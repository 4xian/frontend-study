---
id: react.core.learn.basics.dom-props
type: lesson
title: DOM Props
summary: 理解 React DOM prop 如何映射到真实 DOM，并正确处理命名、值、样式与属性透传。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 110
prerequisites:
  - react.core.learn.basics.tsx-expressions-and-attributes
  - react.core.learn.basics.props
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-state
related:
  - react.core.learn.basics.tsx-markup-syntax
  - react.core.learn.basics.children-and-composition
tags:
  - React
  - DOM
  - props
  - accessibility
  - style
appliesTo: React 19.2
verifiedAt: 2026-08-16
objectives:
  - 能区分 React element prop、DOM property、HTML attribute 与组件 Prop。
  - 能正确使用 className、htmlFor、tabIndex、data-*、aria-* 及常见 camelCase 名称。
  - 能区分 HTML 布尔 attribute、字符串、数字、ARIA 枚举值与省略语义。
  - 能正确使用 style 对象、数值单位、CSSProperties 和 CSS 自定义属性。
  - 能在 props spread 前过滤组件私有字段并控制覆盖顺序。
recap:
  - TSX 传的是 React element props，React DOM 再按元素合同更新 DOM property 或 HTML attribute。
  - 多词 DOM prop 通常使用 camelCase，class 与 for 分别写成 className 与 htmlFor。
  - data-* 和 aria-* 保持 HTML 中的连字符拼写，ARIA 名称和取值还必须符合规范。
  - 值语义由具体 prop 决定，不能用一条字符串化规则解释所有属性。
  - style 接收对象，普通 CSS key 使用 camelCase，非零长度数值通常自动补 px。
  - 组件私有 prop 必须在 spread 到原生元素前被消费，后写的同名 prop 会覆盖先写值。
sources:
  - title: React DOM Common Components
    url: https://react.dev/reference/react-dom/components/common
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 通用 DOM props、命名、值类型与 style 合同
      - data-*、aria-* 与自定义 attribute 边界
  - title: React DOM Components
    url: https://react.dev/reference/react-dom/components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 内置元素的 DOM prop 公共合同
  - title: React Unknown Prop Warning
    url: https://react.dev/warnings/unknown-prop
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 私有 prop 泄漏、未知 prop 与 rest props 过滤
  - title: React Invalid ARIA Prop Warning
    url: https://react.dev/warnings/invalid-aria-prop
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - ARIA 名称必须符合规范
  - title: MDN Boolean Attribute
    url: https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML
    sourceType: official-reference
    appliesTo: HTML
    claims:
      - HTML 布尔 attribute 的存在语义
  - title: MDN hidden global attribute
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden
    sourceType: official-reference
    appliesTo: HTML
    claims:
      - hidden 的枚举值与隐藏状态
  - title: MDN HTMLElement.dataset
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
    sourceType: official-reference
    appliesTo: DOM
    claims:
      - data-* 与 dataset 的字符串映射
---

# DOM Props

## 一、学习目标

- 区分 TSX 中的 prop、DOM 对象上的 property 和 HTML 中的 attribute。
- 掌握 `className`、`htmlFor`、`tabIndex` 以及多词名称的 camelCase 规则。
- 根据具体 prop 选择字符串、数字或布尔值，不把所有属性当作字符串。
- 正确使用 `style` 对象、动态数值、无单位属性和 CSS 自定义属性。
- 使用 `data-*` 与 `aria-*`，同时理解数据边界和可访问性边界。
- 为包装组件设计可控的 DOM props 透传合同，避免私有 prop 泄漏。

## 二、为什么需要 DOM Props

组件 Props 是组件之间的数据合同；DOM props 是 React 与浏览器内置元素之间的合同。两者都写在标签上，
但接收者不同：

```tsx
type CourseCardProps = {
  title: string
}

/** title 由自定义组件接收，className 由组件决定是否继续传给 DOM。 */
function CourseCard({ title }: CourseCardProps) {
  return <article className="course-card">{title}</article>
}

const view = <CourseCard title="DOM Props" />
```

`CourseCard` 的 `title` 可以由你自由定义；`article` 的 `className` 则必须遵守 React DOM 与浏览器平台的
规则。若把 HTML 拼写或组件私有字段直接交给原生元素，可能得到类型错误、运行时 warning 或失效的
可访问性语义。

本课只建立内置 HTML 元素的 DOM props 公共模型，不展开受控输入、提交行为、Ref、hydration、原始 HTML
注入或自定义元素接入。

## 三、Prop、Property 与 Attribute

### 1. TSX 首先创建带 Props 的 React Element

下面的 `className`、`tabIndex` 和 `aria-current` 首先是 React element 的 props：

```tsx
const navigationItem = (
  <a className="navigation-item" tabIndex={0} aria-current="page">
    当前页面
  </a>
)
```

React DOM 在提交阶段根据 `<a>` 的平台合同更新真实 DOM。浏览器最终可能展示：

```html
<a class="navigation-item" tabindex="0" aria-current="page">当前页面</a>
```

DOM 对象又会提供 `element.className`、`element.tabIndex` 等 properties。三层名称不必完全相同：

| 层次 | 示例 | 谁解释 |
| --- | --- | --- |
| React element prop | `className`、`tabIndex` | React DOM |
| DOM property | `element.className`、`element.tabIndex` | 浏览器 DOM API |
| HTML attribute | `class`、`tabindex` | HTML 解析器与序列化器 |

因此，不能因为浏览器 Elements 面板显示 `tabindex`，就回到 TSX 写 `tabindex`。

### 2. 内置元素与自定义组件的合同不同

本课使用的小写标签都是浏览器内置元素，首字母大写标签表示 React 组件：

```tsx
const nativeElement = <section title="DOM 标题" />
const componentElement = <CourseCard title="组件标题" />
```

`section` 可接收哪些 props 由 React DOM 类型和平台合同决定。`CourseCard` 可接收哪些 props 则由
`CourseCardProps` 决定。自定义组件拿到 `className` 并不会自动把它放到 DOM；组件必须明确转发。

### 3. TypeScript 是第一层检查，不是语义证明

React 的 TSX 类型会检查内置标签及其 props：

```tsx
const correct = <div tabIndex={0} />

// 错误：名称应为 tabIndex，值应为 number。
const wrong = <div tabindex="0" />
```

类型检查能拦截许多拼写和类型错误，但不能证明：

- `aria-describedby` 指向的 ID 一定存在。
- 正数 `tabIndex` 一定符合页面焦点顺序。
- 任意 `data-*` 内容一定适合暴露在 DOM 中。

所以正确使用 DOM props 需要同时满足 React 类型、React DOM 合同和浏览器平台语义。

## 四、DOM Prop 命名

### 1. 多词名称通常使用 camelCase

React DOM 通常采用 DOM property 风格的 camelCase：

| HTML attribute | TSX DOM prop | 正确示例 |
| --- | --- | --- |
| `class` | `className` | `<div className="panel" />` |
| `for` | `htmlFor` | `<label htmlFor="email" />` |
| `tabindex` | `tabIndex` | `<div tabIndex={0} />` |
| `contenteditable` | `contentEditable` | `<div contentEditable={true} />` |
| `spellcheck` | `spellCheck` | `<p spellCheck={false} />` |
| `maxlength` | `maxLength` | `<input maxLength={40} />` |

单词名称通常保持原样，例如 `id`、`title`、`role`、`hidden`、`lang`。

### 2. className 接收完整 Class 字符串

`className` 不是 CSS Module 或条件对象的专用容器；它接收最终字符串：

```tsx
const className = ['notice', isImportant ? 'notice-important' : null]
  .filter(Boolean)
  .join(' ')

const notice = <aside className={className}>系统通知</aside>
```

类名可以由数组、模板字符串或工具函数生成，最终交给 `className` 的仍应是字符串。不要把对象直接传入：

```tsx
// 错误：className 不接收样式条件对象。
const wrong = <aside className={{ important: true }}>系统通知</aside>
```

### 3. htmlFor 必须匹配目标 ID

`htmlFor` 最终对应 `<label for>`，其值应与目标控件的 `id` 相同：

```tsx
const field = (
  <>
    <label htmlFor="account-email">邮箱</label>
    <input id="account-email" name="email" type="email" />
  </>
)
```

`htmlFor` 不匹配 `name`、变量名或显示文字。本例只展示关联关系，不展开输入值由谁控制。

### 4. tabIndex 使用数字

`tabIndex` 的常见有效选择是：

- `tabIndex={0}`：进入按文档顺序排列的键盘焦点序列。
- `tabIndex={-1}`：不进入顺序键盘导航，但仍可由脚本聚焦。
- 正数：人为重排顺序，通常会让键盘导航难以预测，应避免。

原生按钮、链接和输入控件已经具有焦点行为，不要无条件给所有元素添加 `tabIndex={0}`。当视觉顺序与
合理焦点顺序冲突时，应先修正文档结构，而不是用一串正数补丁重排。

### 5. data-* 与 aria-* 保留连字符

这两类名称与 HTML 保持一致：

```tsx
const status = (
  <section data-order-id="A-1024" aria-labelledby="order-heading">
    <h2 id="order-heading">订单状态</h2>
  </section>
)
```

不要写 `dataOrderId`、`ariaLabelledby` 或 `aria-role`。`role` 是独立标准 prop，不是 `aria-role`。

## 五、值类型与存在语义

### 1. 字符串字面量与表达式不是一回事

引号直接传字符串，花括号传 JavaScript 表达式：

```tsx
const panelTitle = '账户设置'
const order = 0

const panel = <section title={panelTitle} tabIndex={order} />
const sameTitle = <section title="账户设置" />
```

`tabIndex="0"` 是字符串，不等于 `tabIndex={0}`。值应该根据具体 prop 的合同选择，而不是为了省事全写成
字符串。

### 2. HTML 布尔 Attribute 看是否存在

`disabled`、`required` 等 HTML boolean attributes 由存在与否表达真假：

```tsx
const enabledButton = <button disabled={false}>保存</button>
const disabledButton = <button disabled={true}>保存中</button>
const alsoDisabled = <button disabled>保存中</button>
```

最后一行是 `disabled={true}` 的简写。不要写：

```tsx
// 错误：HTML 不会把字符串 "false" 当成 false；attribute 仍然存在。
const wrong = <button disabled="false">保存</button>
```

如果值来自 URL 或接口字符串，应先显式转换为 boolean，再交给 prop：

```tsx
const isDisabled = rawDisabled === 'true'
const button = <button disabled={isDisabled}>保存</button>
```

### 3. ARIA True/False 不是 HTML 布尔 Attribute

ARIA 的 `true` / `false` 是关键字枚举。`aria-expanded="false"` 明确表达折叠状态，不是“存在就为真”：

```tsx
const disclosure = (
  <button aria-expanded={isOpen} aria-controls="course-outline">
    课程目录
  </button>
)
```

React 允许传 boolean 表达式并生成对应 ARIA 值，但语义仍由具体 ARIA attribute 定义。不要把 HTML boolean
规则套到 `aria-*`。

### 4. 枚举属性也要查各自合同

`contentEditable`、`draggable`、`spellCheck`、`hidden` 等看起来像布尔值，但平台底层属于枚举或反射
属性。React API 为它们提供方便的值类型，不代表所有“像布尔”的 prop 都有同一序列化规则。

HTML 平台把 `hidden` 归为枚举 attribute，并定义普通隐藏和 `until-found` 两种状态。因此，不能把它归入
HTML boolean attribute。React 19.2 的 `hidden` DOM prop 合同只接受 boolean：`hidden={true}` 进入普通
隐藏状态，`hidden={false}` 省略该 attribute。

```tsx
const collapsedPanel = <section hidden={isCollapsed}>课程详情</section>
```

React 19.2 不支持通过 `hidden="until-found"` 保留平台的同名关键字：该写法不符合 TypeScript 类型，React
DOM 也会把字符串按 true 处理，最终只写出普通的 `hidden` attribute。需要 `until-found` 时，必须另查当前
React 版本与浏览器平台的专门接入合同，不能把 HTML 示例直接复制到 TSX。

可靠判断顺序是：

1. 先查当前 React DOM prop 的官方类型与说明。
2. 再查对应 HTML 或 ARIA 语义。
3. 最后才观察浏览器中的 attribute 字符串。

### 5. null、undefined 与 false 不是通用删除指令

React 明确规定：小写自定义 attribute 的 `null` 或 `undefined` 会移除该 attribute。标准 props 则应传它声明
的真实类型，不要假设 `null`、`undefined` 或 `false` 在每种 DOM prop 上都表示同一件事。

尤其不要把下面三类混为一谈：

- HTML boolean attribute，例如 `disabled`。
- ARIA 枚举，例如 `aria-expanded`。
- HTML 枚举 attribute，例如 `hidden`。

## 六、style 对象

### 1. style 接收对象，不接收 CSS 文本

```tsx
const progressStyle = {
  width: 120,
  backgroundColor: '#1565c0',
  lineHeight: 1.5,
}

const progress = <div style={progressStyle}>已完成</div>
```

标准 CSS property 名通常使用 camelCase，例如 `backgroundColor`，不是 `background-color`。`style={{}}` 的
外层花括号进入 JavaScript，内层花括号创建普通对象。

下面两种写法都不符合 React `style` 合同：

```tsx
const cssText = <div style="width: 120px" />
const kebabCase = <div style={{ 'background-color': '#1565c0' }} />
```

### 2. 数字是否补单位由 CSS Property 决定

React 对普通、非零、需要长度单位的数字自动追加 `px`：

```tsx
const box = <div style={{ width: 120, marginTop: 16 }} />
```

结果相当于 `width: 120px; margin-top: 16px`。无单位属性不会补 `px`：

```tsx
const faded = <div style={{ opacity: 0.8, lineHeight: 1.5, zIndex: 2 }} />
```

显式单位使用字符串：

```tsx
const responsive = <div style={{ width: '50%', marginBlock: '1rem' }} />
```

数值 `0` 不需要单位。不要背一份可能变化的无单位属性清单；能否省略单位由具体 CSS property 的合同决定。

### 3. 使用 CSSProperties 保留类型检查

```tsx
import type { CSSProperties } from 'react'

const cardStyle: CSSProperties = {
  borderColor: '#c9d2dc',
  borderWidth: 1,
  opacity: 0.92,
}
```

`CSSProperties` 提供已知属性的拼写检查与编辑器补全，但不能保证当前浏览器支持每个属性，也不能证明任意
动态字符串一定是合法 CSS 值。

### 4. CSS 自定义属性保持 -- 名称

CSS 自定义属性不使用 camelCase，并且名称区分大小写：

```tsx
import type { CSSProperties } from 'react'

type CSSVariableStyle = CSSProperties & {
  [name: `--${string}`]: string | number
}

const themeStyle = {
  '--accent-color': '#1565c0',
  '--card-width': '18rem',
} satisfies CSSVariableStyle

const themedCard = <article style={themeStyle}>主题卡片</article>
```

React 会用 `style.setProperty` 写入 `--*`，不会自动为自定义属性数字补 `px`。如果值需要单位，应传
`'12px'`、`'18rem'` 等完整 CSS token。只放宽 `--${string}` 比添加任意字符串索引更能保留拼写检查。

### 5. className 与 style 的职责

静态或可枚举的样式优先使用 `className`；真正由运行时数据决定的局部数值适合 `style`：

```tsx
const progress = (
  <div className="progress-track">
    <span className="progress-value" style={{ width: `${percent}%` }} />
  </div>
)
```

不要把完整样式系统搬进每个组件的内联对象。`style` 不提供选择器、伪类、媒体查询或自动前缀能力。

## 七、data-* 与 aria-*

### 1. data-* 只放少量 DOM 可见数据

```tsx
const row = <li data-record-id="customer-42">Ada</li>
```

浏览器通过 `dataset` 提供字符串映射：

```ts
const recordId = element.dataset.recordId
```

`data-record-id` 映射为 `dataset.recordId`，读出的值是字符串或 `undefined`。适合的内容包括：

- 第三方集成需要的稳定标识。
- CSS attribute selector 需要的有限状态。
- 必须由原生 DOM 脚本读取的少量字符串数据。

不适合放入 `data-*` 的内容包括大型对象、权限决定、敏感数据和已经能直接从 Props/State 读取的完整模型。

### 2. aria-* 必须名称、取值和引用都正确

```tsx
const help = (
  <>
    <button aria-describedby="save-help">保存</button>
    <p id="save-help">保存后立即生效。</p>
  </>
)
```

这里不仅要拼对 `aria-describedby`，还要确保 `save-help` 目标真实存在。TypeScript 和 React warning 只能发现
一部分错误，无法证明最终可访问性树符合预期。

### 3. ARIA 不会自动添加交互行为

`aria-disabled={true}` 只向辅助技术声明禁用状态，不会像原生 `disabled` 一样自动阻止点击、键盘激活或表单
行为。能使用原生按钮与 `disabled` 时，应优先使用原生语义。

```tsx
const nativeButton = <button disabled={isBusy}>保存</button>
```

只有自定义复合控件确实没有对应原生能力时，才需要同时设计 ARIA、键盘操作和行为限制。

### 4. 优先使用已有平台能力

如果平台已有 `id`、`title`、`hidden`、`role` 或语义化标签，就不要发明 `isHidden`、`tooltipText`、
`aria-role` 等 DOM attributes。业务组件内部可以使用这些私有 prop 名，但在抵达原生元素前必须转换成合法
DOM props 或被消费掉。

## 八、Props Spread 与透传

### 1. 组件私有 Prop 不能泄漏到 DOM

```tsx
type NoticeProps = {
  tone: 'info' | 'warning'
  title: string
}

/** 错误：tone 是组件决策，不是 section 的 DOM prop。 */
function WrongNotice(props: NoticeProps) {
  return <section {...props}>{props.title}</section>
}
```

把 `tone` 传给 `<section>` 可能触发 unknown prop warning，或生成没有平台意义的 attribute。

### 2. 先消费私有 Prop，再转发剩余 DOM Props

```tsx
import type { ComponentPropsWithoutRef } from 'react'

type NoticeProps = ComponentPropsWithoutRef<'section'> & {
  tone: 'info' | 'warning'
}

/** 只把合法 section props 透传给原生元素。 */
function Notice({ tone, className, ...domProps }: NoticeProps) {
  const classes = ['notice', `notice-${tone}`, className].filter(Boolean).join(' ')

  return <section {...domProps} className={classes} />
}
```

`ComponentPropsWithoutRef<'section'>` 复用目标原生元素的 props 合同。`tone` 和 `className` 先被消费，剩余
`domProps` 才进入 `<section>`。

### 3. Spread 顺序决定覆盖结果

后写的同名 prop 覆盖先写值：

```tsx
const domProps = { title: '外部标题', tabIndex: 0 }

const explicitWins = <section {...domProps} title="组件标题" />
const spreadWins = <section title="组件标题" {...domProps} />
```

第一行最终 title 是“组件标题”，第二行是“外部标题”。包装组件需要明确决定：

- 调用方能否覆盖 `className` 和 `style`。
- 组件是否必须保留某个 `role` 或可访问性名称。
- 事件处理函数由组件替换、合并还是完全交给调用方。

不要随手移动 spread 的位置；它是组件公开合同的一部分。

### 4. 合并 className 与 style

若组件既有默认样式又允许调用方扩展，应显式合并：

```tsx
import type { CSSProperties, HTMLAttributes } from 'react'

type PanelProps = HTMLAttributes<HTMLElement> & {
  inset: number
}

/** 合并调用方样式，并保证组件计算的 inset 最终生效。 */
function Panel({ inset, className, style, ...domProps }: PanelProps) {
  const mergedStyle: CSSProperties = {
    ...style,
    padding: inset,
  }

  return (
    <section
      {...domProps}
      className={['panel', className].filter(Boolean).join(' ')}
      style={mergedStyle}
    />
  )
}
```

这里 `padding` 写在 `...style` 之后，所以调用方不能覆盖组件的 `inset`。如果产品合同允许覆盖，调换顺序并
明确记录即可。

### 5. 小写自定义 Attribute 是集成边界

React DOM 运行时允许向内置元素传递小写、且不以 `on` 开头的自定义 attribute。其值会转成字符串，
`null` 或 `undefined` 会移除 attribute。这主要用于第三方平台集成。

在 TypeScript 项目中，运行时允许不代表 TSX 类型已经声明。以 `thirdpartymarker` 为例，它是合法的
JavaScript 标识符，但不在当前 `<div>` 的 JSX props 类型中，直接写入 TSX 会得到类型错误。若第三方接口
硬性要求这个名称，应在项目的类型边界中为它添加范围明确的声明；不要用 `any` 绕过全部 DOM props 检查。

普通自定义数据优先使用已有类型合同的 `data-*`：

```tsx
const integrated = <div data-third-party-marker="course-42" />
```

连字符未知名称可能绕过 TypeScript 的 JSX 属性检查，因此“类型通过”也不能证明名称有效。不要把
`className` 等标准 prop 的拼写错误改成全小写或连字符形式后当作“已修复”。

## 九、DOM Props Demo

下面的 Demo 同时观察：

- `className` 到 `class` 的映射。
- `htmlFor` 与目标 `id` 的关联。
- `tabIndex`、`disabled`、`hidden` 与 `aria-disabled` 的不同值语义。
- `data-*` 状态与 `style` 数字的最终结果。
- 包装组件先消费私有 `state`，再透传合法 DOM props。

:::demo{id="react.core.learn.basics.dom-props.dom-props-demo"}
:::

Demo 不故意制造 unknown prop warning；私有字段是否被过滤由真实 DOM 结果直接验证。

## 十、易错使用提示

:::pitfalls
### 错误：照搬 HTML Attribute 拼写

**触发条件：** 在 TSX 中写 `class`、`for` 或 `tabindex="0"`。

**原因：** 混淆了 HTML attribute 与 React DOM prop；多词 prop 通常使用 DOM property 风格名称。

**后果：** 出现类型错误、React warning，或得到与预期不同的 DOM。

**错误示例：**

```tsx
const wrong = <label class="field-label" for="email" tabindex="0">邮箱</label>
```

**正确写法：**

```tsx
const correct = <label className="field-label" htmlFor="email" tabIndex={0}>邮箱</label>
```

**验证方式：** 核对 React DOM Reference，并检查 TSX 名称和值类型。

### 错误：把字符串 false 当成布尔 False

**触发条件：** 从 URL 或接口拿到字符串后直接写 `disabled="false"`。

**原因：** HTML boolean attribute 由存在与否表达真假，字符串内容不是布尔解析器。

**后果：** attribute 仍然存在，控件仍被禁用。

**错误示例：**

```tsx
const wrong = <button disabled="false">保存</button>
```

**正确写法：**

```tsx
const isDisabled = rawDisabled === 'true'
const correct = <button disabled={isDisabled}>保存</button>
```

**验证方式：** 检查按钮的 `disabled` property 与 attribute 是否符合预期。

### 错误：把 data-* 和 aria-* 改成 camelCase

**触发条件：** 写出 `dataCourseId`、`ariaLabel` 或不存在的 `aria-role`。

**原因：** `data-*` 与 `aria-*` 保持 HTML 连字符名称，且 ARIA 只接受规范定义的属性名。

**后果：** 数据 attribute 缺失、React 发出 warning，或辅助技术无法读取预期语义。

**错误示例：**

```tsx
const wrong = <section dataCourseId="42" ariaLabel="课程" aria-role="region" />
```

**正确写法：**

```tsx
const correct = <section data-course-id="42" aria-label="课程" role="region" />
```

**验证方式：** 核对 DOM attribute 名称、React console 与可访问性树。

### 错误：把 style 当成 CSS 字符串

**触发条件：** 传入 CSS 文本、使用 kebab-case key，或认为所有数字都会补 `px`。

**原因：** React `style` 接收对象；普通 key 使用 camelCase，数值单位由 CSS property 决定。

**后果：** 类型或运行时错误、样式不生效，或单位与预期不同。

**错误示例：**

```tsx
const wrong = <div style="background-color: red; line-height: 2px" />
```

**正确写法：**

```tsx
const correct = <div style={{ backgroundColor: 'red', lineHeight: 2 }} />
```

**验证方式：** 检查 computed style，并区分需要长度单位与无单位的 property。

### 错误：把组件私有 Prop 全部 Spread 到 DOM

**触发条件：** 包装组件直接写 `<section {...props}>`，其中包含 `tone`、`layout` 等私有字段。

**原因：** 没有先消费组件层合同，也没有明确原生元素可接收的 props。

**后果：** unknown prop warning、无意义 attribute，或第三方代码误读脏数据。

**错误示例：**

```tsx
function Notice(props: { tone: 'info'; title: string }) {
  return <section {...props}>{props.title}</section>
}
```

**正确写法：**

```tsx
function Notice({ tone, title }: { tone: 'info'; title: string }) {
  return <section className={`notice notice-${tone}`}>{title}</section>
}
```

**验证方式：** 检查原生节点上只有预期 attributes，console 没有 unknown prop warning。

### 错误：忽略 Spread 的覆盖顺序

**触发条件：** 调整 `{...domProps}` 位置，却没有判断谁应拥有同名 prop 的最终控制权。

**原因：** JSX spread 使用对象属性顺序，后写值覆盖先写值。

**后果：** 必需的 `className`、`style`、`role` 或可访问性名称被意外覆盖。

**错误示例：**

```tsx
const wrong = <section className="required" {...domProps} />
```

**正确写法：**

```tsx
const className = ['required', domProps.className].filter(Boolean).join(' ')
const correct = <section {...domProps} className={className} />
```

**验证方式：** 为有冲突和无冲突两种输入分别推导最终 props。

### 错误：用 aria-disabled 代替真实禁用行为

**触发条件：** 给自定义可点击元素添加 `aria-disabled={true}`，但仍执行点击与键盘操作。

**原因：** ARIA 描述可访问性语义，不自动实现浏览器行为。

**后果：** 辅助技术听到“已禁用”，用户却仍能触发操作，语义与行为矛盾。

**错误示例：**

```tsx
const wrong = <div role="button" tabIndex={0} aria-disabled={true}>删除</div>
```

**正确写法：**

```tsx
const correct = <button type="button" disabled>删除</button>
```

**验证方式：** 同时核对键盘、指针行为和可访问性树，而不只看 attribute。

:::

## 十一、判断顺序与适用边界

### 1. 从公开合同判断 DOM Props

判断一个 DOM prop 时，先查 React DOM 对该内置元素的公开合同，再核对对应 HTML、ARIA 或 CSS 规则，
最后观察真实 DOM 与 computed style。浏览器序列化出的 attribute 是结果，不能反向替代 React prop 的名称
和值类型。

遇到 unknown prop warning 时，应先检查包装组件是否把私有字段泄漏给原生元素。正确修复是消费私有
字段、限制目标元素 props 并明确 spread 顺序，不是把错误名称改成全小写来消除 warning。

### 2. 适用场景

本课规则适用于：

- 在 TSX 中直接渲染 HTML 内置元素；SVG 专用 props 仍按对应元素合同核对。
- 编写需要透传 `className`、`style`、ARIA 和原生事件的包装组件。
- 将少量集成标识放进 `data-*`。
- 为第三方集成提供经过确认的小写自定义 attribute。

需要另查专门合同的场景包括：

- 输入、选择、文本域的受控值与默认值。
- 表单提交、校验和 Action。
- Ref 与命令式 DOM 操作。
- Hydration 警告与服务端渲染一致性。
- 原始 HTML 注入。
- 自定义元素的类型、事件和 property 定义。

## 十二、练习

:::exercise
### 完成 DOM Props 透传与结果核对

**要求：** 修正一段从 HTML 复制的 TSX，使 `className`、`htmlFor`、`tabIndex` 和 `aria-*` 名称正确；
预测 `disabled`、`aria-expanded`、`data-state` 与 `style.width` 在不同 boolean 状态下的结果；实现一个私有
`tone: 'success' | 'warning'`、支持合法 `<span>` DOM props、合并 `className` 且不泄漏 `tone` 的 `Badge`；
最后在浏览器中核对真实 `<span>` 的 attribute、property、class 和 computed style。

**验收：** 能解释 HTML attribute、DOM property 与 React prop 的差异；能说明 `tabIndex` 为什么只使用
`0` 或 `-1`；能区分 HTML boolean 与 ARIA `true`/`false`；真实 `<span>` 没有 `tone` attribute，
`className` 与 `style` 的覆盖策略明确，观察结果与预测一致。
:::

## 十三、本节小结

- TSX 写的是 React element props，React DOM 再更新 DOM property 或 HTML attribute。
- 多词 DOM prop 通常使用 camelCase；`className`、`htmlFor` 是重要专用名称。
- `data-*`、`aria-*` 保留连字符，ARIA 还要求规范名称、取值和引用关系。
- HTML boolean、ARIA 枚举、字符串和数字分别有自己的语义，不能用字符串化口诀代替。
- `style` 接收对象；普通 key 使用 camelCase，长度数字通常补 `px`，无单位属性和 `--*` 例外。
- 包装组件要先消费私有 prop，再转发剩余 DOM props；后写的同名 prop 获得最终值。
- `aria-disabled` 不会自动实现禁用行为，原生语义优先。

## 十四、参考资料

- [Common components](https://react.dev/reference/react-dom/components/common) - 通用 DOM props、样式与
  自定义 attribute 合同。
- [React DOM Components](https://react.dev/reference/react-dom/components) - 内置元素的 DOM prop 合同。
- [Unknown Prop Warning](https://react.dev/warnings/unknown-prop) - 私有 prop 泄漏与过滤方式。
- [Invalid ARIA Prop Warning](https://react.dev/warnings/invalid-aria-prop) - ARIA 名称约束。
- [MDN Boolean attribute](https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML) - HTML 布尔 attribute
  的存在语义。
- [MDN hidden global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) -
  `hidden` 的枚举值与隐藏状态。
- [MDN HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) - `data-*`
  与 `dataset` 映射。
