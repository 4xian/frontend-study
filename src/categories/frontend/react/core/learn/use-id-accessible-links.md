---
id: react.core.learn.basics.use-id-accessible-links
type: lesson
title: useId 与可访问关联
summary: 使用 useId 为可复用组件建立唯一、稳定的 label 与描述关联，并理解 SSR 和多 root 边界。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 105
prerequisites:
  - react.core.learn.basics.rules-of-hooks
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-state
  - react.core.learn.basics.dom-props
related:
  - react.core.learn.basics.list-rendering-and-key
  - react.core.learn.basics.react-root-lifecycle
tags:
  - React
  - useId
  - accessibility
  - ARIA
  - SSR
appliesTo: React 19.2
verifiedAt: 2026-08-16
objectives:
  - 能解释 useId 解决的 DOM 关联问题，并将其与数据身份和列表 key 区分。
  - 能在组件顶层调用一次 useId，并派生一组用途清晰的相关 ID。
  - 能使用 htmlFor、aria-labelledby 与 aria-describedby 建立正确的名称和描述关系。
  - 能组合空格分隔的 ID reference list，并保证引用只指向当前存在的元素。
  - 能验证同一可复用组件的多个实例不会发生 ID 冲突或关联串线。
  - 能说明 SSR 组件树一致性和多 root identifierPrefix 的配置边界。
recap:
  - useId 返回用于 DOM 关联的唯一字符串，必须在组件或自定义 Hook 顶层调用。
  - 一次 useId 调用可以作为共享前缀，再用稳定后缀派生输入、帮助和错误元素的 ID。
  - htmlFor 连接原生 label 与控件，aria-labelledby 提供名称引用，aria-describedby 提供描述引用。
  - HTML 中多个 ARIA ID 引用使用空格分隔，不能写成逗号列表、数组或 CSS 选择器。
  - 多实例唯一性由 useId 处理；多个独立 React root 可用不同 identifierPrefix 隔离。
  - useId 不能生成列表 key 或业务主键，React 19.2 也不支持在 async Server Components 中调用它。
sources:
  - title: React useId
    url: https://react.dev/reference/react/useId
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - useId 的签名、调用位置与唯一 ID 合同
      - 共享前缀、多实例、SSR、多 root、key 与 Server Component 边界
  - title: React Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 顶层调用位置与稳定顺序
  - title: React DOM Common Components
    url: https://react.dev/reference/react-dom/components/common
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - id、htmlFor 与 ARIA DOM props
  - title: React createRoot
    url: https://react.dev/reference/react-dom/client/createRoot
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 客户端多 root 的 identifierPrefix
  - title: React hydrateRoot
    url: https://react.dev/reference/react-dom/client/hydrateRoot
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - hydration 内容一致性与 identifierPrefix
  - title: React renderToPipeableStream
    url: https://react.dev/reference/react-dom/server/renderToPipeableStream
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 服务端 identifierPrefix 与客户端前缀一致性
  - title: WHATWG HTML label element
    url: https://html.spec.whatwg.org/multipage/forms.html#the-label-element
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - label for 与 labelable control ID 的关联合同
  - title: WAI-ARIA 1.2 aria-labelledby
    url: https://www.w3.org/TR/wai-aria-1.2/#aria-labelledby
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - aria-labelledby 的名称引用语义
  - title: WAI-ARIA 1.2 aria-describedby
    url: https://www.w3.org/TR/wai-aria-1.2/#aria-describedby
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - aria-describedby 的描述引用语义
  - title: W3C WAI Technique ARIA9
    url: https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA9.html
    sourceType: official-reference
    appliesTo: WCAG 2.2
    claims:
      - HTML 中空格分隔的 ID reference list
---

# useId 与可访问关联

## 一、学习目标

- 理解硬编码 DOM ID 在可复用组件中为什么会产生冲突。
- 掌握 `useId()` 的返回值、调用位置和稳定调用顺序。
- 用一个 ID 前缀派生输入、帮助文本和错误文本的关联 ID。
- 区分原生 `label`、可访问名称与补充描述的职责。
- 正确组合一个或多个 ARIA ID 引用，并同步处理条件节点。
- 判断单 root、多 root、客户端渲染和服务端渲染中的 ID 边界。
- 明确 `useId` 不承担列表 key、业务 ID 或持久化标识的职责。

## 二、为什么需要 useId

### 1. 单个组件会掩盖硬编码 ID 的问题

下面的字段只出现一次时，label 和输入看起来能够正常关联：

```tsx
/** 渲染一个邮箱字段。 */
function EmailField() {
  return (
    <div>
      <label htmlFor="email">邮箱</label>
      <input id="email" type="email" />
    </div>
  )
}
```

问题不在这一个实例，而在组件的可复用性。页面同时渲染两个 `EmailField` 时，会出现两个
`id="email"`。ID 不再唯一，两个 label 也都持有同一个 `htmlFor="email"`。浏览器只能按文档中的匹配
结果处理，关联可能落到错误实例。

```tsx
/** 渲染两个使用相同硬编码 ID 的字段。 */
function ContactPage() {
  return (
    <main>
      <EmailField />
      <EmailField />
    </main>
  )
}
```

重复 ID 不只是命名问题。它会影响所有以 ID 建立的关系，包括：

- `<label htmlFor>` 与表单控件的关联。
- `aria-labelledby` 引用的名称来源。
- `aria-describedby` 引用的帮助或错误说明。
- 其它以元素 ID 为目标的平台能力。

### 2. 模块级常量不能解决组件实例冲突

把字符串提取成常量只消除了重复书写，没有产生实例级唯一性：

```tsx
const emailId = 'email'

/** 仍然为每个实例使用同一个模块级 ID。 */
function EmailField() {
  return (
    <div>
      <label htmlFor={emailId}>邮箱</label>
      <input id={emailId} type="email" />
    </div>
  )
}
```

需要解决的问题是“每个组件实例如何得到不会与其它实例冲突的 DOM 关联 ID”。`useId` 正是为这个问题
提供的 React API。

## 三、useId 的最小模型

### 1. 签名与返回值

`useId` 从 `react` 导入，不接收参数，返回一个字符串：

```tsx
import { useId } from 'react'

/** 为当前字段实例生成 DOM 关联 ID。 */
function EmailField() {
  const inputId = useId()

  return (
    <div>
      <label htmlFor={inputId}>邮箱</label>
      <input id={inputId} type="email" />
    </div>
  )
}
```

这个字符串与当前组件中的这一次 `useId` 调用关联。相同组件的不同实例会得到不会互相冲突的值。同一
实例重新 render 时，React 仍能把这次调用与该实例中的同一调用位置对应起来。

`useId` 的公共合同是“提供唯一 ID 字符串”，不是“提供某种固定格式的字符串”。不要读取其中的字符、
截取片段、判断前缀外观，也不要让 CSS 选择器依赖内部格式。

### 2. 它是 Hook

`useId` 遵守普通 Hook 的调用规则，只能在以下位置调用：

- 函数组件的顶层。
- 自定义 Hook 的顶层。

这里的顶层指 React 函数体中不受条件、循环、嵌套函数或异常分支控制的位置，不是 JavaScript 文件的
模块顶层。

```tsx
import { useId } from 'react'

/** 在组件顶层固定调用 useId。 */
function CourseField({ visible }: { visible: boolean }) {
  const inputId = useId()

  if (!visible) return null

  return <input id={inputId} />
}
```

调用必须放在条件返回之前。`visible` 可以控制 JSX 是否显示，但不能控制 `useId` 是否执行。

### 3. 不在事件处理器中临时生成 ID

事件处理器不是组件或自定义 Hook 的 render 顶层，因此不能在点击时调用 `useId`：

```tsx
import { useId } from 'react'

/** 错误地在事件处理器中调用 Hook。 */
function WrongButton() {
  /** 错误地在点击时生成关联 ID。 */
  function handleClick() {
    const dialogId = useId()
    console.log(dialogId)
  }

  return <button onClick={handleClick}>打开</button>
}
```

组件应在 render 顶层取得 ID，再把已经存在的值交给 JSX 或事件逻辑。ID 的生成属于组件结构，不属于
一次点击操作。

## 四、一个前缀派生一组 ID

### 1. 相关元素共享实例前缀

一个字段经常同时包含输入、帮助文本和错误文本。可以只调用一次 `useId`，再用固定后缀标明每个元素的
局部职责：

```tsx
import { useId } from 'react'

/** 为一个字段派生输入、帮助和错误元素的 ID。 */
function CourseEmailField() {
  const idPrefix = useId()
  const inputId = `${idPrefix}-input`
  const helpId = `${idPrefix}-help`
  const errorId = `${idPrefix}-error`

  return (
    <div>
      <label htmlFor={inputId}>课程邮箱</label>
      <input id={inputId} aria-describedby={helpId} />
      <p id={helpId}>请输入学校提供的邮箱。</p>
      <p id={errorId}>邮箱格式不完整。</p>
    </div>
  )
}
```

`-input`、`-help` 和 `-error` 是可读的固定用途后缀。它们不编码用户、课程、数据库记录或时间。只要
`idPrefix` 在组件实例之间唯一，派生出的整组 ID 也保持实例隔离。

### 2. 后缀必须在本地保持一致

关联属性和被引用元素必须使用同一个派生变量。不要在不同位置重复手写模板字符串：

```tsx
const idPrefix = useId()
const inputId = `${idPrefix}-input`
const helpId = `${idPrefix}-help`

const field = (
  <>
    <label htmlFor={inputId}>邮箱</label>
    <input id={inputId} aria-describedby={helpId} />
    <p id={helpId}>仅用于课程通知。</p>
  </>
)
```

集中派生变量可以直接比较引用双方，降低 `-description` 与 `-described` 之类拼写不一致的风险。

### 3. 多次 useId 调用并非派生一组 ID 的必要条件

为不同、彼此无关的控件分别调用 `useId` 是合法的。但同一字段中的输入、帮助和错误本来就是一组关系，
共享一个前缀更容易阅读和检查：

```tsx
const idPrefix = useId()
const inputId = `${idPrefix}-input`
const helpId = `${idPrefix}-help`
const errorId = `${idPrefix}-error`
```

无论采用一次还是多次调用，所有 Hook 都必须无条件执行，并在每次 render 保持相同顺序。本课使用一个
共享前缀，是为了让一组关联在代码中也形成清楚的一组。

## 五、label 与 htmlFor

### 1. htmlFor 引用控件的 id

在 TSX 中，React DOM 使用 `htmlFor` 表示 HTML `<label>` 的 `for` 属性：

```tsx
<label htmlFor={inputId}>课程邮箱</label>
<input id={inputId} name="courseEmail" type="email" />
```

`htmlFor` 的值必须匹配目标控件的 `id`。它不按 `name`、变量名、placeholder 或可见文本匹配。

| 值 | 主要职责 | 是否是 label 关联目标 |
| --- | --- | --- |
| `id` | 在当前文档树中标识元素 | 是 |
| `name` | 表单数据中的字段名称 | 否 |
| `placeholder` | 输入为空时的简短提示 | 否 |
| label 文本 | 向用户显示控件名称 | 不是引用值 |

### 2. 原生 label 是普通输入的首选

标准输入控件能够使用 `<label>` 时，优先建立原生 label 关系。点击 label 也能把对应控件作为目标，扩大
文字附近的可操作区域。

```tsx
/** 使用原生 label 标记复选框。 */
function ConsentField() {
  const inputId = useId()

  return (
    <div>
      <input id={inputId} type="checkbox" />
      <label htmlFor={inputId}>同意接收课程通知</label>
    </div>
  )
}
```

`useId` 不替代语义元素。它只为 label 与控件提供不会冲突的关联值。

### 3. 隐式嵌套与显式 ID 关联

HTML 也允许把控件嵌套在 label 内部。可复用组件需要同时关联帮助文本、错误文本或分离布局时，显式
`htmlFor` 与 `id` 更容易与其它 ID 引用使用同一套变量。

```tsx
<label htmlFor={inputId}>课程邮箱</label>
<input id={inputId} aria-describedby={helpId} />
<p id={helpId}>用于发送课程安排。</p>
```

显式关联不要求 label 和 input 必须相邻，但它们必须处于规范允许关联的同一树中，目标也必须是可被
label 标记的控件。

## 六、名称与描述引用

### 1. aria-labelledby 提供名称引用

`aria-labelledby` 引用一个或多个元素的 ID，被引用元素的文本参与提供当前元素的可访问名称：

```tsx
const headingId = `${idPrefix}-heading`

const region = (
  <section aria-labelledby={headingId}>
    <h2 id={headingId}>课程选择</h2>
    <p>从可用课程中选择一个主题。</p>
  </section>
)
```

它适合名称来自页面中其它元素的结构。对于普通输入，已有原生 `<label>` 时，不需要为了使用 ARIA 而把
原生关系改写成 `aria-labelledby`。

### 2. aria-describedby 提供补充描述

`aria-describedby` 引用更详细的说明，例如格式要求、用途说明或当前错误：

```tsx
<label htmlFor={inputId}>课程邮箱</label>
<input id={inputId} aria-describedby={helpId} />
<p id={helpId}>请输入学校提供的邮箱。</p>
```

名称回答“这个控件是什么”，描述补充“应该怎样填写、数据用于什么或当前有什么问题”。名称和描述职责
不同，不能因为两者都接收 ID 引用就互换。

### 3. ID reference 不带井号

ARIA ID 引用接收元素 ID 本身，不是 CSS 选择器：

```tsx
// 正确：直接引用元素 ID。
<input aria-describedby={helpId} />

// 错误：#helpId 形式属于 CSS selector 思维。
<input aria-describedby={`#${helpId}`} />
```

被引用元素必须真实存在，并且承担相应名称或描述职责。只有字符串相同而没有对应节点，不能建立有效
关系。

## 七、组合多个描述 ID

### 1. HTML 使用空格分隔多个 ID

一个控件可以同时引用帮助文本和错误文本。HTML 中的 ID reference list 使用空格分隔：

```tsx
const describedBy = `${helpId} ${errorId}`

const input = <input id={inputId} aria-describedby={describedBy} />
```

下面几种形式都不正确：

```tsx
// 错误：逗号会成为值的一部分。
const commaSeparated = `${helpId},${errorId}`

// 错误：不是 CSS selector 列表。
const selectors = `#${helpId} #${errorId}`

// 错误：DOM prop 需要最终的字符串，不是字符串数组。
const idArray = [helpId, errorId]
```

### 2. 条件节点与引用必须同步

错误文本只在 `hasError` 为真时存在，那么 `aria-describedby` 也应只在这时包含 `errorId`：

```tsx
const describedBy = hasError ? `${helpId} ${errorId}` : helpId

return (
  <div>
    <label htmlFor={inputId}>课程邮箱</label>
    <input id={inputId} aria-describedby={describedBy} />
    <p id={helpId}>请输入学校提供的邮箱。</p>
    {hasError ? <p id={errorId}>邮箱格式不完整。</p> : null}
  </div>
)
```

错误消失后，错误节点和对应 ID 引用一起移除。这样属性不会指向不存在的元素。

### 3. 条件控制普通值，不控制 Hook

错误状态可以改变 `describedBy` 字符串和 JSX 分支，但 `useId` 调用始终在组件顶层执行：

```tsx
type AccessibleFieldProps = {
  label: string
  help: string
  error: string
  hasError: boolean
}

/** 根据错误状态组合描述关系，同时保持 Hook 顺序稳定。 */
function AccessibleField({ label, help, error, hasError }: AccessibleFieldProps) {
  const idPrefix = useId()
  const inputId = `${idPrefix}-input`
  const helpId = `${idPrefix}-help`
  const errorId = `${idPrefix}-error`
  const describedBy = hasError ? `${helpId} ${errorId}` : helpId

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-describedby={describedBy} />
      <p id={helpId}>{help}</p>
      {hasError ? <p id={errorId}>{error}</p> : null}
    </div>
  )
}
```

这个结构在任意 `hasError` 值下都调用一次 `useId`，调用位置也不变。

## 八、多组件实例

### 1. 每个实例拥有自己的关联组

同一个字段组件可以直接渲染多次：

```tsx
/** 显示两组彼此独立的可访问字段。 */
function ContactFields() {
  return (
    <section>
      <AccessibleField
        label="课程邮箱"
        help="请输入学校提供的邮箱。"
        error="课程邮箱格式不完整。"
        hasError={false}
      />
      <AccessibleField
        label="联系邮箱"
        help="用于接收课程通知。"
        error="联系邮箱格式不完整。"
        hasError={false}
      />
    </section>
  )
}
```

两个实例都会执行自己的 `useId` 调用，并派生自己的 `inputId`、`helpId` 和 `errorId`。第一组 label 只
引用第一组输入，第二组描述也只引用第二组帮助节点。

### 2. 验证关联要比较整组关系

检查多实例时，不只看“页面中出现了两个不同字符串”，还要检查每组引用是否闭合：

1. 每个 `inputId` 在页面中只有一个对应输入。
2. 每个 label 的 `htmlFor` 等于同组 `inputId`。
3. 每个 `aria-describedby` 只包含同组帮助和错误 ID。
4. 属性中出现的每个 ID 都有当前存在的对应元素。
5. 状态切换不会让一个实例引用另一个实例的节点。

### 3. 不用数组 key 解释实例唯一性

组件实例的 `useId` 值与列表数据身份是两个不同问题。两个实例可以像上例那样直接写在 JSX 中，完全不
涉及列表。即使组件来自列表，列表 key 仍必须来自数据，字段内部的 DOM 关联再由 `useId` 负责。

## 九、SSR 与 hydration

### 1. 服务端和客户端必须渲染相同组件树

服务端渲染的 HTML 随后会由客户端 `hydrateRoot` 接管。`useId` 能让对应组件在服务端和客户端得到可匹配
的 ID，但前提是两端初始渲染相同的组件树。

如果服务端渲染一个字段，客户端初始 render 却在它前面插入另一个会调用 `useId` 的组件，那么组件路径
发生变化。`useId` 不是任意 hydration 差异的修复器；应修复两端树和初始输出不一致的问题。

### 2. 不用全局自增计数器代替 useId

全局计数器依赖实际执行先后顺序。服务端流式渲染、客户端 hydration 和并发调度不应由应用代码用一份
可变计数器猜测相同顺序。`useId` 的公共用法只要求两端保持相同组件树，不要求应用管理全局编号。

```tsx
// 不采用：模块级可变计数器把 ID 与执行顺序绑定。
let nextId = 0

/** 错误地从全局计数器生成字段 ID。 */
function CounterField() {
  const inputId = `field-${nextId++}`
  return <input id={inputId} />
}
```

### 3. 不依赖生成字符串的内部形状

React 可以根据组件树路径协调服务端和客户端 ID，但这不是让应用解析内部编码的许可。应用只把返回值
作为不透明字符串传给 `id` 和引用属性。不要把其中的冒号、数字或路径外观写进业务判断。

## 十、多 root 与 identifierPrefix

### 1. 多实例不等于多 root

一个 React 应用通常只有一个 root，root 内可以包含很多组件实例。普通单 root 应用不需要为每个组件手工
拼接应用前缀；`useId` 已经处理 root 内的唯一性。

多 root 指同一个 HTML 页面分别调用多次 `createRoot` 或 `hydrateRoot`，创建彼此独立的 React 树。例如
页面主体和一个独立挂载的小工具分别由 React 管理。

### 2. 不同 root 使用不同前缀

可以在创建 root 时配置 `identifierPrefix`，避免多个独立 root 生成互相冲突的 ID：

```tsx
import { createRoot } from 'react-dom/client'

createRoot(courseContainer, { identifierPrefix: 'course-' }).render(<CourseApp />)
createRoot(helpContainer, { identifierPrefix: 'help-' }).render(<HelpWidget />)
```

`identifierPrefix` 是 root 级配置，不应由每个字段组件重复拼接。页面只有一个 React 应用时，不必为了
形式添加它。

### 3. SSR 同一 root 的两端使用相同前缀

一个 SSR root 如果设置了前缀，服务端渲染 API 与对应客户端 `hydrateRoot` 必须使用相同值：

```tsx
// 服务端与对应客户端 root 使用同一个前缀。
renderToPipeableStream(<CourseApp />, { identifierPrefix: 'course-' })
hydrateRoot(courseContainer, <CourseApp />, { identifierPrefix: 'course-' })
```

规则可以概括为：不同独立 root 的前缀彼此区分，同一个 SSR root 的服务端与客户端前缀保持一致。

## 十一、不能承担的身份职责

### 1. 不能作为列表 key

列表 key 表示数据项在相邻 render 之间的身份，应该来自数据本身：

```tsx
const rows = courses.map((course) => <CourseRow key={course.id} course={course} />)
```

不要在循环中调用 `useId`，也不要在行组件中生成一个 ID 再反向作为父列表的 key。Hook 不能在循环中
调用，而生成的 DOM ID 也不表示数据项身份。

### 2. 不能作为业务主键或持久标识

不要把 `useId` 返回值写入数据库、请求参数、URL、LocalStorage 或分析事件来标识业务记录。业务身份由
数据层定义，通常需要跨会话、跨设备或跨系统保持意义；`useId` 只服务于当前 React 结构中的 DOM 关联。

### 3. 不生成可依赖的随机 UUID

`useId` 没有承诺 UUID 格式或随机性。需要业务 UUID 时使用业务层明确选择的生成机制，但这不属于 DOM
关联问题。不要因为当前看到的字符串“看起来特殊”，就推断其算法或稳定期限。

### 4. async Server Components 限制

React 19.2 当前不支持在 async Server Components 中调用 `useId`。这是一项明确的 API 限制，不意味着
普通客户端组件或同步组件不能使用 `useId`。本课示例均使用普通函数组件。

## 十二、Demo：观察关联变化

下面的示例直接渲染两个字段实例。每个实例只调用一次 `useId`，并显示当前派生 ID 与
`aria-describedby`。切换错误后，帮助描述保持，错误描述按当前节点是否存在加入或移除。

:::demo{id="react.core.learn.basics.use-id-accessible-links.accessible-field-demo"}
:::

观察时检查四件事：

1. 两个输入的 ID 不同。
2. 每个 label 的 `for` 只匹配同组输入。
3. 初始 `aria-describedby` 只引用同组帮助文本。
4. 显示错误后，属性变为同组帮助 ID、一个空格、同组错误 ID。

状态切换只改变普通字符串和错误 JSX。每个字段中的 `useId` 调用数量、位置和顺序始终不变。

## 十三、易错使用提示

:::pitfalls
### 错误：在可复用组件中硬编码 ID

**触发条件：** 每个字段实例都输出 `id="email"`。

**原因：** 固定字符串在组件复用时不会自动变成实例级唯一值。

**后果：** 多个 label、名称或描述可能引用同名元素，关联发生串线。

**错误示例：**

```tsx
/** 为所有实例输出相同 ID。 */
function EmailField() {
  return (
    <>
      <label htmlFor="email">邮箱</label>
      <input id="email" />
    </>
  )
}
```

**正确写法：**

```tsx
/** 为当前实例生成独立 ID。 */
function EmailField() {
  const inputId = useId()
  return (
    <>
      <label htmlFor={inputId}>邮箱</label>
      <input id={inputId} />
    </>
  )
}
```

**验证方式：** 同时渲染两个实例，确认输入 ID 不同，且每个 `htmlFor` 只匹配同组输入。

### 错误：根据状态决定是否调用 useId

**触发条件：** 只在 `hasError` 为真时为错误节点调用 `useId`。

**原因：** 状态变化会改变 Hook 调用集合和顺序。

**后果：** 代码违反 Rules of Hooks，后续 Hook 位置可能无法正确对应。

**错误示例：**

```tsx
/** 错误地条件调用 useId。 */
function Field({ hasError }: { hasError: boolean }) {
  const inputId = useId()
  const errorId = hasError ? useId() : undefined
  return <input id={inputId} aria-describedby={errorId} />
}
```

**正确写法：**

```tsx
/** 固定调用一次 useId，再条件组合普通值。 */
function Field({ hasError }: { hasError: boolean }) {
  const idPrefix = useId()
  const inputId = `${idPrefix}-input`
  const errorId = `${idPrefix}-error`

  return (
    <>
      <input id={inputId} aria-describedby={hasError ? errorId : undefined} />
      {hasError ? <p id={errorId}>格式错误</p> : null}
    </>
  )
}
```

**验证方式：** 切换每个条件，确认 `useId` 调用仍位于组件顶层且执行次数不变。

### 错误：htmlFor 匹配 name 而不是 id

**触发条件：** label 使用 `htmlFor="email"`，输入只有 `name="email"`，实际 `id` 是另一个值。

**原因：** label 的显式关联按控件 ID 匹配，不按提交字段名匹配。

**后果：** label 没有标记预期控件。

**错误示例：**

```tsx
<label htmlFor="email">邮箱</label>
<input id={inputId} name="email" />
```

**正确写法：**

```tsx
<label htmlFor={inputId}>邮箱</label>
<input id={inputId} name="email" />
```

**验证方式：** 比较 label 的 `for` 属性与输入的 `id`，两者必须完全相同。

### 错误：用逗号或井号组合描述 ID

**触发条件：** 把多个 ID 写成 `help,error` 或 `#help #error`。

**原因：** HTML ID reference list 使用空格分隔的原始 ID，不是 CSV 或 CSS selector。

**后果：** 属性无法解析成预期的两个描述目标。

**错误示例：**

```tsx
<input aria-describedby={`${helpId},${errorId}`} />
```

**正确写法：**

```tsx
<input aria-describedby={`${helpId} ${errorId}`} />
```

**验证方式：** 按空格拆分属性值，每个结果都应与页面中一个描述元素的 `id` 完全一致。

### 错误：节点移除后保留悬空引用

**触发条件：** 错误元素只在 `hasError` 为真时存在，但输入始终引用 `errorId`。

**原因：** ID reference 应指向当前文档中实际存在并承担描述职责的元素。

**后果：** 错误消失后，属性仍声明一个无法解析的描述关系。

**错误示例：**

```tsx
<input aria-describedby={`${helpId} ${errorId}`} />
{hasError ? <p id={errorId}>格式错误</p> : null}
```

**正确写法：**

```tsx
const describedBy = hasError ? `${helpId} ${errorId}` : helpId

const field = (
  <>
    <input aria-describedby={describedBy} />
    {hasError ? <p id={errorId}>格式错误</p> : null}
  </>
)
```

**验证方式：** 分别检查错误显示与隐藏状态，属性中的每个 ID 都必须有对应节点。

### 错误：用 useId 生成列表 key

**触发条件：** 为列表项调用 `useId`，或让行组件生成的 DOM ID承担数据身份。

**原因：** 列表 key 必须来自数据；Hook 也不能在循环中调用。

**后果：** 代码混淆 DOM 关联与数据身份，列表无法表达稳定的数据对应关系。

**错误示例：**

```tsx
// 错误：循环内调用 Hook，并把 DOM ID 当成列表身份。
const rows = courses.map((course) => <CourseRow key={useId()} course={course} />)
```

**正确写法：**

```tsx
const rows = courses.map((course) => <CourseRow key={course.id} course={course} />)
```

**验证方式：** key 的来源应能追溯到课程数据，而不是 render 时调用的 `useId`。

### 错误：SSR 两端使用不同前缀

**触发条件：** 服务端使用 `identifierPrefix: 'server-'`，对应客户端 root 使用 `'client-'`。

**原因：** 同一个 SSR root 的服务端输出与客户端 hydration 必须使用相同前缀。

**后果：** 两端生成的关联 ID 不一致，产生 hydration mismatch。

**错误示例：**

```tsx
renderToPipeableStream(<App />, { identifierPrefix: 'server-' })
hydrateRoot(container, <App />, { identifierPrefix: 'client-' })
```

**正确写法：**

```tsx
renderToPipeableStream(<App />, { identifierPrefix: 'app-' })
hydrateRoot(container, <App />, { identifierPrefix: 'app-' })
```

**验证方式：** 对每个 SSR root 比较服务端与客户端配置；对应前缀必须字节一致。
:::

## 十四、原理与适用场景

### 1. 判断顺序

遇到 DOM 关联问题时，按以下顺序检查：

1. 目标是 DOM 关联，还是列表或业务数据身份。
2. `useId` 是否位于组件或自定义 Hook 顶层。
3. 同一关系组是否从一个前缀派生用途清晰的 ID。
4. 原生 label 的 `htmlFor` 是否匹配控件 `id`。
5. `aria-labelledby` 与 `aria-describedby` 是否承担正确职责。
6. 多个 ID 是否使用空格分隔，且每个引用节点当前存在。
7. 多实例是否保持组内闭合，多 root 是否需要 `identifierPrefix`。
8. SSR 两端的组件树和对应 root 前缀是否一致。

### 2. 适用边界

`useId` 适合组件库字段、可重复面板标题、帮助文本、错误文本和其它需要 IDREF 的可复用结构。若 ID
来自真实业务数据，并且页面能保证其已满足 DOM ID 唯一性，也可以直接使用数据 ID；不要为了使用 Hook
而重复生成第二套身份。

本课不处理完整输入状态、验证时机、提交、焦点管理或屏幕阅读器播报策略。`useId` 只负责提供关联所需的
唯一值，不能单独证明整个界面的可访问性正确。

## 十五、练习

:::exercise
### 练习一：修复重复字段

**要求：** 把一个写死 `id="course-email"` 的字段组件改为调用一次 `useId`，派生 `inputId` 与
`helpId`。直接渲染两个实例，并确认每个 label 和帮助文本只关联同组输入。

**验收：** 页面中不存在重复 ID；两个 `htmlFor` 分别匹配同组输入；两个 `aria-describedby` 分别匹配
同组帮助节点。
:::

:::exercise
### 练习二：组合条件描述

**要求：** 为字段增加 `hasError` prop。错误显示时让 `aria-describedby` 同时引用帮助和错误节点，错误
隐藏时只引用帮助节点。切换状态时不得增加、删除或移动 `useId` 调用。

**验收：** 两种状态下属性中的每个 ID 都有对应节点；错误隐藏后没有悬空引用；`useId` 仍只有一次顶层
调用。
:::

:::exercise
### 练习三：判断身份来源

**要求：** 分别说明“列表行 key”“数据库课程 ID”“字段 input ID”“多 root 前缀”应由数据、`useId`
还是 root 配置负责，并解释不能互换的原因。

**验收：** 列表 key 与数据库 ID 归入数据合同，字段 input ID 归入 DOM 关联，多 root 前缀归入 root
配置；每项都能说明其稳定范围。
:::

## 十六、本节小结

- `useId()` 返回不透明的唯一字符串，用于当前 React 结构中的 DOM 关联。
- Hook 始终在组件或自定义 Hook 顶层调用，条件只控制普通值和 JSX。
- 同一关系组可以由一个前缀加固定后缀派生，便于检查组内引用。
- 原生 label 使用 `htmlFor` 匹配控件 `id`；名称与描述引用承担不同职责。
- 多个 ARIA ID 在 HTML 中用空格分隔，节点移除时同步移除引用。
- 多实例由 `useId` 隔离，多 root 可由 `identifierPrefix` 隔离，SSR 对应两端前缀保持一致。
- 列表 key 和业务主键来自数据，不由 `useId` 生成。

## 十七、参考资料

- [React useId](https://react.dev/reference/react/useId) - `useId` 的完整公共合同与使用边界。
- [React Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) - Hook 的合法调用位置。
- [React DOM Common Components](https://react.dev/reference/react-dom/components/common) - `id`、`htmlFor` 与 ARIA props。
- [React createRoot](https://react.dev/reference/react-dom/client/createRoot) - 客户端 root 的 `identifierPrefix`。
- [React hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) - hydration 一致性与客户端前缀。
- [React renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream) - 服务端前缀配置。
- [WHATWG HTML label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element) - label 与控件的 ID 关联。
- [WAI-ARIA 1.2 aria-labelledby](https://www.w3.org/TR/wai-aria-1.2/#aria-labelledby) - 名称引用。
- [WAI-ARIA 1.2 aria-describedby](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby) - 描述引用。
- [W3C WAI Technique ARIA9](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA9.html) - HTML 中多个 ID 的空格分隔写法。
