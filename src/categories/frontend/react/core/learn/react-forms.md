---
id: react.core.learn.basics.react-forms
type: lesson
title: React 表单
summary: 使用受控与非受控字段管理当前值，并通过原生提交事件和 FormData 读取表单数据。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 150
prerequisites:
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-state
  - react.core.learn.basics.dom-props
  - react.core.learn.basics.use-id-accessible-links
related:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.basics.immutable-state-updates
  - react.core.learn.basics.state-ownership-and-thinking-in-react
tags:
  - React
  - form
  - controlled input
  - FormData
  - accessibility
  - TypeScript
appliesTo: React 19.2（React DOM）、HTML Living Standard、@types/react 19.2.18
verifiedAt: 2026-08-16
objectives:
  - 能区分控件当前值与提交数据两个边界。
  - 能用 value、checked 和同步 onChange 管理受控字段。
  - 能用 defaultValue、defaultChecked 初始化非受控字段。
  - 能保持受控或非受控模式在控件生命周期内一致。
  - 能正确处理 input、textarea、单选与多选 select、checkbox 和 radio。
  - 能在 form 的 onSubmit 中取消浏览器默认提交。
  - 能根据 name、选中状态和 disabled 规则理解 FormData entry list。
  - 能用 get 与 getAll 分别读取单值和同名多值。
  - 能用 label、id、aria-describedby、fieldset、legend 和 required 建立基础表单语义。
  - 能为抽取的 change 与 submit 处理器标注当前 React 事件类型。
recap:
  - 受控文本和 select 使用 value，受控 checkbox 与 radio 使用 checked，并在 onChange 中同步更新 State。
  - defaultValue 与 defaultChecked 只提供非受控字段的初始值，后续当前值由浏览器保存。
  - 同一控件不能在受控与非受控之间切换，也不能同时提供当前值 prop 和对应默认值 prop。
  - name 决定 FormData 的键，id 建立元素身份与 label 或描述关联，两者职责不同。
  - onSubmit 发生在 form；preventDefault 只取消默认提交，不读取数据，也不停止事件传播。
  - FormData 只包含符合平台规则的 entry；disabled、无 name、未选中的 checkbox 或 radio 不产生 entry。
  - get 返回首个同名值，getAll 返回全部同名值；同名 checkbox 与 multiple select 应使用 getAll。
  - 当前 React 类型使用 SubmitEvent<HTMLFormElement> 标注提交处理器，nativeEvent.submitter 表示提交控件。
sources:
  - title: React input Reference
    url: https://react.dev/reference/react-dom/components/input
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - input 的 value、checked、defaultValue、defaultChecked、onChange、name、required 与受控生命周期
  - title: React textarea Reference
    url: https://react.dev/reference/react-dom/components/textarea
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - textarea 的 value、defaultValue、onChange 与 children 边界
  - title: React select Reference
    url: https://react.dev/reference/react-dom/components/select
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - select 的 value、defaultValue、multiple、selectedOptions 与提交多值
  - title: React form Reference
    url: https://react.dev/reference/react-dom/components/form
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - form onSubmit、preventDefault 与 FormData 读取
  - title: React Using TypeScript
    url: https://react.dev/learn/typescript
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - JSX 事件类型推断与 ChangeEvent 标注
  - title: HTML Forms
    url: https://html.spec.whatwg.org/multipage/forms.html
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - label、fieldset、legend、button、required 与表单控件语义
  - title: HTML constructing the entry list
    url: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - name、disabled、选中状态、submitter 与多值 entry 规则
  - title: XMLHttpRequest FormData
    url: https://xhr.spec.whatwg.org/#interface-formdata
    sourceType: specification
    appliesTo: XHR Living Standard
    claims:
      - FormData 构造器、get、getAll 与有序 entry list
  - title: WAI-ARIA aria-describedby
    url: https://www.w3.org/TR/wai-aria-1.2/#aria-describedby
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - 表单控件补充描述的 ID 引用关系
  - title: React type declarations
    url: https://unpkg.com/@types/react@19.2.18/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - ChangeEvent、SubmitEvent、SubmitEventHandler 与 FormEvent 弃用标记
---

# React 表单

## 一、学习目标

- 区分“用户正在编辑的当前值”和“提交时生成的数据”两个边界。
- 掌握受控字段的 `value`、`checked` 与同步 `onChange` 合同。
- 掌握非受控字段的 `defaultValue`、`defaultChecked` 与浏览器值所有权。
- 正确使用文本 `input`、`textarea`、`select`、checkbox 和 radio。
- 在 `<form onSubmit>` 中处理所有正常提交入口，并准确使用 `preventDefault()`。
- 理解 `FormData` 按 `name`、选中状态、disabled 状态和 submitter 生成 entry list。
- 使用 `get()` 与 `getAll()` 读取单值和同名多值。
- 为控件建立 label、描述、分组与必填语义。
- 使用当前 React TypeScript 事件类型声明抽取的处理器。

## 二、表单包含两个不同边界

### 1. 当前控件值

用户输入字符、切换 checkbox 或选择 option 时，控件的当前值会发生变化。React 代码首先要决定当前值
由谁保存：

- 受控字段：当前值由 React State 保存，JSX 每次 render 把值写给控件。
- 非受控字段：当前值由浏览器 DOM 保存，React 可以提供初始值。

受控文本输入的闭环是：

```text
React render -> value -> input
用户输入 -> onChange -> setState -> 下一次 render
```

任何一环缺失都会破坏合同。只有 `value` 没有同步更新 State，输入会被旧值写回；只有 `onChange` 没有
`value`，控件仍是非受控字段。

### 2. 提交数据

提交发生在另一个时间点。浏览器根据表单当前状态生成有序的 name/value entry list，`FormData` 提供了读取
这个结果的接口。

```text
用户触发提交
  -> 原生约束校验
  -> form 上的 submit event
  -> 未取消：浏览器继续默认提交
  -> 已取消：客户端代码留在当前页面处理数据
```

控件当前值与提交数据有关，但不是同一个概念：

| 问题 | 负责的接口 |
| --- | --- |
| 输入框此刻显示什么 | `value`、`checked` 或浏览器保存的当前值 |
| 用户编辑时怎样通知 React | `onChange` |
| 非受控字段初始显示什么 | `defaultValue`、`defaultChecked` |
| 哪个字符串成为提交字段名 | `name` |
| 提交时包含哪些字段 | HTML entry list 规则 |
| 客户端怎样读取提交投影 | `FormData` |

## 三、受控文本 input

### 1. value 与 onChange 必须成对

```tsx
import { useState } from 'react'
import type { ChangeEvent } from 'react'

/** 展示由 React State 驱动的姓名输入。 */
export function NameField() {
  const [name, setName] = useState('')

  /** 把输入控件的当前字符串同步到 State。 */
  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.currentTarget.value)
  }

  return <input value={name} onChange={handleNameChange} />
}
```

`event.currentTarget` 是挂载处理器的 input，`value` 的类型是字符串。React 的 `onChange` 对文本控件会在
用户编辑时立即触发，使用方式更接近浏览器的 `input` event，不应按“失去焦点才触发”的原生 change
语义理解。

### 2. 同步更新指更新值的时机

受控 handler 必须在这次 `onChange` 调用中安排对应 State 更新：

```tsx
/** 同步保存用户刚输入的字符串。 */
function handleChange(event: ChangeEvent<HTMLInputElement>) {
  setValue(event.currentTarget.value)
}
```

网络请求、日志记录或其它异步工作不能代替这个写回。可以在更新 State 后执行其它逻辑，但不能等异步结果
返回才让 `value` 跟上用户输入。

### 3. 空字符串是稳定的文本初始值

受控文本字段应在整个生命周期内保持字符串：

```tsx
const [query, setQuery] = useState('')
```

如果数据可能是 `null` 或 `undefined`，在交给 `value` 前收敛为字符串：

```tsx
<input value={profile.name ?? ''} onChange={handleNameChange} />
```

不要让首次 render 的 `value` 是 `undefined`，后续又变成字符串。前者表示非受控，后者表示受控，会发生
模式切换。

### 4. number input 的 value 仍是字符串

`<input type="number">` 限制输入界面，但 DOM `value` 仍是字符串：

```tsx
const [ageText, setAgeText] = useState('18')

/** 保留 number input 的原始字符串，包括空值。 */
function handleAgeChange(event: ChangeEvent<HTMLInputElement>) {
  setAgeText(event.currentTarget.value)
}
```

保留字符串可以表示用户清空字段、只输入负号等编辑中状态。需要数字时，在明确的业务边界进行校验和转换，
不要把 `event.currentTarget.value` 误标为 number。

## 四、checkbox 与 radio

### 1. checked 表示选中状态

checkbox 的 UI 状态由 `checked` 控制，change handler 读取 `currentTarget.checked`：

```tsx
const [subscribed, setSubscribed] = useState(false)

/** 同步复选框当前的布尔选中状态。 */
function handleSubscribedChange(event: ChangeEvent<HTMLInputElement>) {
  setSubscribed(event.currentTarget.checked)
}

const field = (
  <input
    name="notification"
    type="checkbox"
    value="email"
    checked={subscribed}
    onChange={handleSubscribedChange}
  />
)
```

这里有两个不同值：

- `checked` 是 boolean，决定控件是否选中。
- `value="email"` 是选中时进入表单数据的字符串。

读取 `event.currentTarget.value` 不能判断 checkbox 是否选中。它通常只会得到预先声明的提交值。

### 2. 未声明 value 的 checkbox 提交 on

选中的 checkbox 如果没有显式 `value`，平台默认提交字符串 `"on"`。未选中的 checkbox 不产生 entry，
不会自动提交 `false`。

需要有业务含义的结果时，显式写出值：

```tsx
<input name="topic" type="checkbox" value="react" />
```

### 3. radio 组共享 name

同一 radio 组共享 `name`，每项有不同 `value`。受控 State 保存当前选项值，每个 radio 的 `checked` 由
比较得到：

```tsx
type Mode = 'reading' | 'practice'

const [mode, setMode] = useState<Mode>('reading')

/** 同步单选组当前选中的提交值。 */
function handleModeChange(event: ChangeEvent<HTMLInputElement>) {
  setMode(event.currentTarget.value as Mode)
}

const fields = (
  <>
    <input
      name="mode"
      type="radio"
      value="reading"
      checked={mode === 'reading'}
      onChange={handleModeChange}
    />
    <input
      name="mode"
      type="radio"
      value="practice"
      checked={mode === 'practice'}
      onChange={handleModeChange}
    />
  </>
)
```

`as Mode` 只告诉 TypeScript 代码接受哪些字符串，不会在运行时校验 DOM 值。选项由本地固定 JSX 声明时，
这个窄化边界清楚；来自外部数据的值需要实际校验。

## 五、textarea 与 select

### 1. textarea 使用 value 或 defaultValue

React 中受控 textarea 使用字符串 `value`，非受控 textarea 使用 `defaultValue`：

```tsx
const [notes, setNotes] = useState('')

/** 同步多行文本的当前字符串。 */
function handleNotesChange(event: ChangeEvent<HTMLTextAreaElement>) {
  setNotes(event.currentTarget.value)
}

const controlledNotes = <textarea value={notes} onChange={handleNotesChange} />
const uncontrolledNotes = <textarea defaultValue="初始说明" />
```

不要使用 `<textarea>初始说明</textarea>` 提供 React textarea 的初始内容。

### 2. 单选 select 使用字符串 value

```tsx
type Delivery = 'online' | 'classroom'

const [delivery, setDelivery] = useState<Delivery>('online')

/** 同步单选 select 的当前值。 */
function handleDeliveryChange(event: ChangeEvent<HTMLSelectElement>) {
  setDelivery(event.currentTarget.value as Delivery)
}

const deliveryField = (
  <select value={delivery} onChange={handleDeliveryChange}>
    <option value="online">线上</option>
    <option value="classroom">教室</option>
  </select>
)
```

React 用 select 自身的 `value` 决定选项，不在 `<option>` 上写 `selected`。

### 3. multiple select 使用字符串数组

`multiple={true}` 时，受控 `value` 是字符串数组：

```tsx
const [topics, setTopics] = useState<string[]>(['tsx', 'state'])

/** 从 selectedOptions 读取当前全部选项。 */
function handleTopicsChange(event: ChangeEvent<HTMLSelectElement>) {
  setTopics(Array.from(event.currentTarget.selectedOptions, (option) => option.value))
}

const topicField = (
  <select multiple value={topics} onChange={handleTopicsChange}>
    <option value="tsx">TSX</option>
    <option value="state">State</option>
    <option value="forms">Forms</option>
  </select>
)
```

非受控 multiple select 的初始值同样是字符串数组：

```tsx
<select name="topic" multiple defaultValue={['tsx', 'state']}>
  <option value="tsx">TSX</option>
  <option value="state">State</option>
  <option value="forms">Forms</option>
</select>
```

提交时每个已选且未禁用的 option 都产生一个同名 entry。

## 六、非受控字段与默认值

### 1. defaultValue 只设置初始值

```tsx
<input name="invitationCode" defaultValue="REACT-19" />
```

首次挂载时，浏览器输入框以这个字符串开始。用户编辑后，当前值保存在 DOM 中。组件重新 render 时，
`defaultValue` 不会像受控 `value` 一样持续覆盖用户输入。

### 2. defaultChecked 只设置初始选中状态

```tsx
<input name="topic" type="checkbox" value="tsx" defaultChecked />
```

`defaultChecked` 提供初始 boolean 状态；用户后续可以独立切换。提交时仍按控件实际的当前选中状态决定是否
产生 entry。

### 3. 受控与非受控是二选一合同

| 模式 | JSX 提供 | 当前值由谁保存 | React 怎样读取 |
| --- | --- | --- | --- |
| 受控文本或 select | `value + onChange` | React State | 直接读取 State |
| 受控 checkbox 或 radio | `checked + onChange` | React State | 直接读取 State |
| 非受控文本或 select | 可选 `defaultValue` | 浏览器 DOM | 提交时用 FormData |
| 非受控 checkbox 或 radio | 可选 `defaultChecked` | 浏览器 DOM | 提交时用 FormData |

同一个控件不能同时使用 `value` 与 `defaultValue`，也不能同时使用 `checked` 与 `defaultChecked`。这两组
prop 分别表达持续控制和只给初值，语义互斥。

### 4. 生命周期内不要切换模式

错误写法：

```tsx
<input value={profile?.name} onChange={handleNameChange} />
```

当 `profile` 未就绪时，值是 `undefined`，控件非受控；数据到达后值变成字符串，控件又变成受控。正确写法
应从第一次 render 就确定模式：

```tsx
<input value={profile?.name ?? ''} onChange={handleNameChange} />
```

checkbox 或 radio 的受控值同样应始终是 boolean。

## 七、字段名称与基础无障碍

### 1. name、id 和 label 职责不同

```tsx
<label htmlFor="course-email">课程邮箱</label>
<input id="course-email" name="email" type="email" />
```

| 接口 | 职责 |
| --- | --- |
| `name` | 成为 FormData entry 的键 |
| `id` | 在当前文档中标识元素，并作为关联目标 |
| `htmlFor` | 让 label 引用具有相同 id 的控件 |
| label 文本 | 提供可见名称和可访问名称 |

`id` 不能代替 `name`。只有 id 没有 name 的字段可以被 label 正确关联，但不会进入 FormData。只有 name
没有 label 的字段可以提交，但用户可能不知道字段用途。

### 2. aria-describedby 提供补充描述

```tsx
<label htmlFor="course-name">课程名称</label>
<input id="course-name" name="name" aria-describedby="course-name-help" />
<p id="course-name-help">填写目录中显示的名称。</p>
```

`aria-describedby` 引用帮助文本或错误说明，为已有名称增加描述。它不能代替 label。多个描述 ID 使用空格
分隔，并且每个 ID 都应指向当前存在的元素。

### 3. checkbox 与 radio 仍需要 label

```tsx
<input id="receive-email" name="notification" type="checkbox" value="email" />
<label htmlFor="receive-email">接收邮件通知</label>
```

点击 label 可以激活关联控件。可复用组件中的 ID 应保持实例唯一，不能让多个字段共享同一个硬编码 ID。

### 4. 使用 fieldset 与 legend 表达一组选择

```tsx
<fieldset>
  <legend>学习方式</legend>
  <label>
    <input name="mode" type="radio" value="reading" />
    阅读讲解
  </label>
  <label>
    <input name="mode" type="radio" value="practice" />
    动手练习
  </label>
</fieldset>
```

`legend` 提供整组问题，单项 label 提供每个选项名称。不要只靠布局或颜色表达分组关系。

### 5. required 是原生约束

```tsx
<input name="name" required />
```

正常交互式提交时，浏览器会先进行原生约束校验。必填字段缺值可能阻止 submit event，因此 `onSubmit`
不一定执行。`required` 不等于完整业务校验，服务端也不能因为浏览器做过检查就信任输入。

### 6. disabled 同时改变交互和提交

```tsx
<input name="internalCode" value="INTERNAL-01" disabled readOnly />
```

disabled 控件不可交互，也不进入 FormData。需要提交一个值时，不能先把对应字段 disabled 再假设它仍会
被浏览器收集。`readOnly` 与 `disabled` 的提交行为不同，不要互换使用。

## 八、form onSubmit 与默认行为

### 1. 提交处理器挂在 form 上

```tsx
import type { SubmitEvent as ReactSubmitEvent } from 'react'

/** 接管表单提交并留在当前页面。 */
function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  console.log('客户端接管提交')
}

const form = (
  <form onSubmit={handleSubmit}>
    <button type="submit">提交</button>
  </form>
)
```

提交处理器放在 form 上，可以统一覆盖点击提交按钮和键盘触发的正常提交。只监听按钮 `onClick` 会把
表单语义缩成某一个点击入口。

### 2. preventDefault 只取消默认提交

浏览器默认会按 form 的属性和平台规则继续提交，通常伴随导航或页面刷新。客户端决定自行处理时，在
handler 开头调用 `event.preventDefault()`。

它不会：

- 自动读取字段。
- 自动把值保存到 State。
- 自动发起网络请求。
- 自动显示成功结果。
- 停止事件传播。

`stopPropagation()` 控制传播路径，`preventDefault()` 控制默认行为。返回 `false` 也不能替代明确调用。

### 3. currentTarget 是当前 form

```tsx
/** 从挂载处理器的 form 构造提交数据。 */
function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
}
```

`event.currentTarget` 由处理器挂载位置决定，类型是 `HTMLFormElement`。不要从某个按钮的 click event
拼装整个表单数据。

## 九、button type 与 submitter

### 1. 按钮明确声明 type

表单中的普通 `<button>` 在常见情况下默认是提交按钮。每个按钮都应写出真实命令：

```tsx
<button type="button" onClick={handlePreview}>
  预览
</button>
<button type="submit">提交</button>
```

`type="button"` 不触发表单提交；`type="submit"` 发起提交。是否存在 `onClick` 不会改变按钮的默认类型。

### 2. submitter 表示本次提交控件

提交按钮也可以提供 `name=value`：

```tsx
<button type="submit" name="intent" value="register">
  提交报名
</button>
```

原生 `SubmitEvent.submitter` 是触发本次提交的元素，也可能是 `null`。如果需要让提交按钮的 name/value
进入新 FormData，应把 submitter 传给构造器：

```tsx
/** 构造包含本次提交按钮的 FormData。 */
function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget, event.nativeEvent.submitter)
  console.log(formData.get('intent'))
}
```

`new FormData(form)` 没有 submitter 参数时，不会凭空判断哪个提交按钮应进入 entry list。

## 十、FormData entry list

### 1. FormData 不是所有 DOM 子节点的复制

`new FormData(form)` 读取表单当前状态，并按 HTML 规则构造有序 entry list。常见结果如下：

| 控件状态 | 是否产生 entry | 结果 |
| --- | --- | --- |
| 有有效 name 的普通可用字段 | 是 | name 成为 key，当前提交值成为 value |
| 没有 name 或 name 为空 | 否 | id 不能代替 name |
| disabled 字段 | 否 | 当前值不会被收集 |
| 未选中的 checkbox 或 radio | 否 | 不会产生 `false` 字符串 |
| 选中的 checkbox 或 radio | 是 | 使用控件的 value；缺省值为 `on` |
| multiple select 的已选 option | 是 | 每个已选 option 产生独立同名 entry |
| 非本次 submitter 的按钮 | 否 | 普通按钮和其它提交按钮都不产生 entry |
| 本次 submitter | 取决于构造方式 | 传给 FormData 构造器时可包含其 name/value |

entry 有顺序，同名字段不会相互覆盖。这个模型比“表单变成一个普通对象”更准确。

### 2. get 返回首个同名值

```tsx
const name = formData.get('name')
```

返回类型是 `FormDataEntryValue | null`，其中 `FormDataEntryValue` 是 `string | File`。即使表单当前只包含
文本字段，通用读取函数也应处理类型：

```tsx
/** 只接受指定字段的文本 entry。 */
function readTextValue(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}
```

`get()` 只返回第一个匹配 entry。字段不存在时返回 `null`。

### 3. getAll 保留全部同名值

```tsx
/** 读取全部同名文本 entry。 */
function readTextValues(formData: FormData, name: string) {
  return formData.getAll(name).filter((value): value is string => typeof value === 'string')
}

const topics = readTextValues(formData, 'topic')
```

同名 checkbox、radio 组和 multiple select 都可能使用同一 name。其中 radio 正常只产生一个选中值，
checkbox 组与 multiple select 可以产生多个值。需要完整集合时使用 `getAll()`。

### 4. 不要用普通对象丢失重复 key

```tsx
const payload = Object.fromEntries(formData)
```

普通对象的同名属性只能保留一个值，上面的转换会丢失重复 entry，因此不能作为表单数据的通用无损表示。
需要对象结构时，应先明确每个字段是单值还是多值，再分别用 `get()` 和 `getAll()` 构造业务对象。

## 十一、TypeScript 事件类型

### 1. 内联 handler 优先使用推断

```tsx
<input value={name} onChange={(event) => setName(event.currentTarget.value)} />
```

JSX 已知 `onChange` 属于 input，因此 TypeScript 可以推断 `event`。抽取为命名函数后，再明确元素类型。

### 2. change handler 按元素区分

```tsx
import type { ChangeEvent } from 'react'

/** 处理单行输入控件。 */
function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
  console.log(event.currentTarget.value)
}

/** 处理多行文本控件。 */
function handleTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
  console.log(event.currentTarget.value)
}

/** 处理下拉选择控件。 */
function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
  console.log(event.currentTarget.selectedOptions)
}
```

不要为了复用而把所有事件写成宽泛的 `Event` 或 `any`。元素类型直接决定 currentTarget 上可用的属性。

### 3. 当前提交类型是 React SubmitEvent

当前 `@types/react 19.2.18` 已把 `FormEvent` 标记为 deprecated，`onSubmit` 使用
`SubmitEventHandler<T>`。抽取提交处理器时写成：

```tsx
import type { SubmitEvent as ReactSubmitEvent } from 'react'

/** 使用当前 React 类型读取 form 与原生 submitter。 */
function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget, event.nativeEvent.submitter)
}
```

别名 `ReactSubmitEvent` 用来与全局 DOM `SubmitEvent` 区分。React 合成事件的 `nativeEvent` 已正确指向
DOM `SubmitEvent`，不需要额外强制断言。

## 十二、完整观察示例

下面的 Demo 同时展示：

- 受控文本、checkbox、radio、select 与 textarea。
- 使用 `defaultValue`、`defaultChecked` 的非受控字段。
- label、描述关联、fieldset、legend、required 与 disabled。
- 普通按钮与提交按钮的 type 差异。
- form `onSubmit`、`preventDefault()` 与 submitter。
- FormData 有序 entry、`get()`、`getAll()` 和 disabled 排除规则。

:::demo{id="react.core.learn.basics.react-forms.form-values-demo"}
:::

观察顺序：

1. 编辑受控姓名、通知、学习方式、授课方式和说明，确认 React 当前值立即变化。
2. 编辑非受控邀请码、主题 checkbox 和 multiple select，确认 React State 区域不承担这些当前值。
3. 点击普通预览，确认它只更新计数，不产生提交快照。
4. 清空 required 姓名并提交，确认浏览器先阻止无效提交。
5. 恢复姓名并提交，检查 FormData entry 的原始顺序。
6. 比较同名 `topic` 的 entry 与 `getAll(topic)` 结果。
7. 确认未选中的 checkbox、disabled 内部编号没有进入结果。
8. 确认提交按钮的 `intent=register` 被第二个 FormData 参数包含。

## 十三、常见错误

:::pitfalls
### 错误一：提供受控值却没有同步写回

**触发条件：** 给可编辑字段传入 `value` 或 `checked`，但没有 `onChange`，或者 handler 没有更新
对应的 State。

**原因：** 每次 render 提供的受控 prop 是控件当前值。用户编辑后，如果 State 没有同步变化，下一次
render 仍会把旧值交给控件。

**后果：** 字段看起来只读，或用户刚输入的内容立即恢复为旧值；React 还会对缺少 handler 的受控字段
发出警告。

**错误示例：**

```tsx
const [name] = useState('')

return <input name="name" value={name} />
```

**正确写法：**

```tsx
const [name, setName] = useState('')

return (
  <input
    name="name"
    value={name}
    onChange={(event) => setName(event.currentTarget.value)}
  />
)
```

**验证方式：** 连续输入多个字符，确认控件显示值与 State 快照始终一致，并且控制台没有受控字段警告。

### 错误二：用 checkbox 或 radio 的 value 控制选中状态

**触发条件：** 把 `value` 当作 checkbox / radio 的布尔选中状态，或在 `onChange` 中读取
`currentTarget.value` 判断是否选中。

**原因：** `checked` 表示 UI 是否选中；`value` 表示该控件被选中后写入表单 entry 的提交值。两者属于
不同合同。

**后果：** React State 与界面选中状态不同步；未显式提供 value 的 checkbox 被选中时还可能提交默认值
`on`，而不是期望的 `true`。

**错误示例：**

```tsx
<input
  type="checkbox"
  name="notifications"
  value={String(enabled)}
  onChange={(event) => setEnabled(Boolean(event.currentTarget.value))}
/>
```

**正确写法：**

```tsx
<input
  type="checkbox"
  name="notifications"
  value="email"
  checked={enabled}
  onChange={(event) => setEnabled(event.currentTarget.checked)}
/>
```

**验证方式：** 交替选中和取消，确认 State 保存 boolean；提交时只有选中状态产生
`notifications=email` entry。

### 错误三：混用受控与非受控合同

**触发条件：** 同一字段同时提供 `value` 与 `defaultValue`、`checked` 与 `defaultChecked`，或者让受控值
在 `undefined` / `null` 与字符串、boolean、字符串数组之间切换。

**原因：** 当前值只能由 React 或浏览器 DOM 其中一方持续保存。默认值 prop 只负责非受控字段的初始值，
不能与持续受控 prop 同时承担值来源。

**后果：** React 无法得到稳定的值所有权合同并发出警告；用户输入可能被覆盖，后续代码也无法判断应从
State 还是 DOM 读取当前值。

**错误示例：**

```tsx
const [name, setName] = useState<string | undefined>(undefined)

return (
  <input
    value={name}
    defaultValue="初始名称"
    onChange={(event) => setName(event.currentTarget.value)}
  />
)
```

**正确写法：**

```tsx
const [name, setName] = useState('')

return (
  <>
    <input
      value={name}
      onChange={(event) => setName(event.currentTarget.value)}
    />
    <input name="inviteCode" defaultValue="WELCOME" />
  </>
)
```

**验证方式：** 检查字段从首次 render 到卸载前始终使用同一种模式；编辑字段时没有模式切换警告，
非受控字段在后续 render 中不会被默认值重新覆盖。

### 错误四：沿用原生 textarea children 或 option selected 写法

**触发条件：** 用 `<textarea>内容</textarea>` 提供 React textarea 的初始内容，或在单个 option 上写
`selected` 决定 React select 的选中项。

**原因：** React 将 textarea 和 select 的值接口统一到控件自身：持续控制用 `value`，只提供初始值用
`defaultValue`；选择状态不由 option 独立保存。

**后果：** 声明不能表达稳定的受控或非受控合同，可能产生警告，单选和多选逻辑也难以统一。

**错误示例：**

```tsx
<textarea>请补充说明</textarea>

<select>
  <option value="online" selected>
    线上
  </option>
</select>
```

**正确写法：**

```tsx
<textarea name="notes" defaultValue="请补充说明" />

<select name="delivery" defaultValue="online">
  <option value="online">线上</option>
  <option value="onsite">线下</option>
</select>
```

**验证方式：** 修改默认值后重新挂载控件，确认初始选择正确；用户编辑后的一次普通父组件 render 不会把
非受控当前值恢复成默认值。

### 错误五：把所有可见字段都当成 FormData entry

**触发条件：** 只给字段写 `id` 而没有 `name`，依赖 disabled 字段提交，或期待未选中的 checkbox /
radio 产生 `false` entry。

**原因：** `FormData` 按 HTML 的 entry list 规则构造提交数据。无有效 `name`、disabled、未选中的
checkbox / radio 都会被跳过；`id` 只负责元素身份和关联。确实需要随表单提交但不需要用户编辑的值可以
使用 hidden 字段，但接收端仍须独立校验。

**后果：** 界面上能看到的值没有进入提交数据，后续读取返回 `null`；如果业务需要明确的 false 或禁用值，
仅靠这些控件不会自动生成它们。

**错误示例：**

```tsx
<input id="course-name" defaultValue="React 表单" />
<input name="internalCode" value="REACT-FORM" disabled readOnly />
<input type="checkbox" name="public" value="yes" />
```

**正确写法：**

```tsx
<label htmlFor="course-name">课程名称</label>
<input id="course-name" name="courseName" defaultValue="React 表单" />
<input type="hidden" name="internalCode" value="REACT-FORM" />
<input type="checkbox" name="public" value="yes" defaultChecked />
```

**验证方式：** 用 `Array.from(formData.entries())` 查看原始 entry 顺序，分别确认有 name 的可用字段、
disabled 字段和未选中字段是否出现。

### 错误六：只处理按钮点击或省略按钮 type

**触发条件：** 把提交主逻辑写在提交按钮 `onClick` 中，或者让表单内的预览、重置局部状态等普通按钮
省略 `type`。

**原因：** 表单可由点击、键盘和浏览器 API 等入口提交，统一边界是 form 的 `onSubmit`。表单内 button
在常规场景省略 type 时默认具有提交语义。

**后果：** 键盘提交绕过业务逻辑；普通按钮可能意外触发约束校验和提交。

**错误示例：**

```tsx
<form>
  <button onClick={handleSubmit}>提交</button>
  <button onClick={showPreview}>预览</button>
</form>
```

**正确写法：**

```tsx
<form onSubmit={handleSubmit}>
  <button type="submit" name="intent" value="register">
    提交
  </button>
  <button type="button" onClick={showPreview}>
    预览
  </button>
</form>
```

**验证方式：** 在文本字段中按 Enter 与点击提交按钮都应进入同一 `onSubmit`；点击预览只能执行预览命令。

### 错误七：混淆 preventDefault、事件传播与数据读取

**触发条件：** 认为 `preventDefault()` 会读取字段、阻止事件冒泡或关闭原生约束校验，或者用
`stopPropagation()` 代替取消浏览器默认提交。

**原因：** `preventDefault()` 只取消当前可取消事件的默认行为；`stopPropagation()` 只影响事件传播。
字段读取由 State 或 `FormData` 完成，约束校验通常发生在 submit event 之前。

**后果：** 页面仍可能刷新，父级 handler 仍可能收到事件，或代码在没有读取数据时误以为已经完成提交。

**错误示例：**

```tsx
function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.stopPropagation()
  console.log('表单已经保存')
}
```

**正确写法：**

```tsx
function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget, event.nativeEvent.submitter)
  console.log(formData.get('courseName'))
}
```

**验证方式：** 提交有效表单后页面不刷新且能读到 entry；在外层临时监听 submit 时，确认是否传播与是否执行
默认行为是两个独立结果。

### 错误八：用单值结构保存同名多值

**触发条件：** 用 `get()` 读取 checkbox 组或 multiple select，或直接认为
`Object.fromEntries(formData)` 能无损保存所有 entry。

**原因：** 一个表单可以生成多个同名 entry。`get()` 只返回首个值，普通对象的同名属性只能保留一个值。

**后果：** 用户选择的部分值被静默丢失，提交结果与界面选择不一致。

**错误示例：**

```tsx
const topics = formData.get('topic')
const payload = Object.fromEntries(formData)
```

**正确写法：**

```tsx
const topics = formData.getAll('topic').filter(
  (value): value is string => typeof value === 'string',
)

const entries = Array.from(formData.entries())
```

**验证方式：** 至少选中两个同名 checkbox 和两个 multiple option，确认 `getAll()` 与原始 entries 保留
全部值及表单顺序。

### 错误九：忽略 FormData 类型与表单语义

**触发条件：** 把 `FormData.get()` 结果直接调用字符串方法，使用帮助文本代替 label，或认定点击提交按钮后
`onSubmit` 必然执行。

**原因：** `get()` 返回 `string | File | null`；`aria-describedby` 提供补充描述而不是可访问名称；无效的
required 字段可能在 submit event 派发前被浏览器约束校验拦截。

**后果：** 缺失字段或文件字段造成运行时错误，辅助技术无法得到字段名称，提交 handler 也可能没有机会
执行。

**错误示例：**

```tsx
const courseName = formData.get('courseName').trim()

<p id="name-help">请输入课程名称</p>
<input name="courseName" aria-describedby="name-help" required />
```

**正确写法：**

```tsx
const rawCourseName = formData.get('courseName')
const courseName = typeof rawCourseName === 'string' ? rawCourseName.trim() : ''

<label htmlFor="course-name">课程名称</label>
<p id="name-help">请输入课程名称</p>
<input
  id="course-name"
  name="courseName"
  aria-describedby="name-help"
  required
/>
```

**验证方式：** 分别检查缺失值、普通文本值和文件值的类型分支；使用可访问性树确认字段名称来自 label，
清空 required 字段后确认浏览器先阻止无效提交。
:::

## 十四、源码推导与适用场景

### 1. React 公共接口确定当前值合同

React 的 `input`、`textarea` 与 `select` 文档共同规定了受控接口：文本类控件和 select 使用
`value + onChange`，checkbox / radio 使用 `checked + onChange`。`defaultValue` 与
`defaultChecked` 只设置非受控字段的初始值。这些公共接口足以判断字段由 React State 还是浏览器 DOM
保存，不需要依赖 React 内部对象或私有属性。

固定版本的 `ReactDOMInput.js` 还可以观察到两类开发期检查：一类检查 `value` 与 `defaultValue`、
`checked` 与 `defaultChecked` 是否同时出现；另一类检查字段是否在受控和非受控之间切换。源码证明当前
版本怎样发现错误，但公共承诺仍以 React 文档为准，不能依赖警告文字或内部函数名称保持不变。

### 2. HTML 算法确定提交投影

HTML 的“constructing the entry list”算法逐个检查表单控件，并跳过 disabled、没有有效 name、未选中的
checkbox / radio 和非本次 submitter 等控件。XHR 标准中的 `FormData(form, submitter)` 使用这份 entry
list 构造数据，`get()` 取首个同名值，`getAll()` 取全部同名值。

由此可以推导：控件当前值和提交数据不能混成一个概念。React State 可以保存当前 UI 值，却不会让没有
name 的字段自动进入 FormData；浏览器 DOM 可以保存非受控当前值，也不代表 disabled 字段会被提交。
调试提交数据时，应先查看原始 entries，再决定怎样转换成业务结构。

### 3. 事件和类型声明限定 handler 能读取什么

HTML 将 submit event 派发到 form，DOM 的 `preventDefault()` 只设置默认行为的取消状态。当前
`@types/react` 声明中，form `onSubmit` 接收 React `SubmitEvent<HTMLFormElement>`；它的
`currentTarget` 是 form，`nativeEvent` 是原生 `SubmitEvent`，因此可以读取 `submitter` 并交给
FormData 构造器。React 官方 TypeScript 指南建议先使用 JSX 内联 handler 的类型推断，抽取函数时再标注
具体元素类型。

这套类型只描述可访问的值，不会替代运行时判断。`FormData.get()` 仍可能得到 `string`、`File` 或
`null`，必须按实际字段合同缩窄类型。

### 4. 根据读取时机选择受控或非受控

- 输入过程中需要立即渲染派生结果、联动其它控件或由 State 决定值时，使用受控字段。
- 只需要默认值并在提交时读取、输入过程不驱动 React 界面时，可以使用非受控字段。
- 同一真实表单可以同时包含两种字段，但每个字段自己的值来源必须稳定。
- 同名 checkbox 和 multiple select 天然产生多值，应在数据模型中保留数组，而不是强行压成单值对象。
- 每个字段先提供 label；帮助文本再通过 `aria-describedby` 补充。相关选项使用 `fieldset` 与
  `legend` 表达分组。

这些判断适用于原生 `input`、`textarea`、`select` 与 form 提交。它们不自动解决远程请求、复杂校验、
文件上传、异步提交状态或自定义 ARIA widget；遇到这些问题时仍需单独设计数据、交互和可访问性合同。

## 十五、练习与验收

### 1. 补全受控字段

实现课程名称 input、授课方式 select 和公开状态 checkbox：

- input 和 select 使用字符串 State。
- checkbox 使用 boolean State。
- 每个字段都有 label、id 和 name。
- 所有 handler 使用正确的 currentTarget 属性。

验收：编辑任意字段后，界面显示值与 State 快照一致；控制台没有受控字段 warning。

### 2. 建立非受控多值提交

实现三个同名兴趣 checkbox 和一个 multiple select：

- 初始选择使用 `defaultChecked` 或 `defaultValue`。
- 每个选项使用业务可读的显式 value。
- 提交时用 `getAll()` 显示全部值。

验收：改变选择并提交，结果按表单顺序包含所有已选值，未选项不出现。

### 3. 验证 entry 排除规则

在表单中加入：

- 一个只有 id、没有 name 的输入。
- 一个有 name 但 disabled 的输入。
- 一个未选中的 checkbox。
- 一个正常可用的命名输入。

验收：FormData 只包含正常可用的命名输入；能够解释其它三项为什么被排除。

### 4. 验证提交边界

加入一个 `type="button"` 和一个带 `name="intent"` 的 `type="submit"`：

- 普通按钮只更新本地计数。
- 提交处理器立即调用 `preventDefault()`。
- FormData 构造器接收 `event.nativeEvent.submitter`。

验收：普通按钮不触发提交；提交按钮进入 intent entry；页面不刷新。

### 5. 排查模式切换

检查下面三种初始 State：

```tsx
const [name, setName] = useState<string | undefined>(undefined)
const [enabled, setEnabled] = useState<boolean | undefined>(undefined)
const [topics, setTopics] = useState<string[] | undefined>(undefined)
```

把它们改为从首次 render 起就符合受控 prop 类型的初始值。

验收：文本使用字符串、checkbox 使用 boolean、multiple select 使用字符串数组，整个生命周期不切换
受控模式。

## 十六、开发判断小结

1. 先决定当前值由 React State 还是浏览器 DOM 保存，再选择受控或非受控接口。
2. 受控文本、textarea 和 select 使用 `value + onChange`；checkbox 与 radio 使用
   `checked + onChange`。
3. 非受控字段只用 `defaultValue` 或 `defaultChecked` 提供初始值。
4. 同一控件生命周期内保持模式一致，不混用 value/defaultValue 或 checked/defaultChecked。
5. name 面向提交，id 面向元素身份和关联，label 提供名称，aria-describedby 提供补充描述。
6. form 的 onSubmit 是提交边界；客户端接管时立即调用 preventDefault。
7. 按钮显式声明 type；需要提交按钮值时把 nativeEvent.submitter 传给 FormData。
8. FormData 遵循平台 entry 规则，不是所有控件和 DOM 属性的复制。
9. 单值使用 get，多值使用 getAll，并处理 string、File 与 null 类型边界。
10. TypeScript 优先使用 JSX 推断；抽取 handler 时按具体元素标注 ChangeEvent 或 React SubmitEvent。

## 十七、参考资料

- [React `<input>`](https://react.dev/reference/react-dom/components/input) - `value`、`checked`、默认值、
  `onChange`、name、required 与受控生命周期。
- [React `<textarea>`](https://react.dev/reference/react-dom/components/textarea) - textarea 的受控、非受控与
  children 边界。
- [React `<select>`](https://react.dev/reference/react-dom/components/select) - 单选、多选、字符串数组、
  `selectedOptions` 与提交多值。
- [React `<form>`](https://react.dev/reference/react-dom/components/form) - form `onSubmit`、
  `preventDefault()` 与 FormData 读取。
- [Using TypeScript](https://react.dev/learn/typescript#typing-dom-events) - JSX 事件类型推断与抽取 handler 的
 事件类型。
- [ReactDOMInput.js 19.2.8](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom-bindings/src/client/ReactDOMInput.js#L47-L85) - 受控/非受控 prop 冲突的固定版本实现检查。
- [HTML 表单控件基础设施](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html) - name、
  disabled、约束校验、提交事件与表单控件公共规则。
- [HTML constructing the entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) - 无 name、disabled、选中状态、multiple 与 submitter 的 entry 规则。
- [HTML `<button>`](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element) - button 的
  type 状态与提交语义。
- [DOM `preventDefault()`](https://dom.spec.whatwg.org/#dom-event-preventdefault) - 取消默认行为与事件传播的
  区别。
- [XHR `FormData`](https://xhr.spec.whatwg.org/#interface-formdata) - FormData 构造器、entry 顺序、`get()` 与
  `getAll()`。
- [WAI-ARIA `aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby) - 可访问描述的 ID
  引用关系。
- [`@types/react` 19.2.18](https://unpkg.com/@types/react@19.2.18/index.d.ts) - `ChangeEvent`、React
  `SubmitEvent`、`SubmitEventHandler` 与 `nativeEvent` 类型。
- [TypeScript DOM 声明 6.0.3](https://raw.githubusercontent.com/microsoft/TypeScript/v6.0.3/src/lib/dom.generated.d.ts) - 原生 `SubmitEvent.submitter` 与 `FormDataEntryValue` 类型。
