---
id: react.core.learn.basics.module-boundaries-and-component-tree
type: lesson
title: 模块边界与组件树
summary: 掌握组件的导入导出，区分 root component、模块依赖树与 React render tree。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - react.core.learn.basics.function-components
related: []
tags:
  - React
  - ES Module
  - import
  - export
  - render tree
  - dependency tree
appliesTo: React 19.2 / ECMAScript 2026
verifiedAt: 2026-08-15
objectives:
  - 能把组件从一个模块导出，并在另一个模块中用对应语法导入。
  - 能区分默认导出、具名导出、默认导入、具名导入和显式别名。
  - 能准确区分 root component、root module 与 React Root object。
  - 能分别画出 JavaScript module dependency tree 和一次 React render tree。
  - 能解释为什么静态导入的组件不一定出现在当前 render tree 中。
recap:
  - export 决定模块对外提供哪些绑定，import 在使用模块中建立对应的本地绑定。
  - 默认导出对应无花括号的默认导入；具名导出对应带花括号的具名导入。
  - root component 是 render tree 的首个组件，不等于入口模块或 createRoot 返回的对象。
  - 模块依赖树的节点是模块、边是 import；render tree 的节点是组件、边是实际渲染关系。
  - import 只建立代码依赖，只有本次实际渲染的组件才进入当前 render tree。
sources:
  - title: React Importing and Exporting Components
    url: https://react.dev/learn/importing-and-exporting-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件跨文件拆分步骤、root component file、默认与具名导入导出对应关系
  - title: React Understanding Your UI as a Tree
    url: https://react.dev/learn/understanding-your-ui-as-a-tree
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React render tree、module dependency tree、root component 与 root module
  - title: React Your First Component
    url: https://react.dev/learn/your-first-component
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React 应用从 root component 开始，组件可以按需要拆到独立文件
  - title: React createRoot
    url: https://react.dev/reference/react-dom/client/createRoot
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - React Root object 是 createRoot 返回并提供 render 与 unmount 的对象
  - title: React Developer Tools
    url: https://react.dev/learn/react-developer-tools
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Components 面板用于检查当前 React 组件层级
  - title: React DevTools Components Tree Changes
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-devtools/CHANGELOG.md#components-tree-changes
    sourceType: official-reference
    appliesTo: React DevTools in React 19.2.8
    claims:
      - Components tree 支持过滤，host nodes 默认隐藏且可以重新显示
  - title: MDN import
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
    sourceType: official-reference
    appliesTo: ECMAScript modules
    claims:
      - 静态 import、默认与具名导入、别名和只读 live binding
  - title: MDN export
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
    sourceType: official-reference
    appliesTo: ECMAScript modules
    claims:
      - 默认与具名导出、别名以及一个模块最多一个默认导出
  - title: ECMAScript 2026 Modules
    url: https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html#sec-ecmascript-language-scripts-and-modules
    sourceType: specification
    appliesTo: ECMAScript 2026
    claims:
      - ImportDeclaration、ExportDeclaration、default 导出名与重复默认导出的错误边界
---

# 模块边界与组件树

## 一、学习目标

- 能从一个文件导出组件，并在另一个文件中正确导入和使用。
- 能判断默认导入、具名导入和别名是否与导出声明匹配。
- 能找到一棵 React render tree 的 root component。
- 能区分模块依赖关系、组件渲染关系和最终 DOM 层级。
- 能根据固定分支分别画出 module dependency tree 与当前 render tree。

## 二、为什么需要模块边界与组件树

小页面可以把几个组件写在同一个文件中。随着组件增加，单个文件会同时承担太多定义，查找、复用和
修改都会变困难。ES Module 提供文件之间的公开边界：定义模块决定公开什么，使用模块明确依赖什么。

但是文件拆分后会同时出现两类关系：

```text
一个文件 import 另一个文件       -> 模块依赖关系
一个组件在 JSX 中渲染另一个组件  -> React render 关系
```

两类关系经常相似，却不能混为一谈。导入组件不代表它已经显示；把组件移动到另一个文件，也不一定改变
它在界面中的父子位置。需要分别建立模块边界、模块依赖树和 React render tree，才能准确回答“代码
从哪里来”与“当前谁渲染了谁”。

## 三、模块是 JavaScript 文件边界

一个模块是独立的代码作用域。模块顶层定义的名称默认只在当前模块中可见：

```tsx
// CourseHeader.tsx
function CourseHeader() {
  return <h1>React Core</h1>
}
```

另一个文件不能因为知道 `CourseHeader` 这个名称就直接使用它。跨文件使用需要两个明确动作：

1. 定义模块通过 `export` 暴露一个绑定。
2. 使用模块通过 `import` 取得这个绑定，并建立本地名称。

模块可以导出组件，也可以导出普通函数、常量或其他值。React 组件仍是 JavaScript 值；React 不会
发明另一套导入导出语法。

### 1. 模块说明符指出从哪里导入

`from` 后面的字符串称为 module specifier。相对说明符从当前文件位置开始解析：

```tsx
import { CourseHeader } from './CourseHeader'
import { CourseFooter } from '../shared/CourseFooter'
```

- `./CourseHeader` 从当前目录查找目标模块。
- `../shared/CourseFooter` 先回到上一级目录，再进入 `shared`。
- 大小写、扩展名是否可以省略以及可用的路径别名由当前运行环境和项目配置决定，不是 React 语法。

模块说明符回答“到哪里找模块”，花括号和本地名称回答“从该模块取得哪个导出”。这两个问题需要分别
核对。

## 四、用具名导出公开组件

### 1. 在定义模块中导出

把 `export` 写在函数声明前，可以建立具名导出：

```tsx
// CourseHeader.tsx
export function CourseHeader() {
  return <h1>React Core</h1>
}
```

这里公开的导出名是 `CourseHeader`。函数仍在当前模块中定义，只是其他模块现在可以按这个名称请求它。

### 2. 在使用模块中导入

具名导入使用花括号：

```tsx
// App.tsx
import { CourseHeader } from './CourseHeader'

export default function App() {
  return <CourseHeader />
}
```

这段代码包含两个不同动作：

- `import { CourseHeader }` 在 `App.tsx` 中建立本地绑定。
- `<CourseHeader />` 才把组件放进这一次 React render。

花括号不是对象解构。它表示当前模块请求另一个模块名为 `CourseHeader` 的导出。

### 3. 一个模块可以有多个具名导出

```tsx
// CourseSections.tsx
export function CourseHeader() {
  return <header>课程标题</header>
}

export function CourseSummary() {
  return <aside>课程小结</aside>
}
```

使用方可以只导入需要的名称，也可以一次导入多个：

```tsx
import { CourseHeader, CourseSummary } from './CourseSections'
```

“一个组件必须单独占一个文件”不是 React 规则。紧密相关的小组件可以放在同一模块中；文件边界应帮助
理解和复用，而不是机械地增加文件数量。

### 4. 可以在定义后集中导出

组件不必在声明时立刻写 `export`。也可以先完成定义，再用 export list 统一公开：

```tsx
function CourseHeader() {
  return <header>课程标题</header>
}

function CourseSummary() {
  return <aside>课程小结</aside>
}

export { CourseHeader, CourseSummary }
```

两种写法建立的具名导出相同。集中导出适合在文件末尾查看模块公开边界；声明处导出适合直接看出某个
定义是否公开。选择应保持一致、易于查找。

## 五、用默认导出公开主要组件

### 1. 默认导出

一个模块可以指定一个默认导出：

```tsx
// LessonPanel.tsx
export default function LessonPanel() {
  return <section>模块边界</section>
}
```

默认导出对应特殊导出名 `default`。一个模块最多只能有一个默认导出，因为同一模块不能重复提供两个
`default`。

### 2. 默认导入不写花括号

```tsx
import LessonPanel from './LessonPanel'
```

默认导入方可以选择本地绑定名：

```tsx
import Panel from './LessonPanel'
```

两种写法都取得同一个默认导出。语法允许改名，不表示任意名称都同样清楚。组件函数名、文件名和默认
导入名保持一致，通常更便于搜索和调试。

### 3. 默认导出与具名导出可以共存

```tsx
// CoursePage.tsx
export function CourseHeader() {
  return <header>React Core</header>
}

export default function CoursePage() {
  return <main><CourseHeader /></main>
}
```

使用方可以同时导入：

```tsx
import CoursePage, { CourseHeader } from './CoursePage'
```

混用在语法上有效。团队可以统一偏好的风格，但“只能使用默认导出”或“只能使用具名导出”都不是 React
强制规则。

### 4. 可以在定义后指定默认导出

默认导出也可以与定义分开书写：

```tsx
function LessonPanel() {
  return <section>模块边界</section>
}

export default LessonPanel
```

`export default function LessonPanel() {}` 同时完成定义与默认导出；上面的写法先建立本地绑定，再把该
绑定指定为模块的默认导出。使用方仍然采用无花括号的默认导入。

## 六、默认与具名语法必须对应

| 定义模块 | 使用模块 | 含义 |
| --- | --- | --- |
| `export default function Card() {}` | `import Card from './Card'` | 取得默认导出 |
| `export function Card() {}` | `import { Card } from './Card'` | 取得名为 `Card` 的导出 |
| `export function Card() {}` | `import { Card as CourseCard } from './Card'` | 取得 `Card`，本地改名为 `CourseCard` |

判断时先看导出声明，再选择对应导入语法。不要根据文件名猜测模块使用了哪种导出。

### 1. 具名导入怎样改名

具名导入需要用 `as` 显式建立别名：

```tsx
import { CourseHeader as Header } from './CourseHeader'

export default function App() {
  return <Header />
}
```

`as` 左侧必须是模块真实提供的导出名，右侧是当前模块使用的本地名称。直接写 `{ Header }` 会请求一个
名为 `Header` 的导出；若定义模块只导出了 `CourseHeader`，请求就无法匹配。

## 七、导入绑定不是复制一份值

静态 `import` 建立只读 live binding。可以把它理解为当前模块持有另一个模块导出绑定的只读视图：

- 导出模块更新这个绑定时，导入方之后读取会看到新值。
- 导入方不能给导入绑定重新赋值。
- 这不是把导出值复制成一个互不相关的局部变量。

```tsx
import { CourseHeader } from './CourseHeader'

CourseHeader = function Replacement() {
  return <h1>替换标题</h1>
}
```

上面的重新赋值违反导入绑定的只读合同。若需要选择不同的已有组件，应创建自己的局部值，而不是改写
导入绑定。

静态 `import` 声明位于模块顶层。它描述模块之间可以在加载前确定的依赖，不等于在组件函数执行时按
条件调用另一个文件。

## 八、文件和组件不是一一对应

需要同时避免两个相反误解：

1. 一个文件可以定义并导出多个组件。
2. 一个组件可以依赖多个模块，包括不包含组件的普通数据模块。

例如：

```ts
// courseMeta.ts
export const courseTitle = 'React Core'
```

```tsx
// App.tsx
import { courseTitle } from './courseMeta'

export default function App() {
  return <h1>{courseTitle}</h1>
}
```

`courseMeta.ts` 会成为模块依赖的一部分，但它没有定义 React 组件，所以不会成为 render tree 的组件
节点。

## 九、root component 是什么

React 应用的一棵 render tree 从 root component 开始：

```tsx
root.render(<App />)
```

这里的 `App` 是这棵树中 React 首先渲染的组件，因此是 root component。名称 `App` 只是常见约定，
不是 React 强制名称；实际入口也可能选择其他组件。

root component 所在文件经常被称为 root component file。把它命名为 `App.tsx` 很常见，但文件名取决于
项目或框架设置。识别根组件应查看实际入口渲染了哪个组件，不能只搜索固定文件名。

## 十、区分三种 root

| 名称 | 所属模型 | 准确定义 |
| --- | --- | --- |
| root component | React render tree | React 在这棵树中首先渲染的组件 |
| root module / entrypoint | module dependency tree | 模块依赖关系的入口文件 |
| React Root object | React DOM API | 入口代码调用 `render` 时使用的对象 |

root module 经常包含 root component，但二者不是同一个概念。组件拆到独立文件后，入口模块可以只
导入并渲染 root component；它仍是依赖关系的入口，而组件文件定义的是 render tree 的首个组件。

下面三行分别对应三个对象：

```tsx
import App from './App' // 当前文件可以是 root module
const root = createRoot(node) // root 是 React Root object
root.render(<App />) // App 是 root component
```

三者经常同时出现在入口代码中，所以口语里都可能简称“root”。学习和排错时应说出完整名称，不能把
文件、组件函数和 API 对象互相替代。这里的重点是识别两棵树各自的根；React Root object 的创建和
生命周期不影响这两个定义。

## 十一、React render tree

React render tree 表示一次 render 中 React 组件的嵌套关系：

```text
App
├─ CourseHeader
└─ LessonPanel
   └─ EmptyNotice
```

读这棵树时遵守以下规则：

1. 节点是 React 组件。
2. 父子边表示父组件在本次 render 中渲染了子组件。
3. 最上方的 `App` 是 root component。
4. 靠近根的组件是 top-level component。
5. 不再渲染其他组件的节点是 leaf component。

### 1. render tree 不包含普通 DOM 元素

假设 `CourseHeader` 返回：

```tsx
function CourseHeader() {
  return (
    <header>
      <h1>React Core</h1>
    </header>
  )
}
```

React render tree 中有 `CourseHeader` 组件节点，但不把 `<header>` 和 `<h1>` 列成 React 组件节点。
这些标签会形成浏览器 DOM 的元素层级，属于另一棵平台树。

因此“父组件”不是“父 DOM 元素”的同义词。组件关系来自 JSX 中组件渲染组件，DOM 关系来自最终平台
元素的嵌套。

## 十二、module dependency tree

module dependency tree 描述源码模块之间的静态依赖：

```text
main.tsx
└─ App.tsx
   ├─ CourseHeader.tsx
   ├─ PublishedLesson.tsx
   ├─ DraftLesson.tsx
   └─ courseMeta.ts
```

这棵树的规则与 render tree 不同：

1. 节点是 JavaScript module，不是组件。
2. 分支表示一个模块通过静态 `import` 依赖另一个模块。
3. 根节点是 root module 或 entrypoint。
4. `courseMeta.ts` 这类非组件模块也可以出现。
5. 同一模块能导出多个组件，所以一个模块节点不等于一个组件节点。

依赖关系帮助理解代码从哪里进入、一个模块需要哪些其他模块。最终分包、tree shaking 和产物大小还受
构建工具及配置影响，不能只看几条 import 就下结论。

严格来说，真实模块依赖可能共享同一依赖，也可能出现循环，更接近有向图。React 官方在入门资料中使用
dependency tree 作为心智模型；树形图适合从一个入口阅读主要依赖，但不能表示所有共享和循环关系。

## 十三、两棵树的核心区别

| 对比项 | module dependency tree | React render tree |
| --- | --- | --- |
| 节点 | JavaScript modules | 本次 render 中的 React components |
| 边 | 静态 `import` dependency | 父组件实际渲染子组件 |
| 根 | root module / entrypoint | root component |
| 非组件模块 | 可以出现 | 不出现 |
| DOM 元素 | 不作为独立模块节点 | 不作为 React 组件节点 |
| 条件分支 | 静态导入仍属于依赖 | 只出现本次实际选择的组件 |
| 主要用途 | 理解代码依赖 | 理解当前组件层级 |

最重要的判断是：

```text
import A    只证明当前模块依赖 A 所在模块
<A />       才证明本次 render 让 A 成为子组件
```

文件夹层级也不能推出 render 父子关系。把 `CourseHeader.tsx` 放进 `components/header/` 只是代码组织，
不表示它一定渲染在其他目录中的组件之上。

## 十四、条件分支怎样改变 render tree

考虑两个组件都被静态导入：

```tsx
import DraftLesson from './DraftLesson'
import PublishedLesson from './PublishedLesson'

const showDraft = false

export default function App() {
  return showDraft ? <DraftLesson /> : <PublishedLesson />
}
```

模块依赖树同时包含 `DraftLesson.tsx` 和 `PublishedLesson.tsx`，因为两条静态 import 都存在。

当 `showDraft` 为 `false` 时，本次 render tree 是：

```text
App
└─ PublishedLesson
```

若另一次 render 选择草稿分支，树会变为：

```text
App
└─ DraftLesson
```

render tree 描述的是一次 render，不是所有可能分支的永久总表。这里用固定布尔值比较两个确定结果，
不讨论改变分支所需的状态和事件机制。

## 十五、用 React DevTools 观察组件层级

React Developer Tools 的 Components 面板可以观察当前 React 组件层级：

1. 找到当前 root component。
2. 展开它并观察实际渲染的子组件。
3. 与浏览器 Elements 面板中的 DOM 元素层级对照。

Components 面板观察当前 React 组件，不是 ES Module 分析器。没有看到 `DraftLesson`，只能说明它不在
当前观察到的 render tree 中；不能据此断言源码没有 import `DraftLesson.tsx`。

同样，Elements 面板只看到 `<main>`、`<section>` 等 DOM 元素，也不能说明 `App`、`CourseHeader`
这些组件不存在。不同面板回答的是不同问题。

Components 面板显示的是当前组件树的可观察投影，还会受到 component filters 影响。例如 host nodes
默认可以被隐藏，也可以关闭过滤后重新显示。因此面板当前可见的行数不能作为完整 render tree 的规范
定义；判断组件关系应结合当前分支、组件源码和过滤设置。

## 十六、观察模块依赖与 render tree

下面的 Demo 使用 5 个参与分析的 JS/TS 源码模块：root component 同时导入具名组件、两个默认组件和
一个非组件数据模块。固定条件选择 `PublishedLesson`，所以两棵树包含的节点不同。

:::demo{id="react.core.learn.basics.module-boundaries-and-component-tree.tree-comparison-demo"}

左侧列出 root module 的静态 JavaScript 依赖，包含两个 lesson 模块和 `course-meta.ts`。

右侧只列当前实际渲染的 React 组件，不包含非组件模块和未选中的 `DraftLesson`。

展开源码可以一次查看这 5 个 JS/TS 模块，并核对默认导入、具名导入与分支。入口文件还导入 CSS 以
提供展示样式；CSS 由当前工具链处理，不属于这里分析的 ECMAScript 模块集合。
:::

## 十七、易错使用提示

:::pitfalls
### 错误：把默认导出当作具名导出导入

**触发条件：** 定义模块使用 `export default`，使用方却给名称加花括号。

**原因：** 模块提供的是 `default` 导出，不是同名具名导出。

**后果：** 模块链接失败，React 还没有机会渲染这个组件。

**错误示例：**

```tsx
// Card.tsx
export default function Card() {
  return <article>课程卡片</article>
}

// App.tsx
import { Card } from './Card'
```

**正确写法：**

```tsx
import Card from './Card'
```

**验证方式：** 先读取导出声明；`export default` 必须对应无花括号的默认导入。

### 错误：把具名导出当作默认导出导入

**触发条件：** 模块只导出 `export function Card`，使用方却省略花括号。

**原因：** 模块没有提供 `default` 导出。

**后果：** 导入请求无法匹配，组件不会进入 render。

**错误示例：**

```tsx
// Card.tsx
export function Card() {
  return <article>课程卡片</article>
}

// App.tsx
import Card from './Card'
```

**正确写法：**

```tsx
import { Card } from './Card'
```

**验证方式：** 对照花括号中的名称与定义模块真实提供的 export name。

### 错误：一个模块写两个默认导出

**触发条件：** 想把两个组件都标记成当前文件的“主要组件”。

**原因：** `default` 也是导出名，同一模块不能重复导出相同名称。

**后果：** 模块在解析阶段失败，文件中的组件都不能使用。

**错误示例：**

```tsx
export default function Header() {
  return <header>标题</header>
}

export default function Footer() {
  return <footer>页脚</footer>
}
```

**正确写法：**

```tsx
export default function Header() {
  return <header>标题</header>
}

export function Footer() {
  return <footer>页脚</footer>
}
```

**验证方式：** 一个模块最多出现一个 `export default`，其他公开值使用具名导出。

### 错误：具名导入改名时省略 `as`

**触发条件：** 模块导出 `CourseHeader`，使用方直接请求 `{ Header }`。

**原因：** `{ Header }` 请求的是名为 `Header` 的导出，不会自动寻找 `CourseHeader`。

**后果：** 导入无法匹配，或者工具报告缺少导出。

**错误示例：**

```tsx
import { Header } from './CourseHeader'
```

**正确写法：**

```tsx
import { CourseHeader as Header } from './CourseHeader'
```

**验证方式：** 确认 `as` 左侧是真实导出名，右侧才是当前模块的新本地名。

### 错误：认为 import 后组件会自动显示

**触发条件：** 文件已经导入 `Notice`，却没有在当前 JSX 分支中使用它。

**原因：** import 只建立模块依赖，不建立组件渲染关系。

**后果：** 排错时不断修改导入路径，却忽略真正缺少的是 `<Notice />`。

**错误示例：**

```tsx
import Notice from './Notice'

export default function App() {
  return <main>课程列表</main>
}
```

**正确写法：**

```tsx
import Notice from './Notice'

export default function App() {
  return (
    <main>
      <Notice />
    </main>
  )
}
```

**验证方式：** 分开检查 import 关系和本次 JSX；只有实际渲染才进入当前 render tree。

### 错误：把 DOM 树当作 React render tree

**触发条件：** 只在 Elements 面板看到 `<main>` 和 `<section>`，便把它们画成 React 组件节点。

**原因：** DOM 元素层级和 React 组件层级建模对象不同。

**后果：** 组件边界、DOM 边界和数据流归属被混在一起。

**错误示例：**

```text
错误的 React render tree：App -> main -> section
```

**正确写法：**

```text
React render tree：App -> LessonPanel
DOM tree：main -> section
```

**验证方式：** Components 面板看组件，Elements 面板看 DOM，不用一个面板替代另一个。

### 错误：把一次 render tree 当作永久结构

**触发条件：** 观察一次分支后，把所有候选组件都画进同一棵当前树。

**原因：** render tree 描述一次 render，条件可以让下一次 render 选择不同组件。

**后果：** 未选中组件被误判为当前存在，当前组件的影响范围也会判断错误。

**错误示例：**

```text
showDraft 为 false，仍画成：App -> DraftLesson + PublishedLesson
```

**正确写法：**

```text
showDraft 为 false：App -> PublishedLesson
showDraft 为 true： App -> DraftLesson
```

**验证方式：** 每次只根据当前实际选择的 JSX 分支画 render tree。

### 错误：混淆 root 概念与根组件命名

**触发条件：** 把入口文件、`App` 组件和 `createRoot` 返回值称为同一个对象，或只按 `App.tsx` 这个
固定文件名寻找 root component。

**原因：** root module、root component 与 React Root object 分别属于模块树、render tree 与 React
DOM API；`App` 和 `App.tsx` 只是常见命名，不是 React 强制规则。

**后果：** 文件、组件函数和 API 对象之间出现无法成立的调用关系，并可能在其他入口、嵌入页面或框架
项目中错误判断“没有根组件”。

**错误示例：**

```text
“App.tsx 文件就是 createRoot 返回的 root component”
“找不到 App.tsx，所以页面没有 root component”
```

**正确写法：**

```text
main.tsx -> root module
App -> root component
createRoot(node) 的返回值 -> React Root object
从实际入口的 root.render(<Component />) 识别 root component
```

**验证方式：** 每次使用 root 一词时补全其完整名称，再追踪实际入口渲染的组件；不能从示例文件名
推导 React 强制规则。

### 错误：用 Components 面板推断模块依赖

**触发条件：** DevTools 当前没有显示某个组件，就断言源码没有 import 它。

**原因：** Components 面板观察当前 render tree，不分析静态模块依赖。

**后果：** 未选中的分支和非组件模块会被错误遗漏。

**错误示例：**

```text
DevTools 没有 DraftLesson，所以 App 没有导入 DraftLesson.tsx。
```

**正确写法：**

```text
源码 import -> 判断 dependency tree
Components 面板 -> 判断当前 render tree
```

**验证方式：** 为两棵树分别收集证据，不从一棵树反推另一棵树。

### 错误：给导入绑定重新赋值

**触发条件：** 试图用新组件覆盖已经导入的组件名称。

**原因：** 静态 import 建立只读绑定，导入方不能重新赋值。

**后果：** 赋值失败，模块边界也失去清晰的所有权。

**错误示例：**

```tsx
import CourseHeader from './CourseHeader'

CourseHeader = function ReplacementHeader() {
  return <header>替换标题</header>
}
```

**正确写法：**

```tsx
import CourseHeader from './CourseHeader'
import CompactHeader from './CompactHeader'

const ActiveHeader = CourseHeader
```

**验证方式：** 导入名称只读取不赋值；需要选择时创建自己的局部绑定。
:::

## 十八、原理与适用场景

### 1. 官方事实

- React 组件可以留在同一文件，也可以通过对应的 export/import 拆到独立模块。
- 默认导出对应默认导入，具名导出对应具名导入；一个模块最多一个默认导出。
- root component 是 render tree 中首先被渲染的组件，名称和文件位置取决于实际入口。
- React render tree 的节点是当前组件，module dependency tree 的节点是模块。
- render tree 不包含普通平台元素，也不会自动包含所有已导入组件。
- Components 面板观察当前 React 组件，不能代替源码模块分析。

### 2. 可以据此推导什么

1. 文件拆分可以改变模块依赖结构，但只要 JSX 渲染关系不变，render tree 可以保持不变。
2. 同一个组件模块被导入，不代表每次 render 都会使用它。
3. 非组件模块可以影响组件输出，却不会因此变成 React 组件节点。
4. 调试“代码从哪里来”应沿 import 追踪；调试“当前谁渲染了谁”应沿 render tree 追踪。
5. 把组件、模块和 DOM 分成三种模型，可以避免用文件夹层级解释界面父子关系。

### 3. 适用场景

- 把可复用组件从过大的 root component file 中拆出。
- 核对默认与具名导入导出不匹配的模块错误。
- 阅读陌生 React 项目时先找入口模块和 root component。
- 判断一个已导入组件为何没有出现在当前界面。
- 用 React DevTools 理解当前组件层级，同时用源码追踪模块依赖。

## 十九、练习

阅读下面三个模块：

```tsx
// Status.tsx
export function PublishedStatus() {
  return <strong>已发布</strong>
}

export default function DraftStatus() {
  return <strong>草稿</strong>
}
```

```ts
// courseMeta.ts
export const courseName = 'React Core'
```

```tsx
// App.tsx
import DraftStatus, { PublishedStatus } from './Status'
import { courseName } from './courseMeta'

const published = true

export default function App() {
  return (
    <main>
      <h1>{courseName}</h1>
      {published ? <PublishedStatus /> : <DraftStatus />}
    </main>
  )
}
```

:::exercise
### 分别画出两棵树

**要求：** 写出 `App.tsx` 的 module dependency tree，并写出 `published` 为 `true` 时的 React render
tree；然后说明为什么两棵树的节点数量不同。

**验收：** 依赖树包含 `App.tsx`、`Status.tsx` 和 `courseMeta.ts`；render tree 只包含 `App` 与
`PublishedStatus`；`DraftStatus` 虽已随模块导入，但当前分支没有渲染；`courseMeta.ts` 是非组件模块，
不会成为 render tree 节点；`<main>`、`<h1>` 和 `<strong>` 只属于 DOM 层级。
:::

## 二十、本节小结

- 组件跨文件使用必须由定义模块 export，再由使用模块用对应语法 import。
- 默认导出对应无花括号的默认导入；具名导出对应花括号导入，改名必须显式使用 `as`。
- 一个模块可以导出多个组件，也可以只导出非组件值；文件和组件不是一一对应。
- root component、root module 和 React Root object 属于三个不同模型。
- module dependency tree 记录模块与 import，React render tree 记录本次组件与渲染关系。
- 已 import 的组件不一定出现在当前 render tree，DOM 元素也不是 React 组件节点。
- Components 面板用于观察当前组件层级，源码 import 用于判断模块依赖。

## 二十一、参考资料

- [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) - 组件跨文件组织及默认、具名导入导出。
- [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree) - React render tree 与 module dependency tree。
- [Your First Component](https://react.dev/learn/your-first-component) - root component 与组件文件组织。
- [`createRoot`](https://react.dev/reference/react-dom/client/createRoot) - React Root object 的公共边界。
- [React Developer Tools](https://react.dev/learn/react-developer-tools) - Components 面板的组件层级观察。
- [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) - 静态导入、别名与 live binding。
- [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) - 默认、具名导出与重复默认导出边界。
- [ECMAScript 2026 Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html#sec-ecmascript-language-scripts-and-modules) - 模块导入导出规范语法。
