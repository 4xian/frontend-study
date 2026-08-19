# 模块边界与组件树研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.module-boundaries-and-component-tree`
- 标题：模块边界与组件树
- 教学层级：零基础到进阶
- 核验日期：`2026-08-15`
- 研究状态：已完成，可进入单知识点课程编写
- 知识基线：React 官方文档 `19.2`、React `19.2.8`、ECMAScript 2026 与 MDN

本知识点只回答组件怎样跨 ES Module 文件导出和导入、应用的 root component 是什么、组件在一次
render 中怎样组成树，以及模块依赖树为何不是 React render tree。条件分支只用于说明 render tree
会随一次次 render 改变；React DevTools 只用于观察当前组件层级。

Props、`children`、State、事件、Hook、Effect、Router、动态导入、再导出、构建器配置、打包优化和
本站本地环境均不在本课展开。B06 的 JSX Runtime、React element 与 JSX transform 也不得进入本课
正文。`createRoot` / `hydrateRoot` 生命周期、多 root 管理、render/commit、Portal 和 Profiler 同样只
保留必要的消歧边界，不进入学习者主线。它们不能借“模块”或“树”的名义进入课程主线。

## 研究方法与证据边界

1. `2026-08-15` 使用 Tavily 将搜索范围分别限定在 `react.dev`、`developer.mozilla.org`、`tc39.es`
   和 React 官方 GitHub 仓库，先发现 root component、import/export、两种树与 DevTools 的候选页面。
2. 搜索摘要只用于发现线索；最终结论逐页回到 React 19.2 官方正文、React 文档固定提交、MDN
   Reference、ECMAScript 规范和 React `v19.2.8` 官方 release 核验。
3. React 文档负责组件文件、root component、render tree、module dependency tree 和 DevTools 的公共
   教学合同；MDN 与 ECMAScript 规范负责 `import` / `export` 的语言语义。React 不重新定义 ES Module。
4. React 文档固定到提交 `c7d6b700038c63d1aaf2c649af1aefe01ebbacac`，避免 current 页面后续漂移。
   `2026-08-15` 重新获取两篇核心文档的 `main` 原文并计算 SHA-256，结果分别与固定提交原文一致；
   current 页面仍标记为 React `19.2`。
5. React 官方 release API 在 `2026-08-15` 仍将 `19.2.8` 列为 19.2 的 latest patch。该版本于
   `2026-07-21` 发布，只列出 React Server Components 解码性能改进，未列出本课 import/export、
   render tree 或 module dependency tree 的相关变更；本课公共结论仍以 React 19.2 文档为准。
6. ECMAScript 采用已发布的 [ECMAScript 2026](https://tc39.es/ecma262/2026/) 固定版，不把滚动中的
   2027 草案冒充当前稳定规范。MDN 页面只用于补充学习者可读的语言说明，语法与早期错误最终回到
   ECMAScript 2026 核验。
7. DevTools 的公共入口回到 React 19.2 文档，组件树过滤行为回到 React `v19.2.8` 标签内的官方
   DevTools changelog 和 overview；不把面板当前显示的行数等同于规范性的完整 render tree。
8. 本记录只形成后续课程与 Demo 的事实边界，不创建课程、Demo、manifest、fixture 或构建证据。

## 官方来源卡

| ID | 官方直接来源 | 适用版本 | 本课采用的 claim |
| --- | --- | --- | --- |
| `react-import-export` | [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) | React 文档 `19.2` | root component file、组件跨文件三步、默认与具名 import/export 的对应关系、一个默认导出与多个具名导出。 |
| `react-import-export-source` | [`importing-and-exporting-components.md`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/importing-and-exporting-components.md) | React 文档固定提交 | 固定本课采用的组件文件拆分、命名建议与模块扩展名边界。 |
| `react-ui-tree` | [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree) | React 文档 `19.2` | render tree 的节点、root component、单次 render、条件分支，以及 module dependency tree 的节点和用途。 |
| `react-ui-tree-source` | [`understanding-your-ui-as-a-tree.md`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/understanding-your-ui-as-a-tree.md) | React 文档固定提交 | 固定两棵树的差异、非组件模块、HTML 元素缺席和 root module 定义。 |
| `react-first-component` | [Your First Component](https://react.dev/learn/your-first-component) | React 文档 `19.2` | React 应用从 root component 开始；组件可同文件组织，也可按需要移到独立文件；页面可以有多个 React root。 |
| `react-devtools` | [React Developer Tools](https://react.dev/learn/react-developer-tools) | React 文档 `19.2` | DevTools 可以检查 React 组件；浏览器扩展提供 Components 和 Profiler 面板。 |
| `react-devtools-changelog` | [React DevTools changelog](https://github.com/react/react/blob/v19.2.8/packages/react-devtools/CHANGELOG.md#components-tree-changes) | React `v19.2.8` 标签内 DevTools 记录 | Components tree 支持过滤；host nodes 默认隐藏，但可以关闭过滤后显示，因此面板可见节点不是规范性的 render tree 定义。 |
| `react-devtools-overview` | [React DevTools overview](https://github.com/react/react/blob/v19.2.8/packages/react-devtools/OVERVIEW.md#components-panel) | React `v19.2.8` 标签内 DevTools 记录 | Components tree 按 React commit 接收变化，并按 renderer 与 root 区分多 root；面板不是 ES Module 分析器。 |
| `react-create-root` | [`createRoot`](https://react.dev/reference/react-dom/client/createRoot) | React DOM 文档 `19.2` | `createRoot` 返回的 React Root 对象与作为 render tree 首节点的 root component 是不同概念。 |
| `mdn-modules` | [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) | 核验于 `2026-08-15` | ES Module 的文件边界、导出、导入、别名和模块说明符基础。 |
| `mdn-import` | [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) | ECMAScript modules | 静态 import 建立只读 live binding；默认、具名和别名 import 的语法。 |
| `mdn-export` | [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) | ECMAScript modules | 默认、具名与别名 export；一个模块最多一个默认导出。 |
| `ecma-modules` | [ECMAScript 2026 Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html#sec-ecmascript-language-scripts-and-modules) | ECMAScript 2026 | ImportDeclaration / ExportDeclaration、ModuleRequest、`default` 导出名，以及重复默认导出的早期错误。 |
| `ecma-cyclic-modules` | [Cyclic Module Records](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html#sec-cyclic-module-records) | ECMAScript 2026 | 通用模块依赖可含共享依赖与循环；React 的 dependency tree 是本课采用的入门表示。 |
| `react-versions` | [React Versions](https://react.dev/versions) | 核验于 `2026-08-15` | react.dev 当前文档版本为 `19.2`，且不为每个 patch 单独发布文档版本。 |
| `react-19-2-8` | [React `v19.2.8` release](https://github.com/react/react/releases/tag/v19.2.8) | React `19.2.8` | 核验时 latest patch、发布日期与该 patch 的公开变更范围。 |

## 一、从文件到组件树的最小模型

先区分四个对象：

```text
JavaScript module
  -> 用 export 暴露模块绑定
  -> 另一个 module 用 import 获得本地绑定
  -> 组件在 JSX 中渲染另一个组件
  -> React 为本次 render 建立组件间的父子关系
```

- **模块**是 JavaScript 代码边界；一个模块可以导出组件、函数、常量，也可以什么都不导出。
- **组件**是交给 React 使用的 UI 函数；组件不因为单独放进文件就自动可被其他文件访问。
- **模块依赖边**由静态 `import` 建立，表示一个模块依赖另一个模块。
- **render 父子边**由当前组件实际渲染另一个组件建立，表示本次 UI 中的组件嵌套关系。

文件拆分解决组织与复用问题，组件树描述本次 UI 关系。二者经常长得相似，但不是同一份结构。

## 二、组件跨文件边界

React 官方把移动组件拆成三个动作：新建模块、从定义模块导出、在使用模块中用对应语法导入。最小
示例如下：

```jsx
// CourseHeader.jsx
export function CourseHeader() {
  return <h1>React Core</h1>
}
```

```jsx
// App.jsx
import { CourseHeader } from './CourseHeader.js'

export default function App() {
  return <CourseHeader />
}
```

边界规则如下：

1. 只在当前文件使用的组件可以不导出；模块顶层声明不等于全局声明。
2. 其他文件要引用该组件，定义模块必须导出，使用模块必须导入并获得一个本地绑定。
3. 同一文件可以包含多个紧密相关的小组件；“每个文件必须只有一个组件”不是 React 规则。
4. 把组件移到另一个文件不会自动改变 render 父子关系；只要 JSX 嵌套关系不变，概念上的 render tree
   可以保持不变。
5. 把模块导入当前文件也不会自动把其组件放进 render tree；只有当前 render 实际产生对应组件 element，
   它才出现在该次树中。

## 三、默认与具名导出的对应规则

### 3.1 默认导出与导入

一个模块最多有一个默认导出：

```jsx
// LessonPanel.jsx
export default function LessonPanel() {
  return <section>模块边界</section>
}
```

默认导入不使用花括号；导入方自行选择本地绑定名：

```jsx
import LessonPanel from './LessonPanel.js'
import Panel from './LessonPanel.js'
```

两行若分别出现在不同模块中，都会取得同一个 `default` 导出。第二行合法，但 React 官方建议组件函数、
文件和本地绑定都使用有意义的名称，避免任意改名让调试和搜索变困难。

### 3.2 具名导出与导入

一个模块可以有多个具名导出：

```jsx
// CourseSections.jsx
export function CourseHeader() {
  return <header>课程标题</header>
}

export function CourseSummary() {
  return <aside>课程小结</aside>
}
```

不使用别名时，花括号中的导入名必须对应导出名：

```jsx
import { CourseHeader, CourseSummary } from './CourseSections.js'
```

具名导入允许显式建立别名。需要匹配的是 `as` 左侧的导出名，右侧是当前模块使用的本地绑定：

```jsx
import { CourseHeader as Header } from './CourseSections.js'

export default function App() {
  return <Header />
}
```

因此“具名 import 必须同名”的准确说法是：请求的导出名必须存在；若需要不同的本地名，必须显式写
`as`。花括号是 import declaration 的语法，不是普通对象解构。

### 3.3 同一模块可以混用两类导出

```jsx
// CoursePage.jsx
export function CourseHeader() {
  return <header>React Core</header>
}

export default function CoursePage() {
  return <main><CourseHeader /></main>
}
```

```jsx
import CoursePage, { CourseHeader } from './CoursePage.js'
```

混用在语言上有效，但 React 官方提醒团队可以选择统一一种风格来减少混淆。课程只教学语法合同，不把
“默认导出还是具名导出更好”写成 React 强制规范。

## 四、root component 不是固定文件名

React 应用的 render tree 从 root component 开始。它是 React 在该棵树中首先渲染的组件，例如：

```jsx
root.render(<App />)
```

这里 `App` 是 root component，但 `App` 只是示例命名。React 官方明确说明 root component 所在文件
取决于项目设置；文件路由框架甚至可能为不同页面提供不同 root component。把根组件文件称为
`App.jsx` 是常见约定，不是 React 公共合同。

三个相近名称必须分开：

| 名称 | 所属模型 | 准确定义 |
| --- | --- | --- |
| root component | React render tree | React 在这棵树中首先渲染的组件，是 render tree 的根节点。 |
| root module / entrypoint | module dependency tree | 依赖树的入口模块，通常包含 root component，但“通常”不是恒等关系。 |
| React Root object | React DOM API | `createRoot` 返回并提供 `render` / `unmount` 的对象，不是组件函数或树节点。 |

一页也可能嵌入多个相互独立的 React root；每个 root 都有自己的 root component 和 render tree。本课只
建立术语边界，不重复讲 `createRoot` 生命周期，也不展开框架路由。

## 五、React render tree

React 19.2 官方文档给出的公开教学模型是：render tree 表示**一次 render** 中 React 组件的嵌套关系。

```text
App                 <- root component
├─ CourseHeader     <- top-level component
└─ LessonPanel
   └─ EmptyNotice   <- leaf component
```

需要保留以下规则：

1. 每个节点代表 React 组件；箭头或分支表示父组件渲染子组件。
2. root component 是树的根节点，也是 React 在这棵树中首先渲染的组件。
3. render tree 不列出组件返回的 `<main>`、`<section>`、`<h1>` 等平台 UI primitive；这些元素属于
   浏览器 DOM 等另一棵平台树。
4. top-level component 靠近根节点，leaf component 位于底部且不再渲染其他组件。这个分类帮助理解
   数据流和性能影响，但本课不做性能优化教学。
5. render tree 是一次 render 的快照式模型，不是组件源文件的永久目录。

这里的“父组件”和“子组件”只表示渲染关系，不表示 JavaScript class 继承、文件夹嵌套或 import 路径
层级。

## 六、条件分支会让 render tree 改变

父组件可以在不同 render 中产生不同的子组件。为解释树的变化，只需保留一个最小分支：

```jsx
import DraftLesson from './DraftLesson.js'
import PublishedLesson from './PublishedLesson.js'

const showDraft = false

export default function App() {
  return showDraft ? <DraftLesson /> : <PublishedLesson />
}
```

模块依赖在源码层同时包含 `DraftLesson.js` 和 `PublishedLesson.js`，但当 `showDraft` 为 `false` 时，本次
render tree 只包含 `App -> PublishedLesson`。若另一次 render 选择另一个分支，树会改为
`App -> DraftLesson`。

本课只要求学习者判断“当前分支让哪个组件进入这一次树”，不教学条件表达式选型、Props 驱动条件、
State 更新、事件切换或分支中的挂载与状态保留。这些属于后续独立课程。

## 七、module dependency tree

模块依赖树描述源码模块之间的静态依赖关系：

```text
main.jsx
└─ App.jsx
   ├─ CourseHeader.jsx
   ├─ PublishedLesson.jsx
   ├─ DraftLesson.jsx
   └─ courseMeta.js
```

规则如下：

1. 节点代表模块，不代表组件；分支代表 import dependency，不代表 render 父子关系。
2. 根节点是 root module 或 entrypoint file；它通常包含 root component，但两种 root 不能互换定义。
3. `courseMeta.js` 这类不导出 React 组件的模块也会出现在依赖树中，却不会出现在 render tree。
4. 同一模块可以导出多个组件，因此“一个模块节点”等于“一个组件节点”的假设不成立。
5. 依赖树帮助工具判断运行应用所需的模块，也能帮助调查包体积；本课不展开 bundler 配置、tree shaking、
   code splitting 或最终产物推断。

两棵树的最短对照是：

| 对比项 | module dependency tree | React render tree |
| --- | --- | --- |
| 节点 | JavaScript modules | 本次 render 中的 React components |
| 边 | 静态 import dependency | 父组件实际渲染子组件 |
| 根 | entrypoint / root module | root component |
| 非组件代码 | 可以出现 | 不出现 |
| HTML / 平台元素 | 模块内源码，不作为模块节点拆出 | 不作为 React 组件节点出现 |
| 条件分支 | 静态导入仍在依赖关系中 | 只出现本次选中的组件分支 |
| 主要用途 | 理解代码依赖和构建输入 | 理解组件层级、数据流和 render 影响范围 |

## 八、React DevTools 的可观察边界

React 官方说明 React Developer Tools 可以检查 React 组件；安装浏览器扩展后，React 页面会出现
Components 和 Profiler 面板。本课使用 Components 面板建立以下观察：

1. 展开当前 root component，观察当前已提交给面板的组件父子层级。
2. 对照浏览器 Elements 面板，确认 React 组件层级与 DOM 元素层级不是同一模型。
3. 改变固定演示分支后重新加载，观察未选中的组件不在当前组件层级中。
4. 检查 Components 面板过滤器：官方 changelog 说明 host nodes 默认隐藏，但可以关闭过滤后显示。

DevTools 是观察当前应用组件的工具，不是 ES Module 分析器：Components 面板不能证明某个文件是否被
静态 import，也不能列出当前未渲染的所有候选分支。模块依赖仍应回到源码 import 关系；历史 render
变化和 Fiber 内部结构也不能从一个当前面板快照推导为公共合同。Components tree 是 DevTools 对已提交
React tree 的可调过滤投影，不是本课概念模型的逐节点规范实现；面板是否显示 host node 不能改变
“React render tree 节点按组件建模，DOM tree 节点按平台节点建模”的课程判断。

## 九、规则清单与证据

| 规则 | 可执行判断 | 证据 |
| --- | --- | --- |
| 跨文件组件必须建立模块边界 | 定义模块 export，使用模块用对应 import 取得本地绑定 | `react-import-export`、`mdn-import`、`mdn-export` |
| 默认导出对应默认导入 | `export default` 对应无花括号的 `import LocalName from` | `react-import-export`、`ecma-modules` |
| 具名导出对应具名导入 | `export function Name` 对应 `import { Name }` | `react-import-export`、`mdn-import` |
| 具名导入可以显式别名 | `import { ExportedName as LocalName }` | `mdn-import`、`mdn-modules` |
| 一个模块最多一个默认导出 | 第二个 `export default` 是早期语法错误；具名导出可以有多个 | `react-import-export`、`mdn-export`、`ecma-modules` |
| 静态 import 是只读 live binding | 导出方更新绑定后导入方可读到新值；导入方不能给导入绑定重新赋值 | `mdn-import`、`mdn-export`、`ecma-modules` |
| root component 由当前入口决定 | 不把 `App` 或某个固定文件名写成 React 强制规则 | `react-import-export`、`react-first-component` |
| render tree 只建模组件关系 | React 组件是节点；HTML 等平台 primitive 不在该树中 | `react-ui-tree`、`react-ui-tree-source` |
| render tree 绑定一次 render | 条件选择改变时，下一次树可以出现不同组件分支 | `react-ui-tree`、`react-ui-tree-source` |
| dependency tree 建模模块关系 | 模块是节点，import 是边，非组件模块也可出现 | `react-ui-tree`、`react-ui-tree-source` |
| 两棵树不能互相推出 | import 不保证本次 render；render 父子关系也不等于文件层级 | `react-ui-tree-source` |
| DevTools 只承担运行时观察 | Components 面板检查 React 组件且可过滤节点，不替代模块依赖分析，也不定义规范性的完整 render tree | `react-devtools`、`react-devtools-changelog`、`react-devtools-overview`、`react-ui-tree` |

## 十、易错点证据矩阵

| 易错点 | 触发条件 | 原因 | 后果 | 错误示例 | 正确写法 | 验证方式 | 官方证据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 把默认导出当具名导出导入 | 模块写 `export default function Card()`，使用方加花括号 | `default` 与 `Card` 是不同导出名 | 模块链接失败，组件不会进入 render | `import { Card } from './Card.js'` | `import Card from './Card.js'` | 对照导出声明与 import 形式；加载时应无 missing export 错误 | `react-import-export`、`mdn-import` |
| 把具名导出当默认导出导入 | 模块只写 `export function Card()`，使用方省略花括号 | 模块没有 `default` 导出 | 模块链接失败，React 尚未开始渲染该组件 | `import Card from './Card.js'` | `import { Card } from './Card.js'` | 核对模块公开的 export name | `react-import-export`、`mdn-export` |
| 同一模块写两个默认导出 | 想把两个组件都标成“主要组件” | ECMAScript 规定模块导出名不能重复，`default` 也是导出名 | 解析阶段产生 SyntaxError，模块不执行 | `export default function Header() {}; export default function Footer() {}` | 保留一个 default，另一个写 `export function Footer() {}` | 解析模块；重复 `default` 必须失败 | `react-import-export`、`ecma-modules` |
| 具名导入改名却不写 `as` | 导出 `CourseHeader`，使用方直接请求 `{ Header }` | 请求了不存在的导出名 `Header` | 模块链接失败或工具报告 missing export | `import { Header } from './CourseHeader.js'` | `import { CourseHeader as Header } from './CourseHeader.js'` | 对照 `as` 左侧与真实导出名 | `mdn-import`、`mdn-modules` |
| 认为导入后组件会自动出现 | 文件静态 import 组件，却没有在本次 JSX 中使用 | import 只建立模块依赖，不建立 render 父子关系 | 错把 dependency tree 当 render tree，调试方向错误 | `import Notice from './Notice.js'` 后断言树已有 `Notice` | 在需要的分支实际写 `<Notice />`，再观察当前树 | 对照源码 import 与 DevTools 当前组件层级 | `react-ui-tree`、`react-ui-tree-source` |
| 把 DOM 树当 React render tree | 在 Elements 面板只看到 `main`、`section`，便认为组件消失 | React 官方 render tree 按组件建模，DOM 按平台节点建模；DevTools 过滤器还能改变 host node 是否可见 | 无法准确判断组件父子与 DOM 嵌套的差别 | 把 `<section>` 记录为 React 组件节点 | render tree 记录 `App -> LessonPanel`，DOM 单独记录元素 | 按节点类型分别判断，不用任一面板的当前过滤结果替代概念定义 | `react-ui-tree-source`、`react-devtools`、`react-devtools-changelog` |
| 把 render tree 当永久静态结构 | 只看一次 render，就断言所有分支永远存在 | render tree 表示一次 render，条件可让父组件产生不同子组件 | 漏判当前未选中分支，或误判已卸载组件仍在树中 | 同时把 `DraftLesson` 和 `PublishedLesson` 画入每次树 | 按每次实际选择分别画 `App -> DraftLesson` 或 `App -> PublishedLesson` | 改变固定条件后重新观察 Components 面板 | `react-ui-tree`、`react-ui-tree-source` |
| 混淆 root 概念或固定命名 | 把 root module、root component、`createRoot` 返回对象都叫 `root`，或认定根文件必须叫 `App.jsx` | 三者属于不同模型，组件名与文件名取决于实际入口 | 错误地把文件、函数和 API 对象互相替代，或在其他入口中误判没有根组件 | “`App.jsx` 文件就是 `createRoot` 返回的 root component；找不到该文件就没有 root component” | 分别写明 entry module、实际 root component 与 React Root object | 按两棵树和 `createRoot` 签名逐项核对，并追踪实际入口 | `react-ui-tree`、`react-create-root`、`react-import-export`、`react-first-component` |
| 用 Components 面板推断模块依赖 | DevTools 中没看到某组件，便断言对应模块未被 import | Components 面板观察当前已渲染组件，不是静态模块分析器 | 漏掉未选中分支和非组件模块 | “DevTools 没有 DraftLesson，所以 App 没有 import 它” | DevTools 查 render tree，源码 import 查 dependency tree | 分别收集组件面板与 import 关系证据 | `react-devtools`、`react-ui-tree-source` |
| 给导入绑定重新赋值 | 试图用新组件覆盖已导入的组件名称 | 静态 import 建立只读 live binding | 赋值失败，模块边界的所有权也被误解 | `CourseHeader = ReplacementHeader` | 新建自己的局部绑定选择已导入组件 | 导入名称只读取不赋值 | `mdn-import`、`mdn-export`、`ecma-modules` |

## 十一、进阶边界

1. **默认导出仍有导出名。** ECMAScript 在规范内部把匿名默认导出关联到合成名称 `default`；默认
   import 可以任选本地名，并不表示它“没有名称”。
2. **import 是绑定，不是复制值。** MDN 将静态 import 定义为只读 live binding；课程保留导出方更新
   可见、导入方不能重新赋值及其错误示例，不展开模块求值顺序与循环初始化。
3. **模块说明符解析不由 React 统一。** React 文档指出省略 `.js` 的写法可能取决于 setup，显式扩展名
   更接近原生 ES Module。本课示例使用明确路径，但不教学 bundler、Node 或浏览器的配置差异。
4. **render tree 是公共心智模型，不是 Fiber 对象图。** 应用不能依赖内部节点字段、遍历顺序或调试器
   私有协议；本课不读取 React reconciler 源码来发明公共 API。
5. **render tree 也不是 DOM tree。** React 可以面向 Web、mobile 或 desktop 等不同平台；组件关系不
   因底层 UI primitive 改变而等同于某个平台节点树。
6. **依赖树不等于最终 bundle。** 官方文档只支持“bundler 使用依赖树确定所需模块”这一层；最终分包、
   tree shaking 和产物大小还受工具及配置影响，不能由几条 import 静态猜测。
7. **“依赖树”是入门表示。** 通用 ES Module 依赖可出现同一模块被多处依赖，规范也定义了 cyclic
   module record；严格分析时更接近有向图。本课沿用 React 官方 dependency tree 术语，不教学循环、
   图算法或模块求值顺序。
8. **超出本课的模块能力。** namespace import、side-effect import、dynamic `import()`、再导出、barrel、
   import attributes、循环依赖、懒加载与 code splitting 全部延期到语言或工程化课程。
9. **超出本课的树行为。** Props、`children`、State、事件、Hook、Effect、列表 key、组件身份保留、
   render/commit、Portal、`hydrateRoot`、多 root 生命周期、Profiler 性能分析与 Router 树均由后续课程
   独立解释。
10. **DevTools 可见树不是规范定义。** Components tree 随 React commit 更新，并受 component filters
    影响；host nodes 默认隐藏但可重新显示。课程只能把它作为观察辅助，不能从当前可见行反推模块依赖、
    未渲染分支或 React 内部 Fiber 合同。

## 十二、课程与 Demo 边界

### 课程正文主线

- 从“module specifier 指出来源模块，定义模块导出绑定，使用模块导入本地绑定”建立零基础模型。
- 用默认/具名两组组件文件详细解释声明处导出、定义后 export list、默认导出、具名 alias、一个
  default 与只读 live binding。
- 解释 root component、root module 和 React Root object 三者差异，但不重复 Root 生命周期。
- 用同一份小型源码并排画 module dependency tree 与单次 React render tree。
- 用一个固定布尔条件展示两次 render 可以选择不同组件分支，不教学条件渲染完整语法。
- 把 React DevTools Components 面板作为可选观察证据，并与 DOM Elements、源码 import 各自分工。

### Demo 冻结范围

后续 Demo 可以使用以下最小模块：

```text
App.tsx                         default root component
CourseHeader.tsx                named component export
PublishedLesson.tsx             default component export
DraftLesson.tsx                 default component export
courseMeta.ts                   named non-component export
```

`App.tsx` 同时演示一个默认 import、一个具名 import 和一个非组件模块依赖；固定条件只让
`PublishedLesson` 或 `DraftLesson` 之一进入当前 render tree。学习者应能得到三组观察：

1. 源码 import 关系中，两种 lesson 模块与 `courseMeta.ts` 都属于 dependency tree。
2. 当前 Components 面板中，只有 root component、`CourseHeader` 和当前被选中的 lesson component。
3. Elements 面板只显示最终平台元素，不显示 `App`、`CourseHeader` 等组件函数名。

Demo 不使用 Props、`children`、State、事件、Hook 或 Effect；不提供分支切换按钮，不读取 bundler
内部图，不展示本站路径、命令、版本兼容、构建结果、源码哈希或 Gate 结论。没有安装 React DevTools
时，Demo 的可见 UI 和源码对照仍应足以完成基础判断，DevTools 只承担额外的组件层级观察。

## 十三、2026-08-15 现有课程正文审计建议

计划把 B05 定义为“复用并精简”，核心范围只有导入导出、root component、React render tree 与 module
dependency tree。“精简”只针对重复措辞和越界知识，不以行数、章节数或示例数量限制本科核心解释。
以下按 `2026-08-15` live 正文记录保留、补充、删除、移动、合并与新增结论；本批不修改课程、Demo 或
manifest。

### 1. 保留

- 保留 module specifier 用于指出来源模块，并详细说明 `./`、`../` 相对路径；大小写、扩展名省略和路径
  别名只说明取决于宿主设置，不扩展具体工具配置。证据：`react-import-export-source`、`mdn-modules`。
- 保留默认与具名 import/export 的完整基础合同：声明处导出、定义后 export list、定义后
  `export default Name`、默认导入、具名导入、显式 alias、默认与具名混用，以及一个模块最多一个
  default。证据：`react-import-export`、`mdn-import`、`mdn-export`、`ecma-modules`。
- 保留静态 import 的只读 live binding、导出方更新可见、导入方不可重新赋值与静态 import 位于模块
  顶层的语言边界；不展开求值顺序或循环初始化。证据：`mdn-import`、`mdn-export`、`ecma-modules`。
- 保留一个文件可导出多个组件、组件也可依赖非组件模块的双向说明；“一个文件等于一个组件节点”不是
  React 或 ECMAScript 规则。
- 保留 root component 由实际入口首先渲染的组件决定，`App` 与 `App.tsx` 只是常见命名。证据：
  `react-first-component`、`react-ui-tree`。
- 保留 module dependency tree 与单次 React render tree 的并排对照：模块/`import` 与组件/实际渲染
  是两套关系，非组件模块和未选中分支只进入前者。证据：`react-ui-tree`、`react-ui-tree-source`。
- 保留现有五模块 Demo 与固定布尔分支，因为它能在不引入 State、事件或 Props 的前提下给出两棵树的
  可观察差异。
- 保留 DOM tree 只作为反例边界，帮助学习者不把 `<main>` 等平台节点画成 React 组件节点；不扩展
  render/commit、Portal 或宿主实现。
- 保留 10 类高价值 pitfalls：默认误作具名、具名误作默认、重复 default、alias 漏写 `as`、import
  不等于 render、DOM tree 不等于 render tree、一次 render tree 不等于永久结构、root 概念与命名混淆、
  Components 面板不能反推模块依赖、导入绑定不可重新赋值。

### 2. 补充

- live 正文已补充 module specifier、定义后集中具名导出、定义后指定默认导出；三项都属于 B05
  import/export 核心，应与声明处导出共同保留。
- live 正文已把根级二级标题改为连续中文编号，并让各节根级三级标题从 `1.` 开始；这属于课程规范校准，
  不改变知识点范围。
- live 元数据已同步为 `verifiedAt: 2026-08-15`、`appliesTo: React 19.2 / ECMAScript modules`；研究来源
  进一步固定 ECMAScript 2026，避免课程继续引用滚动草案。
- 在 root module 与 root component 的对照中保留 React 官方的限定词：root module **经常**包含 root
  component，但二者不是恒等关系。证据：`react-ui-tree`。
- 把 DevTools 定位成可选观察辅助：Components 面板检查 React 组件，但其可见树受过滤器影响；host
  nodes 默认隐藏、也可以重新显示，因此不能把面板当前行数当作规范性的完整 render tree。证据：
  `react-devtools`、`react-devtools-changelog`、`react-devtools-overview`。
- 在“dependency tree”首次出现处用一句话注明它是 React 官方采用的入门树形表示；真实 ES Module
  依赖可以共享节点或成环，更接近有向图。该限制只需一句，不教学图算法或循环求值。证据：
  `ecma-cyclic-modules`。
- 课程 `sources` 中的 ECMAScript 链接应固定到 ECMAScript 2026；若正文加入 DevTools 过滤器边界，
  同时登记 `react-devtools-changelog`，确保新增结论有直接来源。
- Demo 入口还导入 CSS；live 正文已补充“本课只分析五个 JS/TS 模块，CSS 由工具链处理，不属于这里的
  ECMAScript 模块集合”。该句只用于避免把 CSS 误画入标准模块图，不展开 Vite 的 CSS 模块加载机制。

### 3. 删除

- 删除“这些内容由后续第几课解释”之类路线生产措辞；学习者正文直接说明当前不展开即可，不泄露批次、
  计划或后续课程编号。
- 删除任何把 multiple roots、`createRoot` / `hydrateRoot` 生命周期、render/commit、Portal、Profiler、
  Fiber 或 B06 JSX Runtime / React element 展开为 B05 主线的内容。
- 不删除 module specifier、定义后 export list、live binding、默认/具名双向错配、alias 或重新赋值错误；
  它们都属于本课 import/export 合同。

### 4. 移动

- 把 React Root object 的创建、`createRoot` / `hydrateRoot`、多个 React roots 与生命周期细节移动到
  B07“React Root 与页面入口”。B05 只保留一句“root component 不等于 `createRoot` 返回对象”，用于
  消歧。
- 共享依赖、循环依赖的求值与模块初始化顺序移动到 JavaScript / TypeScript 模块或工程化资料；B05 只
  保留“dependency tree 是入门表示，真实依赖可成图”的一句边界。
- 把 Portal、Profiler、渲染性能、commit 时序和内部 Fiber 观察移动到后续对应课程。B05 的 DevTools
  只使用 Components 面板说明可观察边界。
- JSX transform、JSX Runtime 与 React element 全部留给 B06；B05 不新增任何相关解释、源码字段或
  运行时 factory。

### 5. 合并

- 只合并“混淆三种 root”与“把 `App.tsx` 当强制根文件名”两个 pitfalls 为一类 root 概念与命名错误；
  两个触发场景、原因、后果和验证方式全部保留。其余本科章节与九类 pitfalls 不建议合并。

### 6. 新增

- 不新增课程、Demo、fixture、第二条教学主线或新的 pitfalls 类别。
- DevTools filter 与 CSS 的说明都只是在现有观察上补齐边界，不构成新知识点。
- 不把调研日期、patch 版本、哈希、搜索过程或批次状态新增到学习者正文；这些生产证据只保留在本记录。

审计后的 B05 应详细回答六个问题：module specifier 指向哪里、模块导出了哪些绑定、使用方怎样匹配并
读取导入绑定、哪个组件是 root component、入口模块依赖哪些模块、当前 render 实际出现哪些组件。
超出这六个问题的 Root 生命周期、运行时机制和性能分析不进入本课。
