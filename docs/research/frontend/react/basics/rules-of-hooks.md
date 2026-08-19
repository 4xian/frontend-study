# Hooks 调用规则研究记录

## 研究范围与基线

- 课程 ID：`react.core.learn.basics.rules-of-hooks`
- 标题：Hooks 调用规则
- 教学层级：本科基础
- 核验日期：`2026-08-16`
- 运行时基线：React / React DOM 19.2.8
- 文档基线：React 官方文档 19.2

本记录只回答五个问题：普通 Hook 能在哪里调用、为什么每次 render 必须保持调用顺序、什么是合法的
React 函数边界、lint 能检查什么，以及 React 19 的 `use` API 为什么是一个窄例外。

Effect 依赖、Effect 生命周期、自定义 Hook 的抽取方法、Suspense 数据读取、Context 语义、组件纯度、
React Compiler 优化和服务端组件均不在这里展开。

## 研究方法与证据边界

1. 按仓库规定先调用 Tavily 搜索 React 官方资料；调用因账户套餐用量上限失败。随后按搜索顺位使用 Exa
   定位并提取 `react.dev` 页面，所有结论仍回到 React 官方原文核验，搜索摘要不单独作为事实依据。
2. React 版本页说明 `react.dev` 发布最新 React 文档，当前 latest version 为 19.2；官方不会为每个
   minor 或 patch 发布独立文档站。因此本文把官方文档的 19.2 基线与仓库的 19.2.8 运行时分开记录。
3. 调用顺序的原因采用 `rules-of-hooks` lint 官方页给出的公共合同：React 依赖 Hook 调用顺序在 render
   之间正确保留 State。本文不把 Fiber、dispatcher 或 Hook 链表等内部实现写成应用层承诺。
4. React 官方 lint 页面把相关小节称为 “`use` hook”，但 `use` API Reference 明确写明 “Despite its
   name, `use` is not a Hook”。本文按 API Reference 区分：`use` 是 React API，也是普通 Hook 顶层规则
   的特殊调用例外，不把它概括成“所有以 `use` 开头的函数都能条件调用”。
5. lint 是静态反馈，不改变运行时规则，也不能证明组件逻辑没有其他错误。本文只采用官方文档明确列出的
   检查范围和官方规则源码可直接证明的命名/代码路径识别，不推断任意动态代码都能被分析。

## 官方来源卡

| ID | 一手来源 URL | 采用的事实 |
| --- | --- | --- |
| `react-versions` | [React Versions](https://react.dev/versions) | `react.dev` 提供最新版本文档；当前 latest version 为 19.2；官方不为每个 minor 或 patch 建独立文档站。 |
| `react-reference` | [React Reference Overview](https://react.dev/reference/react) | React 19 当前 Reference 把 Hooks、ESLint Plugin 与 Rules of React 分为独立栏目。 |
| `react-hooks-index` | [Built-in React Hooks](https://react.dev/reference/react/hooks) | 当前内置 Hook 的官方索引；State、Context、Ref、Effect、性能和其它 Hook 都受普通 Hook 调用规则约束。 |
| `react-rules-of-hooks` | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) | 普通 Hook 只能在函数组件或自定义 Hook 顶层调用；禁止条件、循环、嵌套函数、事件处理器、class、提前返回之后和 `try/catch/finally`。 |
| `react-calls` | [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks) | 组件应通过 JSX 交给 React 调用；Hook 不应作为普通值传递、动态替换或通过高阶 Hook 改写。 |
| `react-custom-hook-names` | [Hook names always start with use](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use) | 组件名以大写字母开头；Hook 名以 `use` 加大写字母开头；不调用 Hook 的普通函数应避免 `use` 前缀。 |
| `react-eslint-plugin` | [eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks) | 插件在构建期检查 Rules of React；`recommended` 同时包含基础规则和 React Compiler 相关规则。 |
| `react-eslint-rules` | [rules-of-hooks lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks) | React 期望每次 render 以完全相同顺序调用相同 Hooks；官方违规清单、`use` 例外和 lint 配置边界。 |
| `react-use` | [`use` API Reference](https://react.dev/reference/react/use) | `use` 读取 Promise 或 Context；它不是 Hook，可在条件和循环中调用，但只能在组件或 Hook 内，且不能放在 `try/catch` 中。 |
| `react-docs-fixed` | [Rules of Hooks](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/rules/rules-of-hooks.md)、[React calls](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/rules/react-calls-components-and-hooks.md)、[lint](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/eslint-plugin-react-hooks/lints/rules-of-hooks.md)、[`use`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/use.md) | 固定本课四组核心公共事实，避免 live 文档变化后失去逐 claim 证据。 |
| `react-fiber-hooks-source` | [`ReactFiberHooks.js` 调用位置](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L980-L1068)、[调用过少检查](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L634-L708) | 固定版本把普通 Hook 按调用位置串联，并检查调用过多或过少；只用于解释公共顺序合同。 |
| `react-rules-lint-source` | [`RulesOfHooks.ts` 命名识别](https://github.com/facebook/react/blob/v19.2.8/packages/eslint-plugin-react-hooks/src/rules/RulesOfHooks.ts#L24-L58)、[`use` 特判](https://github.com/facebook/react/blob/v19.2.8/packages/eslint-plugin-react-hooks/src/rules/RulesOfHooks.ts#L612-L720) | 规则用 Hook/组件命名与 AST 代码路径做静态识别，并对 `use` 的条件、循环和 `try/catch` 进行特判。 |

## 逐 claim 事实账本

| ID | 经一手来源核验的事实 | 证据 | 正文边界 |
| --- | --- | --- | --- |
| `C01` | 普通 Hook 只能在函数组件或自定义 Hook 的函数体顶层调用。 | `react-rules-of-hooks` | “顶层”不是模块顶层。 |
| `C02` | 条件、循环、嵌套函数、事件处理器、class、条件提前返回之后和 `try/catch/finally` 都不是普通 Hook 的合法位置。 | `react-rules-of-hooks`、`react-eslint-rules` | 示例只覆盖位置判断，不展开各 Hook API。 |
| `C03` | 自定义 Hook 可以调用其它 Hook，但它自己也只能在组件 render 或另一个 Hook 的合法调用链中执行。 | `react-rules-of-hooks` | 不提前讲抽取和复用设计。 |
| `C04` | React 每次 render 都期望同一组普通 Hook 以完全相同的顺序执行。 | `react-eslint-rules` | 把稳定顺序作为规则原因。 |
| `C05` | 条件或循环改变调用序列后，React 可能错配 State，并报告调用过多或过少。 | `react-eslint-rules`、`react-fiber-hooks-source` | 不把链表、Fiber 或错误文本写成公共 API。 |
| `C06` | React `v19.2.8` 当前实现按调用位置追加和复用普通 Hook 节点。 | `react-fiber-hooks-source` | 仅用于验证位置心智模型，不进入课程实现教学。 |
| `C07` | 函数组件应通过 JSX 交给 React 调用，不能当普通函数直接执行。 | `react-calls` | 用 `<Panel />` 与 `Panel()` 建立边界。 |
| `C08` | Hook 应静态出现在组件或 Hook 内，不应作为普通值传递、动态选择或临时包装。 | `react-calls` | 不展开高阶组件或编译优化。 |
| `C09` | 组件名以大写字母开头，自定义 Hook 名以 `use` 加大写字母开头；普通计算函数不应冒用 Hook 名。 | `react-custom-hook-names` | 命名帮助人和 lint 识别边界，但名字本身不授予运行权限。 |
| `C10` | `rules-of-hooks` 在构建/检查阶段静态分析常见调用位置和顺序违规。 | `react-eslint-plugin`、`react-eslint-rules` | lint 是早期反馈，不是运行时保证。 |
| `C11` | 官方规则源码依赖名称和可分析的 AST 代码路径，并对 `use` 单独处理。 | `react-rules-lint-source` | 不声称任意动态 JavaScript 都能被 lint 完整证明。 |
| `C12` | React `use` API 不是普通 Hook，可以在条件和循环中调用。 | `react-use`、`react-eslint-rules` | 例外不能推广到 `useState`、`useEffect`、`useContext` 或自定义 Hook。 |
| `C13` | `use` 仍必须在组件或 Hook 内，不能放在普通函数、事件处理器或模块顶层。 | `react-use`、`react-eslint-rules` | 例外不放宽 React 函数边界。 |
| `C14` | `use` 不能包在 `try/catch` 中；pending 交给 Suspense，拒绝/错误交给 Error Boundary。 | `react-use` | 只解释限制，不展开异步数据 API。 |

## 一、普通 Hook 的两条调用规则

### 1.1 只在 React 函数顶层调用

“顶层”是指函数组件或自定义 Hook 的函数体顶层，不是 JavaScript 模块顶层。普通 Hook 必须在任何
条件分支、循环、嵌套函数和条件提前返回之前调用。

合法调用位置只有两类：

1. React 函数组件的函数体顶层。
2. 自定义 Hook 的函数体顶层。

以下位置不支持普通 Hook：

- `if`、三元表达式、`&&`、`||` 等条件分支；
- `for`、`while`、`do...while` 等循环；
- 条件 `return` 之后；
- 事件处理器、回调或其它嵌套函数；
- 传给 `useMemo`、`useReducer` 或 `useEffect` 的函数内部；
- `async` 函数；
- class 方法；
- JavaScript 模块顶层；
- `try`、`catch` 或 `finally` 块。

这份清单由 Rules of Hooks 与官方 `rules-of-hooks` lint 页面共同给出。课程不应把“代码看起来每次都会
执行”当成例外；语法位置本身必须满足规则。

### 1.2 只从 React 函数调用

普通 JavaScript 函数不能调用 Hook。函数组件由 React 通过 JSX 调用；自定义 Hook 则从函数组件或
另一个自定义 Hook 调用。

~~~tsx
import { useState } from 'react'

// 组件由 React 通过 JSX 调用，Hook 位于组件顶层。
function CoursePanel() {
  const [isOpen] = useState(false)

  return <p>{isOpen ? '课程已展开' : '课程已收起'}</p>
}

// 自定义 Hook 以 use 加大写字母命名，并在自身顶层调用其它 Hook。
function useCourseSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  return { selectedId, setSelectedId }
}
~~~

组件名的大写约定和自定义 Hook 的 `useXxx` 约定让工具与读者识别 React 函数边界。普通计算函数如果
不调用 Hook，应使用 `getSortedCourses` 一类普通名称，不应仅为“看起来像 Hook”而添加 `use` 前缀。

## 二、调用顺序为什么必须稳定

官方 `rules-of-hooks` lint 页面给出的公共心智模型是：React 依赖 Hook 的调用顺序，在多次 render
之间正确保留 State；每次 render 都期望调用完全相同的 Hooks，并且顺序完全相同。

~~~tsx
import { useState } from 'react'

type ProfileProps = {
  showDetails: boolean
}

// 两个 Hook 无条件、按固定顺序执行；条件只决定返回什么 UI。
function Profile({ showDetails }: ProfileProps) {
  const [name] = useState('Ada')
  const [age] = useState(20)

  if (!showDetails) {
    return <p>{name}</p>
  }

  return <p>{name}，{age} 岁</p>
}
~~~

如果某次 render 因条件少调用一个 Hook，后续调用就不再对应上一轮相同位置的 State。公开文档描述的
后果包括 State 错配，以及 `Rendered fewer/more hooks than expected` 一类错误。课程可以用“稳定的
调用序列”解释原因，但不应进一步声称公开 API 保证某种内部数组下标或链表实现。

条件需求通常有三种最小修正：

1. 无条件调用 Hook，把条件放进普通计算、事件处理逻辑或 Hook 接收的回调内部。
2. 把条件提前返回移到所有 Hook 调用之后。
3. 当循环中的每一项需要独立 State 时，提取子组件，让每个子组件拥有固定 Hook 序列。

## 三、React 函数边界

### 3.1 组件由 React 调用，自定义 Hook 随组件 render

组件虽然由 JavaScript 函数定义，但应通过 `<Article />` 使用，不能写成 `Article()` 直接调用。React
需要负责何时调用组件，才能把组件类型、树中身份和局部 State 联系起来。直接调用包含 Hook 的组件，
还很容易在调用方的条件或循环中间接破坏 Hooks 规则。

自定义 Hook 的代码会随调用它的组件一起重新执行，因此应把它理解为组件函数体的一部分。Hook 不应作为
普通 prop 传递、在 render 中动态替换，或用高阶函数临时包装成另一个 Hook；应静态调用明确的自定义
Hook，并把差异作为普通参数传入。

## 四、lint 的作用与边界

### 4.1 `rules-of-hooks` 是本科核心

`eslint-plugin-react-hooks` 的 `rules-of-hooks` 规则直接检查普通 Hook 的调用位置和 React 函数边界，
能在构建期发现条件、循环、提前返回、回调、异步函数、class 方法和模块顶层调用等常见错误。它把一部分
运行时错配提前为编辑器或构建反馈，但规则来源仍是 React 的执行合同，不是 lint 自行规定的代码风格。

本科课程应让学习者做到：

- 能读懂一条 Rules of Hooks lint 报错，并定位真正的调用位置；
- 能通过无条件调用、移动提前返回或提取子组件修正调用顺序；
- 不通过关闭规则、改名隐藏 Hook 或复制 State 来绕过报错；
- 知道 lint 通过不代表业务逻辑和全部 React 规则都正确。

官方插件总览还包含 `exhaustive-deps`、`purity`、`refs`、`static-components` 等规则。这些规则各自检查
不同合同，不应全部塞进 Hooks 调用规则课程。

### 4.2 lint 不是运行时保证

官方插件说明把 lint 定位为构建期反馈。它能根据名称和静态代码路径识别常见违规，但不会执行应用，也
不能证明动态代码路径和业务逻辑全部正确。`rules-of-hooks` 通过只表示没有发现它能识别的调用结构错误，
更不能用改名、动态属性或关闭规则来绕过 React 合同。

## 五、React 19 的 `use` 例外

React 19 的 `use(resource)` 用于读取 Context 或 Promise。API Reference 明确说明：尽管名字以 `use`
开头，`use` 不是 Hook。与普通 Hook 不同，它可以放在条件或循环中。

~~~tsx
import { use } from 'react'

type CourseTitleProps = {
  shouldRead: boolean
  titlePromise: Promise<string>
}

// use 可以条件调用，但仍位于 React 组件边界内。
function CourseTitle({ shouldRead, titlePromise }: CourseTitleProps) {
  if (!shouldRead) {
    return <p>暂不读取</p>
  }

  const title = use(titlePromise)
  return <h2>{title}</h2>
}
~~~

例外仍有两条调用限制：

1. `use` 必须在组件或 Hook 内调用，不能放在模块顶层或普通 JavaScript 函数中。
2. `use` 不能放在 `try/catch` 中；读取 Promise 的错误交给 Error Boundary，等待状态交给 Suspense。

本课只需要学习者识别这项调用位置例外，不要求实现 Promise 缓存、Suspense、Error Boundary、服务端
组件数据流或 `use(context)` 的完整语义。尤其不能把 `use` 的例外推广到 `useState`、`useEffect`、
`useContext` 或自定义 Hook。

## 常见错误与最小修正

| 错误 | 为什么不成立 | 最小修正 |
| --- | --- | --- |
| `if (enabled) useState(0)` | 条件会改变普通 Hook 的调用序列。 | 无条件调用 `useState`，条件只决定如何使用 State 或渲染什么。 |
| 条件 `return` 后才调用 Hook | 不同 render 可能在 Hook 之前返回。 | 把普通 Hook 移到所有条件返回之前，或拆分组件。 |
| 在 `map`/`for` 中为每项调用 Hook | 项目数量和顺序可变，Hook 序列随之变化。 | 提取带 Hook 的行组件，在列表中渲染 `<Row />`。 |
| 在 `onClick` 中调用 Hook | 事件处理器不是 render 中的组件或自定义 Hook 顶层。 | 在组件顶层调用 Hook，处理器只使用 Hook 已返回的值和更新函数。 |
| 在普通 `getData()` 中调用 Hook | 普通函数不是合法 React 函数边界。 | 若确实封装 Hook 逻辑，改为明确的 `useData` 并只从组件/Hook 调用；否则传入所需值。 |
| 在模块顶层调用 `useState` | “顶层”被误解为文件顶层，实际需要组件或自定义 Hook 函数体顶层。 | 把局部 State 放进拥有它的组件。 |
| 在 `useMemo` 回调中调用另一个 Hook | 回调是嵌套函数，不是 React 函数边界。 | 把被嵌套的 Hook 移到组件顶层，再把结果交给计算。 |
| 在 `try/catch/finally` 中调用普通 Hook | 分支与异常路径会改变调用序列，官方明确禁止。 | Hook 保持顶层调用；在允许的事件或边界处理错误。 |
| 直接写 `Article()` 调用组件 | 绕过 React 对组件类型、身份和调用时机的管理。 | 在 JSX 中写 `<Article />`。 |
| 把 `useState` 当作 `use` 一样条件调用 | `use` 是 React 19 API 的窄例外，不代表普通 Hooks。 | 仅对官方 `use(resource)` 应用例外；其它 Hooks 继续遵守顶层规则。 |
| 把 `use(promise)` 包在 `try/catch` 中 | `use` 虽可条件调用，但官方明确禁止 `try/catch`。 | 使用 Suspense 表示等待，使用 Error Boundary 处理拒绝。 |

### 条件 Hook 的错误与修正

~~~tsx
import { useState } from 'react'

type EditorProps = {
  enabled: boolean
}

// 错误：enabled 改变时，useState 可能出现或消失。
function BadEditor({ enabled }: EditorProps) {
  if (enabled) {
    const [title] = useState('React')
    return <p>{title}</p>
  }

  return null
}

// 正确：Hook 无条件调用，条件只决定 UI。
function Editor({ enabled }: EditorProps) {
  const [title] = useState('React')

  if (!enabled) {
    return null
  }

  return <p>{title}</p>
}
~~~

### 列表中的错误与修正

~~~tsx
import { useState } from 'react'

type Course = {
  id: string
  title: string
}

// 错误：列表长度变化会改变 Hook 调用次数。
function BadCourseList({ courses }: { courses: Course[] }) {
  return (
    <ul>
      {courses.map(
        // 错误：回调执行次数随列表变化，不能在这里调用 Hook。
        course => {
          const [selected] = useState(false)
          return (
            <li key={course.id}>
              {selected ? '已选' : '未选'} {course.title}
            </li>
          )
        },
      )}
    </ul>
  )
}

// 正确：每个行组件各自拥有固定的 Hook 序列。
function CourseRow({ course }: { course: Course }) {
  const [selected] = useState(false)

  return <li>{selected ? '已选' : '未选'} {course.title}</li>
}

// 列表只负责渲染组件，不在循环回调中调用 Hook。
function CourseList({ courses }: { courses: Course[] }) {
  // 把每门课程映射为独立的行组件。
  function renderCourse(course: Course) {
    return <CourseRow key={course.id} course={course} />
  }

  return (
    <ul>{courses.map(renderCourse)}</ul>
  )
}
~~~

## 本科课程范围边界

### 必须掌握

- 能准确解释“组件或自定义 Hook 顶层”，并区分函数体顶层与模块顶层。
- 能列出条件、循环、提前返回、事件处理器、嵌套回调和普通函数等典型非法位置。
- 能用“每次 render 的 Hook 调用序列必须相同”解释规则，而不依赖内部实现猜测。
- 能通过移动条件、移动 Hook 或提取子组件完成最小修正。
- 能区分函数组件、自定义 Hook、普通函数的命名和调用边界。
- 能说明 `rules-of-hooks` lint 的价值与静态分析边界。
- 能准确复述 React 19 `use` 的窄例外及其组件/Hook 边界、`try/catch` 限制。

### 只需识别，不展开

- React Compiler 诊断可以由 ESLint plugin 暴露，但编译覆盖率和优化策略不是调用规则。
- `use(promise)` 与 Suspense、Error Boundary、缓存的关系只用于解释为何不能 `try/catch`。
- `use(context)` 与 `useContext` 的语义差异只用于证明 `use` 的条件调用例外。

### 明确排除

- 每个内置 Hook 的 API、依赖数组和生命周期语义；
- 自定义 Hook 的抽取、复用、参数设计和共享逻辑模式；
- Effect 同步、清理与依赖移除；
- Suspense 数据架构、Promise 缓存、Server Components 和框架数据加载；
- React 内部 Hook 存储结构、Fiber 字段或 dispatcher 实现；
- 全量 ESLint plugin 配置、React Compiler 配置和全部推荐规则教学；
- 高阶组件和动态组件系统的完整重构方法。

## 准确性结论

1. 对普通 Hooks，“无条件、同顺序、只在函数组件或自定义 Hook 顶层调用”是不可拆开的核心合同。
2. 稳定调用顺序用于让 React 在 render 之间正确对应 State；条件与循环会破坏这份对应关系。
3. `rules-of-hooks` 是本科核心的静态反馈规则；其它推荐 lint 不应被误写成同一条调用规则。
4. React 19 的 `use` 是明确且有限的例外：它不是 Hook，可条件或循环调用，但仍必须位于组件或 Hook
   内，并且不能位于 `try/catch` 中。
