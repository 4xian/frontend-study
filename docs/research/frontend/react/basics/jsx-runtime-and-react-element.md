# JSX Runtime 与 React Element 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.jsx-runtime-and-react-element`
- 标题：JSX Runtime 与 React Element
- 教学层级：本科范围的 React 基础课
- 核验日期：`2026-08-15`
- 文档基线：React 文档 `19.2`
- 运行时基线：React `19.2.8`
- 类型核验：固定 `@types/react@19.2.8`；本地 `@types/react@19.2.18` 交叉核对
- 工具核验：TypeScript 官方 JSX 文档；本地 TypeScript `6.0.3`
- 研究状态：官方资料核验完成，可用于修订课程

本知识点只回答以下问题：TSX/JSX 源码怎样变成 JSX runtime 调用，这些调用怎样创建 React
element，以及应用代码可以依赖哪些最小公共边界。automatic/classic runtime 的选择只讲到能读懂
配置和迁移旧代码；`createElement` 只用于等价消歧。

本知识点不展开 React 私有 element 字段、Fiber、reconciler、Root 生命周期、render/commit、DOM
提交、State、完整 Props 课程、Ref 或列表 key 算法。

## 研究方法与证据边界

1. 按仓库搜索顺序先使用 Tavily 定位 React、TypeScript、Babel 和 React 固定版本源码的候选 URL，
   再回到官方文档、React `v19.2.8` tag 与当前类型包核验关键结论。
2. React element 的应用层合同以 React `19.2` 公共文档为主；固定版本源码只核验 runtime export、
   `key` 提取和开发期浅冻结，不把实现形状升级为公共 API。
3. React `19.2.8` 运行时包不内置本课引用的 TypeScript 声明；精确类型证据来自独立发布的
   `@types/react@19.2.8`，并用本地 `@types/react@19.2.18` 交叉核对相同公共边界。
4. TypeScript 与 Babel 文档中的生成代码是对应工具当前输出示例。它能说明 automatic/classic 模式，
   不能证明所有转换器未来必须按同一细节选择 `jsx` 或 `jsxs`。
5. live 资产审计只读取本课程正文、同名 Demo、entry manifest 的本课程条目和 demo manifest 的本课程
   条目；本记录不修改这些资产。

## 官方来源卡

| ID | 官方直接来源 | 适用版本 | 本记录采用的结论 |
| --- | --- | --- | --- |
| `react-versions` | [React Versions](https://react.dev/versions) | React 文档 `19.2` | React 文档与 19.2 发布线的版本基线。 |
| `react-jsx-markup` | [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) | React 文档 `19.2` | JSX 是 JavaScript 语法扩展，需要工具转换；JSX 与 React 不是同一个概念。 |
| `react-create-element` | [`createElement`](https://react.dev/reference/react/createElement) | React 文档 `19.2` | JSX 与 `createElement` 都能创建 React element；element 是对象形式的描述；创建 element 不会调用组件或创建 DOM；element 与 props 必须按不可变值对待。 |
| `react-valid-element` | [`isValidElement`](https://react.dev/reference/react/isValidElement) | React 文档 `19.2` | React element 比可渲染 React node 的集合窄；形状相似的任意对象不是 element。 |
| `react-calls-components` | [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks) | React 文档 `19.2` | 组件通过 JSX 使用，不应作为普通函数直接调用；React 决定何时调用组件。 |
| `react-special-key` | [Special Props Warning](https://react.dev/warnings/special-props) | React 文档 `19.2` | `key` 是 React 使用的特殊信息，组件不能通过 `props.key` 读取它。 |
| `react-19-upgrade` | [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) | React `19.x` | React 19 要求新的 JSX transform；它支持使用 JSX 时不手写 React import。 |
| `react-new-transform` | [Introducing the New JSX Transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) | React 官方迁移说明 | 新 runtime entry 只供 Babel、TypeScript 等编译器 transform 使用；应用手工创建 element 仍使用 `createElement`。 |
| `react-jsx-source` | [React `v19.2.8` `ReactJSX.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSX.js) | React `19.2.8` | `jsx`、`jsxs`、`jsxDEV` 与 Fragment 的固定版本导出；production 中 `jsx`、`jsxs` 当前可共用 factory，`jsxDEV` 只在开发分支提供。 |
| `react-element-source` | [React `v19.2.8` `ReactJSXElement.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSXElement.js) | React `19.2.8` | runtime 从配置中单独提取 `key`；开发构建对 element 和顶层 props 做浅冻结。 |
| `react-package-source` | [React `v19.2.8` `package.json`](https://github.com/facebook/react/blob/v19.2.8/packages/react/package.json) | React `19.2.8` | 包公开 `react/jsx-runtime` 与 `react/jsx-dev-runtime` 子路径供转换器生成代码使用。 |
| `react-types` | [`@types/react@19.2.8` 发布物](https://registry.npmjs.org/@types/react/-/react-19.2.8.tgz) | React types `19.2.8` | `ReactElement` 的最低类型面是 `type`、`props`、`key`；runtime helper 类型明确要求业务代码使用 JSX 和转换器，而不是直接调用 helper。 |
| `ts-jsx` | [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) | TypeScript JSX | `react`、`react-jsx`、`react-jsxdev` 的输出模式和 runtime entry。 |
| `ts-jsx-option` | [TypeScript `jsx` option](https://www.typescriptlang.org/tsconfig/jsx.html) | TypeScript JSX | 三种模式的最小配置说明及按文件覆盖边界。 |
| `babel-jsx` | [Babel React JSX transform](https://babeljs.io/docs/babel-plugin-transform-react-jsx) | Babel `7.9+` automatic runtime | automatic 自动导入 helper，classic 使用配置的 factory；当前示例展示 `jsx` 与 `jsxs` 的生成结果。 |
| `babel-jsx-source` | [Babel JSX transform source](https://github.com/babel/babel/blob/main/packages/babel-plugin-transform-react-jsx/src/create-plugin.ts) | Babel 当前源码 | 当前转换器按源码中可见的 JSX children 数量选择 `jsx`/`jsxs`，开发转换统一使用 `jsxDEV` 并传静态 children 标志。 |

## 一、从源码到 React element 的稳定主线

最小链路是：

```text
TSX / JSX 源码
  -> TypeScript、Babel 或其他 JSX 转换器
  -> automatic runtime 生成 react/jsx-runtime 调用
  -> runtime 调用返回 React element 对象
```

JSX 是语法扩展，不是浏览器直接执行的 HTML，也不是 React 在运行时解析的字符串。转换器先把
JSX 语法改写为普通 JavaScript 调用，JavaScript 执行这些调用后才得到 React element。
证据：`react-jsx-markup`、`ts-jsx`、`babel-jsx`。

这条链路只到“创建 element 描述”为止。创建描述不会调用自定义组件，不会创建 DOM，也不等于内容
已经显示。证据：`react-create-element`、`react-calls-components`。

## 二、automatic runtime 与 helper 的准确边界

### 1. automatic runtime 自动生成 import

TypeScript 使用以下配置时，会把 JSX 转成 automatic runtime 调用：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

概念化输出是：

```js
import { jsx as _jsx } from 'react/jsx-runtime'

const label = _jsx('span', { children: '课程' })
```

因此，只为使用 JSX 语法时，不需要手写 `import React from 'react'`。这不表示 React 依赖消失：生成
代码仍需要能解析 `react/jsx-runtime`。如果源码直接使用 `useState`、`createElement` 等 API，仍应导入
对应名字。证据：`react-19-upgrade`、`react-new-transform`、`ts-jsx-option`、
`react-package-source`、`babel-jsx`。

### 2. `jsx` 与 `jsxs` 的选择不是应用公共合同

TypeScript 与 Babel 的官方示例通常把一个 JSX element 转成 `jsx`，把含多个静态 children 的结构转成
`jsxs`。React `19.2.8` 源码也为两者保留 dynamic/static children 的开发校验入口。

当前 Babel 源码数的是转换器在 JSX 源码中看到的 children 数量，不是运行时值是否碰巧为数组。例如
`<List>{items}</List>` 只有一个 JSX 表达式，不能因为 `items` 运行时是数组就断言应使用 `jsxs`。

这只能作为“当前转换器会替应用选择 helper”的观察，不应写成“一个 child 永远调用 `jsx`、多个 child
永远调用 `jsxs`”的应用层保证，原因有三点：

1. 业务源码面对的是 JSX 语法，不是 helper API。
2. `@types/react` 对 `jsx` 与 `jsxs` 都明确写着不要直接使用，应交给 JSX 转换器。
3. React `19.2.8` 的 production 路径当前让 `jsx` 与 `jsxs` 共用同一 factory，并在源码注释中把未来
   静态 children 优化保留为实现选择。

课程可以展示一次当前输出帮助定位层级，但不能让学习者根据 child 数量手写或断言 helper。
证据：`ts-jsx`、`babel-jsx`、`babel-jsx-source`、`react-types`、`react-jsx-source`、
`react-new-transform`。

### 3. `jsxDEV` 只是开发变体

`react-jsxdev` 会从 `react/jsx-dev-runtime` 生成 `jsxDEV` 调用，用于附带开发诊断信息。React
`19.2.8` 固定版本源码也只在开发分支提供 `jsxDEV`；它不会创建另一种 React element，也不应由业务
代码直接调用。证据：`ts-jsx-option`、`react-jsx-source`、`react-types`。

## 三、TypeScript `jsx` 配置的最低说明

| `compilerOptions.jsx` | 转换结果 | 对 React import 的最低结论 |
| --- | --- | --- |
| `react-jsx` | automatic production 形式，生成 `react/jsx-runtime` 的 helper 调用 | 仅写 JSX 不需要手动导入默认 `React`；生成代码仍依赖 React runtime。 |
| `react-jsxdev` | automatic development 形式，生成 `react/jsx-dev-runtime` 的 `jsxDEV` 调用 | 只用于开发输出；同样不要求为了 JSX 语法手动导入默认 `React`。 |
| `react` | classic 形式，生成 `React.createElement` 调用 | 生成代码需要作用域中存在匹配 factory；默认示例要求 `React` 绑定。 |

`jsx` 选项决定 TypeScript 怎样 emit `.tsx` 中的 JSX。若配置为保留 JSX 给下游工具，则最终 runtime
由下游转换器决定，不能只看 TypeScript 配置猜测。React 19 新代码应采用新的 automatic transform；
classic 只保留为旧项目配置与迁移消歧。证据：`ts-jsx`、`ts-jsx-option`、`react-19-upgrade`、
`babel-jsx`。

## 四、React element 的公共心智模型

### 1. 可以说是对象，但不要只说“普通对象”

React `createElement` 文档明确称返回值为 “React element object”，并用简化 JavaScript 对象说明它是
一份描述。因而在语言层面把 element 理解为 JavaScript 对象是准确的；更稳妥的本科表述是：

> React element 是 React 创建的、对象形式的不可变 UI 描述。

不加限定地说“普通对象”容易产生两个错误推论：任意 `{ type, props }` 都是 element，或业务代码可以
自由改写其字段。官方 `isValidElement` 文档明确否定前者，`createElement` 文档的不可变要求否定后者。
课程还应把 element 当作不透明描述，不枚举或依赖运行时对象形状。证据：`react-create-element`、
`react-valid-element`。

### 2. 最低公共边界是 `type`、`props`、`key`

固定 `@types/react@19.2.8` 的 `ReactElement` 定义提供以下最低教学面；本地较新的
`@types/react@19.2.18` 仍保持同一结构：

```ts
interface ReactElement<P = unknown, T = string | JSXElementConstructor<any>> {
  type: T
  props: P
  key: string | null
}
```

| 字段 | 本课只需要建立的认识 |
| --- | --- |
| `type` | 字符串可表示内建标签；组件标识符也可以成为 element type。 |
| `props` | 保存这份 element 描述的输入，包括转换器生成的 `children`；不展开完整 Props 数据流。 |
| `key` | React 单独使用的特殊提示；只建立它与 `props` 分离的边界，不教学完整 identity 规则。 |

这三项是 TypeScript 公共类型的最低边界，不是对运行时对象全部字段的枚举承诺。业务代码仍应优先传递
或返回 element，而不是围绕字段形状编程。证据：`react-create-element`、`react-types`。

### 3. `key` 不进入组件可读的 `props`

写 `<CourseCard key="course-1" title="React" />` 时，`title` 可作为组件 props，`key` 则由 React 单独
处理。组件不能读取 `props.key`；若业务逻辑也需要该 ID，应另传普通 prop。React `19.2.8` runtime
源码同样在创建 props 对象时排除 `key`。证据：`react-special-key`、`react-element-source`。

## 五、element 创建与组件调用不是一回事

```tsx
function Greeting() {
  return <h1>你好</h1>
}

const element = <Greeting />
```

这里创建的是 `type` 指向 `Greeting` 的 React element；执行这条 JSX 表达式不会立即调用
`Greeting`。React 官方还明确要求组件应通过 JSX 使用，不要写 `Greeting()` 把它当普通函数调用。
本课只建立“element creation 不等于 component invocation”的边界，不展开组件调用时机和过程。
证据：`react-create-element`、`react-calls-components`。

## 六、不可变语义与开发期浅冻结必须分开

### 公共语义

React 文档要求 element 及其 props 在创建后保持不可变。需要另一份描述时应创建新的 JSX element，
而不是修改已有 `element.props`。这是应用代码在 production 与 development 都应遵守的语义。
证据：`react-create-element`。

### 当前开发实现

React `19.2.8` 的开发构建会浅冻结 element 和顶层 props，用来尽早暴露直接修改。浅冻结只说明当前
开发构建的第一层对象受保护：

- 不能把 `Object.isFrozen(element)` 当成跨环境业务判断。
- 不能把浅冻结解释为所有嵌套 prop 值都会递归冻结。
- production 是否实际冻结不是公共合同；应用仍按不可变语义编写。

证据：`react-create-element`、`react-element-source`。

## 七、JSX 与 `createElement` 的有限等价

```tsx
const fromJsx = <h1 className="title">课程</h1>
const fromFactory = createElement('h1', { className: 'title' }, '课程')
```

两种写法都能创建表达相近意图的 React element，但不是同一个对象，也不代表 automatic transform 会
把 JSX 编译为 `createElement`。React 文档把 `createElement` 列为 JSX 的公开替代 API，同时将其归在
Legacy APIs；React 19 又要求新的 JSX transform。

因此本科课程只用 `createElement` 做两件事：说明 JSX 最终得到 element 描述，以及帮助识别 classic
输出或迁移旧代码。日常代码继续写 JSX，不展开手写 factory 技巧。证据：`react-create-element`、
`react-19-upgrade`、`ts-jsx-option`。

## 八、element、node 与 DOM 的最小消歧

React element 不是 DOM node，也不是所有 React node 的同义词。`isValidElement(<p />)` 为 true，
而 string、number 和 element 数组本身不是 React element，即使它们可作为 React node 使用。形状相似
的任意对象也不会自动成为 React element。

这部分只保留一张最小判断表，不展开完整 `ReactNode` 联合、DOM API 或 DOM 提交过程：

| 值 | 是 React element | 说明 |
| --- | --- | --- |
| `<p />` | 是 | JSX runtime 创建的 element 描述。 |
| `createElement('p')` | 是 | 公开 factory 创建的 element 描述。 |
| `'课程'`、`3` | 否 | 可以是 React node，但不是 element。 |
| `[<span key="a" />]` | 否 | 数组里的值可包含 element，数组本身不是 element。 |
| `{ type: 'p', props: {} }` | 否 | 相似形状不能替代 React 创建的 element。 |

证据：`react-create-element`、`react-valid-element`、`react-types`。

## 九、关键结论证据矩阵

| 关键结论 | 官方证据 |
| --- | --- |
| JSX 必须先转换，automatic runtime 会生成 runtime import | `react-jsx-markup`、`ts-jsx-option`、`babel-jsx` |
| automatic 只免除“为 JSX 语法手动导入 React”，不免除 runtime 依赖 | `react-19-upgrade`、`react-package-source`、`ts-jsx-option` |
| `jsx`/`jsxs` 的精确选择不应成为业务源码合同 | `react-types`、`react-jsx-source`、`ts-jsx`、`babel-jsx` |
| `jsxDEV` 是开发变体，不是另一种 element | `ts-jsx-option`、`react-jsx-source`、`react-types` |
| React element 是对象形式的 UI 描述，创建描述不会调用组件或创建 DOM | `react-create-element`、`react-calls-components` |
| `type`、`props`、`key` 是当前 ReactElement 的最低公共类型面 | `react-types`、`react-create-element` |
| `key` 由 React 单独处理，组件不能通过 `props.key` 读取 | `react-special-key`、`react-element-source` |
| element 与 props 必须按不可变值使用；浅冻结只是当前开发期执行方式 | `react-create-element`、`react-element-source` |
| `createElement` 只保留为公开替代 API 和 classic/迁移消歧 | `react-create-element`、`react-19-upgrade`、`ts-jsx-option` |

## 十、2026-08-15 live 课程、Demo 与 manifest 审计

以下建议基于本次只读到的当前课程正文、同名 Demo 与本课程 manifest 条目。修订时仍应保持单知识点，
不把研究日期、版本核验过程、资产状态或验证命令写进学习者正文。

### 1. 保留

- 保留 `TSX -> transform -> JSX runtime -> React element` 主线，并保留“创建 element 不会立即创建 DOM
  或显示内容”的一句边界。证据：`react-jsx-markup`、`react-create-element`。
- 保留 automatic runtime 自动生成 `react/jsx-runtime` import、仅写 JSX 不需要默认 React import，
  但 runtime 依赖仍存在的解释。证据：`react-19-upgrade`、`ts-jsx-option`。
- 保留 `type`、`props`、`key` 最小模型，以及内建标签 type 与组件 type 的对照。证据：
  `react-create-element`、`react-types`。
- 保留“`<CourseCard />` 创建 element 而不是立即调用 `CourseCard`”的示例，并补上组件不应直接作为
  普通函数调用的官方规则。证据：`react-create-element`、`react-calls-components`。
- 保留不可变语义与开发期浅冻结，但必须继续分成公共要求和当前开发实现两层。证据：
  `react-create-element`、`react-element-source`。
- 保留 element/node/DOM 的一张紧凑消歧表与 `isValidElement` 的窄边界；不保留完整 ReactNode 类型枚举。
- 保留现有 Demo 的 JSX / `createElement` 对照、element type、非 HTMLElement、开发浅冻结和
  `isValidElement` 样本。浅冻结展示必须明确标成开发环境观察，不能冒充 production 保证。
- 保留 entry manifest 的本课程 slug/load 映射和 demo manifest 的当前 ID、React runtime、同名 TSX
  source 映射；本次未发现需要调整的登记项。

### 2. 补充

- 在第一次展示 `jsx`/`jsxs` 后立即补充：单 child / 多个静态 children 只是当前转换器输出示例，
  exact helper selection 不是应用公共合同，业务代码不得直接调用。证据：`react-types`、
  `react-jsx-source`。
- 把 `jsxDEV` 明确为 `react-jsxdev` / `react/jsx-dev-runtime` 的开发变体，不再用“开发工具可以使用”
  这种模糊措辞。证据：`ts-jsx-option`、`react-jsx-source`。
- 补充 TypeScript `react-jsx`、`react-jsxdev`、`react` 三行最小表，让 automatic 与 classic 的导入
  边界可直接核对。证据：`ts-jsx`、`ts-jsx-option`。
- 把“普通对象”统一改成“React 创建的、对象形式的不可变 UI 描述”，并补一句形状相似的任意对象不是
  element。证据：`react-create-element`、`react-valid-element`。
- 在 `key` 行补充“组件不能读取 `props.key`；业务需要同一 ID 时另传普通 prop”，但不展开列表
  identity。证据：`react-special-key`。
- 在不可变章节先写跨环境公共语义，再写 React `19.2.8` development 浅冻结，明确不是深冻结，也不是
  production 判断条件。证据：`react-create-element`、`react-element-source`。

### 3. 删除

- 删除“一个 child 永远选择 `jsx`、多个静态 child 永远选择 `jsxs`”式确定性规则；只保留当前
  TypeScript/Babel 示例和“转换器负责选择”。
- 删除私有 element 字段名、对象截图、字段枚举顺序、开发/生产私有形状比较和任何自行识别 element
  的技巧；公共代码只使用 JSX、React API 与公开类型。
- 删除独立的 React 19 `ref` 字段章节；Ref 与完整 Props 边界不属于本知识点。
- 删除完整 `ReactNode` 联合成员枚举、DOM API 操作、Root 消费过程、render/commit 和 DOM 提交措辞；
  只保留 element 不是 DOM node、创建描述不等于显示的最小消歧。
- 删除“第几课”“下一课”“后续批次”等生产路线描述，正文只说“本知识点不展开”。
- 删除研究正文中的旧 TypeScript `7.0.2` 临时 fixture、临时目录和 Gate 叙事；官方 TypeScript 文档与
  当前本地版本已足以支撑配置边界。

### 4. 移动

- `key` 如何保持 identity、列表增删移动规则与 key 选择策略移动到列表 key 课程；本课只保留
  `key` 与 `props` 分离。
- Props 数据流、`children` 的完整语义和 prop mutation 规则移动到 Props 课程；本课只把 `props` 当作
  element 描述的输入容器。
- Ref 的传递和 React 19 `ref as prop` 细节移动到 Ref/Props 对应课程。
- Root 创建、消费 element、更新与卸载，render/commit、reconciliation 和 DOM 提交移动到各自课程。
- `ReactNode` 的完整类型联合、Promise/iterable/portal 等成员移动到 TypeScript 类型或组合课程。

### 5. 合并

- 把现有“单 child 用 `jsx`”“多个静态 child 用 `jsxs`”“development 用 `jsxDEV`”三段合并为一节
  “转换器选择 runtime helper”：给一个 production 示例、一个 development 示例和一条非公共合同
  警告即可。
- 把“不会创建 DOM”“不会自动显示”“不会立即执行组件”合并为“创建 element 只创建描述”，再用三个
  短判断分别消歧，避免展开 Root 与 DOM 提交。
- 把 element/node/DOM 的多节说明合并成一张表；保留 `isValidElement` 只判断 element 的结论。
- 把 classic transform 与 `createElement` 两处重复说明合并到迁移/等价消歧段，不新增手写 factory
  主线。
- 合并“手写 runtime helper”与“automatic runtime 不依赖 React”两个易错点：二者都通过检查生成
  import 和保持业务源码为 JSX 验证。

审计后的课程应让学习者准确回答六个问题：JSX 由谁转换、automatic runtime 从哪里导入 helper、
为什么不必为 JSX 手写 React import、element 是什么、创建 element 为什么不等于调用组件、
`type`/`props`/`key` 与不可变语义的最低边界是什么。其余实现与生命周期内容不进入本知识点。
