# 异步审核队列研究记录

## 知识点合同

- 标题：实战：异步审核队列
- 稳定 ID：`react.core.learn.advanced.lab-action-review-queue`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本课整合已经独立讲解的四个能力：function Form Action 提交 `FormData`，`useFormStatus` 读取父
form 的提交状态，`useActionState` 保存 Action 返回的业务结果，`useOptimistic` 在同一 Action 等待
期间派生临时队列。四个能力共享一次提交生命周期，但不共享同一种 State。

审核队列只作为整合场景。课程不把真实网络、服务器协议、数据库、缓存、事务、权限、幂等、重试或
冲突合并写成 React Hook 的能力。

## 调研方法与证据边界

公共 API 以 React `19.2` 的 `<form>`、`useFormStatus`、`useActionState` 和 `useOptimistic`
Reference 为准，并固定到 `reactjs/react.dev` 提交。React `19.2.8` 源码和官方测试只用于核对当前
patch 的 Form Action、Action 队列、host transition status 和 optimistic 重放行为。

HTML 的成功控件与 `FormData` 规则由 WHATWG HTML 和 XHR Living Standard 支撑；动态状态通知由
WAI-ARIA `status` role 与 WCAG ARIA22 支撑。Fiber、lane、队列节点和 entanglement 不是学习者可
依赖的公共时序合同。

## 官方来源卡

| 编号 | 一手来源 | 本课采用的事实 |
| --- | --- | --- |
| S1 | [React `<form>`](https://react.dev/reference/react-dom/components/form) | function Action 接收 `FormData`、在 Transition 中执行、成功后重置未受控字段、throw/reject 交给错误边界。 |
| S2 | [React `useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus) | 后代读取最近父 form 的 `pending`、`data`、`method`、`action`；同组件和表单外读取不到目标状态。 |
| S3 | [React `useActionState`](https://react.dev/reference/react/useActionState) | 前次结果、payload、结果 State、pending、Action 上下文和顺序队列。 |
| S4 | [React `useOptimistic`](https://react.dev/reference/react/useOptimistic) | 基础值、Action 期间临时值、纯 `updateFn`、成功承接与失败回退。 |
| S5 | [React 19 Actions](https://react.dev/blog/2024/12/05/react-19#actions) | Actions、表单状态、结果 State 和 optimistic UI 的稳定组合方向。 |
| S6 | [固定 `<form>` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/form.md) | 固定 function Action、FormData、reset 和错误传播的公开文字。 |
| S7 | [固定 `useFormStatus` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/hooks/useFormStatus.md) | 固定父 form 作用域、四字段和 troubleshooting。 |
| S8 | [固定 `useActionState` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useActionState.md) | 固定三元组、表单 payload、调用上下文、队列和错误处理。 |
| S9 | [固定 `useOptimistic` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useOptimistic.md) | 固定 optimistic State、Action 约束与 `updateFn` 纯度。 |
| S10 | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) | React `19.2.8` 的 Action State 队列、基础值 passthrough、optimistic 更新与 Action 上下文旁证。 |
| S11 | [`FormActionEventPlugin.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/events/plugins/FormActionEventPlugin.js) | React DOM 构造提交 `FormData`、建立 pending form status 并调用 function Action。 |
| S12 | [`ReactDOMFormActions.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/shared/ReactDOMFormActions.js) | React DOM `19.2.8` 的 pending/idle form status 判别联合。 |
| S13 | [`ReactDOMForm-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js) | FormData、四字段、成功 reset、submitter、错误边界和非法嵌套 form 的固定测试。 |
| S14 | [`ReactAsyncActions-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js) | Action 等待、多次派发、基础值变化和 optimistic 重算的固定测试。 |
| S15 | [HTML 构造 entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set) | `name`、禁用控件、submitter 与成功控件进入 FormData 的规则。 |
| S16 | [FormData `get()`](https://xhr.spec.whatwg.org/#dom-formdata-get) | 文本字段可能缺失或不是字符串，读取后需要缩窄。 |
| S17 | [WAI-ARIA `status`](https://www.w3.org/TR/wai-aria-1.2/#status) | `status` 隐含 polite live region 与 atomic 语义。 |
| S18 | [WCAG ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) | 状态容器应在消息更新前存在，让辅助技术读取动态结果。 |

## 四个状态所有者

### 1. 基础审核队列

基础队列保存已经确认的事实。每条记录拥有稳定 ID、标题、提交者和确认状态：

```tsx
type ReviewItem = Readonly<{
  id: string
  title: string
  owner: string
  status: 'awaiting' | 'approved' | 'changes-requested'
}>
```

成功路径通过基础 State setter 写入确认结果。业务失败或异常路径不确认本轮输入，因此基础队列保持
原值。临时审核结果不能先写进基础数组，再手工恢复旧快照。

### 2. optimistic 队列

`useOptimistic(baseReviews, updateFn)` 只为当前 Action 派生显示值。输入应包含记录 ID 和审核决策；
`updateFn` 只映射目标记录并增加临时字段，不发送请求、不调用 setter、不生成随机 ID。

```tsx
type ReviewIntent = Readonly<{
  reviewId: string
  decision: 'approve' | 'request-changes'
}>

function updateOptimisticQueue(
  reviews: readonly ReviewItem[],
  intent: ReviewIntent,
): readonly OptimisticReviewItem[] {
  return reviews.map((review) =>
    review.id === intent.reviewId
      ? { ...review, pendingDecision: intent.decision }
      : review,
  )
}
```

### 3. Action 结果 State

`useActionState` 保存最近一次 Action 返回给界面的业务结果，例如 revision、success/invalid 类型、
目标记录和反馈文案。它不替代基础队列，也不替代临时队列。

```tsx
type ReviewResult = Readonly<{
  revision: number
  kind: 'idle' | 'success' | 'invalid'
  reviewId: string | null
  fieldError: 'note' | null
  message: string
}>
```

业务失败应作为普通结果 State 返回；throw/reject 表示异常失败，应由最近 Error Boundary 处理。不能
通过解析错误字符串区分两者。只有备注校验失败设置 `fieldError: 'note'`；表单级业务失败使用 `null`。

### 4. 父 form 提交状态

`useFormStatus` 只能在 form 后代组件中调用。`pending` 用来禁用本表单的提交按钮，`data` 用来显示
本次提交的记录 ID 和 decision；它不保存成功结果、错误结果或 optimistic 队列。

同组件先调用 Hook 再返回 `<form>` 读不到该 form。正确结构是：

```tsx
function SubmitControls() {
  const status = useFormStatus()
  return <button disabled={status.pending}>提交审核</button>
}

function ReviewForm() {
  return (
    <form action={submitReview}>
      <SubmitControls />
    </form>
  )
}
```

## 完整提交流程

### 1. 提交入口

父 form 的 `action` 使用 `useActionState` 返回的 Action。记录 ID 放入 hidden input，审核决定放入
submitter 的 `name="decision"` / `value`，备注字段使用稳定 `name`。React 收集本次 `FormData`，
Action 的第二个参数得到这份 payload。

### 2. 进入等待阶段

Action 先读取并缩窄 `FormData`，再派发 optimistic input。此时：

- form 后代的 `useFormStatus().pending` 为 `true`；
- `useFormStatus().data` 描述本次提交，而不是当前输入框的后续变化；
- `useActionState` 的 `isPending` 表示当前 Action State 队列仍有工作；
- optimistic 队列在目标行显示“等待确认”；
- 基础队列和上一次 Action 结果仍是已确认值。

这些信号可以在同一段时间出现，但语义不同。不能用一个页面级 `loading` 布尔值替代全部状态。

### 3. 成功路径

成功返回的数据先写入基础队列，随后 Action 返回新的结果 State。Action 结束后临时 input 消失，
optimistic 队列服从新的基础值。revision 来自 `previousState.revision + 1`，不能从闭包中的旧 result
State 推断。

Form Action 成功完成会重置未受控字段；受控字段仍由 React State 决定。Demo 的备注是受控字段，
所以只有显式更新 note State 才会改变它。

### 4. 业务失败路径

规则冲突、备注不符合业务要求或记录版本已变化可以返回 `kind: 'invalid'` 的结果 State。Action 正常
完成，未确认的 optimistic input 消失，基础队列保持原值，受控备注仍可供用户修改后重试。

业务失败不是异常。若使用普通返回值表达它，不应同时 throw；否则结果 State 和 Error Boundary 会
争夺同一次失败的展示职责。

### 5. 异常路径

解析之外的程序错误、依赖故障或明确 reject 会进入最近 Error Boundary。错误边界可能卸载整张表单，
因此不能承诺异常后 DOM 字段一定保留。恢复路径应重建明确的表单边界，而不是假设 optimistic 回滚
等价于错误恢复。

## 队列、并发与身份边界

`useActionState` 对同一个 Hook 的多次派发按顺序处理，但业务审核队列是应用数据。React 不会替应用
实现操作 ID、服务器版本、跨客户端冲突、权限检查、事务或幂等。

本 Demo 在提交期间禁用审核切换和重复提交，只允许一项待确认操作。这样能清楚观察四种 State 的组合，
不会把多 Action 完成顺序扩成另一条教学主线。生产系统需要并发时，应在数据层携带操作 ID 和版本，并
用服务器确认结果更新基础队列。

审核记录 ID 是列表 `key`、FormData 目标和成功合并条件。optimistic reducer 不改变 ID；决策是临时
字段，不应拼进 `key`。

## 可访问反馈

- submit 按钮使用原生 `disabled={pending}` 阻止同一表单重复操作，并显示当前决策的 pending 文案。
- Action 结果使用预先存在的 `role="status" aria-atomic="true"` 容器，不移动焦点。
- 业务失败通过文字和 `aria-invalid` 说明，不能只改变边框颜色。
- 队列行同时显示状态文字；颜色只作为辅助。
- 记录选择使用原生按钮与 `aria-pressed`，pending 期间禁用，避免选择与提交 payload 分离。
- 控件在 `390px` 与 `200%` 文本下允许换行，不能产生页面横向溢出或裁切按钮文字。

## Demo 合同

### 固定输入

Demo 使用三条本地审核记录和固定稳定 ID。一次只选择一条待审核记录，备注为受控输入，两个 submitter
分别提交“通过”和“退回修改”。

### 可观察结果

1. 冷启动有三条基础记录，结果 revision 为 `0`，form status 与 Action State 都为空闲。
2. 提交“通过”后，目标行立即显示等待确认；基础待审核计数不变。
3. form 后代同时显示 `pending=true`、记录 ID 和提交决策，两个 submitter 被禁用。
4. 返回成功后目标行写入基础 State，optimistic 标记消失，revision 增加，结果为 success。
5. 选择另一条记录并返回业务失败后，目标行回到原基础状态，revision 不增加，结果为 invalid。
6. 受控备注在成功和业务失败后都由 note State 保留；切换记录或完整重建时结果确定。
7. pending 期间离开页面会结算本地控制 Promise，并阻止卸载后的 State 更新。

### 确定性限制

- 不使用真实网络、timer、随机数、持久化或第三方状态包。
- 手动 Promise 只用于把 Action 停在可观察阶段，不代表服务器接口。
- 不固定 render 次数、内部 lane、队列节点或具体毫秒数。
- 运行组件与源码面板读取同一组 TSX、CSS 文件。

## 易错点账本

### 用一个 loading State 代替四种状态

它会混淆父 form pending、Action 结果、基础数据和临时显示。应让每个 Hook 只拥有自己的信息，并在 UI
中按语义组合。

### 在 form 外调用 useFormStatus

Hook 读不到目标父 form，会一直呈现空闲状态。应把状态组件放进 form 后代。

### 把业务失败写进基础队列再恢复

旧快照可能覆盖等待期间其他确认数据。失败路径不确认本轮输入，让 optimistic State 回到当前基础值。

### 在 updateFn 中修改队列或产生副作用

重放会重复突变、请求或随机身份。`updateFn` 只根据参数返回新数组和新对象。

### 只更新 optimistic State

成功 Action 结束后临时值会消失。必须把确认结果写入基础队列。

### 把返回 invalid 和 throw 混成同一种错误

普通结果应由 `useActionState` 展示；异常由 Error Boundary 展示。两条路径需要不同恢复合同。

### 用数组下标识别审核记录

排序、筛选或插入后会把结果写到错误行。FormData、optimistic input、基础合并和列表 `key` 都使用同一
稳定 ID。

### 把 React Action 队列当服务器事务

前端排队不能提供跨客户端一致性、授权、幂等或事务。生产系统仍需数据层和服务端合同。

## 研究结论

异步审核队列的最小正确结构是：Form Action 提交稳定记录 ID 与决策；form 后代用 `useFormStatus`
表达本次提交；`useActionState` 保存业务结果；`useOptimistic` 只派生等待期间的队列行；成功把确认结果
写回基础 State，业务失败不确认本轮输入，异常交给 Error Boundary。四个能力协作于一次 Action，但
不能互相替代，也不能提供后端一致性保证。
