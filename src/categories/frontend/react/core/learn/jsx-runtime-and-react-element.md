---
id: react.core.learn.basics.jsx-runtime-and-react-element
type: lesson
title: JSX Runtime 与 React Element
summary: 理解 TSX 从源码到 runtime helper 再到 React element 描述的过程，并准确区分 element、node 与 DOM。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - react.core.learn.basics.module-boundaries-and-component-tree
related:
  - engineering.typescript.reference.tsconfig-language-jsx
tags:
  - React
  - JSX
  - TSX
  - jsx-runtime
  - ReactElement
  - ReactNode
appliesTo: React 19.2 / React 19.2.8 / automatic JSX runtime
verifiedAt: 2026-08-15
objectives:
  - 能描述 TSX 源码经过 transform 与 JSX runtime 后得到 React element 的过程。
  - 能解释 automatic JSX runtime 为什么不要求手写 React import，却仍然依赖 react/jsx-runtime。
  - 能使用 type、props 与 key 建立 React element 的最小公共模型，同时避开内部字段。
  - 能区分 React element、React node 与浏览器 DOM node，并正确理解 isValidElement 的范围。
  - 能说明 element 的不可变合同，以及为什么创建 element 不等于调用组件或创建 DOM。
recap:
  - JSX 是待转换语法，不是浏览器直接执行的 HTML，也不是运行时解析的字符串。
  - automatic runtime 由转换器生成 react/jsx-runtime 调用，精确 helper 选择不是应用代码合同。
  - React element 是 React 创建的、对象形式的不可变 UI 描述；创建描述不会调用组件或创建 DOM。
  - ReactElement 比 ReactNode 窄；string、number 和数组可成为 node，却不是 element。
  - element 与 props 创建后按不可变值使用；type、props、key 是最低公共类型边界，key 不属于组件可读的 props。
sources:
  - title: React Writing Markup with JSX
    url: https://react.dev/learn/writing-markup-with-jsx
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - JSX 是 JavaScript 语法扩展，与 React 是两个概念
  - title: React createElement
    url: https://react.dev/reference/react/createElement
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - React element 的描述模型、不可变合同与 JSX 等价关系
  - title: React isValidElement
    url: https://react.dev/reference/react/isValidElement
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - React element 与 React node 的集合边界
  - title: React Calls Components and Hooks
    url: https://react.dev/reference/rules/react-calls-components-and-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - JSX 创建组件 element，React 决定何时调用组件
  - title: React Special Props Warning
    url: https://react.dev/warnings/special-props
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - key 由 React 单独处理，组件不能通过 props.key 读取
  - title: React 19 Upgrade Guide
    url: https://react.dev/blog/2024/04/25/react-19-upgrade-guide#new-jsx-transform-is-now-required
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - React 19 要求新的 JSX transform
  - title: React New JSX Transform
    url: https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
    sourceType: official-reference
    appliesTo: React automatic JSX runtime
    claims:
      - runtime entry 供转换器生成代码使用，业务代码不直接调用 helper
  - title: React 19.2.8 JSX Runtime Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSX.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - jsx、jsxs、jsxDEV 与 Fragment 的 runtime 导出
  - title: React 19.2.8 Element Factory Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSXElement.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - element factory、开发期浅冻结与内部字段边界
  - title: '@types/react 19.2.8'
    url: https://registry.npmjs.org/@types/react/19.2.8
    sourceType: source-code
    appliesTo: React types 19.2.8
    claims:
      - ReactElement 的 type、props、key 类型边界与 runtime helper 使用警告
  - title: TypeScript JSX Handbook
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript JSX
    claims:
      - react-jsx、react-jsxdev 与 JSX type checking 合同
  - title: TypeScript jsx Option
    url: https://www.typescriptlang.org/tsconfig/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript JSX
    claims:
      - react、react-jsx 与 react-jsxdev 的输出形式
---

# JSX Runtime 与 React Element

## 一、学习目标

- 看到一段 TSX 时，能说清楚它在浏览器执行前还会发生什么。
- 能解释 `react-jsx`、`react/jsx-runtime`、`jsx`、`jsxs` 与 `jsxDEV` 各自处于哪一层。
- 能区分 TypeScript 的 automatic、development 与 classic JSX 输出模式。
- 能用“React 创建的不可变 UI 描述”理解 React element。
- 能准确判断 React element、React node、相似普通对象与 HTMLElement 的区别。
- 能说明 `type`、`props`、`key` 的最低公共边界，并知道 `key` 不属于组件可读的 props。
- 能避开手写 runtime helper、直接调用组件、修改 element 和读取内部字段等脆弱做法。

## 二、为什么写下标签还不等于页面已经出现

下面是一段合法 TSX：

~~~~tsx
const heading = <h1 title="React Core">课程</h1>
~~~~

这行代码看起来像 HTML，但它位于 `.tsx` 文件中。浏览器的 JavaScript 引擎不会把 `<h1>` 当作
普通 JavaScript 语法，React 也不会在运行时拿到一段字符串后重新解析标签。

中间必须有一次 transform：工具把 TSX 变成合法 JavaScript，JavaScript 执行后得到 React element。
到这里产生的仍是 UI 描述，不是浏览器 DOM。

建立这条链路，可以一次解决几个常见困惑：

- 为什么源码里不写 `import React` 也能使用 JSX。
- 为什么创建 `<h1 />` 变量后，页面不会自动新增 DOM。
- 为什么 `console.log(<h1 />)` 看到的是对象，而不是 `HTMLHeadingElement`。
- 为什么 string 能渲染，却不能通过 `isValidElement`。

## 三、从 TSX 到 React element

本知识点需要掌握四步：

```text
TSX 源码
  -> 编译工具解析并 transform
  -> JSX runtime helper 创建 React element
```

React element 是这条链路的结果。创建 element 不会调用自定义组件、不会读取 DOM，也不会让内容自动
显示。

### 1. TSX 源码是作者界面

~~~~tsx
const heading = <h1 className="course-title">React Core</h1>
~~~~

作者使用标签语法表达 element type、attribute 和 child。它适合阅读与维护，但还不是浏览器最终执行的
JavaScript。

### 2. transform 是工具工作

TypeScript、Babel 或 Vite 使用的转换器会解析 JSX 结构，选择 runtime helper，并生成 JavaScript。
transform 负责“把语法变成调用”，不负责把 UI 提交到页面。

### 3. JSX runtime 创建 element 描述

生成代码调用 `react/jsx-runtime`。helper 返回 React element，描述 type、props、children 与 key 等
信息。helper 的具体选择由转换器完成，不由业务代码决定。

### 4. JavaScript 执行后得到 element

transform 产生的是普通 JavaScript 调用。调用执行后得到 React element 对象；这一步只完成描述创建，
不包含组件调用、DOM 创建或页面更新。

## 四、automatic JSX runtime

### 1. automatic runtime 自动生成 import

TypeScript 使用下面的配置时，会把 TSX 转成 automatic runtime 调用：

~~~~json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
~~~~

源码与概念化输出如下：

~~~~tsx
const label = <span>课程</span>
~~~~

automatic JSX transform 的概念化输出接近：

~~~~js
import { jsx as _jsx } from 'react/jsx-runtime'

const label = _jsx('span', { children: '课程' })
~~~~

转换器会自动插入 `react/jsx-runtime` import，所以仅为了使用 JSX，不需要手写默认 React import。
helper 的局部名可能变化，也可能生成其他模块格式；稳定结论是转换器负责引入对应 runtime entry。

### 2. 转换器负责选择 `jsx` 或 `jsxs`

下面的源码包含多个静态 JSX children：

~~~~tsx
const card = (
  <section>
    <strong>React</strong>
    <span>Core</span>
  </section>
)
~~~~

当前 TypeScript 或 Babel 的概念化输出可能接近：

~~~~js
const jsx_runtime_1 = require('react/jsx-runtime')

const card = jsx_runtime_1.jsxs('section', {
  children: [
    jsx_runtime_1.jsx('strong', { children: 'React' }),
    jsx_runtime_1.jsx('span', { children: 'Core' }),
  ],
})
~~~~

一个 child 常生成 `jsx`，多个静态 JSX children 常生成 `jsxs`。这里数的是转换器在源码中看到的
children 结构，不是运行时值是否碰巧为数组：

~~~~tsx
const items = [<span key="a">A</span>, <span key="b">B</span>]
const list = <section>{items}</section>
~~~~

`{items}` 在源码中是一个表达式，不能因为 `items` 的运行值是数组，就断言必须使用 `jsxs`。更重要的
是，精确 helper 选择不是应用公共合同：业务代码继续写 JSX，由转换器选择并导入 helper。

### 3. `jsxDEV` 是开发变体

TypeScript 的 `react-jsxdev` 模式从 `react/jsx-dev-runtime` 生成 `jsxDEV` 调用，用于附带开发诊断
信息。React 19.2.8 也只在开发分支提供 `jsxDEV`。它不会创建另一种 element，不用于 production 输出，
也不应由业务代码直接调用。

### 4. Fragment 也由 runtime 提供

短 Fragment `<>...</>` 没有标签字符串。automatic runtime 从对应 entry 取得 `Fragment` 标识，
再创建 element 描述。这里需要识别的是 `Fragment` 的 runtime 来源，不需要手工调用它的 helper。

### 5. 不写默认 React import 不等于没有 React

automatic transform 自动生成 runtime import，所以只使用 JSX 时通常不需要：

~~~~tsx
import React from 'react'
~~~~

但以下结论仍然成立：

- 项目必须安装兼容的 React runtime。
- 打包器必须能解析 `react/jsx-runtime` export。
- 类型检查需要匹配的 JSX types。
- 使用 `useState`、`createElement` 等公开 API 时仍要导入对应名字。

“不需要默认 React import”只是一条源码作用域规则，不能推导成“JSX 与 React runtime 无关”。

## 五、TypeScript `jsx` 配置

`compilerOptions.jsx` 决定 TypeScript 怎样输出 `.tsx` 中的 JSX：

| 配置 | 输出形式 | 对 React import 的最低结论 |
| --- | --- | --- |
| `react-jsx` | automatic 形式，生成 `react/jsx-runtime` helper 调用 | 仅写 JSX 不需要默认 `React` 绑定，生成代码仍依赖 React runtime。 |
| `react-jsxdev` | development automatic 形式，生成 `react/jsx-dev-runtime` 的 `jsxDEV` 调用 | 用于开发输出，同样不要求为 JSX 手写默认 React import。 |
| `react` | classic 形式，默认生成 `React.createElement` 调用 | 作用域中必须存在匹配的 factory，默认配置需要 `React` 绑定。 |

如果 TypeScript 配置为保留 JSX 给其他工具处理，最终 runtime 由下游转换器决定，不能只看 TypeScript
配置推断生成代码。React 19 要求现代 JSX transform；classic 形式主要用于识别和迁移旧配置。

## 六、React element 是什么

### 1. 一份轻量 UI 描述

React element 是 React 创建的、对象形式的不可变 UI 描述。下面两种写法都会创建 element：

~~~~tsx
import { createElement } from 'react'

const fromJsx = <h1 className="title">课程</h1>
const fromFactory = createElement('h1', { className: 'title' }, '课程')
~~~~

它们不是同一个对象，但表达相近的 UI 意图。这里的“对象形式”不表示任意相似对象都能冒充 element，
也不表示业务代码可以自由修改它。

### 2. 最小公共字段

`@types/react@19.2.8` 的 `ReactElement` 公共模型包含：

~~~~ts
interface ReactElement<P = unknown, T = string | JSXElementConstructor<any>> {
  type: T
  props: P
  key: string | null
}
~~~~

为了聚焦，先这样理解：

| 字段 | 意义 | 本课边界 |
| --- | --- | --- |
| `type` | React 要处理的 element 类型 | 字符串表示 intrinsic element，组件标识符也可以成为 type。 |
| `props` | 当前 element 的输入描述 | 转换器生成的 `children` 也会进入 props。 |
| `key` | React 单独使用的特殊提示 | 与组件可读的 props 分离；这里只建立字段边界。 |

这三项是当前 TypeScript 公共类型的最低教学面，不是运行时对象全部字段的枚举承诺。

### 3. `type` 不是永远的字符串

~~~~tsx
const intrinsic = <section />
const custom = <CourseCard />
~~~~

前者的 type 是字符串 `'section'`；后者的 type 是标识符 `CourseCard` 指向的值。创建 `custom` 时只把
`CourseCard` 记录为 element type，不会立即调用 `CourseCard`。

### 4. `key` 不属于组件可读的 `props`

```tsx
<CourseCard key="course-1" courseId="course-1" />
```

`key` 由 React 单独处理，组件不能通过 `props.key` 读取它。如果业务逻辑也需要同一个 ID，应像
`courseId` 这样另传普通 prop。这里只说明 `key` 与 props 分离，不展开列表身份规则。

### 5. element 应视为不透明值

`type`、`props`、`key` 用于建立最低心智模型，不表示业务代码应围绕对象形状编程。应用通常创建、
传递或返回 element；识别 element 使用 React 公共 API，不复制未公开字段，也不依赖 development 与
production 的对象形状差异。

## 七、创建 element 只创建描述

### 1. 不会创建 DOM

创建 React element 只构造 JavaScript 描述，不会读取或创建浏览器 DOM，因此这一步不依赖
`document`。

浏览器中也一样：

~~~~tsx
const element = <button>开始</button>
const isDomNode = element instanceof HTMLElement // false
~~~~

此时变量保存 React element 描述，不是 `HTMLButtonElement`。

### 2. 不会自动显示

~~~~tsx
const hiddenDescription = <p>这是一份尚未被使用的描述</p>
~~~~

只创建变量不会让页面新增段落。element creation 和页面更新是两个不同动作。

### 3. 不会因为自定义 type 就立即调用组件

~~~~tsx
function CourseCard() {
  return <article>课程卡片</article>
}

const description = <CourseCard />
~~~~

这一步创建“type 是 `CourseCard`”的 element，不会立即执行函数体。React 决定何时调用组件；应用代码
也不应写 `CourseCard()` 把组件当作普通函数调用。JSX element creation 与 function invocation 必须
分开理解。

## 八、React element、React node 与 DOM node

React element 是 React node 集合中的一类值，不是所有 node 的同义词，也不是浏览器 DOM node：

| 值 | React element | React node | DOM node | 判断理由 |
| --- | --- | --- | --- | --- |
| `<p />` | 是 | 是 | 否 | JSX runtime 创建的 element 描述。 |
| `createElement('p')` | 是 | 是 | 否 | React 公共 factory 创建的 element 描述。 |
| `'课程'`、`3` | 否 | 是 | 否 | 文本和数字可以作为 node，但不是 element。 |
| `[<span key="a" />]` | 否 | 是 | 否 | 数组中可以包含 element，数组本身不是 element。 |
| `{ type: 'p', props: {} }` | 否 | 否 | 否 | 形状相似的任意对象不会自动成为 element。 |
| `document.createElement('p')` | 否 | 否 | 是 | 这是宿主平台已经存在的 DOM 对象。 |

`isValidElement` 只检查“是不是 React element”：

~~~~tsx
import { createElement, isValidElement } from 'react'

isValidElement(<p />) // true
isValidElement(createElement('p')) // true
isValidElement('课程') // false
isValidElement(2) // false
~~~~

### 1. `isValidElement` 不能判断“能不能渲染”

不要写：

~~~~ts
function canRender(value: unknown) {
  return isValidElement(value)
}
~~~~

该函数会错误拒绝 string 和 number。`isValidElement` 只适合“输入必须是 element”的窄边界，不能
代替 ReactNode 类型检查，也不能用来识别 DOM node。

## 九、不可变 element

### 1. 创建后不要修改

错误思路：

~~~~tsx
const heading = <h1 className="title">课程</h1>
heading.props.className = 'title active'
~~~~

React element 与它的 props 在 development 和 production 中都必须按不可变值使用。要表达新描述，
就重新创建：

~~~~tsx
const activeHeading = <h1 className="title active">课程</h1>
~~~~

### 2. development 构建会浅冻结

React 19.2.8 的开发构建会对 element 与顶层 props 执行浅层 `Object.freeze`，从而更早暴露直接修改。
这是当前开发期保护，不是跨环境业务判断条件；production 是否实际冻结不改变不可变语义。

### 3. 浅冻结不等于深冻结

~~~~tsx
const options = { tone: 'calm' }
const element = <section data-options={JSON.stringify(options)} />
~~~~

冻结 element 和顶层 props 不代表任意外部对象都会递归冻结，也不会替应用深拷贝嵌套数据。浅冻结描述
实现层的第一层保护，不是深冻结承诺。

## 十、JSX 与 `createElement` 的有限等价

### 1. 它是公开替代 API

~~~~tsx
import { createElement } from 'react'

const heading = createElement('h1', { className: 'title' }, '课程')
~~~~

`createElement(type, props, ...children)` 返回 React element。这里用它说明 JSX 的结果模型，并帮助
识别 classic transform 生成的旧代码。

### 2. 它不是 automatic runtime helper

`createElement` 是 React 公开 API；`jsx/jsxs/jsxDEV` 是面向编译器的 runtime entry。两者都能创建
element，但调用合同与目标不同，不能因为“结果相似”就手动替换生成代码。

### 3. 常规代码继续使用 JSX

JSX 更容易看出嵌套与闭合关系，也能让工具负责 helper 选择和开发诊断。`createElement` 是公开 API，
但不需要成为普通业务代码的主要写法；automatic runtime 也不会把 JSX 编译成 `createElement`。

## 十一、观察 React element 模型

下面的同源 Demo 同时观察：

- JSX 与 `createElement` 都能描述相同 UI。
- intrinsic element 的公开 type 是标签字符串。
- React element 不是 HTMLElement。
- 开发环境下 element 与 props 浅冻结。
- element、string、number、array node 的 `isValidElement` 结果不同。

:::demo{id="react.core.learn.basics.jsx-runtime-and-react-element.element-model-demo"}
对照 JSX 与 createElement 的渲染结果，并检查 element、node、DOM 和浅冻结边界
:::

## 十二、易错使用提示

:::pitfalls
### 错误：把 JSX 当作浏览器直接理解的 HTML

**触发条件：** 认为浏览器收到 `.tsx` 后会直接解析 `<section>`。

**原因：** JSX 是 JavaScript 语法扩展，必须先转换成合法 JavaScript。

**后果：** 无法解释构建配置、runtime import 和编译错误发生在哪一层。

**错误示例：**

~~~~text
浏览器直接执行 <section>课程</section>
~~~~

**正确写法：**

~~~~text
TSX -> transform -> JSX runtime -> React element
~~~~

**验证方式：** 查看 transform 后的代码，确认 TSX 已变成对 JSX runtime 的调用。

### 错误：误解 automatic runtime 并手写 helper

**触发条件：** 因源码没有默认 React import 就删除 `react` 依赖，或在业务代码中手动导入 `jsx`、
`jsxs`，试图代替转换器。

**原因：** automatic runtime 只是由 transform 自动生成 import；runtime 依赖仍然存在，精确 helper
选择也属于转换器职责。

**后果：** 删除依赖会导致 `react/jsx-runtime` 无法解析；手写 helper 会丢失可读 JSX、开发诊断和
transform 兼容性，也没有可靠性能收益。

**错误示例：**

~~~~tsx
import { jsxs } from 'react/jsx-runtime'

const view = jsxs('p', { children: ['React', ' Core'] })
~~~~

**正确写法：**

~~~~tsx
const view = <p>React Core</p>
~~~~

**验证方式：** 业务源码继续书写 JSX；查看 transform 后的代码，确认工具自动引用
`react/jsx-runtime`，且项目保留兼容的 React runtime。

### 错误：创建 element 后期待页面自动出现

**触发条件：** 只执行 `const view = <p>课程</p>`，便断言页面已经新增段落。

**原因：** 创建 element 只产生对象形式的 UI 描述，不创建 DOM，也不更新页面。

**后果：** 变量存在，但页面没有新增节点。

**错误示例：**

~~~~tsx
const view = <p>课程</p>
// 期待 DOM 已更新
~~~~

**正确写法：**

~~~~text
创建 element 只得到描述，不能由变量存在推断页面已经更新
~~~~

**验证方式：** 分别检查变量中的 React element 与浏览器当前 DOM，不把两类对象混为一谈。

### 错误：用 `isValidElement` 判断所有可渲染值

**触发条件：** 把 `isValidElement(value)` 当作 `canRender(value)`。

**原因：** React element 只是 React node 的一个子集。

**后果：** string、number、数组等合法 node 被错误拒绝。

**错误示例：**

~~~~tsx
const canRenderNumber = isValidElement(3) // false，于是错误地拒绝 3
~~~~

**正确写法：**

~~~~tsx
const node: ReactNode = 3
~~~~

**验证方式：** 对 element、string、number 和 array 分别运行 `isValidElement`，再对照 ReactNode 类型。

### 错误：修改已有 element 的 props

**触发条件：** 创建 JSX 后直接赋值 `element.props.title = '新标题'`。

**原因：** element 与 props 按不可变描述使用，开发构建还会浅冻结它们。

**后果：** 开发期浅冻结可能让赋值直接失败；其他环境即使没有立即报错，也违反不可变合同。

**错误示例：**

~~~~tsx
const element = <h2 title="旧标题">课程</h2>
element.props.title = '新标题'
~~~~

**正确写法：**

~~~~tsx
const nextElement = <h2 title="新标题">课程</h2>
~~~~

**验证方式：** 需要不同内容时创建新的 element，不修改旧 element 的 props。

### 错误：依赖未公开字段或 `instanceof` 识别 element

**触发条件：** 复制某个开发构建对象截图，自行读取未公开字段或用自定义 `instanceof` 判断。

**原因：** 内部字段和对象形状不是应用公共合同，React element 也不是公开 class instance。

**后果：** 升级、跨环境或 development/production 切换后判断失效。

**错误示例：**

~~~~text
根据一次 console 对象截图复制字段并自行判断
~~~~

**正确写法：**

~~~~ts
const elementOnly = isValidElement(value)
~~~~

**验证方式：** 只使用 React 公共 API 和公开类型，不把运行时对象截图当作稳定接口。
:::

## 十三、原理与适用场景

### 1. 官方事实

- JSX 是待 transform 的语法扩展，不等于 React，也不等于 HTML。
- automatic runtime 通过 `react/jsx-runtime` 或开发 entry 提供 helper，精确 helper 由转换器选择。
- JSX 与 `createElement` 都创建 React element；创建 element 不会创建 DOM 或调用组件。
- `ReactElement` 公共类型比 `ReactNode` 窄。
- `key` 由 React 单独处理，组件不能通过 `props.key` 读取。
- element 与 props 必须按不可变值使用；React 19.2.8 开发构建会执行浅冻结。

### 2. 课程推导

- 日常代码优先 JSX，`createElement` 只用于理解结果模型和识别 classic 输出。
- 是否需要 React 默认 import 由 transform 模式决定，不能据此判断运行时依赖是否存在。
- 应围绕公开类型和 API 建立判断，不应通过内部对象快照学习 React。
- “创建描述”“调用组件”和“创建 DOM”是三个不同判断，不能从前者推出后两者已经发生。

### 3. 适用场景

- 排查 JSX runtime 无法解析、classic/automatic 配置混淆。
- 解释 JSX expression 的运行值和 TypeScript 类型。
- 在只接受 element 的边界使用 `isValidElement`。
- 判断某个变量保存的是 UI 描述、可渲染 node，还是实际 DOM node。
- 审查 element mutation、未公开字段依赖和手写 helper。

### 4. 适用边界

- element 模型不能说明页面何时更新，也不能代替 DOM 节点模型。
- `props` 在这里只表示 element 描述的输入容器，不展开组件数据流。
- `key` 在这里只说明与 props 分离，不解释列表增删移动时的身份规则。
- automatic/classic 对照只用于读懂配置和旧代码，不扩展手写 factory 或自定义 runtime。

## 十四、练习

下面有四个值：

~~~~tsx
import { createElement, isValidElement } from 'react'
import type { ReactNode } from 'react'

const first = <p>课程</p>
const second = createElement('p', null, '课程')
const third: ReactNode = 3
const fourth = { type: 'p', props: { children: '课程' } }
~~~~

:::exercise
### 判断值所处的层级

**要求：** 不执行任何页面更新，分别写出四个值的 `isValidElement` 结果；说明哪些能赋给
`ReactNode`；再解释为什么此时不能声称页面已经出现 `<p>`。

**验收：** `first/second` 为 true；`third/fourth` 为 false；前三个可作为当前 ReactNode，任意普通对象
`fourth` 不可以；创建 element 只产生描述，不会自动创建或更新 DOM。

**参考答案：**

~~~~tsx
const answers = [
  isValidElement(first), // true
  isValidElement(second), // true
  isValidElement(third), // false，但 number 是 ReactNode
  isValidElement(fourth), // false，普通对象也不是 ReactNode
]
~~~~
:::

## 十五、本节小结

- TSX 必须先 transform；automatic runtime 生成对 `react/jsx-runtime` 的调用。
- `jsx`、`jsxs`、`jsxDEV` 面向转换器，精确 helper 选择不是业务代码合同。
- React element 是 React 创建的、对象形式的不可变 UI 描述，不是 HTMLElement。
- 创建 element 不等于调用组件、创建 DOM 或更新页面。
- `type`、`props`、`key` 是最低公共类型边界；`key` 不属于组件可读的 props。
- `ReactElement` 是 `ReactNode` 的子集；`isValidElement` 不能代替“是否可渲染”判断。
- element 与 props 必须保持不可变；开发浅冻结只是当前实现提供的辅助保护。
- classic transform 与 `createElement` 用于识别旧输出，常规源码继续使用 JSX。

## 十六、参考资料

- [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) - JSX 与 React 的关系。
- [`createElement`](https://react.dev/reference/react/createElement) - element 描述、不可变合同与 JSX 对照。
- [`isValidElement`](https://react.dev/reference/react/isValidElement) - element 与 node 的集合边界。
- [React Calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks) - element 创建与组件调用的区别。
- [Special Props Warning](https://react.dev/warnings/special-props) - `key` 与组件 props 的边界。
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#new-jsx-transform-is-now-required) - 现代 JSX transform 要求。
- [Introducing the New JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) - automatic runtime 与编译器 helper 边界。
- [React 19.2.8 `ReactJSX.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSX.js) - runtime helper 导出。
- [React 19.2.8 `ReactJSXElement.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSXElement.js) - 当前 factory 与开发浅冻结实现。
- [`@types/react@19.2.8`](https://registry.npmjs.org/@types/react/19.2.8) - ReactElement 公共类型与 helper 使用边界。
- [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) - JSX 模式与 automatic runtime contract。
- [TypeScript `jsx` Option](https://www.typescriptlang.org/tsconfig/jsx.html) - automatic、development 与 classic 输出形式。
