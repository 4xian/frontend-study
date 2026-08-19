---
id: react.core.learn.advanced.form-action-client-submission
type: lesson
title: 表单 Action 与提交状态
summary: 使用 function Action 处理 FormData，并从表单后代读取提交状态与成功重置结果。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 120
prerequisites:
  - react.core.learn.advanced.activity-hidden-state-restoration
related:
  - react.core.learn.basics.react-forms
  - react.core.learn.advanced.use-transition-pending-action
  - react.core.learn.advanced.use-action-state-result-queue
  - react.core.learn.advanced.use-optimistic-pending-state
tags:
  - React
  - Form Action
  - FormData
  - useFormStatus
  - formAction
appliesTo: React 19.2（React DOM）
verifiedAt: 2026-08-18
objectives:
  - 能把客户端函数传给 form 的 action，并从唯一参数读取 FormData。
  - 能区分父 form action、普通 submitter 数据与 function formAction 覆盖。
  - 能预测异步 Action pending、成功、拒绝时的字段与错误边界行为。
  - 能区分成功后重置的未受控字段与仍由 State 决定的受控字段。
  - 能用 useFormStatus 读取 pending、data、method、action 四字段。
  - 能正确安排状态组件，并判断同组件、表单外与兄弟表单的作用域。
recap:
  - function action 接收本次提交的 FormData，不接收 submit event。
  - React 接管 function Action 提交，并把同步或异步 Action 放进 Transition。
  - Action 成功后重置当前 form 的未受控字段，拒绝时交给最近的 Error Boundary。
  - function formAction 覆盖父 Action；普通 submitter 的 name/value 才作为业务字段进入父 Action。
  - useFormStatus 从 react-dom 导入，返回最近父 form 的 pending、data、method、action。
  - 状态读取点必须是目标 form 的后代；同组件、表单外和兄弟 form 不共享提交状态。
sources:
  - title: React form Reference
    url: https://react.dev/reference/react-dom/components/form
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - function action、FormData、Transition、成功重置、错误传播与 formAction 覆盖
  - title: React useFormStatus Reference
    url: https://react.dev/reference/react-dom/hooks/useFormStatus
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - 四字段返回值、父 form 后代作用域、同组件与无父 form 边界
  - title: React input Reference
    url: https://react.dev/reference/react-dom/components/input
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 受控与未受控字段、defaultValue、defaultChecked 与 input formAction
  - title: React 19 发布说明
    url: https://react.dev/blog/2024/12/05/react-19#react-dom-actions
    sourceType: release-note
    appliesTo: React 19
    claims:
      - React DOM Actions、useFormStatus 与成功后的未受控字段重置
  - title: React useTransition Reference
    url: https://react.dev/reference/react/useTransition
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - Action prop 的 Transition 语义与 await 后更新边界
  - title: XMLHttpRequest Standard FormData
    url: https://xhr.spec.whatwg.org/#interface-formdata
    sourceType: specification
    appliesTo: Living Standard
    claims:
      - FormData 的条目列表、get、getAll 与值类型
  - title: HTML Standard form submission
    url: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-2
    sourceType: specification
    appliesTo: Living Standard
    claims:
      - 表单成功控件、submitter 与嵌套 form 禁止边界
  - title: React DOM form Action official tests
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js
    sourceType: official-test
    appliesTo: React DOM 19.2.8
    claims:
      - 四字段、默认 method、成功重置、错误边界与非法嵌套 form
  - title: React DOM function Action attribute validation
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L117-L151
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - function action 与 method、encType、target 同时声明时的警告和覆盖规则
  - title: WAI-ARIA status role
    url: https://www.w3.org/TR/wai-aria-1.2/#status
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - status 的 polite live region 与 atomic 语义
---

# 表单 Action 与提交状态

## 一、学习目标

- 能把客户端函数直接传给 `<form action>`，并从 `FormData` 读取本次提交快照。
- 能选择父 `action`、普通 submitter `name/value` 或 function `formAction` 表达提交意图。
- 能说明 Action pending、成功与拒绝时，React 分别跟踪什么、重置什么、把错误交给谁。
- 能用 `useFormStatus()` 的判别联合安全读取 `pending`、`data`、`method`、`action`。
- 能把提交状态组件放在目标 form 的真正后代中，并判断多个 form 的作用域。
- 能区分提交数据、提交状态、Action 返回结果、乐观状态与普通异步加载状态。

## 二、为什么需要表单 Action

传统客户端表单通常在 `onSubmit` 中接收事件、调用 `preventDefault()`，再从表单节点构造
`FormData`。React 19 提供了另一条声明式入口：把函数直接传给 `action`。React 收集提交数据、调用
函数、跟踪异步完成，并为 form 内后代提供提交状态。

```tsx
import { useFormStatus } from 'react-dom'

/** 保存本次表单提交的数据。 */
async function saveCourse(formData: FormData) {
  const title = formData.get('title')
  console.log(title)
}

/** 根据所在父 form 的状态渲染提交按钮。 */
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '保存中' : '保存'}
    </button>
  )
}

/** 声明表单并把状态读取组件放在 form 内。 */
function CourseForm() {
  return (
    <form action={saveCourse}>
      <input name="title" />
      <SubmitButton />
    </form>
  )
}
```

这套接口同时解决两个紧密相关的问题：Action 如何接收并完成一次提交，以及 form 内界面如何读取这次
提交是否仍在进行。它不是 `onSubmit` 的缩写，也不是页面级请求管理器。

## 三、function Action 的最小模型

### 1. Action 直接接收 FormData

当 `action` 是函数时，函数的唯一参数是 React 已收集的 `FormData`：

```tsx
/** 读取并缩窄提交字段。 */
function publishCourse(formData: FormData) {
  const title = formData.get('title')
  const audience = formData.get('audience')

  if (typeof title !== 'string' || typeof audience !== 'string') return
  console.log({ title, audience })
}

<form action={publishCourse}>
  <input name="title" />
  <select name="audience" defaultValue="team">
    <option value="team">团队</option>
    <option value="public">公开</option>
  </select>
  <button type="submit">发布</button>
</form>
```

Action 不接收 submit event，因此没有 `event.currentTarget`，也不需要再次执行
`new FormData(event.currentTarget)`。字段值的静态类型是 `FormDataEntryValue | null`，其中
`FormDataEntryValue` 可以是字符串或 `File`；只接受文本时应显式缩窄。

### 2. React 接管默认提交

function Action 与传统事件处理器的主要差异如下：

| 接口 | 第一个参数 | 默认导航 | React 提供的提交合同 |
| --- | --- | --- | --- |
| `onSubmit` | submit event | 处理器决定是否 `preventDefault()` | 普通事件处理器 |
| function `action` | `FormData` | React 接管 | Transition、提交状态、成功重置、错误传播 |

不要在同一条主提交流程中再用 `onSubmit` 取消提交。那会把事件接口与 Action 接口混在一起，使行为和
数据来源难以判断。

### 3. 同步与异步 Action

Action 可以同步完成，也可以返回 Promise：

```tsx
/** 等待保存工作完成，并让失败继续传播。 */
async function saveCourse(formData: FormData) {
  const title = formData.get('title')
  await courseClient.save(title)
}
```

React 会把 function `action` 或 function `formAction` 作为 Action 放进 Transition，并跟踪其返回的
Promise。同步函数可能很快完成，不能保证界面一定肉眼可见地进入 pending；异步函数只有在 Promise
履行或拒绝后才结束这次提交。

React 跟踪 Promise 不等于所有 `await` 后的 State setter 都自动带有 Transition 标记。React 19.2 中，
若 `await` 后的 setter 本身也需要成为 Transition 更新，仍要重新使用 `startTransition` 标记该更新。

## 四、FormData 与成功控件

### 1. name 决定字段键

需要提交的控件必须有 `name`。`id` 用于关联 label，`placeholder` 用于提示，它们都不会替代
`name`：

```tsx
<label htmlFor="course-title">课程标题</label>
<input id="course-title" name="title" />
```

没有 `name`、被禁用、未选中的 checkbox 或 radio 等不属于本次成功控件的内容，不会作为普通业务
字段进入 FormData。只读控件仍可提交；disabled 控件不会提交。

### 2. get 与 getAll

`get(name)` 只返回同名条目中的第一个值。复选组或其他同名多值字段应使用 `getAll(name)`：

```tsx
/** 读取单值标题与多值主题。 */
function savePreferences(formData: FormData) {
  const title = formData.get('title')
  const topics = formData.getAll('topic')

  if (typeof title !== 'string') return
  const textTopics = topics.filter((value): value is string => typeof value === 'string')
  console.log({ title, topics: textTopics })
}
```

不要用 `Object.fromEntries(formData)` 代替所有解析：同名字段会被压成单值，`File` 也不会自动变成文本。

### 3. FormData 是本次提交快照

React 在调用 Action 前收集本次数据。Action `await` 期间用户继续编辑 DOM，不会回头改写已经交给
Action 的 FormData 条目。`useFormStatus().data` 在 pending 期间描述的也是当前这次提交数据，不是输入
框此刻的最新 DOM 值，更不是 Action 返回结果。

### 4. submitter 也可能贡献数据

触发提交的 `<button>`、`<input type="submit">` 或 `<input type="image">` 是 submitter。普通
submitter 有 `name/value` 时，这组数据会进入父 Action 的 FormData：

```tsx
/** 根据普通 submitter 传入的意图区分操作。 */
function handleCourse(formData: FormData) {
  const intent = formData.get('intent')
  console.log(intent)
}

<form action={handleCourse}>
  <textarea name="content" />
  <button type="submit" name="intent" value="draft">
    保存草稿
  </button>
  <button type="submit" name="intent" value="publish">
    发布
  </button>
</form>
```

按 Enter 提交时不一定存在明确 submitter，Action 不能无条件假设 `intent` 一定非空。

## 五、父 action 与 formAction

### 1. 一个父 Action 处理多个意图

当多个按钮只是在相同处理流程中选择简单分支时，保留一个父 Action 并读取普通 submitter 的
`name/value` 最直接。字段解析、校验和共享处理逻辑都集中在同一函数中。

### 2. function formAction 覆盖父 Action

当按钮需要完全不同的处理函数时，把函数传给它的 `formAction`：

```tsx
/** 处理父 form 的默认发布路径。 */
function publish(formData: FormData) {
  console.log('publish', formData.get('content'))
}

/** 处理按钮覆盖后的草稿路径。 */
function saveDraft(formData: FormData) {
  console.log('draft', formData.get('content'))
}

<form action={publish}>
  <textarea name="content" />
  <button type="submit">发布</button>
  <button type="submit" formAction={saveDraft}>
    保存草稿
  </button>
</form>
```

function `formAction` 的函数身份已经表达要调用哪条 Action。不要再为同一个覆盖按钮设置业务
`name/value`：React 需要管理该 submitter 的 Action 身份，开发环境会警告自定义 `name` 被覆盖，
该业务值也不会按普通 submitter 规则进入覆盖 Action 的 FormData。

### 3. action 与 formAction 的元素边界

function `action` 用于 `<form>`。function `formAction` 用于能够提交表单的 button，以及
`type="submit"` 或 `type="image"` 的 input。普通文本 input 不能用 `formAction` 变成提交入口。

### 4. 客户端函数不是网络协议声明

React 对 function `action` / `formAction` 使用 POST 提交语义，并接管已加载 JavaScript 后的客户端
调用。给函数分支设置 `method="get"`、`encType`、`target` 或 submitter 对应覆盖属性，不能把本地
函数变成某种业务 HTTP 协议；React 还可能为这些冲突属性发出开发警告。

客户端函数存在于浏览器 JavaScript 中，不等同于 Server Function。禁用 JavaScript 时的提交、服务端
执行、RSC 与渐进增强需要相应服务端宿主，不能从普通 SPA 的客户端闭包推导。

## 六、pending、成功与拒绝

### 1. pending 表示提交 Action 尚未完成

当异步 Action 返回一个尚未 settle 的 Promise，React 会把相关 form 置于 pending 状态。pending 只
描述这次 form Action 提交，不表示任意 `fetch`、普通按钮 Promise 或页面所有异步工作。

pending 期间应保留用户当前可见内容，并为重复提交提供明确限制。提交按钮常用
`disabled={pending}`，但取消、导航或其他不冲突的控件是否可用，应按界面职责决定，不能把整个页面
全部锁住。

### 2. 成功后重置未受控字段

Action 同步正常返回或异步履行后，React 重置当前 form 的未受控字段。重置表示恢复 DOM 默认值，不是
一律变成空字符串：

```tsx
<form action={saveProfile}>
  <input name="displayName" defaultValue="React learner" />
  <label>
    <input name="notify" type="checkbox" defaultChecked />
    接收通知
  </label>
  <button type="submit">保存</button>
</form>
```

成功后，文本输入恢复为 `defaultValue`，checkbox 恢复为 `defaultChecked`。Action 在重置前已收到
本次 FormData，因此保存逻辑仍能读取用户提交时的值。

### 3. 受控字段仍由 State 决定

传入 `value` 或 `checked` 的字段由 React State 控制。form reset 不能越过这个所有权边界：

```tsx
import { useState } from 'react'
import type { ChangeEvent } from 'react'

/** 对比未受控标题与受控备注的重置结果。 */
function CourseForm() {
  const [note, setNote] = useState('保留这条备注')

  /** 更新受控备注。 */
  function handleNoteChange(event: ChangeEvent<HTMLInputElement>) {
    setNote(event.currentTarget.value)
  }

  /** 读取本次提交快照。 */
  function saveCourse(formData: FormData) {
    console.log(formData.get('title'), formData.get('note'))
  }

  return (
    <form action={saveCourse}>
      <input name="title" defaultValue="未受控标题" />
      <input name="note" value={note} onChange={handleNoteChange} />
      <button type="submit">保存</button>
    </form>
  )
}
```

成功后标题恢复默认值，备注仍等于 `note`。业务确实要清空受控字段时，需要在成功路径中明确更新
State。

### 4. 拒绝交给最近 Error Boundary

Action 同步抛错或返回被拒绝的 Promise 时，错误交给最近的 Error Boundary。公开合同只承诺成功后
自动重置，拒绝不满足成功条件。

Error Boundary 可能用 fallback 替换并卸载原 form。因此“失败没有自动 reset”不等于原输入节点一定
继续显示；要区分 reset 与 remount，可以在边界外观察 reset 事件或保留独立账本。

### 5. bare Action 不消费返回对象

直接传给 form 的 bare Action 没有结果 State 消费者。正常返回 `{ error: '重复标题' }` 仍属于函数
成功完成，返回对象不会自动进入 UI，还可能触发成功重置。需要把前次结果、错误结果或 pending 与业务
State 组合时，应使用 `useActionState`；不能把普通返回对象当成抛错。

## 七、useFormStatus 的四字段

### 1. 导入与调用

`useFormStatus` 从 `react-dom` 导入，不接收参数，并遵守 Hook 顶层调用规则：

```tsx
import { useFormStatus } from 'react-dom'

/** 显示最近父 form 的提交状态。 */
function SubmitStatus() {
  const status = useFormStatus()
  return <p>{status.pending ? '正在提交' : '可以提交'}</p>
}
```

它返回一个以 `pending` 为判别字段的联合类型：

| 字段 | 空闲状态 | pending 状态 | 含义 |
| --- | --- | --- | --- |
| `pending` | `false` | `true` | 父 form 是否有尚未完成的提交 |
| `data` | `null` | `FormData` | 本次提交数据 |
| `method` | `null` | `string` | 提交时 form 的 DOM method |
| `action` | `null` | string 或 Action 函数 | 当前提交使用的 action |

### 2. 先按 pending 缩窄

先判断 `pending`，TypeScript 才能知道其余字段不为 null：

```tsx
/** 显示当前提交的消息。 */
function SubmittedMessage() {
  const status = useFormStatus()

  if (!status.pending) {
    return <p>尚无进行中的提交</p>
  }

  return <p>正在提交：{String(status.data.get('message') ?? '')}</p>
}
```

Action 完成后，status 恢复为 `false / null / null / null`。Hook 不保留“上一次提交”；需要历史记录时，
应用应建立自己的 State。

### 3. data 是提交数据，不是结果

`status.data` 是 pending 提交产生的 FormData。它不是服务器响应、Action 返回值、确认后的业务对象，
也不是乐观 State。读取时仍要处理字段缺失、同名多值与 `File` 类型。

### 4. method 是 DOM form method

`status.method` 描述提交时 form 的 DOM method。HTML form 默认 method 为 GET，而 function Action 又有
React 的 POST 语义约束，这两个观察层不能压成“function Action 时 status.method 必然自动为 post”。

React DOM 19.2.8 的官方测试中，未声明 `method` 的 function Action 在 pending 时返回 `get`。不要为
改变这个显示值而给 function Action form 显式写 `method="post"`：开发环境会警告 React 将覆盖
`method`。当前 `get` 只是 DOM method 观察值，不表示客户端函数发出了 GET 请求；纯客户端 Demo 也
没有业务网络请求。升级 React 后应重新核对这一版本敏感边界。

### 5. action 保留当前入口身份

function Action pending 时，`status.action` 是当前 Action 的函数引用。需要显示固定标签时，使用引用
相等比较，再映射为业务文案：

```tsx
const label = status.pending && status.action === saveCourse ? '保存课程' : '其他提交'
```

不要依赖函数名或 `Function#toString()`。构建压缩、闭包和代码变换都可能改变这些文本，它们不是稳定
身份。

## 八、父 form 作用域

### 1. Hook 调用点必须位于 form 内

正确结构是让调用 Hook 的组件成为目标 form 的真正后代：

```tsx
/** 读取所在父 form 的 pending。 */
function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? '提交中' : '提交'}</button>
}

/** 提供 form 作用域。 */
function MessageForm({ action }: { action: (data: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input name="message" />
      <SubmitButton />
    </form>
  )
}
```

组件拆分不是为了复用而强制增加层级，而是为了让 Hook 调用点真正处在 `<form>` 提供的父级作用域中。

### 2. 声明 form 的同组件读不到它

组件在 render 时先调用 Hook，随后返回一个子 form；这个 form 不是调用点的父级：

```tsx
/** 这个调用点无法读取自己随后返回的 form。 */
function WrongScope({ action }: { action: (data: FormData) => Promise<void> }) {
  const status = useFormStatus()
  return <form action={action}>{String(status.pending)}</form>
}
```

Hook 不会向下搜索子元素。把状态 UI 拆成子组件，并把子组件放进 form，才能读取该 form。

### 3. 表单外不是全局监听器

没有父 form 时，`useFormStatus()` 返回完整空闲状态。页面上其他 form 正在提交，也不会激活这个调用点。
它适合局部提交按钮、局部进度和当前提交摘要，不适合页面级加载条或任意请求监控。

### 4. 兄弟 form 彼此隔离

两个兄弟 form 各自提供提交状态。甲 form pending 时，只有甲内部后代读取到甲的数据、method 与
Action；乙 form 后代保持空闲。乙提交时结论相反。

需要限制同时提交时，可以通过页面自己的 active 状态禁用另一张表单，但不要把这个应用状态伪装成
`useFormStatus` 返回字段。

### 5. 不要物理嵌套 form

“最近父 form”描述的是合法组件树中的父级作用域，不表示可以把 `<form>` 放进另一个 `<form>`。
HTML 禁止 form 成为 form 的后代，React 也会为这种结构报告错误。验证作用域应使用兄弟 form、同组件
对照和表单外对照。

## 九、提交状态 UI 的设计

### 1. 禁用重复提交入口

最常见的局部状态组件是提交按钮：

```tsx
/** 防止同一 form 在当前 Action 完成前重复提交。 */
function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? '正在保存' : '保存'}
    </button>
  )
}
```

原生 `disabled` 同时阻止点击与键盘激活；单独写 `aria-disabled` 不会阻止事件。普通提交按钮禁用后也
不会作为成功控件贡献 `name/value`，因此读取 submitter 意图时要把禁用策略纳入设计。

### 2. 用文本表达状态

pending 不应只靠颜色或旋转图标表达。按钮文字与稳定存在的 `role="status"` 区域应提供明确文本，
并避免在短时间内反复播报整个表单。`status` 隐含 polite live region；`aria-atomic="true"` 让辅助
技术把整条短消息作为一个整体报告。

```tsx
/** 向辅助技术报告当前 form 的提交阶段。 */
function SubmissionNotice() {
  const { pending } = useFormStatus()
  return (
    <p role="status" aria-atomic="true">
      {pending ? '表单正在提交' : '表单可以提交'}
    </p>
  )
}
```

### 3. 不要锁住无关操作

pending 通常需要阻止重复提交和会破坏当前数据的操作，但不应机械禁用页面导航、帮助入口或与这次
提交无关的普通 State 控件。先按资源冲突和数据所有权判断，再决定禁用范围。

### 4. 区分状态层次

常见状态各自回答不同问题：

| 状态 | 回答的问题 |
| --- | --- |
| `useFormStatus().pending` | 最近父 form 是否正在提交 |
| `useFormStatus().data` | 当前 pending 提交带了哪些 FormData |
| `useActionState` 的 State | Action 返回了什么业务结果 |
| `useOptimistic` 的值 | Action 期间暂时显示什么预测结果 |
| 普通应用 State | 已确认数据、历史记录或页面其他交互是什么 |

不要用一个布尔值替代所有状态。提交中、成功、业务失败、系统异常和乐观预览具有不同来源与生命周期。

## 十、Demo：Action 生命周期

第一个 Demo 使用一张表单观察父 `action` 与按钮 function `formAction`。Action 返回由边界外控件 settle
的 Promise：pending 时未受控正文保持当前值；成功后才自动 reset；拒绝时最近 Error Boundary 显示
fallback，边界外 reset 计数不增加。恢复按钮会 remount 新表单，因此不能把新默认值误认成旧 form 的
自动 reset。

父 Action 收到普通发布按钮的 `intent=publish`；覆盖 Action 的 submitter 没有业务 `name/value`，
所以它收到的 `intent` 为 null。受控备注始终由 State 保持，普通计数在 Action pending 时仍可更新。

:::demo{id="react.core.learn.advanced.form-action-client-submission.client-action-demo"}
:::

## 十一、Demo：提交状态作用域

第二个 Demo 使用两个合法的兄弟 form。冷启动时，表单外、甲乙同组件、甲乙后代五个状态面板都为
`pending=false / data=null / method=null / action=null`。

提交甲表单后，只有“甲 form 后代”显示本次 `message`、当前 React DOM 19.2.8 观察到的
`method=get` 与甲 Action；乙后代、两个同组件对照和表单外对照保持空闲。这里的 `get` 是 DOM
观察值，不是网络请求。完成当前 Action 后全部恢复空闲。提交乙表单时结果镜像成立。“重建实验”会
清空输入、gate、调用次数和账本。

:::demo{id="react.core.learn.advanced.form-action-client-submission.parent-form-status-demo"}
:::

## 十二、易错使用提示

:::pitfalls

### 错误一：把 function Action 当作 onSubmit

**触发条件：** 把传统事件处理器原样传给 `action`。

**原因：** function Action 的唯一参数是 `FormData`，不是 submit event；React 已接管默认提交。

**后果：** 代码会调用不存在的事件方法，或重复构造错误的数据来源。

**错误示例：**

```tsx
function save(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
}

<form action={save}>...</form>
```

**正确写法：**

```tsx
function save(formData: FormData) {
  console.log(formData.get('title'))
}

<form action={save}>...</form>
```

**验证方式：** 检查 Action 参数类型为 `FormData`，提交时页面不发生默认导航。

### 错误二：输入有 id 却没有 name

**触发条件：** 只用 `id` 关联 label，却期待 Action 收到该字段。

**原因：** FormData 的字段键来自 `name`，不是 `id` 或 placeholder。

**后果：** `formData.get('title')` 返回 `null`。

**错误示例：**

```tsx
<input id="title" />
```

**正确写法：**

```tsx
<label htmlFor="title">标题</label>
<input id="title" name="title" />
```

**验证方式：** 提交后确认 Action 能读取用户输入的标题。

### 错误三：用 get 读取全部同名字段

**触发条件：** 多个 checkbox 使用同一个 `name`，代码却只调用 `get()`。

**原因：** `get()` 只返回第一个同名条目。

**后果：** 其余选项在业务解析中丢失。

**错误示例：**

```tsx
const topics = formData.get('topic')
```

**正确写法：**

```tsx
const topics = formData.getAll('topic')
```

**验证方式：** 同时选中两个同名 checkbox，确认读取结果包含两个条目。

### 错误四：给 function formAction 按钮添加业务 name

**触发条件：** 同一个按钮既传函数 `formAction`，又传业务 `name/value`。

**原因：** React 需要管理该 submitter 的 Action 身份，并会覆盖按钮的名字。

**后果：** 开发环境出现警告，覆盖 Action 也不能依赖该按钮业务值。

**错误示例：**

```tsx
<button formAction={saveDraft} name="intent" value="draft">
  保存草稿
</button>
```

**正确写法：**

```tsx
<button type="submit" formAction={saveDraft}>
  保存草稿
</button>
```

**验证方式：** 确认 console 无警告，并由 Action 函数身份区分处理路径。

### 错误五：Action 开始时手工 reset

**触发条件：** 提交后立即调用 `form.reset()`，然后才等待可能失败的工作。

**原因：** React 已把自动重置绑定到 Action 成功。

**后果：** 失败时用户输入已经丢失，界面还会错误表现为成功。

**错误示例：**

```tsx
async function save(formData: FormData) {
  formRef.current?.reset()
  await courseClient.save(formData)
}
```

**正确写法：**

```tsx
async function save(formData: FormData) {
  await courseClient.save(formData)
  // 正常返回后由 React 重置未受控字段。
}
```

**验证方式：** 让 Promise 拒绝，确认 reset 事件没有发生。

### 错误六：期待自动 reset 改写受控 State

**触发条件：** 输入使用 `value={title}`，却期待 Action 成功后自动清空。

**原因：** 受控字段的当前值由 State 决定，不由 DOM reset 决定。

**后果：** 未受控字段已复位，受控字段仍显示提交前的值。

**错误示例：**

```tsx
<input name="title" value={title} onChange={handleTitleChange} />
```

**正确写法：**

```tsx
async function save(formData: FormData) {
  await courseClient.save(formData)
  setTitle('')
}
```

**验证方式：** 成功后分别检查未受控默认值与受控 State。

### 错误七：正常返回错误对象并期待失败状态

**触发条件：** bare Action 捕获异常后返回 `{ error }`，并期待表单保留字段、自动显示错误。

**原因：** bare Action 不消费返回对象；正常履行仍属于成功完成。

**后果：** 返回值没有进入 UI，未受控字段还可能按成功路径重置。

**错误示例：**

```tsx
async function save(formData: FormData) {
  try {
    await courseClient.save(formData)
  } catch {
    return { error: '保存失败' }
  }
}
```

**正确写法：**

```tsx
async function save(formData: FormData) {
  await courseClient.save(formData)
}
```

**验证方式：** 区分 Promise 履行与拒绝；需要结果 State 时使用明确的 Action 状态模型。

### 错误八：在声明 form 的同组件读取状态

**触发条件：** 组件先调用 `useFormStatus()`，随后 return 自己的 `<form>`。

**原因：** Hook 只读取调用点的父 form，不能向下读取子元素。

**后果：** 提交该 form 时，调用点仍显示空闲。

**错误示例：**

```tsx
function MessageForm() {
  const status = useFormStatus()
  return <form>{String(status.pending)}</form>
}
```

**正确写法：**

```tsx
function MessageForm() {
  return (
    <form>
      <SubmitStatus />
    </form>
  )
}
```

**验证方式：** 对比同组件 probe 与 form 内后代，确认只有后代进入 pending。

### 错误九：把表单外 Hook 当全局监听器，或用嵌套 form 验证作用域

**触发条件：** 在页面顶部调用 Hook 监听所有 form，或把 form 物理嵌套来比较“最近父级”。

**原因：** `useFormStatus` 只读取调用点的合法父 form；HTML 又禁止 form 成为 form 的后代。

**后果：** 表单外调用点保持空闲；嵌套结构还会产生无效 DOM 和 React warning。

**错误示例：**

```tsx
function PageStatus() {
  return <p>{String(useFormStatus().pending)}</p>
}

<form>
  <form>
    <SubmitStatus />
  </form>
</form>
```

**正确写法：**

```tsx
<>
  <PageStatus />
  <form action={saveA}><SubmitStatus /></form>
  <form action={saveB}><SubmitStatus /></form>
</>
```

**验证方式：** DOM 中不存在 `form form`；提交甲时只有甲后代 pending，乙后代与表单外调用点保持
完整空闲状态。

### 错误十：由 function Action 直接推导 `status.method === 'post'`

**触发条件：** form 未声明 method，仅根据 function Action 的 POST 语义断言 status 一定为 post；或
为了改变 status 而显式添加 `method="post"`。

**原因：** React DOM 19.2.8 的 status 读取 DOM form method，未声明时官方测试观察到 `get`；function
Action 与显式 method 同时使用还会触发开发警告。

**后果：** 课程与当前官方测试冲突，并把 DOM 状态误写成真实 HTTP 传输证据。

**错误示例：**

```tsx
<form action={save} method="post">
  <SubmitStatus />
</form>
```

**正确写法：**

```tsx
<form action={save}>
  <SubmitStatus />
</form>
```

**验证方式：** 不声明 `method`、`encType` 或 `target`；React DOM 19.2.8 pending 时观察 `get`，console
没有属性覆盖 warning，Network 没有业务请求。
:::

## 十三、源码推导与适用场景

### 1. 官方事实

React DOM 的公开类型把 `useFormStatus()` 定义为判别联合：空闲分支是
`pending=false` 且其他字段为 null；pending 分支包含 FormData、method 与当前 action。React 官方测试
验证了后代在 Action 等待期间读取这些字段，Action 完成后恢复空闲。

React 的 form 提交实现会从实际 submitter 选择父 `action` 或覆盖 `formAction`，再建立 FormData 和
host Transition。成功路径安排 form reset；拒绝路径把错误交给渲染错误处理。这些固定版本实现只用于
解释公开合同，不应把内部标志、调度 lane 或固定 render 次数当作应用 API。

### 2. 课程推导

状态沿父 form 作用域提供，因此同一个状态组件可以放进多张 form，并自动读取所在表单，不必接收
`formId` 或手工 pending props。`status.action` 返回入口身份，界面可以用引用相等映射为自己的标签。

FormData 在 Action 调用前建立，而 reset 发生在成功完成后，所以提交快照与随后显示的 DOM 状态是两个
观察点：前者证明保存了什么，后者证明哪些未受控字段恢复默认值。失败时还要把自动 reset、Error
Boundary 卸载与恢复后的 remount 分开判断。

### 3. 适用场景

function Action 适合已加载 JavaScript 的 React 表单提交。`useFormStatus` 适合 form 内提交按钮、局部
状态文字与当前提交摘要。一个父 Action 适合共享处理逻辑的意图分支，function `formAction` 适合真正
独立的处理函数。

这套能力不替代表单校验、文件上传解析、网络协议、业务错误模型、事务、幂等或持久化。它也不提供
页面级请求状态、Action 结果历史或乐观列表；这些职责应由对应的数据与状态模型承担。

## 十四、练习

:::exercise

### 练习一：预测字段与重置结果

**要求：** 创建一个包含 `defaultValue="草稿"` 文本框、默认选中的 checkbox 和受控备注的 form。修改
三者后提交，分别记录 Action 收到的 FormData、pending 阶段显示值和成功后的显示值。

**验收：** 能指出 Action 读取提交快照；pending 时未提前 reset；成功后两个未受控字段恢复默认值，受控
备注仍由 State 决定。
:::

:::exercise

### 练习二：比较两种多提交路径

**要求：** 分别实现“两个普通按钮通过 `intent` 进入同一父 Action”和“草稿按钮用 function
`formAction` 覆盖父 Action”，列出每条路径收到的 FormData key。

**验收：** 能区分普通 submitter 数据与覆盖 Action 的函数身份，不为 function `formAction` 按钮重复
声明业务 `name/value`。
:::

:::exercise

### 练习三：推导两个 form 的作用域

**要求：** 分别提交甲、乙兄弟 form，在 pending 与 settle 后记录表单外、两个同组件和两个后代状态
面板的四字段。

**验收：** 每轮只有目标 form 的后代进入 pending，显示对应数据、method 与 Action；其余调用点保持
空闲，settle 后全部恢复空闲。
:::

:::exercise

### 练习四：划分五种状态

**要求：** 把“当前 form 正在提交”“当前提交的数据”“Action 返回的校验结果”“暂时显示的新条目”
“已经确认的条目列表”分别分配给合适的状态来源。

**验收：** 能把五项分别归入 `pending`、`data`、Action 结果 State、乐观 State 与普通应用 State，不用
一个布尔值混合所有阶段。
:::

## 十五、本节小结

- function `action` 直接接收 FormData，不接收 submit event，也不需要 `preventDefault()`。
- React 在 Transition 中调用 Action；同步正常返回或异步履行后重置当前 form 的未受控字段。
- 受控字段仍由 State 决定；抛错或 Promise 拒绝交给最近的 Error Boundary。
- 普通 submitter 的 `name/value` 可进入父 Action，function `formAction` 则用函数身份覆盖父 Action。
- `useFormStatus` 从 `react-dom` 导入，按 `pending` 判别读取 `data`、`method` 与 `action`。
- Hook 调用点必须位于目标 form 内；同组件、表单外和兄弟 form 不共享提交状态。
- 提交数据、提交状态、Action 返回结果、乐观值与已确认业务 State 各有独立职责。

## 十六、参考资料

- [React `<form>`](https://react.dev/reference/react-dom/components/form) - function Action、FormData、
  Transition、成功重置、错误处理与多提交路径。
- [React `useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus) - 四字段判别联合、父 form
  后代作用域、同组件与无父 form 边界。
- [React `<input>`](https://react.dev/reference/react-dom/components/input) - 受控、未受控、默认值与 input
  `formAction`。
- [React 19](https://react.dev/blog/2024/12/05/react-19#react-dom-actions) - React DOM Actions、
  `useFormStatus` 与成功后的未受控字段重置。
- [React `useTransition`](https://react.dev/reference/react/useTransition) - Action 与 await 后 State 更新的
  Transition 边界。
- [XMLHttpRequest Standard `FormData`](https://xhr.spec.whatwg.org/#interface-formdata) - FormData 的条目、
  `get()`、`getAll()` 与值类型。
- [HTML Standard form submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-2) -
  成功控件、submitter 与 form 结构边界。
- [React DOM form Action official tests](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js) -
  四字段、默认 method、成功重置、错误边界与非法嵌套 form。
- [React DOM function Action attribute validation](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L117-L151) -
  function Action 与 method、encType、target 的冲突警告和覆盖规则。
- [WAI-ARIA `status`](https://www.w3.org/TR/wai-aria-1.2/#status) - polite live region 与 atomic
  状态消息语义。
