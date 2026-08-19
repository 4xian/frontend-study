# 表单提交与默认行为研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.form-submit-and-default-behavior`
- 标题：表单提交与默认行为
- 教学层级：零基础到进阶
- 核验日期：`2026-08-09`
- 研究状态：已完成，可进入单知识点课程编写
- 文档基线：React 官方文档 `19.2`

本课只回答一条主线：表单为什么会提交，React 如何通过 `onSubmit` 接管提交，何时需要
`preventDefault()`，如何识别提交按钮并读取表单数据，以及怎样建立最基础的提交中状态。

明确排除：远程请求实现、服务端接口、路由跳转、原生约束校验体系、文件上传、React function Action、
Server Action、`useActionState`、`useFormStatus`、`useOptimistic`、Reducer、Context、Effect、Ref、
第三方表单库、请求重试、取消、服务端幂等和渐进增强。

## 研究方法与证据边界

1. 按仓库顺位首先使用 Tavily。2026-08-09 的 `tavily_search` 与 `tavily_extract` 均成功，没有切换到
   Exa、Parallel、Perplexity 或原生 Web 搜索。
2. Tavily 只用于发现候选入口和交叉检查。最终事实回到 React `19.2`、MDN 与 WHATWG HTML Standard
   官方原文，不使用搜索摘要代替一手来源。
3. React `<form>` Reference 同时讲传统 `onSubmit` 与 React 19 function Action。本课只采用
   `onSubmit` 的公开合同；Action 只用于划清后续课程边界。
4. 浏览器默认提交、`SubmitEvent`、按钮默认类型与 `FormData` 是 Web 平台合同，不应错误归因于 React。
5. “提交中”只建立客户端 UI 状态和基础防重复入口，不承诺请求一定成功，也不等于服务端恰好处理一次。

## Tavily 查询、候选与官方回源结论

| ID | Tavily query | 主要候选 | 采用或排除结论 |
| --- | --- | --- | --- |
| Q1 | `site:react.dev/reference/react-dom/components/form onSubmit preventDefault action function FormData React 19.2` | React `<form>` Reference | 采用传统 `onSubmit`、默认刷新、受控 State 提交来源；function Action 仅作边界。 |
| Q2 | `site:developer.mozilla.org submit event SubmitEvent submitter preventDefault form requestSubmit` | MDN submit event、SubmitEvent | 采用 submit 触发路径、事件目标、`submitter`、`requestSubmit()` 与 `submit()` 差异。 |
| Q3 | `site:developer.mozilla.org button default type submit inside form HTML` | MDN `<button>` | 采用关联表单内按钮默认提交风险；课程示例显式写 `type`。 |
| Q4 | `site:developer.mozilla.org FormData constructor form submitter successful controls name disabled` | MDN `FormData()` | 采用 `name`、disabled、提交按钮与第二参数合同。 |
| Q5 | `site:react.dev controlled input form submit state onSubmit React current state` | React `<form>`、`<input>` | 采用受控输入提交时直接读取当前 State 的建议。 |
| Q6 | `site:react.dev/reference/react useActionState site:react.dev/reference/react-dom/hooks/useFormStatus form action pending React 19.2` | React Action hooks | 只用于确认后续边界，不进入本课实现。 |
| Q7 | `site:developer.mozilla.org FormData getAll duplicate names checkbox unchecked File string Object.fromEntries` | MDN `FormData`、`getAll()` | 采用多值与 `string \| File` 合同；排除把 `Object.fromEntries()` 当无损通用转换。 |
| Q8 | `site:html.spec.whatwg.org successful controls form data set disabled name checked submitter` | WHATWG form infrastructure | 采用 form entry list 和 submitter 的规范语义。 |
| Q9 | `site:html.spec.whatwg.org button missing value default submit state type` | WHATWG button element | 采用 `type` 的 Auto/Submit/Button 边界，不展开 command 与 popover 新能力。 |

搜索还返回教程、问答、旧版 React 文档与翻译站。它们没有提供比官方原文更强的证据，因此不进入来源卡。

## 官方来源卡

| ID | 一手来源 URL | 本课采用的 claim |
| --- | --- | --- |
| `react-form` | [React `<form>`](https://react.dev/reference/react-dom/components/form) | `onSubmit`、默认向当前 URL 提交并刷新、`preventDefault()`、`FormData`、受控 State 提交来源，以及 function Action 边界。 |
| `react-input` | [React `<input>`](https://react.dev/reference/react-dom/components/input) | `name`、受控值、checkbox/radio 和表单提交的公开合同。 |
| `react-state-snapshot` | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) | handler 读取所属 render 的 State 快照。 |
| `react-input-state` | [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state) | 用明确状态建模提交中 UI。 |
| `react-update-queue` | [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) | React 在不同有意事件之间完成更新；基础禁用不扩展为并发保证。 |
| `react-action-state` | [`useActionState`](https://react.dev/reference/react/useActionState) | 只确认 Action 状态属于后续课程。 |
| `react-form-status` | [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus) | 只确认它读取父级 function Action 的状态，不是普通 Promise 的自动 pending 追踪器。 |
| `mdn-submit-event` | [HTMLFormElement submit event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event) | submit event 发生在 form；点击、Enter、`requestSubmit()` 与 `submit()` 的触发差异；校验可能先阻止提交。 |
| `mdn-submitter` | [`SubmitEvent.submitter`](https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter) | 提供本次触发提交的按钮；没有按钮时可以是 `null`。 |
| `mdn-button` | [HTML `<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) | 关联表单内未显式指定类型的按钮可能提交表单；普通命令应使用 `type="button"`。 |
| `mdn-form-data` | [`FormData()` constructor](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) | 按 `name` 收集成功控件；第二参数可包含提交按钮数据。 |
| `mdn-form-data-get` | [`FormData.get()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/get) | 返回第一个值或 `null`。 |
| `mdn-form-data-get-all` | [`FormData.getAll()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/getAll) | 返回同名字段的全部值。 |
| `mdn-prevent-default` | [`Event.preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) | 取消可取消事件的默认行为，不停止传播。 |
| `whatwg-submit` | [Form submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-2) | submit event 可冒泡、可取消；取消后停止提交算法；entry list 使用 submitter。 |
| `whatwg-submitter` | [`SubmitEvent`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-submitevent-interface) | `submitter` 是触发提交的按钮或 `null`。 |
| `whatwg-button` | [`button` element](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element) | `submit`、`reset`、`button` 与缺省 Auto 状态的规范边界。 |

## 一、表单提交是平台行为

### 1.1 React 没有发明 submit

`<form>`、提交按钮、Enter 提交、默认导航与 `submit` event 都来自 HTML 平台。React 的 `onSubmit`
是在组件代码中订阅这次提交事件的接口。即使完全不用 React，浏览器仍会执行同一套表单提交机制。

零基础正文应先建立下面的因果关系：

```text
用户或脚本发起提交
        |
        v
浏览器校验并在 form 上派发 submit event
        |
        v
事件未被取消 -> 浏览器继续默认提交
事件被取消   -> 客户端代码接管后续行为
```

原生约束校验可能在 submit event 之前阻止提交，此时会触发 `invalid` 而不是 `submit`。本课只用一句
边界提示，完整校验体系另设课程。

### 1.2 哪些操作会触发 submit event

官方平台文档确认以下常见入口：

- 用户点击关联表单的提交按钮。
- 用户在合适的表单字段中按 Enter，触发隐式提交。
- 脚本调用 `form.requestSubmit()`。

直接调用 `form.submit()` 不会派发 submit event，因此不会经过 React `onSubmit`。这也是为什么需要
模拟真实提交语义时应使用 `requestSubmit()`，而不是把二者当同义方法。

### 1.3 监听 form，不要只监听按钮 click

submit event 发生在 `<form>` 元素本身，而不是按钮。只给按钮写 `onClick` 会遗漏 Enter 提交、
`requestSubmit()` 和其他提交按钮，也会把“点击动作”与“提交结果”错误绑定。

课程主写法应是：

```tsx
import type { FormEvent } from 'react'

function SignUpForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // 在这里处理已经被客户端接管的提交。
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">提交</button>
    </form>
  )
}
```

## 二、`preventDefault()` 的准确语义

### 2.1 它取消什么

React `<form>` Reference 明确说明：浏览器默认把数据提交到当前 URL 并刷新页面。客户端准备自行处理
提交时，应在 `onSubmit` 中同步调用 `event.preventDefault()`。

`preventDefault()` 取消的是这次事件关联的默认行为。对于 submit event，结果是浏览器不再继续原生
提交算法。它不会自动校验字段、读取数据、保存数据或更新 UI，这些仍由应用代码负责。

### 2.2 它不停止事件传播

`preventDefault()` 与 `stopPropagation()` 处理不同问题：

| API | 处理的问题 | 对 submit 的典型结果 |
| --- | --- | --- |
| `preventDefault()` | 是否执行浏览器默认行为 | 阻止默认导航或刷新，事件仍可冒泡。 |
| `stopPropagation()` | 事件是否继续传播 | 阻止后续祖先监听器收到事件，但不会自动取消默认提交。 |

不要用 `return false` 代替 `preventDefault()`。React 事件处理器的返回值不是取消默认行为的合同。

### 2.3 应立即取消默认行为

事件处理器决定接管提交时，应在进入异步工作之前调用 `preventDefault()`：

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  await saveDraft()
}
```

不要等 `await` 结束后再尝试取消。默认行为是否继续属于事件分发当下的决定，异步完成后再取消已经失去
清晰可靠的时机。

## 三、按钮类型必须显式表达

### 3.1 缺省 `type` 的风险

关联表单内的 `<button>` 没有显式 `type` 时，通常会成为提交按钮。一个原本只想“添加一行”“清空”
或“显示帮助”的按钮，可能因此意外触发表单提交。

课程与 Demo 统一使用：

```tsx
<button type="submit">保存</button>
<button type="button" onClick={addItem}>
  添加一项
</button>
```

不能把规则泛化成“任何位置的 button 都会提交”。按钮必须与表单关联，且 WHATWG 当前还有 command、
popover 等新边界，本基础课不展开。

### 3.2 `onClick` 不能替代 `type`

给普通按钮写 `onClick` 不会改变它的默认类型。即使 click handler 正常执行，按钮仍可能随后触发表单
提交。行为类型由 `type` 表达，事件处理器只表达激活后执行的应用逻辑。

## 四、识别本次提交按钮

### 4.1 `SubmitEvent.submitter`

一个表单可以有“保存草稿”“发布”等多个提交按钮。submit event 的 target/currentTarget 是 form，
不能从 `event.target` 推断用户点击了哪个按钮。原生 `SubmitEvent.submitter` 才表示本次提交按钮；若
提交不是由按钮触发，它可以是 `null`。

React 事件中可以通过 `nativeEvent` 访问它：

```tsx
import type { FormEvent } from 'react'

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const submitEvent = event.nativeEvent as SubmitEvent
  const submitter = submitEvent.submitter

  if (submitter instanceof HTMLButtonElement) {
    console.log(submitter.value)
  }
}
```

类型窄化不能省略 `null` 与非 button 元素边界。若课程 Demo 只使用 `<button>`，仍应展示运行时窄化，
不要把原生对象无条件断言成固定按钮后直接读取。

### 4.2 多提交按钮的数据设计

提交按钮可以携带 `name` 和 `value`：

```tsx
<button type="submit" name="intent" value="draft">
  保存草稿
</button>
<button type="submit" name="intent" value="publish">
  发布
</button>
```

若使用 `FormData` 并希望包含这组数据，需要把 submitter 传给构造器；只调用
`new FormData(form)` 不会自动包含触发提交的按钮值。

## 五、`FormData` 的数据合同

### 5.1 key 来自 `name`，不是 `id`

`new FormData(form)` 按表单控件的 `name` 收集当前提交值。`id` 用于 DOM 标识与 label 关联，不是
表单数据 key。没有 `name` 的输入即使有可见值，也不会进入 FormData。

```tsx
<label htmlFor="email">邮箱</label>
<input id="email" name="email" type="email" />
```

这里 `email` 同时作为 `id` 和 `name` 只是恰好取了相同字符串；二者职责仍然不同。

### 5.2 只有成功控件会被收集

正文需要用平台术语解释“成功控件”，至少覆盖：

- 控件必须有 `name`。
- disabled 控件不会进入提交数据。
- 未选中的 checkbox/radio 不会提供值。
- 文件控件可能提供 `File`。
- 多个同名控件可以产生多个值。
- 提交按钮是否进入数据取决于是否作为 submitter 参与构造。

因此不要先把所有字段设为 disabled，再创建 FormData；那会改变可收集的数据集合。只为防重复提交时，
通常禁用提交按钮即可。

### 5.3 值不是永远的字符串

FormData 的值类型是 `string | File`。`get(name)` 返回第一个值或 `null`，不能无条件断言成 string：

```tsx
const formData = new FormData(event.currentTarget)
const value = formData.get('email')

if (typeof value === 'string') {
  console.log(value.trim())
}
```

同名 checkbox、多选字段或其他重复名称应使用 `getAll(name)`：

```tsx
const topics = formData
  .getAll('topic')
  .filter((value): value is string => typeof value === 'string')
```

`Object.fromEntries(formData)` 对简单单值表单可能方便，但重复 key 会被后值覆盖。它不是 FormData 的
通用无损表示，课程不能用它暗示多选值仍被完整保留。

### 5.4 把 submitter 加入 FormData

```tsx
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const submitEvent = event.nativeEvent as SubmitEvent
  const submitter = submitEvent.submitter
  const formData = submitter
    ? new FormData(event.currentTarget, submitter)
    : new FormData(event.currentTarget)

  console.log(formData.get('intent'))
}
```

第二个参数必须是属于该 form 的提交按钮。正文不展开构造器异常矩阵，只说明为什么不能随意传普通元素。

## 六、受控输入应从 State 提交

React 官方 `<form>` Reference 明确建议：若输入由 State 控制，提交时直接读取 State，而不是再把
FormData 当作新的事实来源。

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'

function ProfileForm() {
  const [displayName, setDisplayName] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log({ displayName })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="displayName"
        value={displayName}
        onChange={(event) => setDisplayName(event.currentTarget.value)}
      />
      <button type="submit">保存</button>
    </form>
  )
}
```

这不是说受控输入不能出现在 FormData。只要它有 `name` 且满足成功控件规则，FormData 仍可收集它。
直接读 State 的理由是保持单一事实来源，并获得应用已经建立的类型与结构。

FormData 更适合非受控表单，或确实需要按原生成功控件规则收集数据的边界。本课可以并列展示这两条
路径，但不能在同一示例中无理由地混用并制造两个提交来源。

## 七、提交中状态与基础防重复

### 7.1 显式建模状态

最小模型可以是 boolean：

```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
```

当页面还需要展示成功、失败或重试时，`idle | submitting | success | error` 这样的有限状态比多个互相
矛盾的 boolean 更清晰。但成功/失败完整流程与远程请求不属于本课，正文只使用 `idle/submitting`。

### 7.2 提交期间禁用提交按钮

```tsx
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? '提交中...' : '提交'}
</button>
```

禁用状态必须同时有可见文本反馈，不能只依赖颜色。按钮尺寸应稳定，状态切换不能挤压或移动表单布局。

handler 内可保留 guard，避免其他调用路径重复进入：

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  if (isSubmitting) return

  setIsSubmitting(true)

  try {
    await completeLocalSubmission()
  } finally {
    setIsSubmitting(false)
  }
}
```

课程 Demo 不应实现真实网络请求，可以用可控的本地异步边界展示状态恢复。课程正文只解释 UI 状态，
不展示临时验证、本地工程环境或测试过程。

### 7.3 防重复的准确边界

禁用按钮与 handler guard 能减少用户重复触发，是客户端基础交互保护。它不保证业务只处理一次：网络
重试、多个标签页、脚本调用、服务端超时重放等问题都需要服务端幂等和请求协议设计。本课不得把 UI
防重复写成“保证只提交一次”。

## 八、React 19 function Action 只作后续边界

React 19 允许把函数传给 `<form action={fn}>`。官方合同与传统 `onSubmit` 不同：

| 传统 `onSubmit` | function Action |
| --- | --- |
| 接收 React form event。 | 接收 `FormData`。 |
| 客户端接管时调用 `preventDefault()`。 | React 接管提交，不需要手写 `preventDefault()`。 |
| pending 状态由应用自行建模。 | 可与 `useActionState`、`useFormStatus` 组合。 |
| 本课完整教学。 | 本课只说明存在，留给后续阶段。 |

function Action 在 Transition 中运行，成功后会重置非受控字段；函数 action 的 method 按 POST 处理。
这些事实只用于防止学生把两套签名混在一起，不在本课提供 Action 示例。

`useFormStatus` 也不是普通 `onSubmit` Promise 的自动 pending 监听器。它的公开合同建立在父级 form
Action 上，必须由 form 内部的子组件调用。完整 Action、错误处理与渐进增强应在专门课程中一起讲解。

## 九、易错点矩阵

| 易错写法 | 错误原因 | 可观察后果 | 正确边界 |
| --- | --- | --- | --- |
| 只监听提交按钮 `onClick` | click 不是表单提交的唯一入口 | Enter 与 `requestSubmit()` 被遗漏 | 在 form 上使用 `onSubmit`。 |
| 认为 submit event 在按钮上 | 混淆触发者与事件目标 | 从 `event.target` 读不到提交意图 | form 是事件目标，按钮看 `submitter`。 |
| `return false` | React 不以返回值取消默认行为 | 页面仍导航或刷新 | 同步调用 `event.preventDefault()`。 |
| 把 `preventDefault` 与 `stopPropagation` 混用 | 二者控制不同机制 | 事件仍传播或默认提交仍执行 | 按需要分别调用。 |
| `await` 后才取消默认行为 | 取消时机不清晰且过晚 | 浏览器可能已经继续默认提交 | handler 开始时立即取消。 |
| 表单内普通按钮省略 `type` | 缺省按钮可能成为提交按钮 | 添加/清空动作意外提交 | 普通命令写 `type="button"`。 |
| 用 `form.submit()` 测试 handler | 该 API 不派发 submit event | `onSubmit` 没有执行 | 使用真实交互或 `requestSubmit()`。 |
| 把 `id` 当 FormData key | FormData 使用 `name` | `get()` 返回 `null` | 同时按职责设置 `id` 与 `name`。 |
| 提交前禁用所有字段 | disabled 控件不是成功控件 | FormData 丢失字段 | 只禁用需要阻止的提交入口。 |
| `get()` 直接断言 string | 返回值还可能是 `File` 或 `null` | 类型假设与运行值不一致 | 使用类型窄化。 |
| 多值字段只用 `get()` | 只返回第一个值 | 其余选项丢失 | 使用 `getAll()`。 |
| 通用使用 `Object.fromEntries()` | 重复 key 会被覆盖 | 多选值静默丢失 | 按字段合同读取，或显式保留数组。 |
| 多按钮只用 `new FormData(form)` | submitter 数据未加入 | 无法区分 draft/publish | 传入第二个 submitter 参数。 |
| 受控输入又把 FormData 当主来源 | 出现两个事实来源 | 类型、转换或状态可能分叉 | 受控表单提交时直接读 State。 |
| 只禁用按钮却声称绝不重复 | UI 保护不等于端到端幂等 | 仍可能产生重复业务处理 | 明确客户端与服务端边界。 |
| 把 `onSubmit(event)` 与 `action(formData)` 混写 | 两套 API 签名和状态模型不同 | 类型与行为都不成立 | 本课使用 `onSubmit`；Action 后课单独讲。 |

## 十、正文编写合同

1. 从 HTML 平台提交行为讲起，再进入 React `onSubmit`，不能把默认导航描述成 React 特性。
2. 所有 React 示例统一使用 TSX；只有讲平台方法签名时才展示原生 DOM 类型。
3. 主线必须覆盖 submit 触发入口、form 事件目标、`preventDefault()`、显式 button type、
   `SubmitEvent.submitter`、FormData 成功控件、受控 State 提交来源和基础提交中状态。
4. 至少给出 `get()`/`getAll()`、`string | File`、`name`/`id`、disabled 与多提交按钮的易错点。
5. Demo 可以与受控表单知识复用同一场景，但运行源码与展示源码必须同源；普通按钮显式
   `type="button"`，提交按钮显式 `type="submit"`。
6. Demo 至少可观察默认行为被取消、提交次数、提交意图、当前字段值和提交中按钮状态；不得发起真实
   网络请求或依赖服务器。
7. 正文不展开校验、上传、请求、路由、Action hooks、服务端幂等、Effect、Ref 或第三方表单库。
8. 正文不得出现 Tavily 调用、临时验证、本地依赖、仓库命令、构建结果、浏览器证据、Gate 或复审过程。
9. 样式使用 Flexbox、margin 与正常流，不使用 CSS Grid 或 `gap`；按钮状态切换保持稳定尺寸，并满足
   键盘焦点、触控尺寸和 390px 可用性。

## 研究结论

第 19 课可以进入课程编写。稳定教学主线是：提交由 HTML 平台发起，React 在 form 的 `onSubmit` 中
接收事件；客户端接管时立即调用 `preventDefault()`；按钮类型必须显式；提交意图通过
`SubmitEvent.submitter` 识别；FormData 遵循成功控件和多值合同；受控输入提交时继续以 State 为事实
来源；提交中状态只能提供基础 UI 防重复。React 19 function Action 与其 hooks 保持为后续边界。
