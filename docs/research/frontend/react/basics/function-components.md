# 函数组件官方研究记录

## 研究范围

- 课程 ID：`react.core.learn.basics.function-components`
- 标题：函数组件
- 核验日期：`2026-08-15`
- 官方文档基线：React `19.2`、TypeScript 当前 JSX Handbook

本记录只回答以下问题：

1. 什么是函数组件；
2. 为什么组件名必须以大写字母开头；
3. 怎样把组件作为 JSX tag 使用；
4. 定义组件、使用组件和 React 调用组件分别发生了什么；
5. 函数组件返回什么。

以下内容不属于本记录：

- Props；
- `children` 与组件组合模式；
- State、事件与界面更新；
- 组件的导入、导出和跨文件组织；
- JSX runtime、React element 及其内部结构；
- 组件纯度不在本记录展开。

## 调研方法与实际访问证据

1. 外部关键词检索从 Tavily 开始，并把结果限定在 `react.dev` 和 `typescriptlang.org`。2026-08-15
   的组件定义、组件调用、组件返回值和 JSX tag 分类搜索均成功。
2. 对候选页面继续使用 Tavily 定向提取，只采用与本记录范围直接相关的段落，不把搜索摘要或页面中的
   其他主题写成结论。
3. 使用 `curl -L --fail --silent --show-error` 直接核验下表 6 个官方地址，均返回 HTTP `200`。
4. React 版本页说明 `react.dev` 提供最新 React 文档，并将当前文档版本列为 `19.2`。本记录以公共
   文档版本为准，不引入源码补丁版本或内部实现证据。

| ID | 官方直接来源 | 本记录采用的证据 |
| --- | --- | --- |
| `react-quick-start` | [Quick Start](https://react.dev/learn) | React 组件是返回标记的 JavaScript 函数；自定义组件名以大写字母开头，HTML tag 使用小写。 |
| `react-first-component` | [Your First Component](https://react.dev/learn/your-first-component) | 函数定义、JSX 返回、组件名大写，以及组件作为 JSX tag 使用的基础写法。 |
| `react-calls-components` | [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks) | 组件应在 JSX 中使用，不应像普通函数一样由应用代码直接调用；React 决定渲染时的调用时机。 |
| `react-conditional-rendering` | [Conditional Rendering](https://react.dev/learn/conditional-rendering) | 组件明确不显示任何内容时可以返回 `null`。 |
| `react-versions` | [React Versions](https://react.dev/versions) | `react.dev` 当前公共文档版本为 React `19.2`。 |
| `typescript-jsx` | [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) | 小写 tag 是 intrinsic element；大写 tag 是在当前作用域查找标识符的 value-based element。 |

## 一、函数组件是什么

React 官方 Quick Start 给出的基础定义是：React 组件是返回标记的 JavaScript 函数。在本课程使用
JSX，因此可以把函数组件理解为“返回 JSX 的 JavaScript 函数”。

```tsx
function CourseHeading() {
  return <h1>React 基础</h1>
}
```

这段代码同时包含三个基础事实：

1. `function` 是普通 JavaScript 函数声明语法；React 没有额外的“组件函数”关键字。
2. `CourseHeading` 以大写字母开头，因此可以作为自定义组件名。
3. 函数通过 `return` 返回 JSX，描述该组件要显示的界面。

仅仅声明函数不会把内容显示到页面上。函数声明建立了组件定义；组件还需要在 JSX 中被使用，React
才会在渲染时调用它。

证据：[`react-quick-start`](https://react.dev/learn)、
[`react-first-component`](https://react.dev/learn/your-first-component)、
[`typescript-jsx`](https://www.typescriptlang.org/docs/handbook/jsx.html)。

## 二、组件名必须以大写字母开头

React 官方文档要求组件名以大写字母开头。TypeScript JSX Handbook 使用同一约定区分两类 tag：小写
tag 是 intrinsic element，大写 tag 是 value-based element，其名称会作为当前作用域中的标识符查找。

```tsx
<section />
<CourseHeading />
```

- `<section />` 以小写字母开头，是 DOM 环境中的 intrinsic tag。
- `<CourseHeading />` 以大写字母开头，会查找当前作用域中的 `CourseHeading` 组件值。

因此下面的写法不符合组件命名规则：

```tsx
function courseHeading() {
  return <h1>React 基础</h1>
}

const preview = <courseHeading />
```

`courseHeading` 虽然是合法的 JavaScript 函数名，但 `<courseHeading />` 的小写开头不能表达这里定义的
自定义组件。多单词组件通常使用 PascalCase，例如 `CourseHeading`、`CourseSummary`。

证据：[`react-quick-start`](https://react.dev/learn)、
[`react-first-component`](https://react.dev/learn/your-first-component)、
[`typescript-jsx`](https://www.typescriptlang.org/docs/handbook/jsx.html)。

## 三、组件定义保持在顶层

组件定义应保持在顶层，不要在另一个组件函数内部重新定义组件：

```tsx
function CourseHeading() {
  return <h1>React 基础</h1>
}

function Page() {
  return <CourseHeading />
}
```

这里的“顶层”只表示 `CourseHeading` 的定义不在 `Page` 函数体内。下面的写法违反这一规则：

```tsx
function Page() {
  function CourseHeading() {
    return <h1>React 基础</h1>
  }

  return <CourseHeading />
}
```

每次执行 `Page` 都会重新执行内部函数定义。React 官方文档明确指出，不应嵌套组件定义，而应把每个
组件声明放在顶层。这里不涉及把组件放进不同文件，只要求组件定义本身保持稳定。

证据：[`react-first-component`](https://react.dev/learn/your-first-component)。

## 四、把组件作为 JSX tag 使用

定义好组件以后，使用时写组件 tag，而不是手动执行函数：

```tsx
function CourseHeading() {
  return <h1>React 基础</h1>
}

function Page() {
  return <CourseHeading />
}
```

这里的 `<CourseHeading />` 表示“请 React 渲染 `CourseHeading` 组件”。这个最小例子只说明组件 tag 的
写法，不展开 `children`、数据传递或组件组合模式。

组件 tag 和 HTML tag 的共同点是都使用 JSX 标签语法；区别是组件 tag 对应 JavaScript 中定义的组件，
HTML tag 对应浏览器中的内置元素。

证据：[`react-first-component`](https://react.dev/learn/your-first-component)。

## 五、定义、使用与调用的边界

函数组件包含三个需要分开的动作：

| 动作 | 示例 | 责任方 | 含义 |
| --- | --- | --- | --- |
| 定义组件 | `function CourseHeading() { ... }` | 开发者 | 声明组件函数及其返回逻辑。 |
| 使用组件 | `<CourseHeading />` | 开发者 | 在 JSX 中说明这里需要该组件。 |
| 调用组件 | React 在渲染时调用 `CourseHeading` | React | 执行组件函数并取得本次返回的 JSX。 |

不要把第三步改成普通函数调用：

```tsx
function Page() {
  return CourseHeading()
}
```

React 的官方规则明确要求组件只在 JSX 中使用，并由 React 调用。即使组件在 JavaScript 语法层面确实
是函数，也不应把 `CourseHeading()` 当作组件用法。这里只需要记住这个公共边界，不需要了解 React
怎样在内部完成调用。

证据：
[`react-calls-components`](https://react.dev/reference/rules/react-calls-components-and-hooks)。

## 六、函数组件的返回值

函数组件使用 JavaScript 的 `return` 返回 JSX：

```tsx
function CourseSummary() {
  return (
    <section>
      <h2>函数组件</h2>
      <p>组件函数返回一段 JSX。</p>
    </section>
  )
}
```

这里应区分函数体与返回值：

- 花括号 `{ ... }` 包围的是 JavaScript 函数体；
- `return` 后面的 `(...)` 是该函数返回的 JSX；
- JSX 可以写成一行，也可以像示例一样用括号组织多行内容；
- 调用组件时，React 取得这次返回的 JSX，用它继续完成界面渲染。

多行 JSX 的左括号应跟在 `return` 后面：

```tsx
function CourseSummary() {
  return (
    <p>组件函数返回 JSX。</p>
  )
}
```

不要让 `return` 单独占一行：

```tsx
function CourseSummary() {
  return
  <p>这段 JSX 不会成为 return 的值。</p>
}
```

JavaScript 的自动分号插入会让这个 `return` 提前结束。括号既明确多行 JSX 的整体范围，也避免
`return` 与返回值被换行分开。

函数声明与箭头函数都可以表达同一组件合同：

```tsx
function CourseHeading() {
  return <h1>React 基础</h1>
}

const CourseSummary = () => {
  return <p>函数组件也可以使用箭头函数。</p>
}
```

两者都是 JavaScript 函数，都使用大写组件名并返回 JSX。函数声明更直接地展示名称、函数体和
`return`，适合作为初学主线；箭头函数不是另一种 React 组件类型。

组件明确不需要显示任何内容时，可以返回 `null`：

```tsx
function EmptyNotice() {
  return null
}
```

`null` 是“本次不显示内容”的明确返回值，不等同于漏写 `return`。这里仅确认组件可以返回 `null`，不
展开条件判断或其他空内容写法。除常规 JSX 与 `null` 外，本记录不扩展其他可返回值，也不讨论 JSX 在
运行时会变成什么结构。

证据：[`react-quick-start`](https://react.dev/learn)、
[`react-first-component`](https://react.dev/learn/your-first-component)、
[`typescript-jsx`](https://www.typescriptlang.org/docs/handbook/jsx.html)、
[`react-conditional-rendering`](https://react.dev/learn/conditional-rendering)。

## 七、常见错误

| 错误 | 为什么错误 | 正确写法 | 官方证据 |
| --- | --- | --- | --- |
| 组件名写成 `courseHeading` | 小写开头不能表示这里定义的自定义组件 | `CourseHeading` | `react-first-component` |
| 使用 `<courseHeading />` | JSX 把小写 tag 与自定义组件区分开 | `<CourseHeading />` | `react-quick-start` |
| 使用 `CourseHeading()` | 应由 React 在渲染时调用组件 | `<CourseHeading />` | `react-calls-components` |
| 在 `Page` 函数内定义 `CourseHeading` | 每次执行 `Page` 都会重新执行该定义 | 把两个组件都声明在顶层 | `react-first-component` |
| 多行 JSX 让 `return` 单独占一行 | 自动分号插入会让 `return` 提前结束 | 从 `return (` 开始多行 JSX | `react-first-component` |
| 函数体没有返回 JSX | 不符合本课“函数组件返回 JSX”的基础定义 | 写出 `return <h1>...</h1>` | `react-quick-start` |
| 需要不显示内容时漏写 `return` | 没有表达明确的返回值 | 明确写 `return null` | `react-conditional-rendering` |
| 把组件当作特殊 JavaScript 语法 | 组件仍使用普通函数语法定义 | 使用普通函数并遵守 React 组件规则 | `react-first-component` |

## 研究结论

函数组件的基础合同可以归纳为一句话：它是一个名称以大写字母开头、返回 JSX、通过 JSX tag 使用并由
React 在渲染时调用的 JavaScript 函数。

组件定义应保持在顶层。常规界面返回 JSX，明确不显示内容时可以返回 `null`；`null` 与漏写 `return`
不是同一件事。Props、`children`、State、事件、模块组织以及 JSX runtime / React element 都不需要
参与这一定义。
