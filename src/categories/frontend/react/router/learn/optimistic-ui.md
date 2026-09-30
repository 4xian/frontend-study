---
id: react.router.learn.advanced.optimistic-ui
type: lesson
title: Optimistic UI
summary: 使用提交中的 FormData 立即呈现可预测的未来状态，并让服务端结果负责确认或回滚。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 120
prerequisites:
  - react.router.learn.intermediate.fetcher
  - react.router.learn.intermediate.form-fetcher-choice
  - react.router.learn.intermediate.revalidation
  - react.router.learn.intermediate.action-results-and-form-validation
  - react.router.learn.intermediate.lab-auth-admin-workspace
related:
  - react.router.learn.intermediate.action-data-submission
  - react.router.learn.intermediate.route-error-boundary
tags:
  - React Router
  - Data Mode
  - Optimistic UI
  - useFetcher
  - fetcher.formData
  - Revalidation
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
objectives:
  - 能解释 Optimistic UI 为什么可以在 action 完成前显示未来状态。
  - 能用 fetcher.formData 读取当前提交，并把它转换为局部组件的可见状态。
  - 能区分正在提交的预期值和 loader 已确认的服务端值。
  - 能在 action 失败时保留原始 loader 数据，让乐观状态自然回滚。
  - 能判断一个 mutation 是否适合乐观更新，以及何时应该等待服务端结果。
recap:
  - loader data 是已确认事实，fetcher.formData 是提交期间的未来预测。
  - 只在 Fetcher 忙时使用预测值，空闲后让 loader data 接管，失败自然回滚。
  - 每个局部 mutation 使用自己的 Fetcher，pending 范围与操作范围保持一致。
  - Optimistic UI 不能代替服务端校验，不可预测或高风险写入必须等待服务端结果。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本，并对应固定 release 与 tag。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在核验时返回 8.3.0。
  - title: React Router 8.3.0 Pending UI
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/framework/pending-ui.md#optimistic-ui
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 当提交数据已经确定未来状态时，可以读取 fetcher.formData 立即渲染乐观结果。
      - fetcher.Form 可以在不触发页面导航的情况下提供局部提交状态。
  - title: React Router 8.3.0 useFetcher
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useFetcher.md#L19-L85
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Fetcher 维护独立的 state、formData 和 data，可用于并发局部交互。
  - title: React Router 8.3.0 Fetcher State Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L699-L778
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 提交产生的 submitting 与 loading 状态都携带 formData，idle 状态会清空 formData。
  - title: React Router 8.3.0 Using Fetchers
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/fetchers.md#L86-L153
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 乐观字段可以由 fetcher.formData 与 loader data 派生，业务失败可以通过 fetcher.data 返回行内反馈。
  - title: React Router 8.3.0 State Management
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/explanation/state-management.md#L29-L47
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 网络提交状态与 loader/action 数据优先由 Router 提供的状态和数据 API 管理。
  - title: React Router 8.3.0 Form vs. fetcher
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/explanation/form-vs-fetcher.md#L18-L123
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 不需要改变 URL 的局部 mutation 适合使用 Fetcher，并可读取 fetcher.formData。
---

# Optimistic UI

## 一、学习目标

- 能解释 Optimistic UI 为什么可以在 action 完成前显示未来状态。
- 能用 `fetcher.formData` 读取当前提交，并把它转换为局部组件的可见状态。
- 能区分“正在提交的预期值”和“loader 已确认的服务端值”。
- 能在 action 失败时保留原始 loader 数据，让乐观状态自然回滚。
- 能判断一个 mutation 是否适合乐观更新，以及何时应该等待服务端结果。

## 二、为什么需要

网络请求有延迟，但用户对某些操作的预期结果是确定的。例如，点击“标为完成”后，用户已经知道这一
行应该显示“已完成”；如果界面必须等待请求、写入和重新验证全部结束，反馈会显得迟钝。

把结果复制到一个额外的 React state 可以暂时解决延迟，却会产生两个来源：本地 state 说任务已完成，
loader data 仍说任务未完成。请求失败、组件重新加载或另一条 mutation 到来时，两个来源可能失去同步。

Optimistic UI 的最小模型是：loader data 仍是已确认的事实，提交中的 `formData` 是短暂的未来预测。预测
只在请求进行期间覆盖显示；action 成功后依靠重新验证回到新的 loader data，action 失败则继续显示原快照。

## 三、核心概念

### 1. 先区分确认值和预测值

假设任务的确认状态来自 loader：

```tsx
function TaskRow({ task }: { task: { done: boolean } }) {
  const fetcher = useFetcher()
  const pendingDone = fetcher.formData?.get('done')
  const isPending = fetcher.state !== 'idle' && typeof pendingDone === 'string'
  const visibleDone = isPending ? pendingDone === 'true' : task.done

  return (
    <fetcher.Form method="post">
      <button name="done" value={String(!visibleDone)} disabled={isPending}>
        {visibleDone ? '标为待完成' : '标为完成'}
      </button>
    </fetcher.Form>
  )
}
```

`task.done` 是当前 loader 快照；`fetcher.formData` 是这次请求携带的输入。只有 Fetcher 处于提交或重新
验证阶段时才使用预测值，空闲后重新交给 loader data。这样没有额外的“乐观状态副本”。

提交 Fetcher 的常见状态序列是 `idle -> submitting -> loading -> idle`。`submitting` 表示 action 正在
处理，`loading` 表示 action 已结束、相关 loader 正在重新验证；这两个阶段都保留本次 `formData`。如果
只在 `submitting` 时显示乐观值，界面可能在 `loading` 阶段短暂闪回旧 loader 数据。

### 2. 乐观更新不是提前写入服务端

点击按钮只会先改变当前行的显示，不代表 action 已成功。真正写入仍由 action 完成：

```tsx
async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const done = formData.get('done') === 'true'
  await saveTask(done)
  return { ok: true }
}
```

成功 action 完成后，相关 loader 会自动重新验证，新的服务端快照替代预测值。若业务校验返回普通
action data 且没有写入事实数据，组件在请求结束后停止使用 `formData`，因此显示原状态并给出行内反馈；
抛出的错误或 Response 则进入最近的 ErrorBoundary，不属于同一行内回滚流程。

### 3. 每个局部 mutation 应有自己的 pending 所有权

列表中的每一行都可能独立提交。为每行调用 `useFetcher()`，可以让一行进入 `submitting` 时只禁用自己；
其他行仍然可操作。`fetcher.state` 负责请求阶段，`fetcher.formData` 负责解释这一行即将变成什么，
`fetcher.data` 则可以承载 action 返回的成功或失败消息。

这也是选择 Fetcher 的原因：局部状态不需要改变 URL，也不需要让整个页面共享一个 `isLoading`。

## 四、用法与示例

### 1. 先确认“未来值”可由提交字段直接推导

乐观更新适合有限状态切换、开关、收藏、已读标记等操作。表单字段本身应足以描述下一状态：

```tsx
<fetcher.Form method="post">
  <input type="hidden" name="taskId" value={task.id} />
  <input type="hidden" name="done" value={String(!visibleDone)} />
  <button disabled={isPending}>
    {visibleDone ? '标为待完成' : '标为完成'}
  </button>
</fetcher.Form>
```

不要从旧的 React state 计算一个与实际提交不一致的结果。按钮文案和提交值都应基于同一个
`visibleDone`，这样重复点击、请求取消和重新验证时更容易解释。

### 2. 让成功结果回到 loader 数据

action 成功后不需要手动调用 `fetcher.load` 或复制一份列表 state：

```tsx
async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await updateTask(String(formData.get('taskId')), formData.get('done') === 'true')
  return { ok: true }
}
```

组件在 `fetcher.state === 'loading'` 时仍可显示这次预测，等到状态回到 `idle` 后只消费重新验证得到的
loader data。若页面需要显示消息，可以读取 `fetcher.data`，但不要把它当成列表的第二个真相来源。

### 3. 失败时停止预测并说明原因

失败 action 可以返回带错误信息的数据：

```tsx
if (!task) {
  return data({ ok: false, message: '任务不存在' }, { status: 404 })
}
if (!canUpdate) {
  return data({ ok: false, message: '没有修改权限' }, { status: 403 })
}
```

行组件只在 Fetcher 仍然忙时读取 `formData`。请求结束后，失败结果不会成为新的 loader 快照，原状态会
自动重新出现；`fetcher.data` 可以用于告诉用户发生了回滚。错误反馈的边界应与业务错误类型保持一致，
不要为了显示一条可预期的校验消息而替换整个页面。

### 4. 用短暂的 pending 文案建立反馈

预测值不等于请求已经完成。按钮可以在 pending 期间显示“同步中”，同时保留当前行的未来状态；提交结束
后再根据结果显示成功或失败。这样用户能区分“界面立即响应”和“服务端已经确认”。

## 五、Demo：任务完成状态观察台

Demo 使用三个内存任务和每行一个 `useFetcher`：

- 点击“标为完成”时，行会先显示已完成，地址保持 `/tasks` 不变。
- 观察 `submitting` 与 `loading`，确认 action 完成后 loader 调用次数和数据版本变化。
- 勾选“下一次提交模拟失败”，再次提交，确认行先乐观变化，随后显示错误并回到原状态。
- 同时操作不同任务，确认 pending 和按钮禁用范围属于各自的行。

:::demo{id="react.router.learn.advanced.optimistic-ui.optimistic-ui-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把乐观值写进独立 React state

**触发条件：** 点击后用 `setDone` 保存预测值，同时继续从 loader data 读取真实值。

**原因：** 两个状态源没有统一的提交结束、失败和重新加载规则。

**后果：** 请求失败或重新验证后，按钮文案、列表状态和服务端数据可能互相矛盾。

**错误示例：**

```tsx
const [done, setDone] = useState(task.done)
```

**正确写法：**

```tsx
const pendingDone = fetcher.formData?.get('done')
const visibleDone = fetcher.state !== 'idle' && typeof pendingDone === 'string'
  ? pendingDone === 'true'
  : task.done
```

**验证方式：** 让 action 返回失败，确认没有残留的本地状态覆盖 loader 的原值。

### 错误：把预测值当成服务端确认

**触发条件：** 点击后立即显示“保存成功”，没有区分 pending 与完成。

**原因：** Optimistic UI 只表示用户预期，不表示服务器已经接受。

**后果：** 失败、权限拒绝或网络中断时，用户会先看到不准确的成功结论。

**错误示例：**

```tsx
<span>已保存</span>
```

**正确写法：**

```tsx
<span>{isPending ? '同步中' : result?.ok ? '已确认' : '待完成'}</span>
```

**验证方式：** 在 action 延时期间观察文案，确认完成前不会写“已确认”。

### 错误：多个局部操作共用一个全局 pending

**触发条件：** 一行提交时用页面级 `navigation.state` 禁用整个列表。

**原因：** Fetcher 的局部提交并不等同于页面导航。

**后果：** 一条任务更新会阻止无关任务，反馈范围与操作范围不一致。

**错误示例：**

```tsx
const disabled = navigation.state !== 'idle'
```

**正确写法：**

```tsx
const disabled = fetcher.state !== 'idle'
```

**验证方式：** 同时提交两行，确认每行只显示自己的同步状态。

### 错误：action 失败后手动把预测值再写回列表

**触发条件：** action 返回错误时，组件继续更新列表 state 或调用多个手动刷新。

**原因：** 把 Router 的 loader 快照和组件副作用混在一起，造成重复同步。

**后果：** 失败路径可能出现闪烁、重复请求或旧值覆盖新值。

**错误示例：**

```tsx
setTasks((current) => current.map(markDone))
```

**正确写法：**

```tsx
// 只在 Fetcher 忙时读取 formData，空闲后回到 loader data
const visibleDone = isPending ? optimisticDone : task.done
```

**验证方式：** 让 action 返回错误，确认 loader 快照自然恢复且没有额外的手动刷新请求。

### 错误：让 action 根据旧值盲目反转

**触发条件：** 表单只提交任务 ID，action 读取当前状态后执行一次 toggle。

**原因：** 请求重试或重复到达时，“反转一次”不再表达用户真正想要的目标状态。

**后果：** 同一个请求执行两次可能把状态改回去，客户端也无法从 FormData 直接预测未来值。

**错误示例：**

```tsx
task.done = !task.done
```

**正确写法：**

```tsx
const done = formData.get('done') === 'true'
task.done = done
```

**验证方式：** 检查表单是否显式提交目标值，并让相同目标重复到达时保持同一结果。
:::

## 七、源码推导与适用场景

1. **官方事实：** React Router 的 Pending UI 指南把 Optimistic UI 定义为：当提交数据已经确定未来状态时，
   读取 `fetcher.formData` 立即渲染该未来状态；`useFetcher` 同时提供独立的 `state`、`formData` 和 `data`。
2. **课程推导：** 因此可以把 loader data 作为确认快照，把提交中的 FormData 作为临时预测，不需要另建同步
   state；action 成功后由自动重新验证确认，失败后停止预测即完成回滚。
3. **适用边界：** 该模式适合结果简单、可由提交字段直接预测的局部 mutation。支付、库存扣减、权限变更、
   多步骤事务或服务器会重新计算最终值的操作，不应只依赖客户端预测，必须等待服务端结果并设计明确的
   冲突、失败和重试反馈。

## 八、练习

:::exercise
### 练习目标

**要求：** 为 Demo 增加“收藏”字段：点击后先显示收藏状态，action 延时期间按钮显示同步中；让一次失败
响应保持原状态，并在成功后依靠 loader 重新验证确认新状态。最后说明为什么收藏图标的预测值可以来自
`fetcher.formData`，而服务器返回的计数不能直接预测。

**验收：** 收藏操作不改变地址；pending 期间同时覆盖 `submitting` 和 `loading`；成功后不手动刷新；失败后
回到 loader 原值并显示行内反馈；不为收藏字段额外创建同步用 React state。
:::

## 九、本节小结

- loader data 是已确认事实，`fetcher.formData` 是提交期间的未来预测。
- 只在 Fetcher 忙时使用预测值，空闲后让 loader data 接管，失败自然回滚。
- 每个局部 mutation 使用自己的 Fetcher，pending 范围与操作范围保持一致。
- Optimistic UI 不能代替服务端校验；不可预测或高风险写入必须等待服务端结果。

## 十、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核对稳定版本与发布信息。
- [Pending UI：Optimistic UI](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/start/framework/pending-ui.md#optimistic-ui) - 支持使用 `fetcher.formData` 渲染预期状态的官方示例。
- [useFetcher](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/api/hooks/useFetcher.md) - 说明 Fetcher 的独立状态、提交数据和返回数据。
- [Fetcher State Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L699-L778) - 证明 `formData` 在 submitting 与 loading 阶段保留、idle 时清空。
- [Using Fetchers](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/how-to/fetchers.md#L86-L153) - 支持乐观字段派生与行内失败反馈。
- [State Management](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/explanation/state-management.md) - 说明网络相关状态优先由 Router API 管理。
- [Form vs. fetcher](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/explanation/form-vs-fetcher.md) - 说明不改变 URL 的局部 mutation 选择 Fetcher。
