---
id: react.core.learn.basics.function-components
type: lesson
title: 函数组件
summary: 理解普通 JavaScript 函数怎样定义 React 组件，并掌握命名、使用、调用、返回与顶层定义规则。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 50
prerequisites:
  - react.core.learn.basics.tsx-expressions-and-attributes
related: []
tags:
  - React
  - function component
  - component
  - PascalCase
  - return
appliesTo: React 19.2、TypeScript JSX
verifiedAt: 2026-08-15
objectives:
  - 能说明函数组件与普通 JavaScript 函数的共同点和组件合同。
  - 能用大写名称定义函数组件，并通过 JSX tag 使用它。
  - 能区分组件定义、JSX 使用和 React 调用三个动作。
  - 能正确编写单行 JSX、多行 JSX、Fragment 与 null 返回。
  - 能区分函数声明、箭头函数组件和普通辅助函数的调用方式。
  - 能把组件定义放在模块顶层，避免在另一个组件内部创建组件定义。
recap:
  - 函数组件使用普通 JavaScript 函数语法定义，并返回界面描述。
  - 自定义组件名以大写字母开头，通常使用 PascalCase。
  - 使用组件时写成 JSX tag，由 React 在渲染时调用组件函数。
  - 多行 JSX 使用 return 后紧跟括号，明确不显示内容时返回 null。
  - 函数声明和箭头函数都能定义组件，普通辅助函数仍使用普通调用。
  - 组件定义放在模块顶层，组件之间通过 JSX 相互使用。
sources:
  - title: React Quick Start
    url: https://react.dev/learn
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React 组件是返回标记的 JavaScript 函数
      - 自定义组件名称以大写字母开头
  - title: React Your First Component
    url: https://react.dev/learn/your-first-component
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 函数组件的定义、JSX 使用、多行返回与顶层定义
  - title: React Calls Components and Hooks
    url: https://react.dev/reference/rules/react-calls-components-and-hooks
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件应通过 JSX 使用并由 React 调用
  - title: React Conditional Rendering
    url: https://react.dev/learn/conditional-rendering
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件明确不显示内容时可以返回 null
  - title: TypeScript JSX Handbook
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript JSX
    claims:
      - 小写 intrinsic element 与大写 value-based element 的名称边界
---

# 函数组件

## 一、学习目标

- 能从一个普通 JavaScript 函数写出可由 React 使用的函数组件。
- 能根据名称首字母判断 JSX 表示内置标签还是自定义组件。
- 能解释定义组件、使用组件和 React 调用组件之间的区别。
- 能正确处理单行、多行、Fragment、箭头函数与 `null` 返回。
- 能区分组件 JSX 与普通辅助函数调用，不直接执行组件函数。
- 能判断组件定义是否位于模块顶层。

## 二、为什么需要函数组件

只使用 TSX 标记也能写出页面：

~~~~tsx
const page = (
  <main>
    <h1>React 学习中心</h1>
    <p>从函数组件开始组织界面。</p>
  </main>
)
~~~~

当同一种界面需要重复出现，或一段标记已经有明确职责时，继续复制整段 TSX 会让名称、结构和修改位置
都变得模糊。函数组件可以为这段界面建立一个 JavaScript 名称：

~~~~tsx
function CourseHeading() {
  return <h1>React 学习中心</h1>
}
~~~~

函数组件保留了普通函数的定义方式，同时让 React 能通过 JSX 识别并使用这段界面。学习函数组件的
重点不是记住新的关键字，而是掌握名称、返回值和调用责任。

## 三、函数怎样成为组件

### 1. 使用普通函数语法定义

最小函数组件由函数名、函数体和返回值组成：

~~~~tsx
function WelcomeMessage() {
  return <p>欢迎学习 React</p>
}
~~~~

这段代码没有 `component` 关键字，也没有创建类：

- `function` 是 JavaScript 函数声明语法。
- `WelcomeMessage` 是函数名，也是 JSX 中使用的组件名。
- `return` 返回这个组件要描述的界面。
- `<p>...</p>` 是返回的 TSX 标记。

声明函数只建立定义，不会自动把内容显示到页面上。组件还需要进入 JSX，React 才会在渲染界面时使用
它。

### 2. 组件名以大写字母开头

自定义组件名称必须以大写字母开头：

~~~~tsx
function CourseHeading() {
  return <h2>函数组件</h2>
}
~~~~

多单词名称通常使用 PascalCase，每个单词首字母大写：

~~~~text
CourseHeading
LearningProgress
EmptyCourseNotice
~~~~

大写不是视觉风格，而是 JSX 区分自定义组件与内置标签的语义。

### 3. 返回界面描述

函数组件的直接结果是 React 可以继续处理的界面描述：

~~~~tsx
function CourseSummary() {
  const title = '函数组件'
  const duration = 50

  return (
    <section>
      <h2>{title}</h2>
      <p>预计学习 {duration} 分钟</p>
    </section>
  )
}
~~~~

函数体可以先执行普通 JavaScript 表达式，再通过 `return` 交出最终 TSX。局部变量只负责让当前返回值
更容易阅读；它们不会把函数变成另一类组件。

## 四、通过 JSX 使用组件

### 1. 写成组件 tag

定义组件后，在另一段 TSX 中写出大写 tag：

~~~~tsx
function WelcomeMessage() {
  return <p>欢迎学习 React</p>
}

function CoursePage() {
  return (
    <main>
      <WelcomeMessage />
    </main>
  )
}
~~~~

`<WelcomeMessage />` 表示这里需要 `WelcomeMessage` 组件。当前组件没有接收内容，因此使用自闭合
写法最直接。

### 2. 同一个组件可以使用多次

组件定义可以出现在多个 JSX 位置：

~~~~tsx
function LessonNote() {
  return <p>先阅读示例，再预测输出。</p>
}

function CoursePage() {
  return (
    <main>
      <LessonNote />
      <LessonNote />
    </main>
  )
}
~~~~

这里有一个 `LessonNote` 定义和两个使用位置。两个位置都会得到该组件返回的段落，不需要复制组件
内部的标记。

### 3. 区分定义、使用和调用

函数组件包含三个不同动作：

| 动作 | 示例 | 承担者 | 结果 |
| --- | --- | --- | --- |
| 定义组件 | `function LessonNote() { ... }` | 开发者 | 建立组件函数 |
| 使用组件 | `<LessonNote />` | 开发者 | 在 JSX 中声明这里需要该组件 |
| 调用组件 | React 在渲染时调用 `LessonNote` | React | 取得本次返回的界面描述 |

开发者负责定义组件并在 JSX 中使用它，React 负责决定何时调用组件函数。这个责任边界使 React 能识别
组件身份，并统一管理组件的渲染过程。

### 4. 不要直接调用组件函数

下面的写法是普通 JavaScript 调用，不是组件用法：

~~~~tsx
function CoursePage() {
  return WelcomeMessage()
}
~~~~

即使当前函数只返回简单 TSX，应用代码也不应通过 `WelcomeMessage()` 执行组件。正确写法是：

~~~~tsx
function CoursePage() {
  return <WelcomeMessage />
}
~~~~

可以用一条规则区分：

~~~~text
显示一个组件 -> <WelcomeMessage />
计算一个普通值 -> formatCourseTitle()
~~~~

## 五、大写组件与小写标签

### 1. 小写名称表示 intrinsic element

内置 HTML 标签使用小写名称：

~~~~tsx
const heading = <h1>函数组件</h1>
const section = <section>课程内容</section>
~~~~

在浏览器 React 应用中，`h1`、`section`、`button` 等小写名称属于 intrinsic element，最终对应
浏览器平台提供的元素。

### 2. 大写名称查找 JavaScript 值

自定义组件使用大写名称：

~~~~tsx
function CourseHeading() {
  return <h1>函数组件</h1>
}

const heading = <CourseHeading />
~~~~

TypeScript 处理 JSX 时，会把大写 tag 当作当前作用域中的值来查找。这里的
`<CourseHeading />` 指向上方定义的 `CourseHeading` 函数。

### 3. 小写函数名不会自动成为组件

下面的函数名虽然符合 JavaScript 语法，但 JSX 不会把小写 tag 当作这个自定义组件：

~~~~tsx
function courseHeading() {
  return <h1>函数组件</h1>
}

const heading = <courseHeading />
~~~~

应同时修改定义名和 JSX tag：

~~~~tsx
function CourseHeading() {
  return <h1>函数组件</h1>
}

const heading = <CourseHeading />
~~~~

## 六、函数组件的返回

### 1. 单行 TSX 直接返回

内容较短时，可以让 TSX 紧跟 `return`：

~~~~tsx
function StatusBadge() {
  return <strong>学习中</strong>
}
~~~~

这段函数每次被 React 调用时，都明确返回一个 `strong` 元素描述。

### 2. 多行 TSX 使用括号

内容需要换行时，让左括号紧跟 `return`：

~~~~tsx
function CourseSummary() {
  return (
    <section>
      <h2>函数组件</h2>
      <p>组件使用函数返回界面描述。</p>
    </section>
  )
}
~~~~

括号把多行 TSX 组织为一个 JavaScript expression，也避免 `return` 与返回值被换行分开。

### 3. 多个同级节点使用 Fragment

组件仍需返回一个完整 expression。确实不需要额外容器时，可以返回 Fragment：

~~~~tsx
function CourseIntro() {
  return (
    <>
      <h2>函数组件</h2>
      <p>使用 Fragment 返回两个同级节点。</p>
    </>
  )
}
~~~~

Fragment 的标记结构与空白规则没有变化；这里的重点是整个 Fragment 成为组件返回值。

### 4. 明确不显示内容时返回 `null`

组件当前不需要产生可见内容时，可以明确返回 `null`：

~~~~tsx
function HiddenNotice() {
  return null
}
~~~~

`return null` 表达“本次不显示内容”。它与遗漏 `return` 不同：前者是明确结果，后者通常是代码
错误。

返回 `null` 的组件仍然通过 JSX 使用：

~~~~tsx
function CoursePage() {
  return (
    <main>
      <HiddenNotice />
    </main>
  )
}
~~~~

### 5. `return` 后不要直接换行

下面的代码受到 JavaScript 自动分号插入影响：

~~~~tsx
function CourseSummary() {
  return
  <section>函数组件</section>
}
~~~~

JavaScript 会在 `return` 后结束返回语句，下一行 TSX 不会成为函数返回值。多行写法应改为：

~~~~tsx
function CourseSummary() {
  return (
    <section>函数组件</section>
  )
}
~~~~

## 七、函数声明与箭头函数

### 1. 函数声明组件

具名函数声明清楚展示组件名称、函数体和返回位置：

~~~~tsx
function CourseHeading() {
  return <h2>函数组件</h2>
}
~~~~

它适合作为初学时的默认写法，也便于在错误信息和组件结构中识别名称。

### 2. 箭头函数组件

大写变量也可以引用一个返回 TSX 的箭头函数：

~~~~tsx
const CourseNote = () => {
  return <p>箭头函数也能定义组件。</p>
}
~~~~

只有一个 expression 时，可以使用隐式返回：

~~~~tsx
const CourseNote = () => <p>箭头函数也能定义组件。</p>
~~~~

函数声明和箭头函数不是两种 React 组件类型。它们只是 JavaScript 函数的不同写法，都必须满足大写
命名、通过 JSX 使用和返回界面描述等规则。

### 3. 使用花括号时必须写 `return`

箭头函数体使用花括号后，不再自动返回其中的 expression：

~~~~tsx
const CourseNote = () => {
  <p>这段 TSX 没有被返回。</p>
}
~~~~

应显式写出 `return`：

~~~~tsx
const CourseNote = () => {
  return <p>这段 TSX 会成为组件返回值。</p>
}
~~~~

或者删除函数体花括号，使用隐式返回。

## 八、组件定义放在模块顶层

### 1. 不要在另一个组件内部定义组件

下面的 `CourseHeading` 定义位于 `CoursePage` 函数体内：

~~~~tsx
function CoursePage() {
  function CourseHeading() {
    return <h2>函数组件</h2>
  }

  return <CourseHeading />
}
~~~~

每次调用 `CoursePage`，JavaScript 都会重新执行内部函数定义。React 官方文档要求把组件定义放在
顶层，避免每次渲染都创建新的组件定义。

### 2. 顶层定义组件

把两个组件声明为彼此独立的顶层定义：

~~~~tsx
function CourseHeading() {
  return <h2>函数组件</h2>
}

function CoursePage() {
  return <CourseHeading />
}
~~~~

`CoursePage` 可以通过 JSX 使用 `CourseHeading`，但 `CourseHeading` 的定义不在
`CoursePage` 函数体内。

### 3. 使用组件不等于定义组件

这两件事容易混淆：

~~~~text
在函数体中写 <CourseHeading /> -> 使用已经存在的组件
在函数体中写 function CourseHeading() -> 创建新的组件定义
~~~~

组件可以正常使用其他组件。需要避免的是把组件声明本身嵌套在另一个组件函数中。

## 九、组件函数与普通辅助函数

组件和辅助函数都使用 JavaScript 函数语法，但承担不同职责：

~~~~tsx
function formatCourseTitle(title: string) {
  return title.toUpperCase()
}

function CourseHeading() {
  const title = formatCourseTitle('Function Components')
  return <h2>{title}</h2>
}

function CoursePage() {
  return <CourseHeading />
}
~~~~

- `formatCourseTitle()` 计算普通字符串，所以使用普通函数调用。
- `CourseHeading` 描述一段界面，所以写成 `<CourseHeading />`。
- `CoursePage` 也是组件，由 React 通过 JSX 使用。

不要把所有函数都改成组件。只计算字符串、数字或数据结构的函数，继续作为普通辅助函数直接调用；
需要在 React 界面中形成命名 UI 单元的函数，才作为组件使用。

## 十、观察函数组件的定义与使用

下面的同源 Demo 展示函数声明组件、箭头函数组件、重复使用、顶层定义和 `null` 返回：

:::demo{id="react.core.learn.basics.function-components.pure-component-demo"}
观察组件名称、JSX 使用位置、两个重复结果，以及 HiddenNotice 对应的空输出区域
:::

展开源码后可以直接核对：

- 所有组件名称都以大写字母开头。
- `CourseTitle`、`LessonNote` 和 `HiddenNotice` 都在模块顶层定义。
- 组件通过 `<ComponentName />` 使用，没有普通函数式调用。
- 两个 `LessonNote` 使用位置显示相同内容。
- `HiddenNotice` 明确返回 `null`，对应输出区域没有子元素。

## 十一、易错使用提示

:::pitfalls
### 错误：组件名称使用小写字母开头

**触发条件：** 定义 `courseTitle` 并写成 `<courseTitle />`。

**原因：** JSX 使用首字母区分 intrinsic element 与自定义组件，小写 tag 不会指向该组件函数。

**后果：** 自定义函数没有作为组件使用，TypeScript 可能报告不存在对应 intrinsic element。

**错误示例：**

~~~~tsx
function courseTitle() {
  return <h2>函数组件</h2>
}

function Page() {
  return <courseTitle />
}
~~~~

**正确写法：**

~~~~tsx
function CourseTitle() {
  return <h2>函数组件</h2>
}

function Page() {
  return <CourseTitle />
}
~~~~

**验证方式：** 同时检查函数定义和 JSX tag，确认两处名称都以大写字母开头。

### 错误：把组件当作普通函数直接调用

**触发条件：** 在返回值中写 `CourseTitle()`。

**原因：** 普通函数调用绕过 React 对组件调用时机和组件身份的管理。

**后果：** 当前代码没有按组件合同使用 `CourseTitle`，后续加入组件能力时会破坏调用规则。

**错误示例：**

~~~~tsx
function Page() {
  return CourseTitle()
}
~~~~

**正确写法：**

~~~~tsx
function Page() {
  return <CourseTitle />
}
~~~~

**验证方式：** 搜索组件名称的使用位置，组件应作为大写 JSX tag 出现。

### 错误：在另一个组件内部定义组件

**触发条件：** 在父组件函数体内声明子组件函数。

**原因：** 每次调用父组件都会重新执行内部组件定义，产生新的函数值。

**后果：** React 无法把新定义稳定视为原来的组件类型，界面子树可能被重新创建。

**错误示例：**

~~~~tsx
function Page() {
  function CourseTitle() {
    return <h2>函数组件</h2>
  }

  return <CourseTitle />
}
~~~~

**正确写法：**

~~~~tsx
function CourseTitle() {
  return <h2>函数组件</h2>
}

function Page() {
  return <CourseTitle />
}
~~~~

**验证方式：** 确认组件声明不位于任何其他函数体内。

### 错误：让多行 TSX 从 `return` 的下一行开始

**触发条件：** `return` 后立即换行，再写 TSX。

**原因：** JavaScript 自动分号插入会让返回语句提前结束。

**后果：** TSX 没有成为函数返回值，组件无法产生预期界面。

**错误示例：**

~~~~tsx
function CourseSummary() {
  return
  <section>函数组件</section>
}
~~~~

**正确写法：**

~~~~tsx
function CourseSummary() {
  return (
    <section>函数组件</section>
  )
}
~~~~

**验证方式：** 单行 TSX 紧跟 `return`，多行 TSX 的左括号与 `return` 位于同一行。

### 错误：箭头函数使用花括号却漏写 `return`

**触发条件：** 箭头函数体使用 `{ ... }`，但只写 TSX expression。

**原因：** 花括号函数体不会隐式返回内部 expression。

**后果：** 函数返回 `undefined`，没有把预期 TSX 交给 React。

**错误示例：**

~~~~tsx
const CourseNote = () => {
  <p>阅读后再运行示例。</p>
}
~~~~

**正确写法：**

~~~~tsx
const CourseNote = () => {
  return <p>阅读后再运行示例。</p>
}
~~~~

**验证方式：** 使用花括号函数体时查找明确的 `return`；需要隐式返回时删除函数体花括号。
:::

## 十二、原理与适用场景

### 1. 官方事实

- React 组件是返回标记的 JavaScript 函数。
- 自定义组件名以大写字母开头；小写名称用于 intrinsic element。
- 组件应在 JSX 中使用，由 React 在渲染时调用。
- 多行返回使用括号，并让左括号紧跟 `return`。
- 组件定义放在模块顶层，不嵌套在另一个组件函数中。
- 明确不显示任何内容时，组件可以返回 `null`。

### 2. 课程推导

- “使用普通函数语法”不等于“应用代码可以直接调用组件函数”；定义语法与调用责任是两个问题。
- 组件能在另一个组件返回的 JSX 中出现，但组件定义本身仍应位于顶层。
- 函数声明与箭头函数都能定义组件，选择哪种语法不会改变组件合同。
- 普通辅助函数计算普通值，组件函数形成命名 UI 单元，两者不应仅凭语法相似而混用。

### 3. 使用判断

- 一段界面有明确名称、需要重复使用或需要独立理解时，可以提取为函数组件。
- 只计算字符串、数字或数据结构时，使用普通辅助函数。
- 组件名使用清晰的 PascalCase 名词，例如 `CourseHeading`、`EmptyNotice`。
- 组件通过 JSX 使用，定义保持在模块顶层。
- 常规界面返回 TSX，明确不显示内容时返回 `null`。

## 十三、练习

下面的代码混合了小写组件名、直接函数调用、嵌套定义和错误返回：

~~~~tsx
function courseTitle() {
  return <h2>函数组件</h2>
}

const CourseNote = () => {
  <p>组件由 React 调用。</p>
}

function CoursePage() {
  function EmptyNotice() {
    return
    null
  }

  return (
    <main>
      <courseTitle />
      {CourseNote()}
      <EmptyNotice />
    </main>
  )
}
~~~~

:::exercise
### 修正函数组件的定义与使用

**要求：** 把三个组件都改为大写名称和模块顶层定义；组件只通过 JSX 使用；为箭头函数补上返回值；
让 `EmptyNotice` 明确返回 `null`。

**验收：** 页面显示“函数组件”和“组件由 React 调用。”；三个组件定义都位于顶层；源码中没有
`courseTitle` tag、`CourseNote()` 或嵌套组件定义；`EmptyNotice` 的返回值是明确的 `null`。

**参考答案：**

~~~~tsx
function CourseTitle() {
  return <h2>函数组件</h2>
}

const CourseNote = () => {
  return <p>组件由 React 调用。</p>
}

function EmptyNotice() {
  return null
}

function CoursePage() {
  return (
    <main>
      <CourseTitle />
      <CourseNote />
      <EmptyNotice />
    </main>
  )
}
~~~~
:::

## 十四、本节小结

- 函数组件使用普通 JavaScript 函数语法定义，并返回界面描述。
- 自定义组件名以大写字母开头，多单词名称使用 PascalCase。
- 使用组件时写成 `<ComponentName />`，由 React 调用组件函数。
- 单行 TSX 可以直接返回；多行 TSX 使用 `return (`；明确不显示内容时返回 `null`。
- 函数声明和箭头函数都能定义组件，箭头函数使用花括号时必须显式 `return`。
- 组件定义放在模块顶层；在另一个组件的 JSX 中使用它，不等于在函数体内重新定义它。
- 普通辅助函数使用普通调用，组件函数通过 JSX 使用。

## 十五、参考资料

- [Quick Start](https://react.dev/learn) - React 组件的函数定义与大小写命名。
- [Your First Component](https://react.dev/learn/your-first-component) - 组件定义、JSX 使用、多行返回与顶层声明。
- [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks) -
  组件由 React 调用，不由应用代码直接执行。
- [Conditional Rendering](https://react.dev/learn/conditional-rendering) - 组件明确不显示内容时返回
  `null`。
- [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) - intrinsic element
  与 value-based element 的名称解析边界。
