# TSX 标记语法研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.tsx-markup-syntax`（遵循当前 React Module 稳定 ID 约定）
- 建议标题：TSX 标记语法
- 教学层级：零基础到进阶
- 核验日期：`2026-08-15`
- 研究状态：新路线 B02 调整范围已冻结，可进入课程精简
- 知识与 fixture 基线：React `19.2.8`、React DOM `19.2.8`、TypeScript `7.0.2`、
  Vite `8.1.5`、`@vitejs/plugin-react` `6.0.5`、`@types/react` `19.2.18`、
  `@types/react-dom` `19.2.4`

本知识点只研究 TSX 的标记语法。它回答“标记是什么、怎样合法书写、文字怎样进入标记”，不提前讲
attribute 值与表达式求值、JSX runtime、组件定义、Props、列表、事件、State、Root API 或渲染生命周期。

## 新路线 B02 调整审计

| 分类 | 结论 |
| --- | --- |
| 保留 | `.tsx` 文件边界、一个 JSX expression 的外层边界、语义父元素、Fragment、显式闭合、正确嵌套、JSX 注释、普通文本、entity 和空白边界 |
| 补充 | 前置改为已完成的 B01，`related` 改为 B03；Demo 只观察 Fragment 无包装节点、注释不进入文字和 entity 显示结果 |
| 删除 | 六层运行模型、完整静态检查矩阵、HTML content model/无障碍扩展和低频工具实现细节，不再占用 B02 主线 |
| 移动 | 静态/dynamic attribute、`className`、`aria-*`、`data-*` 移到 B03；automatic runtime 移到 B06；React element 与 DOM 提交边界移到 B06/B07；尖括号类型断言留在 TypeScript 课程 |
| 合并 | 无；B02 继续作为独立知识课，不吸收或迁移其他课程 |

### B02 实施冻结

1. 课程核心范围严格采用总计划：`.tsx`、单个外层边界、闭合与嵌套、Fragment、注释和文本。
2. 课程可以说明 TSX 不是 HTML 或字符串，但不展开 React element、DOM、runtime helper 或 Root API。
3. B02 不教授 attribute。Demo 中为站内样式保留的 `className` 不是观察目标，并在正文明确后移到 B03。
4. 负向验证只覆盖 `.ts` 误用 JSX、多个相邻外层标签、未闭合/错配标签和 HTML 注释；不把 DOM prop
   类型错误计入本课 Gate。
5. 浏览器只证明课程路由、Fragment 无额外包装、注释不进入 `textContent`、entity 显示和布局/console；
   不用浏览器反推 JSX parser 内部实现。

## 研究方法与证据边界

1. 先用 Tavily 搜索 React、TypeScript、Vite 和 JSX 官方页面，搜索摘要只用于发现入口。
2. 最终结论回到 React 19.2 官方文档、React `v19.2.8` 源码与测试、TypeScript
   `7.0.2` npm `latest`、稳定版公告、`typescript/v7.0.2` 固定源码、Vite `v8.1.5` 文档、
   官方插件文档和 Meta JSX 规范。
3. Tavily 完成首轮官方入口发现后曾触发账户用量上限；2026-08-09 重新搜索已成功补齐 React 官方
   `Writing Markup with JSX`、React TypeScript 指南与 TypeScript JSX 文档。最终结论仍回到官方 URL
   和精确版本源码核验，没有把搜索摘要作为最终证据。
4. 编译结论使用 TypeScript `7.0.2` 与当前 React typings 在 `/tmp` 建立独立最小 fixture 验证；
   仓库内仍存在的旧 TypeScript 安装只属于宿主现状，不作为课程知识结论。Vite 反馈环只验证转译
   边界，不把“构建成功”误写成类型或 HTML 语义正确。
5. JSX 规范明确不定义运行语义，因此“语法允许什么”和“React 最终怎样处理”分别取证。

## 官方来源卡

以下来源均在 `2026-08-08` 直接核验，共 21 项。

| ID | 官方直接来源 | 适用版本 | claims |
| --- | --- | --- | --- |
| `react-writing-markup` | [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) | React 文档 `19.2` | JSX 是 JavaScript 语法扩展；它与 React 是两个概念；React 教程确认单根、闭合标签、常见 camelCase、`className`、`aria-*`/`data-*` 例外。 |
| `react-fragment` | [`<Fragment>`](https://react.dev/reference/react/Fragment) | React `19.2` | `<>...</>` 可在不增加包装 DOM 节点的情况下分组；它通常是 `<Fragment>...</Fragment>` 的简写。 |
| `react-create-element` | [`createElement`](https://react.dev/reference/react/createElement) | React `19.2` | JSX 的替代形式会创建 React element；element 是 UI 的轻量描述，创建它不会创建 DOM 节点。 |
| `react-dom-common` | [Common components](https://react.dev/reference/react-dom/components/common) | React DOM `19.2` | `className` 对应 CSS class；React 使用 DOM 属性名；`aria-*` 与 HTML 同名，`data-*` 保留短横线。 |
| `react-new-transform` | [Introducing the New JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) | React 17+，对 React 19.2 仍适用 | 浏览器不直接理解 JSX；automatic transform 自动从 `react/jsx-runtime` 引入编译器 helper；这不会改变 JSX 书写语法，也不要求仅为 JSX 导入 `React`。 |
| `react-jsx-runtime-source` | [React JSX runtime source](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSX.js) | React `19.2.8` | automatic runtime 导出 `jsx`、`jsxs`、`jsxDEV` 与 Fragment 类型；这些是转译器目标，不是本课手写 API。 |
| `react-element-source` | [ReactJSXElement source](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSXElement.js) | React `19.2.8` | runtime 把标签类型、属性和子项组装为 React element 数据；开发模式包含额外校验。 |
| `react-dom-source` | [ReactDOMComponent source](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom-bindings/src/client/ReactDOMComponent.js) | React DOM `19.2.8` | `className` 最终映射到 DOM `class` attribute；`tabIndex` 等名称保持 React/DOM property 约定。 |
| `react-whitespace-tests` | [React DOM element integration tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactDOMServerIntegrationElements-test.js) | React DOM `19.2.8` | 同行文本两侧空格和标签之间显式空格可成为文本节点；不能把源码排版空白一律当作“不会显示”。 |
| `jsx-spec` | [JSX specification](https://facebook.github.io/jsx/) | Meta JSX Draft，核验日期页面状态 | JSX 是 XML-like ECMAScript 语法扩展，没有规定运行语义，不由浏览器或 JS 引擎直接实现；开闭标签名称必须匹配。 |
| `jsx-ast` | [JSX AST format](https://github.com/facebook/jsx/blob/main/AST.md) | Meta JSX AST 当前主线 | JSX element、Fragment、text、attribute 与 expression container 是不同 AST 节点；空 expression 用于容纳 JSX 文本位置的注释。 |
| `ts-npm-latest` | [npm registry `typescript/latest`](https://registry.npmjs.org/typescript/latest) | `latest = 7.0.2`，核验日期快照 | npm 的稳定通道指向 `7.0.2`，`gitHead` 为 `2bd066d87f5bafd315be9f40889d0a60b9e58e0b`；课程不采用 `next` 开发版。 |
| `ts-7-announcement` | [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) | TypeScript `7.0` 稳定版公告 | TypeScript 7 是 Go 原生移植版，可由 `typescript` 包安装；目标是兼容 TypeScript 6.0 的检查与命令行行为，但 7.0 不提供稳定程序化 API。 |
| `ts-7-release` | [`typescript/v7.0.2` release](https://github.com/microsoft/typescript-go/releases/tag/typescript/v7.0.2) | TypeScript `7.0.2`，commit `2bd066d…` | `7.0.2` 的 release/tag 与 npm `gitHead` 指向同一固定提交；TypeScript 7 编译器源码属于 `microsoft/typescript-go`。 |
| `ts-jsx-handbook` | [TypeScript JSX handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) | TypeScript 当前稳定文档；以 `7.0.2` fixture 复核 | 使用 JSX 必须采用 `.tsx` 并启用 `jsx`；`.tsx` 禁止尖括号类型断言；`JSX.IntrinsicElements` 和 React typings 提供标签与属性检查。 |
| `ts-jsx-option` | [TypeScript `jsx` option](https://www.typescriptlang.org/tsconfig/jsx.html) | TypeScript 当前稳定文档；以 `7.0.2` emit 复核 | `react-jsx` 产出 `_jsx` helper 调用，`react` 产出 `React.createElement`，`preserve` 保留 JSX；该选项控制 emit。 |
| `ts-parser-source` | [TypeScript 7 parser](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/parser/parser.go) | TypeScript `7.0.2` | parser 区分 element、self-closing element、Fragment、text、attribute；报告父元素、闭合标签和 Fragment 闭合语法错误。 |
| `ts-checker-source` | [TypeScript 7 JSX checker](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/checker/jsx.go) | TypeScript `7.0.2` | checker 解析 intrinsic tag、属性与 JSX children 的类型；静态检查能力取决于可见的 `JSX` namespace 和声明。 |
| `ts-transform-source` | [TypeScript 7 JSX transformer](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/transformers/jsxtransforms/jsx.go) | TypeScript `7.0.2` | transformer 删除纯排版空白、规范化多行 JSXText、解码 entity，并按 automatic runtime 生成 helper 调用。 |
| `vite-features` | [Vite features at `v8.1.5`](https://github.com/vitejs/vite/blob/v8.1.5/docs/guide/features.md) | Vite `8.1.5` | Vite 支持 `.jsx`/`.tsx` 并用 Oxc 转译；Vite 只转译 TypeScript，不执行类型检查，官方建议单独运行 `tsc --noEmit`。 |
| `vite-react-plugin` | [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) | 本地锁定 `6.0.5` README | 官方 React 插件默认使用 automatic JSX runtime，并默认包含 `.js`、`.jsx`、`.ts`、`.tsx`。 |

## 一、先建立正确心智模型

### 1. JSX、TSX、HTML、字符串、React element 与 DOM 不是同一层

| 名称 | 本质 | 由谁读取 | 本课需要记住的边界 |
| --- | --- | --- | --- |
| HTML | 浏览器定义的标记语言 | HTML parser | 浏览器会修复部分不严格写法；这种宽容不能搬到 TSX。 |
| JSX | XML-like 的 ECMAScript 语法扩展 | 编译器或转译器 | 只规定可解析的标记形状，不规定它一定属于 React。 |
| TSX | TypeScript 文件中的 JSX 解析模式 | TypeScript、Vite/Oxc 等工具 | 文件使用 `.tsx`；同时接受 TypeScript 静态检查。 |
| 模板字符串 | JavaScript 的字符串字面量 | JavaScript 引擎 | 结果是字符串；使用反引号和 `${...}`，不是树形 JSX 标记。 |
| React element | React 对一段 UI 的轻量描述 | React runtime | JSX 经 React transform 后产生这种描述；它不是 DOM 节点。 |
| DOM | 浏览器中的节点对象树 | 浏览器 DOM API | 只有后续 renderer 工作后才可能出现；书写 JSX 本身不会创建 DOM。 |

关键结论：不要把 JSX 叫作“HTML 写在 JavaScript 里”。它看起来像 HTML，但有独立语法，
必须先转成普通 JavaScript。JSX 也不是模板字符串；`<section>正文</section>` 表示一个 JSX
expression，而 `` `<section>正文</section>` `` 只是字符串。

### 2. JSX 与 React 可以分开

JSX 规范没有绑定 React。React 项目通过 JSX transform 赋予它 React element 语义；其他框架可以
采用别的 transform。课程可以说“本项目用 React 解释 TSX”，不能说“JSX 天生会创建 React DOM”。

### 3. automatic transform 改变生成代码，不改变标记规则

本项目 `jsx: react-jsx`，官方 React 插件也默认 automatic runtime。源文件可以直接写：

```tsx
const heading = <h1>React 基础</h1>
```

工具生成的代码会从 `react/jsx-runtime` 使用 helper。学习者不应手写或直接导入这些 helper。
无需仅为了 JSX 写 `import React from 'react'`；若代码使用 React 的其他导出，仍要按模块规则导入。

## 二、文件与最小书写形式

### 1. 含 JSX 的 TypeScript 文件使用 `.tsx`

正确：

```tsx
const heading = <h1>React 基础</h1>
```

同一源码放进 `.ts`，TypeScript `7.0.2` 不会进入 JSX 解析模式，本次 fixture 得到两个 `TS1005`
与一个 `TS1110`：

```text
TS1005: ',' expected.
TS1110: Type expected.
```

`.tsx` 只是选择解析模式，不代表文件自动通过类型检查，也不代表浏览器可以直接执行源文件。

### 2. 多行括号不是 JSX 语法要求，但应保留

```tsx
const panel = (
  <section>
    <h1>学习进度</h1>
    <p>已完成第一课</p>
  </section>
)
```

括号属于 JavaScript 分组语法。单行可以不加；多行保留括号能明确 expression 边界，也能避免
`return` 后换行触发 JavaScript 自动分号插入。`return` 的完整行为留到函数组件课程。

## 三、一个 JSX expression 必须有一个外层边界

### 错误：相邻标签没有共同边界

```tsx
const summary = (
  <h1>课程标题</h1>
  <p>课程摘要</p>
)
```

TypeScript `7.0.2` 报 `TS2657: JSX expressions must have one parent element.`。两个相邻标签不是
一个合法的 `PrimaryExpression`。

### 正确方式一：使用有语义的父标签

```tsx
const summary = (
  <section>
    <h1>课程标题</h1>
    <p>课程摘要</p>
  </section>
)
```

父标签应该符合页面语义，不要习惯性增加无意义的 `<div>`。

### 正确方式二：只用 Fragment 分组

```tsx
const summary = (
  <>
    <h1>课程标题</h1>
    <p>课程摘要</p>
  </>
)
```

`<>...</>` 是 Fragment 简写，只提供一个 JSX 语法边界，不增加包装 DOM 节点。简写开标签本身
不能写 attribute；显式 Fragment 的其他能力属于后续知识点，本课不展开。

### 进阶边界：单根是 expression 语法，不是“页面只能有一个 DOM 节点”

Fragment 内仍可描述多个同级节点。单根要求解决的是“当前 JavaScript 位置只能放一个 expression”，
不是要求最终 DOM 必须多套一层元素。

## 四、所有标签都要显式闭合并正确嵌套

### 1. 没有子内容时使用自闭合标签

HTML 中常见的 `<img>`、`<input>`、`<br>` 在 TSX 中要写成：

```tsx
const cover = <img alt="课程封面" src="/cover.png" />
```

本次把它写成未闭合的 `<img>`，TypeScript `7.0.2` 报 `TS17008`，并伴随 `TS1005`。
其中 `TS17008` 表示 JSX 元素没有对应闭标签；`TS1005` 是 parser recovery 使用的通用
“缺少某个 token”诊断，不应把这组组合扩大成所有未闭合写法的固定结果。

### 2. 有内容时同时写开标签和闭标签

```tsx
const summary = <p>学习 TSX 的基本规则</p>
```

不要依赖 HTML parser 自动补 `</p>`、`</li>` 等结束标签。

### 3. 开闭标签必须同名、同大小写并按层级闭合

错误：

```tsx
const summary = <section>正文</article>
```

TypeScript `7.0.2` 报 `TS17002: Expected corresponding JSX closing tag for 'section'.`。交叉闭合也
不合法；后打开的标签必须先关闭。

```tsx
const summary = (
  <section>
    <strong>重点</strong>
  </section>
)
```

## 五、attribute 的标记语法

### 1. 静态文本使用引号

```tsx
const cover = <img alt="课程封面" className="course-cover" src="/cover.png" />
```

单引号和双引号都属于 JSX attribute string 语法；项目格式统一为双引号或单引号由格式工具决定。
动态值和 spread 属于后续“TSX 表达式与属性值”知识点。

### 2. React DOM 常见名称采用 camelCase

React 文档说明 JSX attribute 会成为 JavaScript 对象键，因此很多 HTML/SVG 名称采用 DOM property
形式。入门先掌握：

```tsx
const card = <article className="course-card">React</article>
```

不要写：

```tsx
const card = <article class="course-card">React</article>
```

在当前 `@types/react` `19.2.18` 下，错误写法得到 `TS2322`，并提示 `Did you mean 'className'?`。
完整 DOM props、事件名、style 对象和可访问性合同留到独立课程。

### 3. 不是所有 attribute 都改成 camelCase

`aria-*` 与 `data-*` 保持短横线：

```tsx
const status = <p aria-live="polite" data-course-id="react-core">准备完成</p>
```

因此规则应写成“多数 React DOM props 使用 camelCase”，不能写成“所有 attribute 都使用 camelCase”。

### 4. 同一标签不能重复同名 attribute

```tsx
const card = <article className="first" className="second" />
```

TypeScript `7.0.2` 报 `TS17001: JSX elements cannot have multiple attributes with the same name.`。
不要依赖“后一个覆盖前一个”。

### 5. JSX attribute string 不是 JavaScript 字符串字面量

JSX 规范允许 entity reference。TypeScript `7.0.2` 会在 transform 中解码：

```tsx
const label = <span title="小于 &lt; 大于">比较符号</span>
```

这里 `&lt;` 转成 `<`。不要把 attribute 引号内的反斜线写法想当然地当作 JavaScript 字符串转义；
需要复杂字符串时，等学完 expression container 后改用明确的 JavaScript value。

## 六、JSX 注释

### 正确：在 JSX 子项位置使用 expression container 包住块注释

```tsx
const summary = (
  <section>
    {/* 只解释这一段标记 */}
    <p>React 基础</p>
  </section>
)
```

JSX AST 把这种形式记录为空 expression；transform 后不会成为可见文本。

### 错误一：复制 HTML 注释

```tsx
const summary = <section><!-- HTML 注释 --></section>
```

这不是 JSX 注释。本次 TypeScript `7.0.2` fixture 得到 `TS1003` 与 `TS1382`。

### 错误二：直接把 `//` 当作标签内注释

```tsx
const summary = (
  <section>
    // 这会处在 JSX 文本位置
    <p>React 基础</p>
  </section>
)
```

标签之间首先按 JSXText 扫描；不要期待 `//` 自动采用 JavaScript 行注释语义。统一使用
`{/* ... */}`，并把注释放在要解释的标记附近。

## 七、文本、entity 与空白

### 1. 标签之间的普通字符形成 JSXText

```tsx
const heading = <h1>React 基础</h1>
```

这里的“React 基础”是 text child。它不是带引号的 JavaScript string literal，但 transform 会把它
转换为 runtime 能接收的字符串数据。

### 2. 需要显示标记保留字符时优先使用 entity

```tsx
const comparison = <p>&lt;section&gt; 表示 section 标签</p>
```

`<` 会与 JSX 标签起始语法冲突。零基础阶段使用 `&lt;`、`&gt;` 等 entity 最清楚；使用 JavaScript
string 显式输出的方式留到下一知识点。

### 3. 同行空格与多行排版不是同一规则

```tsx
const sameLine = <p>  React Core </p>
```

React DOM `v19.2.8` 测试确认同行两侧空格可以保留。相反，TypeScript `7.0.2` 对多行 JSXText
执行规范化：去掉纯排版空行，逐行裁剪边界，再用一个空格连接有内容的行。

```tsx
const summary = (
  <p>
    第一行
    第二行
  </p>
)
```

本次 TypeScript emit 得到文本 `"第一行 第二行"`，不是带源码换行的字符串。结论只适用于当前
TypeScript transform；JSX 规范本身不定义运行语义。不要依赖代码缩进精确控制页面空格与换行。

### 4. 标签之间显式写出的空格可能成为文本节点

```tsx
const pair = (
  <div>
    <span>左</span> <span>右</span>
  </div>
)
```

两个 `span` 中间的同行空格是有意义的 JSXText。格式化代码时，要区分为了缩进产生的多行空白和
有意放在同行的空格。

## 八、TypeScript 能检查什么

### 当前基线能发现

- `.ts` 文件误写 JSX：解析失败。
- 多个相邻根标签：`TS2657`。
- 未闭合标签：`TS17008`。
- 开闭标签不匹配：`TS17002`。
- 重复 attribute：`TS17001`。
- React typings 中不存在的 intrinsic tag：例如 `<unknownTag />` 得到 `TS2339`。
- React typings 不接受的 attribute：例如 `class` 得到 `TS2322` 并建议 `className`。
- 已声明 attribute 的值类型不兼容；详细值表达式留到下一知识点。

这些能力依赖 `JSX` namespace 和 `@types/react`。TypeScript 官方文档明确说明：如果
`JSX.IntrinsicElements` 没有定义，intrinsic element 可以退化为不检查；若定义 catch-all string
indexer，未知小写标签也可能被接受。因此不能把当前项目的检查强度当作 TypeScript 永久内建清单。

### 当前基线不能保证

- HTML content model 合法。本次 `<p><div /></p>` 通过 `tsc`，但不是合法的 HTML 嵌套。
- 可访问性完整。本次 `<img src="/cover.png" />` 通过 `tsc`，类型系统没有强制 `alt`。
- 页面最终存在对应 DOM、显示正确或没有运行期 warning。
- CSS class 是否存在、选择器是否写对。
- Vite build 是否等价于类型检查。Vite 官方明确说明它只转译 TypeScript。
- TypeScript 7.0 不提供稳定程序化 API；本课 fixture 使用 `tsc` 命令行，不能假设旧版
  `import 'typescript'` 的嵌入方式仍可用。

因此课程必须同时教会学习者区分：parser error、TypeScript type error、React 开发警告、HTML/无障碍
检查与浏览器结果。它们不是同一个 Gate。

## 九、TSX 特有的进阶限制

### 1. `.tsx` 中不能使用尖括号类型断言

```tsx
declare const value: unknown

const text = <string>value
```

parser 会把 `<string>` 当作 JSX 开标签，本次得到 `TS17008`。TypeScript 官方要求使用：

```tsx
declare const value: unknown

const text = value as string
```

本课只说明语法冲突；类型断言是否合理属于 TypeScript 课程。

### 2. 小写标签与大写标识符走不同解析合同

TypeScript 与 React 约定小写开头名称查询 `JSX.IntrinsicElements`。本课只使用内建小写标签；
大写名称怎样解析为组件留到“函数组件”知识点，不能在本课提前把它解释成 Props 调用。

### 3. JSX 不是浏览器标准语法

源码必须经过工具链。把 `.tsx` 直接作为浏览器 `<script>` 资源并不会因为安装 React 就变成合法
JavaScript。Vite 支持表示它会在开发或构建阶段转译，不表示浏览器原生支持 TSX。

## 十、易错点取证矩阵

| 现象 | 触发条件 | 原因 | 后果 | 正确写法 | 影响版本 | 验证方式 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `.ts` 中 JSX 报 `TS1005`、`TS1110` | TypeScript 文件扩展名不是 `.tsx` | 未启用 JSX 语言变体 | parser 在 `<` 附近失败 | 改为 `.tsx`，并配置 `jsx` | TS `7.0.2` | 同一源码分别作为 `.ts`/`.tsx` 编译 | `ts-jsx-handbook`、fixture |
| 多个相邻根报 `TS2657` | 一个 expression 位置直接写两个同级标签 | JSX grammar 需要单个 expression 边界 | 编译失败 | 使用语义父标签或 Fragment | TS `7.0.2` | 编译正误 fixture | `react-writing-markup`、`ts-parser-source` |
| `<img>` 报未闭合 | 把 HTML void element 写法直接复制到 TSX | JSX 要求显式自闭合或成对闭合 | parser 失败并产生连锁错误 | `<img ... />` | React 19.2、TS `7.0.2` | 编译正误 fixture | `react-writing-markup`、`jsx-spec` |
| 开闭标签错位 | 名称、大小写或嵌套层次不匹配 | JSX 规范把名称不一致列为 early error | 编译失败 | 后开先关，名称完全一致 | TS `7.0.2` | `section/article` 负向 fixture | `jsx-spec`、`ts-parser-source` |
| `class` 得到 `TS2322` | 把 HTML attribute 原样写入 React TSX | React DOM 与 typings 使用 `className` | 类型检查失败；跳过类型检查还可能留下开发警告 | `className="..."` | React DOM `19.2.8`、types `19.2.18` | `tsc --noEmit` | `react-writing-markup`、`react-dom-common` |
| 把所有名称都 camelCase | 改写 `aria-*` 或 `data-*` | 两类 attribute 是官方例外 | 无障碍/数据 attribute 名称错误 | 保留短横线 | React DOM `19.2` | 类型检查加 DOM 观察 | `react-writing-markup`、`react-dom-common` |
| HTML 注释导致解析错误 | 在 JSX child 中写 `<!-- -->` | 这不是 JSX comment grammar | `TS1003`、`TS1382` 等错误 | `{/* ... */}` | TS `7.0.2` | 编译负向 fixture | `jsx-ast`、fixture |
| `//` 出现在页面文本 | 在标签内容中直接写行注释 | child 位置先按 JSXText 解析 | 注释字符可能成为可见文本 | `{/* ... */}` | JSX/React 当前基线 | 检查 emit 与页面文本 | `jsx-ast`、`ts-transform-source` |
| 缩进产生意外空格 | 依赖多行源码排版精确控制文本 | transform 会规范化多行 JSXText；同行空格仍可能保留 | 单词粘连或多出空格 | 明确安排文本边界，不用缩进表达页面布局 | TS `7.0.2`、React DOM `19.2.8` | 查看 emit 和 text node | `ts-transform-source`、`react-whitespace-tests` |
| Vite build 通过但 `tsc` 失败 | 只运行 Vite build | Vite 只转译，不做类型检查 | 类型错误进入生成代码 | 独立运行项目 type-check | Vite `8.1.5` | 对 `class` fixture 分别 build/type-check | `vite-features` |
| `.tsx` 尖括号断言变成标签 | 写 `<Type>value` | JSX 与类型断言都占用尖括号，TSX 选择 JSX 解析 | 未闭合标签错误 | `value as Type` | TS `7.0.2` | 编译负向 fixture | `ts-jsx-handbook`、`ts-parser-source` |

## 十一、可重复验证记录

临时目录位于 `/tmp/react-tsx-ts7.*`，仓库未保留测试或 fixture。

### TypeScript `7.0.2`

`npm latest`、`tsc --version` 与 release tag 三者均核对为 `7.0.2`；fixture 使用命令行编译器，
没有借用仓库内旧版 TypeScript 安装。

```text
positive.tsx             PASS
semantic-limit.tsx       PASS（故意包含 p/div 嵌套与无 alt 图片）
wrong-extension.ts       TS1005 + TS1110
wrong-class.tsx          TS2322
unknown-tag.tsx          TS2339
duplicate-attribute.tsx  TS17001
multiple-roots.tsx       TS2657
mismatched-tag.tsx       TS17002
unclosed-tag.tsx         TS17008 + TS1005
html-comment.tsx         TS1003 + TS1382
angle-assertion.tsx      TS17008 + TS1005
```

正向 emit 的关键结果：

```js
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime'
```

- 源码没有手写 `React` import，automatic transform 自动生成 runtime import。
- `{/* ... */}` 没有进入 children。
- `&lt;已转义&gt;` 变成 `<已转义>`。
- 两行普通 JSXText 变成以一个空格连接的文本。
- `<>...</>` 变成 Fragment runtime 描述，没有包装 host tag。

### Vite `8.1.5`

临时入口故意保留 `class`、`<p><div /></p>` 和缺少 `alt` 的 `<img>`。`vite build` 成功：

```text
vite v8.1.5 building client environment for production...
✓ 6 modules transformed.
✓ built
```

同一 `class` 源码由 `tsc --noEmit` 报 `TS2322`。这直接证明当前基线中 Vite build 不能替代类型检查；
它不证明错误标记可以发布。

## 十二、新路线课程结构

1. 用最小分层表区分 HTML、JSX、TSX 与字符串，不展开 React element 和 DOM 生命周期。
2. 先完成 `.tsx`、单个 JSX expression、语义父元素与 Fragment。
3. 再讲标签显式闭合、正确嵌套、JSX 注释、普通文本、entity 和空白边界。
4. Demo 只观察 Fragment、注释和文本结果；样式所需 attribute 不作为教学内容。
5. 负向 fixture 只验证 parser 合同，不扩展到 DOM prop、完整类型系统或 HTML 语义检查。
6. 练习只修复文件扩展名、外层边界、闭合、注释和文本；不引入 attribute、表达式、组件或 State。

## 十三、未确认与后续边界

- Meta JSX 页面仍标记为 Draft，且明确把 transform 语义交给实现；不能只凭该规范断言 React 运行结果。
- 多行空白结论已由 TypeScript `7.0.2` transformer 和 React DOM `v19.2.8` 测试取证，但不同 JSX
  transform 的精确 whitespace 结果可能不同。课程应绑定当前 TypeScript/Vite/React 基线。
- 本轮没有枚举 React DOM 的全部 attribute、运行期 warning 或 HTML content model；这些进入 DOM Props
  与表单课程，并需要浏览器证据。
- 本轮没有展开 Fragment 的 `key`、canary `ref` 或状态保留行为；它们超出“语法容器”边界。
- 本轮未做真实浏览器渲染，因为产物仅为研究记录且没有课程或 Demo 变更；课程实施时必须补浏览器文本、
  DOM 包装层和 console warning 验证。
- TypeScript 对 JSX 的检查强度依赖当前 `@types/react`。升级 React typings 后必须重跑负向 fixture，
  不能只复用本记录中的错误编号。

## 研究结论

`TSX 标记语法` 应作为一个独立知识点，不再与 attribute、JSX runtime、Root API 或组件定义合并。
新路线 B02 只吸收本记录中与 `.tsx`、外层边界、闭合、Fragment、注释和文本直接相关的证据；其余已取证
内容保留为后续课程来源，不进入 B02 正文。完成 B02 Gate 后，下一课是 B03“TSX 表达式与属性”。
