# DOM Props 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.dom-props`
- 标题：DOM Props
- 教学层级：零基础到进阶
- 核验日期：`2026-08-09`
- 复核日期：`2026-08-16`
- 研究状态：已完成，可进入单知识点课程编写

本课只回答一条主线：在 TSX 中渲染浏览器内置元素时，React 的 DOM props 如何映射到真实 DOM，属性名、
属性值、`style`、`data-*`、`aria-*` 和 props spread 分别遵循什么规则，以及何时会产生 unknown prop
warning。

前置知识是 TSX 标记与表达式、函数组件和组件 Props。本稿只在解释 DOM props 转发时复用这些合同，不
重新讲解组件 Props、事件传播或 State。

明确排除：受控表单、表单提交、事件处理主线、Effect、Ref、hydration 深入、CSS 教程、原始 HTML 注入、
自定义元素接入，以及 React 内部 DOM diff、Fiber 或 lane。

## 研究方法与证据边界

1. 按仓库顺位首先调用 Tavily。2026-08-09 的 `tavily_search` 与 `tavily_extract` 均成功，没有切换到
   Exa、Parallel、Perplexity 或其他搜索工具。
2. Tavily 只用于发现候选入口和交叉检查。搜索结果中的翻译站旧版本、GitHub issue、discussion 与摘要性
   结论不作为最终依据；每条教学结论回到 React 官方英文文档、React 官方源码/测试、TypeScript Handbook、
   MDN 或 W3C 规范核验。
3. React 版本页当前把 Latest 文档标为 `19.2`。本课的公共 React 合同以 React 19.2 文档为准：
   [React Versions](https://react.dev/versions)。
4. 本稿严格区分三层：TSX 中传给 React element 的 prop、浏览器 DOM 对象上的 property、序列化标记中的
   HTML attribute。三者经常相关，但名称、值类型和存在语义不总是一致。
5. TypeScript 能依据 `JSX.IntrinsicElements` 检查内置标签及其 props，但类型通过不等于 HTML/ARIA 语义
   一定正确；可访问性与布尔 attribute 仍须按平台规范判断。
6. React 官方文档没有完整说明 TSX 中 CSS 自定义属性的类型扩展方式。因此运行时行为回到 React 官方
   `CSSPropertyOperations` 源码与测试，类型边界回到 React 的 TypeScript 指南和 `csstype` 官方 README，
   不采用社区讨论帖作为事实来源。

## Tavily 查询、候选与官方回源结论

| ID | Tavily query | 主要候选 | 官方回源结论 |
| --- | --- | --- | --- |
| `Q1` | `site:react.dev/reference/react-dom/components/common DOM props className htmlFor tabIndex style data aria React 19` | React Common Components、印度尼西亚语镜像 | 采用 React 英文官方页；确认 `className`、`htmlFor`、`tabIndex`、`style`、`data-*`、`aria-*` 合同。 |
| `Q2` | `site:react.dev warnings unknown prop spreading props filter custom data attributes` | Unknown Prop Warning、Passing Props、Common Components | 采用 Unknown Prop Warning 与 Common Components；确认先消费组件私有 prop，再转发 rest props。 |
| `Q3` | `site:developer.mozilla.org DOM boolean attributes aria data style custom properties CSS React` | MDN ARIA 与 global attributes | 结果过宽，只保留候选入口；布尔、ARIA、data 与 CSS 自定义属性分别回到专门 Reference。 |
| `Q4` | `site:github.com/facebook/react CSS custom properties style -- React DOM CSSPropertyOperations` | React issue | issue 不作为结论；直接回读 `facebook/react` 官方源码和测试，确认 `--*` 使用 `setProperty` 且不自动补单位。 |
| `Q5` | `site:developer.mozilla.org CSS custom properties -- custom property syntax case sensitive` | MDN `--*`、Using custom properties | 采用 MDN `--*` Reference；确认名称以 `--` 开头、区分大小写、值保留 CSS token。 |
| `Q6` | `site:developer.mozilla.org Web HTML boolean attributes true false presence` | MDN Boolean attribute、`setAttribute` | 采用 MDN Boolean attribute；确认 HTML 布尔 attribute 由存在与否决定，字符串 `"false"` 不能表达 false。 |
| `Q7` | `site:developer.mozilla.org HTML data attributes dataset string values` | MDN `dataset`、Use data attributes | 采用 MDN `dataset` Reference；确认 DOM 中值是字符串，`data-user-id` 映射为 `dataset.userId`。 |
| `Q8` | `site:w3.org WAI ARIA boolean attributes string true false` | WAI-ARIA 1.2、1.3 | 采用稳定 WAI-ARIA 1.2；确认 ARIA true/false 是关键字枚举，不是 HTML 布尔 attribute。 |
| `Q9` | `site:github.com/DefinitelyTyped/DefinitelyTyped types/react CSSProperties custom properties -- string number` | DefinitelyTyped 定义与 discussion | discussion 不作为结论；只用 React 官方 TypeScript 指南确认 `React.CSSProperties`，自定义属性类型另行窄化。 |
| `Q10` | `site:github.com/frenic/csstype CSS.Properties custom properties index signature` | `csstype` issue | issue 不作为结论；直接回读 `csstype` 官方 README 的 module augmentation 与 type assertion 说明。 |
| `Q11` | `site:react.dev using typescript CSSProperties style React TypeScript` | React Using TypeScript、Common Components | 采用 React 官方 TypeScript 指南；确认 `React.CSSProperties` 是 `style` 对象的公共类型入口。 |

随后用 Tavily `extract` 回读了 React DOM Components、Common Components、Unknown Prop Warning、Invalid ARIA
Prop Warning、React TypeScript、TypeScript JSX、MDN Boolean attribute、`dataset`、`tabindex`、CSS `--*` 与
WAI-ARIA 1.2。抽取结果与直接读取官方页面/源码的结论一致。

## 官方来源卡：URL 与支持的 claim

| ID | 一手来源 URL | 本稿采用的 claim |
| --- | --- | --- |
| `react-versions` | [React Versions](https://react.dev/versions) | Latest 文档当前为 React 19.2。 |
| `react-dom-components` | [React DOM Components](https://react.dev/reference/react-dom/components) | 内置 DOM prop 通常使用 camelCase。 |
| `react-common` | [Common components](https://react.dev/reference/react-dom/components/common) | `className`、`htmlFor`、`tabIndex`、`style`、`data-*`、`aria-*` 与自定义 attribute 的公共合同。 |
| `react-unknown` | [Unknown Prop Warning](https://react.dev/warnings/unknown-prop) | 非法 DOM prop、私有 prop 泄漏、rest props 过滤、非标准 attribute 和标签大小写是常见警告来源。 |
| `react-invalid-aria` | [Invalid ARIA Prop Warning](https://react.dev/warnings/invalid-aria-prop) | `aria-*` 必须是 ARIA 规范中的有效名称；`aria-role` 不是 `role` 的替代写法。 |
| `react-typescript` | [Using TypeScript](https://react.dev/learn/typescript) | React Web 类型来自 React 类型定义；内联样式可用 `React.CSSProperties` 描述。 |
| `ts-jsx` | [TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements) | 内置元素从 `JSX.IntrinsicElements` 查找，元素 attribute type 决定 TSX 属性的静态检查。 |
| `mdn-boolean` | [Boolean attribute](https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML) | HTML 布尔 attribute 的存在表示 true、缺失表示 false；`"true"` 与 `"false"` 不是合法布尔 attribute 值。 |
| `mdn-hidden` | [`hidden`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) | `hidden` 是枚举 attribute，支持 hidden 与 until-found 状态。 |
| `mdn-dataset` | [`HTMLElement.dataset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) | `data-*` 在 DOM 中是字符串映射；连字符名称映射到 `dataset` camelCase property。 |
| `mdn-tabindex` | [`tabindex`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex) | `-1`、`0` 的焦点顺序语义；正数会破坏自然顺序，应避免。 |
| `mdn-html-for` | [`HTMLLabelElement.htmlFor`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/htmlFor) | `htmlFor` 反映 `<label for>`，通过目标控件 `id` 建立关联。 |
| `mdn-css-custom` | [Custom properties (`--*`)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/--*) | CSS 自定义属性以 `--` 开头、名称区分大小写，值由 CSS token 构成。 |
| `mdn-spread` | [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) | 对象展开按书写顺序复制属性，后写同名属性覆盖前值；适用于解释 TSX props spread 顺序。 |
| `wai-aria` | [WAI-ARIA 1.2 value type mapping](https://www.w3.org/TR/wai-aria-1.2/#typemapping) | ARIA true/false 在 HTML 中映射为 `"true"` / `"false"` 关键字枚举，而不是 HTML 布尔类型。 |
| `react-css-source` | [`CSSPropertyOperations.js`](https://github.com/facebook/react/blob/v19.2.0/packages/react-dom-bindings/src/client/CSSPropertyOperations.js) | React 识别 `--*` style key 并调用 `style.setProperty`；普通非零数值按属性决定是否补 `px`。 |
| `react-css-test` | [`CSSPropertyOperations-test.js`](https://github.com/facebook/react/blob/v19.2.0/packages/react-dom/src/__tests__/CSSPropertyOperations-test.js) | 官方测试覆盖普通长度补 `px`、无单位属性不补 `px`、CSS 自定义属性不自动加单位。 |
| `csstype-readme` | [`csstype` README](https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors) | CSS 自定义属性遇到类型缺口时可用 module augmentation 或窄 type assertion；不应默认放宽所有 CSS key。 |

## 一、先区分 Prop、Property 与 Attribute

### 1.1 TSX 写的是 React element props

下面的 `className`、`tabIndex` 和 `aria-current` 首先是传给 React element 的 props：

```tsx
const navigationItem = (
  <a className="navigation-item" tabIndex={0} aria-current="page">
    当前页面
  </a>
)
```

React 再按照内置 `<a>` 的合同更新真实 DOM。浏览器最终可能看到 HTML attributes `class`、`tabindex`、
`aria-current`，DOM 对象则暴露 `element.className`、`element.tabIndex` 等 properties。不能因为最终标记使用
小写 attribute，就在 TSX 中把所有 prop 也机械改成小写。

来源：[React DOM Components](https://react.dev/reference/react-dom/components)、
[Common components](https://react.dev/reference/react-dom/components/common)。

### 1.2 TypeScript 检查的是 JSX 元素属性类型

TypeScript Handbook 规定：内置元素名称从 `JSX.IntrinsicElements` 查找，元素对应 property 的类型就是 TSX
attribute type。React 类型定义据此让 `<div>`、`<label>`、`<button>` 拥有不同的可用 props。

因此，以下错误通常能在编译期暴露：

```tsx
// 错误：React 内置 DOM prop 使用 tabIndex，不是 tabindex。
const wrongName = <div tabindex="0" />

// 错误：tabIndex 需要数字，不是字符串。
const wrongValue = <div tabIndex="0" />

const correctValue = <div tabIndex={0} />
```

TypeScript 官方 JSX 文档还明确说明：未知的合法标识符 prop 会报错，但 `some-unknown-prop` 这类不是合法
JavaScript 标识符的连字符名称可能通过检查。因此 `aria-lable` 一类拼写错误不能只依赖 TypeScript；React
运行时警告、ARIA 规范核对和可访问性检查仍然必要。

来源：[TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements)、
[Invalid ARIA Prop Warning](https://react.dev/warnings/invalid-aria-prop)。

## 二、DOM Prop 命名规则

### 2.1 通常使用 camelCase

React 官方说明内置 DOM props 通常遵循 camelCase：

| HTML attribute | TSX DOM prop | 值类型示例 |
| --- | --- | --- |
| `class` | `className` | `string` |
| `for` | `htmlFor` | `string` |
| `tabindex` | `tabIndex` | `number` |
| `contenteditable` | `contentEditable` | React API 接受布尔值 |
| `spellcheck` | `spellCheck` | React API 接受布尔值或 `null` |

已经是单词或平台本身使用小写的名称保持原样，例如 `id`、`title`、`role`、`hidden`。

来源：[React DOM Components](https://react.dev/reference/react-dom/components)、
[Common components](https://react.dev/reference/react-dom/components/common)。

### 2.2 className 表示完整 class 字符串

`className` 接收字符串。条件 class 需要先由 JavaScript 生成最终字符串，不要把对象或布尔值直接传给
`className`：

```tsx
const className = ['notice', isImportant ? 'notice-important' : null]
  .filter(Boolean)
  .join(' ')

const notice = <aside className={className}>系统通知</aside>
```

静态样式优先使用 `className`；`style` 更适合值依赖运行时数据的局部动态样式。这是 React 官方给出的选择
边界，不表示两者不能同时存在。

来源：[Common components: Applying CSS styles](https://react.dev/reference/react-dom/components/common#applying-css-styles)。

### 2.3 htmlFor 通过 id 关联 label 与控件

TSX 中使用 `htmlFor`，最终对应 HTML 的 `for`。其值应匹配目标控件的 `id`，不是 `name`、显示文本或组件
变量名：

```tsx
const field = (
  <>
    <label htmlFor="account-email">邮箱</label>
    <input id="account-email" name="email" type="email" />
  </>
)
```

本课只讲 DOM prop 映射与关联关系，不展开输入控件的受控/非受控状态。

来源：[Common components](https://react.dev/reference/react-dom/components/common)、
[`HTMLLabelElement.htmlFor`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/htmlFor)。

### 2.4 tabIndex 使用数字，并保持自然焦点顺序

React 的 `tabIndex` 接收数字：

- `tabIndex={0}`：元素进入按文档顺序排列的键盘焦点序列。
- `tabIndex={-1}`：不进入顺序键盘导航，但仍可由脚本或某些指针操作聚焦。
- 正数：人为重排焦点顺序，React 与 MDN 都建议避免。

原生可交互元素通常已经具备正确焦点行为，不应为了“保险”给所有元素添加 `tabIndex={0}`。

来源：[Common components](https://react.dev/reference/react-dom/components/common)、
[`tabindex`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex)。

### 2.5 data-* 与 aria-* 是连字符例外

`data-*` 和 `aria-*` 不转换成 camelCase：

```tsx
const status = (
  <section data-order-id="A-1024" aria-labelledby="order-heading">
    <h2 id="order-heading">订单状态</h2>
  </section>
)
```

错误写法包括 `dataOrderId`、`ariaLabelledby` 和 `aria-role`。前两者破坏平台命名，`aria-role` 则根本不是
有效 ARIA attribute；角色应写成 `role`。

来源：[Common components](https://react.dev/reference/react-dom/components/common)、
[Invalid ARIA Prop Warning](https://react.dev/warnings/invalid-aria-prop)。

## 三、字符串、数字与布尔值

### 3.1 字面量字符串与表达式值

等号后的引号直接传字符串；花括号传 JavaScript 表达式：

```tsx
const title = '账户设置'
const order = 0

const panel = <section title={title} tabIndex={order} />
const sameTitle = <section title="账户设置" />
```

不要把所有值都放进引号。`tabIndex="0"` 是字符串，不等同于 `tabIndex={0}`；布尔字符串也不等同于
JavaScript boolean。

### 3.2 HTML 布尔 Attribute 由“是否存在”决定

对于 `disabled`、`required` 等真正的 HTML boolean attributes，存在表示 true，缺失表示 false。TSX 中应传
boolean：

```tsx
const enabledButton = <button disabled={false}>保存</button>
const disabledButton = <button disabled={true}>保存中</button>
const alsoDisabled = <button disabled>保存中</button>
```

`disabled` 是 `disabled={true}` 的简写。不要写 `disabled="false"`：HTML 规范不会把这个字符串解释为 false，
因为 attribute 仍然存在。

来源：[MDN Boolean attribute](https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML)。

### 3.3 不能把所有“像布尔”的值套进同一规则

HTML boolean attribute、HTML enumerated attribute 与 ARIA true/false 是三类不同合同。例如 ARIA 的
true/false 是关键字枚举，`aria-expanded="false"` 明确表达 false，而不是“attribute 存在所以为 true”。

```tsx
const collapsed = <button aria-expanded={false}>筛选条件</button>
```

React 类型允许使用 boolean 表达式方便生成最终 ARIA 值，但语义仍按 WAI-ARIA 的关键字与默认值解释。
HTML 平台把 `hidden` 定义为枚举 attribute，并包含 `until-found` 状态；React 19.2 的 `hidden` DOM prop
合同却只接受 boolean。`hidden={true}` 进入普通隐藏状态，`hidden={false}` 省略 attribute；直接传字符串
`"until-found"` 既不符合 React 19.2 的 TypeScript 类型，React DOM 也只会按 true 写成空值 `hidden`
attribute，不会保留该平台关键字。遇到 `contentEditable`、`draggable`、`spellCheck`、`hidden` 等平台枚举
属性时，必须同时核对 HTML 分类和当前 React DOM prop 合同，不能只从平台名称推导 TSX 值。

来源：[WAI-ARIA 1.2 value type mapping](https://www.w3.org/TR/wai-aria-1.2/#typemapping)、
[Common components](https://react.dev/reference/react-dom/components/common)、
[`hidden`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden)。

### 3.4 null 与 undefined 不能替代所有业务语义

React 官方对自定义 attributes 的公共合同是：值会转换为字符串，`null` 或 `undefined` 会移除 attribute。
对于标准 props，应优先传它声明的真实类型；不要依赖 `null` 在所有 HTML/ARIA props 上都表达相同业务语义。

`false` 也不是通用的“移除任意 attribute”指令。HTML boolean、HTML 枚举与 ARIA 枚举分属不同规则，
课程必须逐类讲清，不能写成一条模糊口诀。

来源：[Common components](https://react.dev/reference/react-dom/components/common)。

## 四、style 对象

### 4.1 style 接收对象，不接收 CSS 文本

React 的 `style` prop 接收 JavaScript 对象。标准 CSS property 名通常使用 camelCase：

```tsx
const progressStyle = {
  width: 120,
  backgroundColor: '#1565c0',
  lineHeight: 1.5,
}

const progress = <div style={progressStyle}>已完成</div>
```

这里的 `width: 120` 会得到像素单位；`lineHeight` 属于无单位属性，不补 `px`。显式单位应使用字符串，例如
`width: '50%'`、`marginBlock: '1rem'`。数值 `0` 不需要单位。

来源：[Common components](https://react.dev/reference/react-dom/components/common)、
[`CSSPropertyOperations.js`](https://github.com/facebook/react/blob/v19.2.0/packages/react-dom-bindings/src/client/CSSPropertyOperations.js)。

### 4.2 style={{}} 是两层普通 JavaScript 语法

外层 `{}` 从 TSX 回到 JavaScript，内层 `{}` 创建对象：

```tsx
const avatar = <img alt="用户头像" style={{ width: 48, height: 48 }} />
```

它不是 React 专门发明的“双花括号指令”。把对象提前命名通常更适合复用和类型检查。

### 4.3 使用 React.CSSProperties 描述样式合同

React 官方 TypeScript 指南推荐用 `React.CSSProperties` 描述传给 `style` 的对象：

```tsx
import type { CSSProperties } from 'react'

const cardStyle: CSSProperties = {
  borderColor: '#c9d2dc',
  borderWidth: 1,
  opacity: 0.92,
}
```

这能提供已知 CSS property 的检查与编辑器补全。它不保证每个运行时浏览器都支持该属性，也不负责验证由
字符串动态拼出的所有 CSS 值。

来源：[Using TypeScript](https://react.dev/learn/typescript#typing-style-props)。

### 4.4 CSS 自定义属性保持 -- 连字符名称

CSS 自定义属性不是标准 property camelCase 规则的例子。名称必须保持 `--token-name`，并且区分大小写：

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

React 官方实现对 `--*` 调用 `style.setProperty`，不会像普通长度 property 一样自动追加 `px`。需要单位时
应在值中显式提供，例如 `'18rem'` 或 `'12px'`。上面的本地 template-literal index signature 只放宽
`--*`，不会把所有未知 style key 都变成合法值。

若团队选择全局扩充 `csstype`，其官方 README 推荐 module augmentation；不应为了省事加入宽泛的
`[key: string]: any`，否则会丢失已知 CSS property 的拼写检查。

来源：[`CSSPropertyOperations.js`](https://github.com/facebook/react/blob/v19.2.0/packages/react-dom-bindings/src/client/CSSPropertyOperations.js)、
[`CSSPropertyOperations-test.js`](https://github.com/facebook/react/blob/v19.2.0/packages/react-dom/src/__tests__/CSSPropertyOperations-test.js)、
[MDN Custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/--*)、
[`csstype` README](https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors)。

## 五、data-* 与 aria-* 的数据边界

### 5.1 data-* 最终提供字符串数据

`data-*` 适合把少量平台可见的自定义数据附加到元素，例如测试选择器、第三方集成标识或需要由 DOM 脚本
读取的 ID：

```tsx
const row = <li data-record-id="customer-42">Ada</li>
```

浏览器通过 `dataset` 暴露字符串映射：`data-record-id` 对应 `element.dataset.recordId`。数值等非字符串写入
DOM dataset 时也会字符串化，因此不要把对象、权限状态或大型业务模型塞进 `data-*`。

React 应用内部已经能通过 Props 或 State 传递的数据，通常无需再绕到 DOM attribute 中读取。

来源：[Common components](https://react.dev/reference/react-dom/components/common)、
[`HTMLElement.dataset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)。

### 5.2 aria-* 必须使用规范中的准确名称和取值

React 保持 ARIA attribute 名与 HTML 一致，并会对拼写错误的 `aria-*` 发出警告：

```tsx
const help = (
  <>
    <button aria-describedby="save-help">保存</button>
    <p id="save-help">保存后立即生效。</p>
  </>
)
```

`aria-labelledby`、`aria-describedby` 等 ID reference 必须指向真实存在的 ID。通过 TypeScript 只能证明名称或
值大致符合类型，不能证明引用目标存在，也不能证明 ARIA 使用符合元素角色。

来源：[Invalid ARIA Prop Warning](https://react.dev/warnings/invalid-aria-prop)、
[WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)。

### 5.3 优先使用已有标准 DOM Prop

如果平台已有 `id`、`title`、`hidden`、`role` 或语义化元素，就不要发明 `isHidden`、`tooltipText`、
`aria-role` 之类的 DOM attributes。组件内部可以使用业务化 prop 名，但在抵达原生元素前必须转换成标准
DOM props 或被消费掉。

## 六、Props Spread 与 Unknown Prop Warning

### 6.1 组件私有 Props 不能泄漏到 DOM

下面的 `tone` 是 `Notice` 组件自己的样式决策，不是 `<section>` 的合法 DOM prop：

```tsx
type NoticeProps = {
  tone: 'info' | 'warning'
  title: string
}

/** 错误示例：把组件私有 tone 一并转发给原生 section。 */
function WrongNotice(props: NoticeProps) {
  return <section {...props}>{props.title}</section>
}
```

这会让无关 prop 漂到原生元素，可能触发 unknown prop warning 或生成无意义 attribute。

来源：[Unknown Prop Warning](https://react.dev/warnings/unknown-prop)。

### 6.2 先消费私有 Props，再转发剩余 DOM Props

可复用包装组件可以显式继承目标原生元素 props，并在 spread 前取出私有字段：

```tsx
import type { ComponentPropsWithoutRef } from 'react'

type NoticeProps = ComponentPropsWithoutRef<'section'> & {
  tone: 'info' | 'warning'
}

/** 渲染通知，并且只把合法的 section DOM props 转发给原生元素。 */
function Notice({ tone, className, ...domProps }: NoticeProps) {
  const classes = ['notice', `notice-${tone}`, className].filter(Boolean).join(' ')

  return <section {...domProps} className={classes} />
}
```

这里 `tone` 和 `className` 已被消费，`domProps` 才被转发。`className` 写在 spread 之后，因此组件计算出的
最终值不会被 `domProps` 中的旧值覆盖。

### 6.3 Spread 顺序决定同名 Prop 的最终值

JSX spread 遵循对象属性的覆盖顺序：后写同名值覆盖先写值。

```tsx
const domProps = { title: '外部标题', tabIndex: 0 }

const explicitWins = <section {...domProps} title="组件标题" />
const spreadWins = <section title="组件标题" {...domProps} />
```

第一行最终 title 是“组件标题”，第二行最终 title 是“外部标题”。组件必须有意识地决定调用方可否覆盖
`className`、`style`、可访问性名称等关键 props。

来源：[MDN Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)。

### 6.4 任意小写自定义 Attribute 是集成边界，不是默认建模方式

React DOM 运行时允许在内置元素上使用小写、且不以 `on` 开头的自定义 attribute；值会转换成字符串，
`null` 或 `undefined` 会移除它。该能力主要用于第三方库或平台集成。

运行时合同与 JSX 静态合同必须分开说明。当前 React 类型定义不会让内置元素接受任意合法 JavaScript
标识符名称，因此 `<div thirdpartymarker="course-42" />` 会产生 TS2322；若第三方接口固定使用该名称，项目
必须补充范围明确的类型声明。TypeScript 又会忽略不是合法 JavaScript 标识符的 JSX attribute 名称，所以
带连字符的未知名称可能通过静态检查，但这种通过不能证明名称属于 React、HTML 或第三方接口合同。

如果只是保存自定义数据，优先使用合法 `data-*`。不要用全小写写法掩盖拼写错误，例如把 `className` 错写
成 `classname`；也不要把对象传给自定义 attribute 后接受 `[object Object]` 这样的意外序列化。

来源：[Common components](https://react.dev/reference/react-dom/components/common)、
[Unknown Prop Warning](https://react.dev/warnings/unknown-prop)、
[TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements)。

## 七、易错点矩阵

| 错误 | 错误原因 | 可观察后果 | 正确方向 | 来源 |
| --- | --- | --- | --- | --- |
| 在 TSX 中写 `class` | 混淆 HTML attribute 与 React DOM prop | 类型错误或警告 | 使用 `className` | `react-common` |
| 写 `for` 而不是 `htmlFor` | 忽略 DOM property 命名 | label 关联写法错误 | `htmlFor` 匹配控件 `id` | `react-common`、`mdn-html-for` |
| 写 `tabindex="0"` | 名称和类型都按 HTML 文本照搬 | TypeScript 报错 | `tabIndex={0}` | `react-dom-components` |
| 大量使用正数 tabIndex | 人为重排焦点顺序 | 键盘导航难以预测 | 只用 `0` / `-1`，保持 DOM 顺序 | `mdn-tabindex` |
| 写 `disabled="false"` | HTML boolean attribute 看存在性 | 控件仍被禁用 | `disabled={false}` | `mdn-boolean` |
| 把 `aria-expanded="false"` 当作 HTML boolean | ARIA 使用关键字枚举 | 错误推导可访问性状态 | 按具体 ARIA attribute 取值解释 | `wai-aria` |
| 把 `hidden` 当作 HTML boolean attribute，或直接传 `"until-found"` | HTML 将其归为枚举 attribute，但 React 19.2 的 prop 只接受 boolean | 分类错误或平台关键字丢失 | React 19.2 使用 boolean，并单独说明平台差异 | `react-common`、`mdn-hidden` |
| 写 `ariaLabel` / `dataUserId` | 把连字符例外改成 camelCase | attribute 无效或丢失 | `aria-label` / `data-user-id` | `react-common` |
| 认为 TypeScript 会拦截所有 `aria-*` typo | 连字符未知 attribute 可能绕过 JSX 静态检查 | 错误 ARIA 名称进入运行时 | 同时依赖 React warning 与 ARIA 规范 | `ts-jsx`、`react-invalid-aria` |
| 写 `aria-role` | 该名称不在 ARIA 规范中 | React warning、语义无效 | 使用 `role` | `react-invalid-aria` |
| 把对象放进 `data-*` | DOM dataset 是字符串映射 | 得到无意义字符串 | 只放少量可序列化标识 | `mdn-dataset` |
| `style="color: red"` | React style 要求对象 | 类型/运行时错误 | `style={{ color: 'red' }}` | `react-common` |
| 在 style 中写 `background-color` | 标准 style key 使用 camelCase | 拼写警告或样式不生效 | `backgroundColor` | `react-common` |
| 认为 style 数字都补 px | 部分 CSS property 无单位 | 错误推导最终 CSS | 查 property；显式单位传字符串 | `react-common`、React CSS source |
| 把 `--card-width: 18` 当 `18px` | 自定义属性不自动补单位 | CSS token 值是 `18` | 需要单位时传 `'18px'` | React CSS source/test |
| 使用宽泛 style index signature | 所有拼写都绕过类型检查 | typo 难以及时发现 | 只放宽 `--${string}` 或精确 token | `csstype-readme` |
| `<div {...props}>` 泄漏 `tone` | 组件私有 prop 未消费 | unknown prop warning 或脏 attribute | 解构私有字段后 spread rest | `react-unknown` |
| 忽略 spread 顺序 | 后写同名 prop 覆盖前值 | 调用方或组件约束意外失效 | 明确关键 prop 放在 spread 前或后 | `mdn-spread` |
| 把未声明的 `thirdpartymarker` 直接写进 TSX | 混淆 React DOM 运行时支持与 JSX 静态合同 | 当前 React 类型定义报告 TS2322 | 普通数据用 `data-*`；固定集成名补充窄类型声明 | `react-common`、`ts-jsx` |
| 用小写自定义 attribute 掩盖 typo | React 允许部分小写 attribute | 错误名称静默进入 DOM | 标准 prop 用官方拼写，自定义数据用 `data-*` | `react-common`、`react-unknown` |

## 八、正文编写合同

正文必须覆盖：

1. React DOM prop、DOM property、HTML attribute 三层区别。
2. camelCase 主规则，以及 `className`、`htmlFor`、`tabIndex`。
3. `data-*`、`aria-*` 保持连字符的例外与有效名称约束。
4. 字符串、数字、HTML boolean、HTML 枚举和 ARIA true/false 的不同值语义。
5. `hidden` 的 HTML 枚举分类、React 19.2 boolean prop 合同与 `until-found` 平台差异。
6. `style` 对象、camelCase property、数值单位、`React.CSSProperties` 和 CSS 自定义属性。
7. props spread 顺序、组件私有 props 过滤和 unknown prop warning。
8. 任意小写自定义 attribute 只作为第三方集成边界，并区分 React DOM 运行时支持与 JSX 静态类型声明。
9. 至少覆盖本记录中的高价值易错点、练习、小结和官方来源。

正文所有 React 展示代码统一使用 TSX。正文不得出现 Tavily 调用、临时验证、本地依赖、仓库命令、构建
结果、源码哈希、浏览器数据、Gate 或复审结论；不得展开受控表单、表单提交、事件处理主线、Effect、Ref、
hydration 实现、CSS 教程、原始 HTML 注入或自定义元素接入。
