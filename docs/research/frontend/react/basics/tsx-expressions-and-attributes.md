# TSX 表达式与属性研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.tsx-expressions-and-attributes`
- 标题：TSX 表达式与属性
- 路线批次：React Core 新路线 `B03`
- 真实前置：`react.core.learn.basics.tsx-markup-syntax`（只复用 `.tsx`、标签、闭合与文本标记）
- 核验日期：`2026-08-15`
- 研究状态：B03 官方调研已冻结，可进入本课正文与 Demo 编写
- 公共文档基线：React `19.2`、TypeScript 当前 JSX Handbook
- 固定实现证据：React / React DOM `19.2.8`、TypeScript `7.0.2`

本课只回答三个问题：怎样在 TSX child 位置写花括号表达式，怎样给 JSX attribute 传动态值或布尔值，
以及常见 JavaScript 值作为 child 时哪些会显示、哪些是空节点、哪些是错误输入。

以下内容不进入 B03：

- B02 已完成的 `.tsx` 文件、单根、闭合、Fragment、注释和纯文本标记规则；
- DOM Props 的命名、`className`、`style`、`data-*`、`aria-*`、属性序列化与透传；
- spread attribute 及覆盖顺序；
- 组件定义、Props 数据流、事件、条件渲染模式、列表与 key；
- JSX Runtime、React Element、Root、render / commit、State、生命周期与副作用。

其中 DOM Props 的完整合同保留给 B18。本课可以用 `title` 或 `disabled` 做最小观察载体，但不能从单个
示例推广浏览器属性映射规则。

## 路线迁移判定

| 旧记录内容 | B03 判定 | 理由或去向 |
| --- | --- | --- |
| 花括号 child expression | 保留 | B03 核心范围。 |
| 引号 attribute 与 `{expression}` attribute | 保留 | B03 核心范围。 |
| 无值 attribute 与显式 Boolean expression | 保留并收窄 | 只讲 TSX 输入值，不讲 DOM 映射。 |
| string、number、Boolean、`null`、`undefined` child | 保留并校准 | 必须区分可见文本与官方 empty node。 |
| function、Symbol、普通对象 child | 保留为错误边界 | 三者结果不同，不能统称为空值或都说成抛错。 |
| `style={{...}}`、camelCase 与单位 | 移出 | 属于 B18 DOM Props。 |
| `{...props}`、透传与覆盖顺序 | 移出 | 属于 B18 DOM Props / 透传。 |
| 求值次数、render 重复与副作用 | 移出 | 属于后续纯度与更新模型，不是 B03 语法合同。 |

## 调研方法与实际访问证据

1. 外部关键词发现严格从 Tavily 开始。2026-08-15 的 React 定域搜索、TypeScript 定域搜索和定向 extract
   均成功，因此没有切换到 Exa、Parallel、Perplexity 或 `codex --search`。
2. 候选结论全部回到 React、TypeScript 官方文档、官方包元数据或固定版本官方源码核验；未采用博客、
   问答站或搜索摘要作为结论来源。
3. `curl -L --fail --silent --show-error` 直接复核完成于
   `2026-08-15T16:04:24+08:00`。下表所列采用来源均返回 HTTP `200`。
4. `npm view` 当场确认 `react@19.2.8`、`react-dom@19.2.8` 与 `typescript@7.0.2` 是各自 `latest`；
   TypeScript `7.0.2` 的 `gitHead` 为 `2bd066d87f5bafd315be9f40889d0a60b9e58e0b`。
5. 本地 `package-lock.json` 当场读取为 React / React DOM `19.2.8`、TypeScript `6.0.3`、
   `@types/react` `19.2.18`、`@types/react-dom` `19.2.4`。本地版本只属于生产证据，不替代公共合同。
6. Meta 旧 JSX Draft 的历史地址经 Tavily 命中，但直接访问返回 HTTP `404`，因此不把它作为本次结论
   来源，也不借缓存摘要补写语义。

| ID | 实际访问的官方来源 | 访问结果 | 本课采用的证据 |
| --- | --- | --- | --- |
| `react-curly-braces` | [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) | Tavily search / extract 成功；直读 `200` | 引号 attribute 是字符串；花括号可位于 child 或 `=` 后；对象字段可显示，普通对象 child 报错。 |
| `react-conditional` | [Conditional Rendering](https://react.dev/learn/conditional-rendering) | Tavily search / extract 成功；直读 `200` | `false`、`null`、`undefined` 是 hole；数值 `0` 会显示。 |
| `react-children` | [`Children`](https://react.dev/reference/react/Children) | Tavily search / extract 成功；直读 `200` | `null`、`undefined` 和 Boolean 是 empty node；string 与 number 是节点。 |
| `react-dom-children` | [Common components](https://react.dev/reference/react-dom/components/common) | Tavily search / extract 成功；直读 `200` | 公共 `children` 分类包含 string、number 与 empty node；本课不采用同页 DOM Props 索引。 |
| `react-versions` | [React Versions](https://react.dev/versions) | Tavily extract 成功；直读 `200` | react.dev 当前文档主版本为 `19.2`。 |
| `react-legacy-boolean` | [JSX In Depth: Props Default to “True”](https://legacy.reactjs.org/docs/jsx-in-depth.html#props-default-to-true) | 直读 `200` | 无值 prop 等价于值 `true`；这是 legacy 官方语法证据，只作兼容说明。 |
| `react-child-source` | [`ReactChildFiber.js` `v19.2.8`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js) | Tavily extract 成功；Raw 直读 `200` | 校准空字符串、function、Symbol、普通对象的不同内部分支。 |
| `react-types-source` | [`ReactTypes.js` `v19.2.8`](https://github.com/facebook/react/blob/v19.2.8/packages/shared/ReactTypes.js) | Raw 直读 `200` | 固定版本内部类型将 `null` / `void` / Boolean 归为 `ReactEmpty`，将 string / number 归为 `ReactText`。 |
| `ts-jsx` | [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) | Tavily search / extract 成功；直读 `200` | JSX 的 attribute 与 children 静态检查由 `JSX` namespace 和使用的库类型决定。 |
| `ts-transform` | [TypeScript 7 JSX transformer](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/transformers/jsxtransforms/jsx.go) | Raw 直读 `200` | 固定版本把无 initializer 的 JSX attribute 转成 `true`，把 expression container 转成内部 expression。 |

## 证据层级

### 官方公共事实

- React 官方 Learn 页面规定：花括号可以在标签内容中，或紧跟在 attribute 的 `=` 后；引号中的
  attribute 值按字符串传入。
- React 官方 Reference 把 string、number 列为 React node，把 `null`、`undefined`、Boolean 列为
  empty node。官方条件渲染页进一步明确 `false` 不显示，而 `0` 会显示。
- TypeScript 官方 JSX Handbook 规定静态 attribute / children 检查由当前 JSX 库提供的类型决定；
  TypeScript 并不替 React 定义最终 child 行为。
- React legacy 官方页记载无值 prop 的值为 `true`。由于它不是当前 Learn 主线，本课以显式 Boolean
  expression 为主要写法，只把简写作为需要认识的语法。

### 课程推导

- TSX 是 TypeScript 文件中的 JSX，因此 B03 用 `.tsx` 示例沿用上述花括号位置规则；这不是另一套模板
  插值语法。
- 静态字符串优先写 `title="课程目录"`，动态值写 `title={courseTitle}`，可让“是否求值”一眼可见。
- `disabled`、`disabled={true}`、`disabled={false}` 与 `disabled="false"` 在 TSX 边界得到的 JavaScript
  值不同；浏览器最终怎样表现由具体 DOM Prop 合同决定，留给 B18。
- function、Symbol 不是官方 empty node。即使当前实现最终不产生内容，也应作为无效 child 教学，不能
  推荐为“什么都不显示”的写法。
- “普通对象 child 报错”不等于“所有 object 都不能成为 child”。数组、可迭代值和 React 识别的特殊
  对象有另外的合同；B03 只提醒这个反例，不展开它们。

### 固定版本内部实现

- React `v19.2.8` 的 `ReactChildFiber.js` 对非空 string、number（以及 bigint）建立文本路径；空字符串
  不进入该路径。
- 同一源码对 unsupported 普通对象调用 `throwOnInvalidObjectType`；对 function 与 Symbol 只在
  `__DEV__` 分支发出不同警告，随后按 empty 处理。
- 上述源码只用于校准“报错、警告、空输出”的差异，不把 Fiber、reconciler 或文本节点创建过程写进
  B03 正文。bigint 虽被当前实现和本地 typings 接受，但当前公共 children 文档主线只列 string 与
  number，因此不升级为本课学习目标。
- TypeScript `7.0.2` transformer 的无 initializer -> `true` 是固定版本实现佐证。课程公共表述仍以
  React legacy 官方语法说明为准，不教授 emit 或 JSX Runtime。

## 一、花括号表达式的公共定义

### 1. 花括号表示回到 JavaScript expression

```tsx
const courseTitle = 'React Core'
const completedLessons = 2

const summary = (
  <section title={courseTitle}>
    <h2>{courseTitle}</h2>
    <p>已完成 {completedLessons + 1} 节准备工作</p>
  </section>
)
```

本课常用 expression 包括变量读取、属性读取、算术、字符串拼接和函数调用。花括号不是模板字符串的
`${value}`，也不是 Vue 模板的 `{{ value }}`。

### 2. 只允许 expression，不直接放 statement

`courseTitle`、`completedLessons + 1`、`formatLabel(courseTitle)` 都会产生值。`if`、`for`、变量声明和
`return` 是 statement，不能直接写进 child 的花括号。需要分支时先算出一个值；完整条件渲染模式不在
B03 展开。

### 3. 语法只产生值，接收方决定合同

`{expression}` 可以求出 string、number、Boolean、对象或函数等不同 JavaScript 值。值能通过 TSX
语法不代表它在任意 attribute 或 child 位置都合法：attribute 要服从对应 prop 类型，child 要服从
React node 合同。这个区分是本课最重要的心智模型。

## 二、attribute expression 与 Boolean 值

### 1. 引号和花括号不是同一值

| TSX | TSX 边界得到的值 | B03 结论 |
| --- | --- | --- |
| `title="courseTitle"` | 字符串 `"courseTitle"` | 不读取变量。 |
| `title="{courseTitle}"` | 字符串 `"{courseTitle}"` | 花括号只是字符串字符。 |
| `title={courseTitle}` | 变量求值结果 | 动态 attribute。 |
| `title={'React Core'}` | 字符串 `"React Core"` | 合法但静态值用引号更清楚。 |

### 2. Boolean attribute 只冻结输入值

| TSX | TSX 边界得到的值 | 教学定位 |
| --- | --- | --- |
| `disabled` | Boolean `true` | 需要认识的无值简写。 |
| `disabled={true}` | Boolean `true` | 更显式，适合初学主线。 |
| `disabled={locked}` | `locked` 的动态 Boolean 结果 | 常用动态写法。 |
| `disabled={false}` | Boolean `false` | 与字符串不同。 |
| `disabled="false"` | 字符串 `"false"` | 不是 Boolean `false`；具体 DOM 后果留给 B18。 |

不要在 B03 推导“所有无值 HTML attribute”或浏览器 property / attribute 同步规则。本节只确认 TSX
产生的 JavaScript 值。

## 三、child expression 的精确边界

| expression 结果 | 公共地位 | React `19.2.8` 可观察结果 | 本课判断 |
| --- | --- | --- | --- |
| 非空 string | 官方 React node | 显示字符串字符 | 可直接显示。 |
| 空字符串 `''` | string 的边界值 | 没有可见字符；当前源码不建立文本路径 | 不把“看不见”误说成 `null` 类 empty node。 |
| number | 官方 React node | 显示十进制文本，`0` 也显示 | 不能把 `0` 当作空 child。 |
| `true` / `false` | 官方 empty node | 不显示文字 | Boolean attribute 与 Boolean child 是两个位置合同。 |
| `null` | 官方 empty node | 不产生可见内容 | 可表示空位置；条件模式后讲。 |
| `undefined` | 官方 empty node | 不产生可见内容 | 不应借此掩盖取值错误。 |
| function | 不是官方 empty node | 开发环境警告，随后无可见内容 | 通常是忘记调用；写 `{formatLabel()}`，不要写 `{formatLabel}`。 |
| Symbol | 不是官方 empty node | 开发环境警告，随后无可见内容 | 不作为 UI 文本；先转换为明确字符串。 |
| unsupported 普通对象 | 不是可显示文本 child | 抛出 `Objects are not valid as a React child` | 读取字段或显式格式化，不要直接写 `{record}`。 |

两个必须保留的准确区分：

1. `false`、`null`、`undefined` 是官方承认的 empty node；function / Symbol 是无效输入并有开发警告，
   不能因为它们当前也不显示就归到同一类。
2. 普通对象不是“静默忽略”，而是抛错；对象字段可以显示，对象作为某些 attribute 的值也可能合法，
   但这不能改变普通对象作为 child 的错误。

本地 `@types/react@19.2.18` 的 `ReactNode` 包含 string、number、bigint、Iterable、ReactPortal、Boolean、
`null`、`undefined` 与 Promise 等已知分支，不包含任意 function、Symbol 或普通对象。这个类型快照只能
说明当前仓库的静态检查边界；React 的运行期结论仍以上述官方文档与固定版本源码为准。

## 四、常用场景

### 场景 1：显示文本与数值

```tsx
const courseTitle = 'React Core'
const pendingCount = 0

const status = (
  <p>
    {courseTitle}：待处理 {pendingCount} 项
  </p>
)
```

string 和 number 可直接成为 child；`0` 会明确显示。

### 场景 2：给 attribute 传动态值

```tsx
const courseTitle = 'React Core'
const locked = false

const preview = (
  <button title={courseTitle} disabled={locked}>
    查看 {courseTitle}
  </button>
)
```

这里只观察“引号是静态字符串、花括号读取变量、Boolean expression 保持 Boolean 值”。`title`、
`disabled` 在 DOM 中的完整行为不从这个例子外推。

### 场景 3：显示对象中的字段或函数调用结果

```tsx
const course = { title: 'React Core' }

const formatTitle = (title: string) => title.toUpperCase()

const heading = <h2>{formatTitle(course.title)}</h2>
```

这里传入 child 的是字段 string 和调用结果 string，不是对象或函数本身。

## 五、易错点冻结

| 错误 | 触发条件 | 后果 | 正确方向 | 证据层级 |
| --- | --- | --- | --- | --- |
| `title="{value}"` | 把引号当作插值环境 | 得到字面字符串 `{value}` | `title={value}` | 官方公共事实 |
| child 写 `${value}` | 混淆模板字符串与 JSX | 不能按预期嵌入当前变量 | `{value}` | 官方事实 + 课程推导 |
| 花括号内直接写 `if` | 把 statement 当 expression | TSX 语法失败 | 先计算值；条件课再学完整模式 | JS / TSX 语法推导 |
| `disabled="false"` | 把字符串当 Boolean | 传入的值不是 `false` | `disabled={false}` | 官方语法事实 |
| 用 `{true}` / `{false}` 显示文字 | 混淆 Boolean child 与字符串 | 页面不出现 `true` / `false` | 需要文字时显式转成 string | 官方公共事实 |
| 把 `0` 当作空 child | 混淆 falsy 与 empty node | 页面显示 `0` | 条件先得到明确 Boolean | 官方公共事实 |
| 写 `{formatTitle}` | 把函数本身当调用结果 | 开发警告且不显示 | `{formatTitle(value)}` | 固定版本实现校准 |
| 写 `{course}` | 把普通对象当可见文本 | 运行期抛错 | `{course.title}` 或明确格式化 | 官方事实 + 固定源码 |

## 六、Demo 可观察目标

Demo 必须是静态、同源 TSX 观察页，不引入事件、State、组件教学或运行阶段说明。最小观察目标为：

1. 页面同时显示静态引号值与 `{courseTitle}` 的动态 child 结果。
2. `title={courseTitle}` 可通过原生提示观察动态字符串；只证明该示例，不讲 DOM Props 索引。
3. 并列放置 `disabled`、`disabled={true}`、`disabled={false}` 三个按钮，让学习者观察 Boolean 值差异；
   正文明确 DOM 映射细节留给 B18。
4. 用清晰分隔符展示 string、number `0`、`true`、`false`、`null`、`undefined`：文字和 `0` 可见，
   四类 empty node 的位置无文字。
5. 展示 `formatTitle(course.title)` 的结果，源码同时证明传入的是函数调用结果与对象字段。
6. 普通对象 child 会中断 Demo，function / Symbol 会制造预期 console warning，因此三者只放错误代码块和
   边界说明，不在正式 Demo 运行路径中。正常浏览器验收仍应保持零 error / warning。

Demo 不得添加 spread、动态 style、属性检查器、事件切换、State 计数器、错误边界或 Fiber / Element
可视化。这些都不是证明 B03 合同所必需。

## 七、正文写作与验收边界

- 正文主线固定为：花括号 expression -> 引号与动态 attribute -> Boolean attribute 输入值 -> child 值边界。
- B02 标记语法只用一句前置回顾，不重复单根、闭合、Fragment、注释或文本规则。
- “expression 可以求出某类值”与“该值在 attribute / child 位置合法”必须分开表述。
- function、Symbol、普通对象必须分别说明：开发警告、开发警告、抛错；不能合并成“都不显示”。
- 课程正文只写 React 公共规则与学习者判断；版本、访问状态、锁文件、固定源码和验收结果保留在调研或
  signoff，不进入面向学习者的正文。
- B03 调研、正文、Demo、临时验证、浏览器验收、独立复审与状态登记闭环前，不开始下一课。

## 研究结论

B03 可以在不展开 DOM Props、组件、Runtime、Element、render / commit 或 State 的前提下独立成课。
它的最小教学合同是：花括号提供 JavaScript expression；引号与花括号 attribute 传入不同值；无值
attribute 是 Boolean `true` 的语法简写；string 与 number child 可显示，Boolean / `null` / `undefined`
是官方 empty node，function / Symbol 是警告型无效 child，unsupported 普通对象 child 会抛错。

后续正文与 Demo 必须以此冻结范围为上限，不恢复旧记录中的 `style`、spread、DOM 命名/透传或 render
副作用内容。
