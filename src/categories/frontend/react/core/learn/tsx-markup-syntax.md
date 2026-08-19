---
id: react.core.learn.basics.tsx-markup-syntax
type: lesson
title: TSX 标记语法
summary: 从零理解 TSX 的文件、结构、闭合、注释和文本规则，写出能够正确解析的 React 标记。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 35
prerequisites:
  - react.core.learn.basics.vite-react-project-setup
related:
  - react.core.learn.basics.tsx-expressions-and-attributes
tags:
  - React
  - JSX
  - TSX
  - Fragment
  - 标记语法
appliesTo: React 19.2.8、TypeScript 7.0.2
verifiedAt: 2026-08-15
objectives:
  - 能区分 HTML、JSX、TSX 和普通字符串。
  - 能在 .tsx 文件中使用语义父元素或 Fragment 建立一个外层边界。
  - 能正确闭合和嵌套标签，并使用 JSX 注释。
  - 能区分 Fragment 简写与完整写法。
  - 能说明普通文本、entity、同行空格与多行源码空白的边界。
recap:
  - JSX 是 XML-like 的 JavaScript 语法扩展；TSX 是 TypeScript 文件中的 JSX 解析模式。
  - 一个 JSX expression 需要一个外层边界，Fragment 可以分组同级节点而不增加包装节点。
  - 标签必须显式闭合并按顺序正确嵌套，JSX 注释写成花括号包裹的块注释。
  - 普通文字会成为标记内容，保留字符可以使用 entity，源码缩进不等于精确页面空白。
sources:
  - title: React Writing Markup with JSX
    url: https://react.dev/learn/writing-markup-with-jsx
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - JSX 与 React 是不同概念
      - 单个外层边界、标签闭合和正确嵌套规则
  - title: React Fragment Reference
    url: https://react.dev/reference/react/Fragment
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - Fragment 可以在不增加包装节点的情况下分组
  - title: TypeScript JSX Handbook
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript JSX
    claims:
      - 使用 JSX 的 TypeScript 文件采用 .tsx 扩展名并启用 jsx 选项
  - title: JSX Specification
    url: https://facebook.github.io/jsx/
    sourceType: specification
    appliesTo: Meta JSX Draft（2026-08-15 核验）
    claims:
      - JSX 的 XML-like 语法与不定义运行语义的边界
      - 开标签与闭标签名称必须匹配
  - title: JSX AST Format
    url: https://github.com/facebook/jsx/blob/main/AST.md
    sourceType: specification
    appliesTo: Meta JSX AST（2026-08-15 核验）
    claims:
      - JSX 文本、Fragment 和用于注释的空 expression 是不同语法节点
  - title: TypeScript JSX Transformer
    url: https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/transformers/jsxtransforms/jsx.go
    sourceType: source-code
    appliesTo: TypeScript 7.0.2
    claims:
      - 多行 JSX 文本的空白规范化与 entity 解码
---

# TSX 标记语法

## 一、学习目标

- 区分 HTML、JSX、TSX 和普通字符串，不再把它们当作同一种内容。
- 给一段 TSX 标记选择正确的文件扩展名和外层边界。
- 区分 Fragment 简写与完整写法，说明两者的导入要求。
- 写出显式闭合、正确嵌套的标签和不会显示在页面上的 JSX 注释。
- 根据所在位置选择 JavaScript 注释或 JSX 注释。
- 根据页面结果解释普通文本、entity、同行空格与多行源码空白的差异。

合法的 TSX 标记需要使用正确的文件扩展名、外层边界、闭合结构、注释和文本写法。

## 二、为什么需要 TSX 标记

界面不是一段平铺文字，而是有结构的内容：标题和说明属于一个区域，列表项属于列表。TSX 允许你在
TypeScript 模块中直接描述这种父子关系。

TSX 看起来像 HTML，却不会沿用 HTML parser 的宽松规则。浏览器读取 HTML 时会修复某些省略的结束
标签；TypeScript 读取 TSX 时要求结构明确。因此需要先把文件、外层边界、闭合和文本规则写准确。

## 三、HTML、JSX、TSX 与字符串

| 名称 | 它是什么 | 本课需要记住什么 |
| --- | --- | --- |
| HTML | 浏览器定义的标记语言 | 外观与 TSX 接近，但解析规则不同 |
| JSX | XML-like 的 JavaScript 语法扩展 | 规定标签和文本等源码形状，不限定只能用于 React |
| TSX | TypeScript 文件中的 JSX 解析模式 | 含 JSX 的 TypeScript 文件使用 `.tsx` |
| 字符串 | JavaScript 的文本值 | 即使内容像标签，也仍然只是文字 |

下面两行外观接近，含义并不相同：

~~~~tsx
const markup = <section>课程正文</section>
const text = `<section>课程正文</section>`
~~~~

`markup` 右侧是一个 JSX expression，需要由支持 JSX 的工具读取；`text` 右侧是模板字符串，尖括号只是
字符串中的普通字符。

:::tip
JSX 规范只定义语法，不规定运行语义。准确说法是“本项目使用 React 解释这段 TSX”，而不是“JSX
天生就是 React 或 HTML”。
:::

## 四、含 JSX 的文件使用 `.tsx`

`.tsx` 告诉 TypeScript：这个文件中可能出现 JSX。最小源码可以只有一条声明：

~~~~tsx
const heading = <h1>React 基础</h1>
~~~~

如果把同一内容放进 `.ts` 文件，TypeScript 不会按 JSX 读取 `<h1>`，会在尖括号附近产生解析错误。
扩展名只负责选择语言模式，不保证文件中的标记一定正确。

### 1. 多行标记常用括号标出边界

~~~~tsx
const summary = (
  <section>
    <h2>学习进度</h2>
    <p>已完成 TSX 标记语法</p>
  </section>
)
~~~~

括号是 JavaScript 的分组语法，不是 JSX 的强制符号。单行标记可以省略；多行时保留括号，能让整个
expression 的起点和终点更清楚。

## 五、一个 expression，一个边界

下面两个相邻标签直接占据同一个 expression 位置，没有共同的外层边界：

~~~~tsx
const summary = (
  <h2>课程标题</h2>
  <p>课程摘要</p>
)
~~~~

TypeScript 会报告 `TS2657: JSX expressions must have one parent element.`。可以根据页面结构选择下面
两种修复方式。

### 1. 使用语义父元素

~~~~tsx
const summary = (
  <section>
    <h2>课程标题</h2>
    <p>课程摘要</p>
  </section>
)
~~~~

这里的标题和摘要共同组成一个章节，`section` 表达了这层含义。父元素会成为最终结构的一部分，不要
为了消除解析错误增加没有语义的 `div`。

### 2. 只需要分组时，使用 Fragment

~~~~tsx
const summary = (
  <>
    <h2>课程标题</h2>
    <p>课程摘要</p>
  </>
)
~~~~

`<>...</>` 是 Fragment 简写。它给两个同级节点建立一个 JSX expression 边界，但不会增加包装节点。
因此，“源码需要一个外层边界”不等于“页面最终只能有一个节点”。

Fragment 也可以写出完整名称：

~~~~tsx
import { Fragment } from 'react'

const summary = (
  <Fragment>
    <h2>课程标题</h2>
    <p>课程摘要</p>
  </Fragment>
)
~~~~

`<>...</>` 不需要 import，`<Fragment>...</Fragment>` 需要从 React 导入 `Fragment`。两种写法都只建立
分组边界，不增加包装节点。

## 六、所有标签都要明确闭合

### 1. 空元素使用自闭合写法

没有内容的标签也要写出 `/`：

~~~~tsx
const divider = <br />
~~~~

写成 `<br>` 会让 parser 继续寻找闭标签，并产生未闭合错误。不能依赖浏览器替 TSX 补全。

### 2. 有内容的元素成对闭合

~~~~tsx
const summary = <p>学习 TSX 的基本规则</p>
~~~~

开标签是 `<p>`，对应的闭标签必须是 `</p>`。

### 3. 后打开的标签先关闭

~~~~tsx
const message = (
  <section>
    <p>
      <strong>重点</strong>
    </p>
  </section>
)
~~~~

标签像层层打开的盒子：先打开 `section`，再打开 `p` 和 `strong`，关闭时就按相反顺序返回。开闭标签
名称和大小写也必须一致。`<section>正文</article>` 会得到标签不匹配错误。

## 七、JSX 注释写在花括号中

标签内容位置中的注释写成 `{/* ... */}`：

~~~~tsx
const summary = (
  <section>
    {/* 只解释这一段标记 */}
    <p>React 基础</p>
  </section>
)
~~~~

花括号把 JavaScript 块注释放进 JSX 内容位置。转换后，这条注释不会成为页面文字。

JSX expression 外仍使用普通 JavaScript 注释：

~~~~tsx
// 下面的变量保存一段 TSX 标记
const summary = (
  <section>
    {/* 这里位于标签内容中 */}
    <p>React 基础</p>
  </section>
)
~~~~

注释语法由所在位置决定：JavaScript 代码位置使用 `//` 或 `/* ... */`，标签内容位置使用
`{/* ... */}`。

HTML 注释不能直接复制到 TSX：

~~~~tsx
const summary = <section><!-- HTML 注释 --></section>
~~~~

这不是合法的 JSX 注释语法。标签之间直接写 `// 注释` 也不会自动变成 JavaScript 行注释，它可能被
当作可见文本。统一使用 `{/* ... */}`。

## 八、普通文本、entity 与空白

### 1. 标签之间可以直接写普通文字

~~~~tsx
const heading = <h1>React 基础</h1>
~~~~

“React 基础”会成为这段标记的文字内容，不需要再加引号。

### 2. 显示保留字符时使用 entity

如果页面需要把标签形状当作文字展示，可以写：

~~~~tsx
const explanation = <p>&lt;section&gt; 表示一个 section 标签</p>
~~~~

页面中看到的是 `<section>`。源码里的 `&lt;` 和 `&gt;` 避免尖括号被读取为新标签的开始或结束；
`&amp;` 可以显示 `&`。

### 3. 同行空格属于文字内容

~~~~tsx
const sentence = <p><strong>React</strong> Core</p>
~~~~

`</strong>` 后面的同行空格属于文本，页面显示 `React Core`。如果删掉这个空格，结果会连接成
`ReactCore`。要保留词语间隔，就在明确的文本位置写出空格。

### 4. 不要依赖源码空白

当前 TypeScript transform 会规范化多行 JSX 文本：纯排版空行不会原样保留，多行文字的边缘空白也会
被整理。

~~~~tsx
const summary = (
  <p>
    第一行
    第二行
  </p>
)
~~~~

当前结果是 `第一行 第二行`，不是保留源码换行的字符串。需要明确的一段文字时，直接写出期望的文字；
需要页面布局时，使用对应的结构和样式，不要用源码缩进控制空格。

## 九、观察 Fragment、注释和文本

下面的运行源码使用 Fragment 返回两个同级节点。对照源码和结果，可以确认 JSX 注释没有进入可见文字，
entity 显示为尖括号。

:::demo{id="react.core.learn.basics.tsx-markup-syntax.markup-structure-demo"}
观察 Fragment 没有增加包装节点，并核对注释与 entity 的页面结果
:::

## 十、易错使用提示

:::pitfalls
### 错误：含 JSX 的文件仍使用 `.ts`

**触发条件：** 在 `course.ts` 中写 `<section>课程</section>`。

**原因：** `.ts` 不启用 JSX 语言变体，parser 会按普通 TypeScript 理解尖括号。

**后果：** 尖括号附近出现解析错误，文件无法作为 TSX 处理。

**错误示例：**

~~~~text
course.ts 中写 const view = <section>课程</section>
~~~~

**正确写法：**

~~~~text
把文件命名为 course.tsx，并确保项目启用了 jsx 选项。
~~~~

**验证方式：** 确认含 JSX 的 TypeScript 文件使用 `.tsx`，再运行项目的类型检查。

### 错误：把多个相邻标签直接放在一起

**触发条件：** 在一个 expression 位置并列书写两个标签，没有父元素或 Fragment。

**原因：** 两个相邻 JSX element 没有共同的 expression 边界。

**后果：** TypeScript 报 `TS2657`，源码不能继续转换。

**错误示例：**

~~~~tsx
const view = <h2>标题</h2><p>摘要</p>
~~~~

**正确写法：**

~~~~tsx
const view = <><h2>标题</h2><p>摘要</p></>
~~~~

**验证方式：** 增加语义父元素或 Fragment；若使用 Fragment，确认最终没有额外包装节点。

### 错误：沿用 HTML 的省略闭合写法

**触发条件：** 在 TSX 中写 `<br>`、省略结束标签，或让开闭标签名称不一致。

**原因：** JSX 要求标签显式闭合并正确匹配，不使用 HTML parser 的自动修复规则。

**后果：** parser 报告未闭合、标签不匹配或后续连锁解析错误。

**错误示例：**

~~~~tsx
const divider = <br>
const section = <section>正文</article>
~~~~

**正确写法：**

~~~~tsx
const divider = <br />
const section = <section>正文</section>
~~~~

**验证方式：** 从最内层开始逐对核对开标签、闭标签与自闭合标签。

### 错误：在 JSX 中复制 HTML 注释

**触发条件：** 在标签内容位置写 `<!-- 注释 -->`，或直接写 `// 注释`。

**原因：** HTML 注释不是 JSX grammar；标签之间的 `//` 位于 JSX 文本位置。

**后果：** HTML 注释产生解析错误，`//` 则可能成为可见文字。

**错误示例：**

~~~~tsx
const card = <article><!-- 课程说明 --><p>React</p></article>
~~~~

**正确写法：**

~~~~tsx
const card = <article>{/* 课程说明 */}<p>React</p></article>
~~~~

**验证方式：** 使用 `{/* ... */}`，并确认注释内容没有进入元素的文字。

### 错误：依赖源码换行控制页面空白

**触发条件：** 期待源码换行和缩进原样成为页面中的换行或空格。

**原因：** JSX transform 会规范化多行 JSX 文本，源码排版不等于最终文字布局。

**后果：** 单词可能以一个空格连接，也可能与预想的换行结果不同。

**错误示例：**

~~~~tsx
const sentence = (
  <p>
    React
    Core
  </p>
)
~~~~

**正确写法：**

~~~~tsx
const sentence = <p>React Core</p>
~~~~

**验证方式：** 查看页面中的实际文字，不要只根据源码缩进推断空白。
:::

## 十一、原理与适用场景

1. JSX 规范只定义语法，不定义 React 的运行过程；本课只把编译器能否正确读取标记当作语法合同。
2. 一个 expression 需要一个外层边界。内容形成真实区域时优先使用有语义的父元素，只需要分组时使用
   Fragment。
3. Fragment 不增加包装节点，但也不会替你修复未闭合、错配或错误嵌套的标签。
4. TypeScript parser 可以发现文件模式、外层边界、闭合、错配和 HTML 注释等问题；解析通过仍不代表
   页面文字与预期一致。
5. 同行文本中的空格可以成为页面文字；多行文本的具体空白结果绑定当前 transform。
6. 需要在 TypeScript 模块中写 JSX 时使用 `.tsx`；不含 JSX 的纯逻辑模块继续使用 `.ts`。

## 十二、练习

下面的源码同时包含文件扩展名、外层边界、闭合和注释问题：

~~~~tsx
// 文件名：course-summary.ts
const view = (
  <h2>React Core</h2>
  <!-- 课程状态 -->
  <br>
  <p>&lt;section&gt; 是一个标签</p>
)
~~~~

:::exercise
### 修复一段从 HTML 直接复制的 TSX

**要求：** 把文件扩展名改为 `.tsx`，使用 Fragment 建立共同外层边界，闭合标签，并改用 JSX 注释。

**验收：** 文件扩展名正确；所有标签具有共同外层边界并正确闭合；注释不会成为页面文字；页面仍显示
`<section> 是一个标签`。

**参考答案：**

~~~~tsx
// 文件名：course-summary.tsx
const view = (
  <>
    <h2>React Core</h2>
    {/* 课程状态 */}
    <br />
    <p>&lt;section&gt; 是一个标签</p>
  </>
)
~~~~
:::

下面的 Fragment 包含一个标签和一段同行文字：

~~~~tsx
const label = (
  <>
    <strong>React</strong> Core
  </>
)
~~~~

:::exercise
### 对照两种 Fragment 写法

**要求：** 从 React 导入 `Fragment`，把 `<>...</>` 改为 `<Fragment>...</Fragment>`，保留
`</strong>` 后面的同行空格。

**验收：** 页面没有新增包装节点；文字显示为 `React Core`；能说明完整写法需要导入 `Fragment`，简写
不需要。
:::

## 十三、本节小结

- JSX 是 XML-like 的 JavaScript 语法扩展；含 JSX 的 TypeScript 文件使用 `.tsx`。
- 一个 JSX expression 需要一个外层边界；`<>...</>` 与完整 `Fragment` 都能分组且不增加包装节点。
- 所有标签都要显式闭合、名称匹配并按正确顺序嵌套。
- 标签内容中的 JSX 注释使用 `{/* ... */}`；JSX 外继续使用 JavaScript 注释。
- 普通文字直接写在标签之间，entity 显示保留字符；同行空格可能显示，多行缩进不等于页面布局。

## 十四、参考资料

- [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) - JSX 标记的入门规则。
- [`<Fragment>`](https://react.dev/reference/react/Fragment) - Fragment 的分组与节点边界。
- [TypeScript JSX handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) - `.tsx` 文件模式。
- [JSX specification](https://facebook.github.io/jsx/) - JSX grammar 与运行语义边界。
- [JSX AST format](https://github.com/facebook/jsx/blob/main/AST.md) - JSX 文本、Fragment 与注释容器。
- [TypeScript JSX transformer](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/transformers/jsxtransforms/jsx.go) - 当前文本空白与 entity 转换依据。
