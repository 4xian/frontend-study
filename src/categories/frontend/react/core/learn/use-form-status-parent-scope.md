---
id: react.core.learn.advanced.use-form-status-parent-scope
type: lesson
title: useFormStatus 表单作用域
summary: 从表单内后代读取最近父 form 的提交状态，并区分同组件、表单外与兄弟表单边界。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.core.learn.advanced.use-optimistic-pending-state
related:
  - react.core.learn.advanced.form-action-client-submission
  - react.core.learn.advanced.use-action-state-result-queue
tags:
  - React
  - useFormStatus
  - Form Action
  - FormData
  - Scope
appliesTo: React 19.2
verifiedAt: 2026-08-15
objectives:
  - 能按 pending 判别读取 data、method 与 action 四字段。
  - 能把状态组件放进目标 form 内，让它读取最近父 form。
  - 能解释声明 form 的同组件为何读不到自己返回的 form。
  - 能用兄弟 form 与表单外对照验证状态作用域隔离。
  - 能区分提交 FormData、Action 引用与 Action 返回结果。
recap:
  - useFormStatus 从 react-dom 导入，无参数调用并返回父 form 的四字段状态。
  - 调用 Hook 的组件必须位于目标 form 内；同组件不能向下读取自己返回的 form。
  - 没有父 form 时得到完整空闲状态，不会订阅页面上的其他 form。
  - pending 时 data 是本次提交的 FormData，action 是父 form 的 Action 引用。
  - 多个 form 按父级作用域隔离，不能用无效的物理嵌套 form 测试边界。
sources:
  - title: React useFormStatus Reference
    url: https://react.dev/reference/react-dom/hooks/useFormStatus
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - 四字段返回值、父 form 后代作用域、同组件与无父 form 边界
  - title: React form Reference
    url: https://react.dev/reference/react-dom/components/form
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - function Action 的 FormData 参数、Transition 与表单 method 语义
  - title: React 19 发布说明
    url: https://react.dev/blog/2024/12/05/react-19#new-hook-useformstatus
    sourceType: release-note
    appliesTo: React 19
    claims:
      - useFormStatus 的稳定发布与父 form 作用域模型
---

# useFormStatus 表单作用域

## 学习目标

- 认识 `pending`、`data`、`method`、`action` 四个字段。
- 在 form 内真正的后代组件中读取提交状态。
- 用同组件与表单外对照识别 Hook 的作用域边界。
- 用两个兄弟 form 验证提交状态彼此隔离。
- 用客户端 function Action 和本地 gate 观察确定性的 pending。

## 为什么需要

提交按钮、进度文字或本次提交摘要通常离 Action 定义有一段组件距离。把 `pending` 逐层通过 props
传下去既重复，也容易把一个表单的状态误传给另一个表单。`useFormStatus` 让 form 内的后代直接读取
最近父 form 的提交状态：

```tsx
import { useFormStatus } from 'react-dom'

/** 显示当前父 form 的提交状态。 */
function SubmitStatus() {
  const status = useFormStatus()
  return <p>{status.pending ? '正在提交' : '可以提交'}</p>
}
```

这里的关键词是“父 form”。Hook 不会搜索组件返回值中的子 form，也不是页面级的全局请求监听器。

## 核心概念

### 一、四字段 status

`useFormStatus()` 不接收参数，返回一个以 `pending` 为判别字段的状态对象：

```tsx
const status = useFormStatus()

if (!status.pending) {
  // data、method、action 在空闲态都是 null。
  return <p>pending=false</p>
}

return <p>{String(status.data.get('message') ?? '')}</p>
```

- `pending`：父 form 是否有尚未完成的提交。
- `data`：pending 提交产生的 `FormData`。
- `method`：本次提交使用的 form method。
- `action`：父 form 当前提交的 action；function Action 时是原函数引用。

先判断 `pending` 再读取 `data`，既符合运行语义，也让 TypeScript 正确缩窄联合类型。Action 完成后，
四字段恢复为 `false / null / null / null`；Hook 不会保留一份“上次提交”历史。

### 二、必须由 form 内后代读取

正确结构是让调用 Hook 的组件成为目标 form 的后代：

```tsx
/** 读取所在父 form 并渲染提交按钮。 */
function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? '提交中' : '提交'}</button>
}

/** 声明表单，并把状态读取点放到 form 内。 */
function MessageForm({ action }: { action: (data: FormData) => Promise<void> }) {
  return (
    <form action={action} method="post">
      <input name="message" />
      <SubmitButton />
    </form>
  )
}
```

组件嵌套只是为了形成 React 树中的后代关系。不要把一个 `<form>` 物理嵌进另一个 `<form>`；那是
无效 HTML，也会触发 React 的嵌套表单警告。

### 三、pending 中的 FormData

function Action 接收本次提交的 `FormData`，`status.data` 在 pending 期间提供同一轮提交的数据：

```tsx
/** 等待保存动作完成。 */
async function saveMessage(formData: FormData) {
  const message = String(formData.get('message') ?? '')
  await save(message)
}
```

`data` 不是 Action 的返回值、服务器响应或确认后的业务 State。若页面需要保存结果或错误，应使用相应
的应用 State；不要为 `useFormStatus` 虚构第五个字段。

本课 Demo 用内存 Promise gate 暂停客户端 Action，点击“完成当前 Action”才结算。这样可以稳定观察
pending，而不依赖网络速度或 timer。

### 四、method 与 action

Demo 中两个 form 都显式写 `method="post"`，因此 pending 状态显示 `method=post`。function Action 的
HTTP 协议说明与 status 读取到的 form method 是两个观察层；不要声称省略 `method` 后该字段必然自动
变成 `post`。

`status.action` 保存当前 Action。比较 action 时应使用引用相等：

```tsx
const actionLabel = status.pending && status.action === alphaAction ? '甲 action' : '其他'
```

不要依赖函数名、`toString()` 或构建后的源码文本，它们都不是稳定的业务标识。

### 五、同组件与表单外边界

下面的调用点在声明 form 的同一个组件中，因此读不到该组件随后返回的子 form：

```tsx
/** 展示同组件无法向下读取自己返回的 form。 */
function WrongScope({ action }: { action: (data: FormData) => Promise<void> }) {
  const status = useFormStatus()
  return <form action={action}>{String(status.pending)}</form>
}
```

Hook 只能读取调用点已经位于其中的父 form，不能向下查找子元素。同理，放在所有 form 外的 Hook 返回
完整空闲状态，不会因为页面上任意表单提交而改变。

两个兄弟 form 各自提供作用域：甲提交时只有甲 form 内后代变为 pending；乙后代、甲乙同组件 probe
和表单外 probe 都保持 idle。乙提交时结论镜像成立。

## 用法示例或 Demo

先观察五个状态面板都为 `pending=false / data=null / method=null / action=null`。提交甲表单后，只有
“甲 form 后代”显示本次消息、`method=post` 与“甲 action”；点击“完成当前 Action”后恢复空闲。

再提交乙表单，确认只有乙后代变为 pending。命令区同时记录当前 active form、甲乙 Action 调用次数
和最近提交快照。“重建实验”会清空表单、gate、状态与账本。

:::demo{id="react.core.learn.advanced.use-form-status-parent-scope.parent-form-status-demo"}
:::

## 易错使用提示

:::pitfalls
### 错误一：在声明 form 的同组件读取

**触发条件：** 组件先调用 `useFormStatus()`，随后才 return 自己的 `<form>`。

**原因：** Hook 读取父级作用域，不能向下读取组件返回的子元素。

**后果：** 提交该 form 时，当前调用点仍显示空闲。

**错误示例：**

```tsx
function MessageForm() {
  const status = useFormStatus()
  return <form>{String(status.pending)}</form>
}
```

**正确写法：** 把状态读取拆成组件，并渲染在 `<form>` 内。

```tsx
function MessageForm() {
  return <form><SubmitStatus /></form>
}
```

**验证方式：** Demo 中同组件 probe 保持 idle，而同一 form 内后代正确进入 pending。

### 错误二：把无父 form Hook 当全局监听器

**触发条件：** 在页面顶部调用 Hook，希望监听所有表单。

**原因：** `useFormStatus` 只读取最近父 form，不订阅页面级提交事件。

**后果：** 页面内表单正在等待，顶部状态仍是完整空闲对象。

**错误示例：**

```tsx
function PageStatus() {
  return <p>{String(useFormStatus().pending)}</p>
}
```

**正确写法：** 在每个目标 form 内放置后代状态组件。

```tsx
<form action={saveMessage}>
  <SubmitStatus />
</form>
```

**验证方式：** 甲乙任一提交时，表单外对照的四字段始终为空闲值。

### 错误三：把任意异步工作当作 form pending

**触发条件：** 普通点击事件启动 `fetch` 或 Promise，期待 Hook 自动变为 pending。

**原因：** status 描述父 form 的 Action 提交，不是任意异步任务。

**后果：** UI 把互不相关的加载过程混成一个全局状态。

**错误示例：**

```tsx
<button onClick={() => fetch('/save')}>保存</button>
```

**正确写法：** 把提交逻辑交给 form 的 function Action；其他异步流程使用各自状态模型。

```tsx
<form action={saveMessage}>
  <SubmitButton />
</form>
```

**验证方式：** Demo 的 pending 只由两个 form 的 Action 与本地 gate 建立。

### 错误四：物理嵌套 form 验证最近父级

**触发条件：** 把内层 `<form>` 写进外层 `<form>` 来比较状态。

**原因：** HTML 不允许 form 成为 form 的后代，React 也会报告嵌套错误。

**后果：** 浏览器修正后的 DOM 与 React 树都不能作为可靠教学证据。

**错误示例：**

```tsx
<form>
  <form><SubmitStatus /></form>
</form>
```

**正确写法：** 使用两个合法的兄弟 form，各自在内部放置后代状态组件。

```tsx
<>
  <form><SubmitStatus /></form>
  <form><SubmitStatus /></form>
</>
```

**验证方式：** DOM 中恰有两个 form，且不存在 `form form` 后代关系。
:::

## 源码推导与适用场景

**官方事实：** React DOM 的空闲状态包含 `pending=false`，其余三个字段为 `null`；提交状态由 form
提供给树内后代。官方测试也验证了后代在 Action 等待期间读取 `FormData`、method 与 Action 引用，
Action 完成后重新得到空闲状态。这里的公共合同仍以官方 Reference 为准，不把内部 context 或更新时点
当作稳定 API。

**课程推导：** 因为状态沿父 form 作用域提供，同一个后代组件放进甲、乙两个兄弟 form 后，会自动读取
各自的提交，而不需要接收 form ID 或手工 pending props。`status.action` 返回函数引用，所以界面若要显示
固定标签，应先做引用相等比较，再映射为自己的文案。

**适用边界：** 这个 Hook 适合 form 内的提交按钮、局部进度和本次 `FormData` 摘要；Action 结果、错误、
任意异步任务和页面级加载状态需要各自的 State 模型。需要观察多个表单时，应使用合法的兄弟 form 与
后代状态组件，不能用物理嵌套 form 制造作用域。

## 练习

:::exercise
### 练习：推导两个 form 的作用域

**要求：** 分别提交甲、乙表单，在 pending 与 settle 后记录五个状态面板的四字段，并记录 Action
调用次数。

**验收：** 每轮只有目标 form 的后代进入 pending，显示对应消息、`post` 与正确 Action；两个同组件
probe、兄弟 form 后代和表单外 probe 都保持 idle；每轮目标 Action 恰调用一次，settle 后全部 idle。
:::

## 本节小结

- `useFormStatus` 从 `react-dom` 导入，无参数返回父 form 的四字段 status。
- 调用点必须位于目标 form 内；声明 form 的同组件不能向下读取它。
- pending 时 `data` 是本次提交的 `FormData`，`action` 是当前 Action 引用。
- 没有父 form 时得到完整空闲对象，多个兄弟 form 的状态彼此隔离。
- 客户端 function Action 足以使用 Hook，不要求 Server Function 或真实网络。

## 参考资料

- [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) - 四字段、后代作用域与常见错误。
- [form](https://react.dev/reference/react-dom/components/form) - function Action、FormData 与 method 语义。
- [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19#new-hook-useformstatus) - Hook 的稳定发布背景。
