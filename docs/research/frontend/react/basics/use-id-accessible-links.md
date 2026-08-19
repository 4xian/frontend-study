# useId 与可访问关联研究记录

## 研究范围与冻结基线

- 课程 ID：`react.core.learn.basics.use-id-accessible-links`
- 标题：useId 与可访问关联
- 教学层级：本科基础
- 核验与访问日期：`2026-08-16`
- React 文档基线：React `19.2`
- React 固定文档提交：`reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- 仓库运行时基线：`react@19.2.8`、`react-dom@19.2.8`
- 写回边界：本轮只新增本研究文件，不修改课程正文、Demo、CSS、manifest、Track、计划、依赖或测试资产。

本记录只回答以下问题：`useId` 返回什么、在哪里调用，如何用一次调用派生同一组件实例内的多个关联
ID，多个实例为什么不会冲突，`label` / `htmlFor`、`aria-describedby` 和 `aria-labelledby` 如何通过 ID
引用建立关系，以及 SSR、hydration 和多 React root 下必须守住哪些前缀边界。

明确排除：完整表单状态、输入值控制、提交与 `FormData`、列表渲染教学、Ref 与命令式聚焦、hydration
实现教程、随机 UUID、数据库 ID、全局自增计数器、业务主键设计、ARIA 属性大全、可访问名称计算算法、
Server Components 全量教学，以及 React 内部 ID 编码格式。

## 研究方法与证据边界

1. 本课所需 React、WHATWG HTML、WAI-ARIA 与 MDN URL 均已知，按仓库规则直接用
   `curl -L --fail --silent --show-error` 回读官方页面；没有发生关键词搜索，因此无需调用 Tavily，也没有
   使用搜索摘要或二方文章支撑结论。
2. React Versions 页面说明 `react.dev` 提供最新 React 文档，当前 latest version 为 `19.2`，且官方不为
   每个 minor 或 patch 单独发布文档站。本稿把 React 19.2 公共文档合同与仓库 `package.json`、
   `package-lock.json` 中的 `19.2.8` 运行时基线分开记录。
3. React 公共事实同时固定到 `react.dev` 官方仓库提交
   `383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`；live 页面用于当前可读入口，固定提交用于防止后续页面更新
   让逐 claim 证据漂移。
4. `label` / `for` 关系回到 WHATWG HTML Living Standard；React 的 `htmlFor` 命名回到 React DOM
   Common Components。二者合并后才能得到“TSX 写 `htmlFor`，浏览器按 `for` 的 ID 关系关联控件”的完整
   合同。
5. `aria-describedby`、`aria-labelledby` 与 ID reference list 的语义回到 WAI-ARIA 1.2；列表分隔符由
   宿主语言决定。HTML 中多个 ID 的空格分隔写法回到 W3C WAI 的 HTML technique，并用 MDN 对相应属性
   的 Reference 交叉核验；MDN 只作补充，不单独承载教学 claim。
6. 本课把 `useId` 生成值严格定位为 DOM 元素关联用 ID。它不是数据记录身份、列表 key、URL 持久标识或
   数据库主键；课程不检查、解析或承诺返回字符串的内部格式。

## 官方来源卡

| ID | 规范 / 官方来源 URL | 本稿采用的事实 |
| --- | --- | --- |
| `R01` | [React Versions](https://react.dev/versions) | `react.dev` 当前 latest version 为 19.2；官方文档按 major 维护，不为每个 minor 或 patch 单独建站。 |
| `R02` | [`useId`](https://react.dev/reference/react/useId) | `useId` 的用途、返回值、顶层调用位置、多实例唯一性、共享前缀派生、SSR 树一致性、多 root 前缀、列表 key 与 async Server Components 限制。 |
| `R03` | [固定提交中的 `useId.md`](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useId.md) | 固定 `R02` 的全部核心公共合同，避免 live 页面漂移。 |
| `R04` | [`createRoot`](https://react.dev/reference/react-dom/client/createRoot)、[固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/client/createRoot.md) | `identifierPrefix` 为当前 root 中 `useId` 生成值加前缀，可避免同页多个 root 冲突。 |
| `R05` | [`hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot)、[固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/client/hydrateRoot.md) | hydration 需要客户端初始输出与服务端内容一致；`identifierPrefix` 必须与服务端使用的前缀相同。 |
| `R06` | [`renderToPipeableStream`](https://react.dev/reference/react-dom/server/renderToPipeableStream)、[固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/server/renderToPipeableStream.md) | 服务端 API 的 `identifierPrefix` 用于 `useId`，且必须与 `hydrateRoot` 的前缀相同。 |
| `R07` | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)、[固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/rules/rules-of-hooks.md) | Hook 只能在函数组件或自定义 Hook 顶层调用，不能放进条件、循环、嵌套函数或提前返回之后。 |
| `R08` | [`rules-of-hooks` lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks)、[固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/eslint-plugin-react-hooks/lints/rules-of-hooks.md) | React 依赖每次 render 完全相同的 Hook 调用集合与顺序来正确保留状态。 |
| `R09` | [React DOM Common Components](https://react.dev/reference/react-dom/components/common)、[固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react-dom/components/common.md) | `htmlFor` 等同 HTML `for`；`id` 应唯一并可用于连接元素，复用组件可用 `useId` 避免冲突。 |
| `H01` | [WHATWG HTML：The label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element) | `label` 的 `for` 值必须是同一树中可标记控件的 ID；匹配元素成为该 label 的 labeled control。 |
| `A01` | [WAI-ARIA 1.2：`aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby) | 该属性引用描述当前对象的一个或多个元素；值类型为 ID reference list。 |
| `A02` | [WAI-ARIA 1.2：`aria-labelledby`](https://www.w3.org/TR/wai-aria-1.2/#aria-labelledby) | 该属性引用标记当前元素的一个或多个元素；值类型为 ID reference list。 |
| `A03` | [WAI-ARIA 1.2：Value](https://www.w3.org/TR/wai-aria-1.2/#propcharacteristic_value) | ID reference 指向同一文档中另一个元素的 ID；ID reference list 是一个或多个此类引用。 |
| `A04` | [WAI-ARIA 1.2：State and Property Attribute Processing](https://www.w3.org/TR/wai-aria-1.2/#state_property_processing) | ID reference list 允许多个值；具体分隔符由宿主语言的列表属性语法决定。 |
| `W01` | [W3C WAI Technique ARIA9](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA9.html) | HTML 的 `aria-labelledby` 值使用空格分隔的 ID 列表；与 WAI-ARIA 的共同 ID reference list 类型合并后固定本课的 HTML 写法。 |
| `M01` | [MDN：`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby) | 补充核验 HTML 中一个 ID 或多个以空格分隔的 ID 组成描述引用列表，不单独作为 claim 依据。 |
| `M02` | [MDN：`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby) | 补充核验 HTML 中以空格分隔的一个或多个 ID 引用共同提供当前元素的可访问名称，不单独作为 claim 依据。 |

## 逐 claim 事实账本

| ID | 经官方来源核验的事实 | 证据 | 正文边界 |
| --- | --- | --- | --- |
| `C01` | `useId()` 不接收参数，返回与“当前组件中的这一次 `useId` 调用”关联的唯一 ID 字符串。 | `R02`、`R03` | 不展示或承诺内部字符串格式。 |
| `C02` | `useId` 是 Hook，只能在函数组件或自定义 Hook 顶层调用。 | `R02`、`R07` | “顶层”是 React 函数体顶层，不是文件顶层。 |
| `C03` | `useId` 不能放在条件、循环、事件处理器、嵌套函数或条件提前返回之后。 | `R02`、`R07` | 错误分支只用于规则对照，不实际运行。 |
| `C04` | React 期望每次 render 调用完全相同的 Hooks，并保持完全相同的顺序；条件调用 `useId` 会破坏这项合同。 | `R08` | 只复用已经学过的 Hooks 规则，不重讲 lint 或 Fiber。 |
| `C05` | 需要多个相关元素 ID 时，可以只调用一次 `useId`，把返回值作为共享前缀，再添加稳定后缀。 | `R02`、`R03` | 后缀表达局部用途，例如 `-input`、`-help`、`-error`；不是数据编码。 |
| `C06` | 同一个可复用组件在页面出现多次时，每个组件实例的 `useId` 值不会冲突。 | `R02`、`R03` | 唯一性用于 DOM 关联；不扩张成全局业务 ID 保证。 |
| `C07` | React DOM 的 `htmlFor` 对应 HTML `for`，其值用于把 `label` 与控件关联。 | `R09`、`H01` | TSX 示例必须写 `htmlFor`，不能写 `for`。 |
| `C08` | HTML `label[for]` 的值必须匹配同一树中 labelable element 的 `id`；匹配的控件成为 labeled control。 | `H01` | 不把 `name`、placeholder、显示文本或变量名误当关联目标。 |
| `C09` | `aria-describedby` 通过一个或多个元素 ID 为当前对象建立描述关系，引用元素共同组成描述。 | `A01`、`A03` | 帮助文本与错误文本只讲 ID 关系，不展开完整描述计算算法。 |
| `C10` | `aria-labelledby` 通过一个或多个元素 ID 为当前元素建立命名关系。 | `A02`、`A03` | 与原生 `label` 作概念对比即可，不把基础输入全部改写成 ARIA。 |
| `C11` | 在 HTML 中，多个 `aria-describedby` 或 `aria-labelledby` 引用写成空格分隔的 ID 列表。 | `A01`、`A02`、`A03`、`A04`、`W01`；`M01`、`M02` 仅交叉核验 | 不用逗号、数组、CSS 选择器或 `#id`。 |
| `C12` | WAI-ARIA 区分“label 提供简洁名称”和“description 提供更详细信息”；两种属性都引用其它元素，但职责不同。 | `A01`、`A02` | 不讲名称优先级和全部可访问名称来源。 |
| `C13` | 错误出现时，可把 `aria-describedby` 从 `helpId` 改为 `` `${helpId} ${errorId}` ``；错误消失时恢复为 `helpId`。变化的是普通字符串，不是 Hook 调用数量。 | `C04`、`C09`、`C11` 的直接应用 | 只做最小布尔切换，不实现完整验证或表单状态。 |
| `C14` | SSR 场景下，`useId` 要求服务端和客户端渲染相同的组件树；树不一致时，生成 ID 也不会匹配。 | `R02`、`R03` | 不把 `useId` 说成可以修复任意 hydration mismatch。 |
| `C15` | `hydrateRoot` 要求客户端初始渲染内容与服务端输出一致，应把 mismatch 当作 bug 修复。 | `R05` | 只交代合同，不教 SSR 环境搭建、流式传输或 mismatch 修复流程。 |
| `C16` | React 官方解释中，`useId` 基于调用组件的 parent path，使相同服务端/客户端树即使渲染顺序不同也能得到匹配输出。 | `R02`、`R03` | parent path 只作解释，不教内部编码、Fiber 或可依赖的字符串结构。 |
| `C17` | 同一页面存在多个独立 React root 时，可为每个 `createRoot` / `hydrateRoot` 配置不同 `identifierPrefix`，避免不同 root 的 `useId` 值冲突。 | `R02`、`R04`、`R05` | 这是 root 级边界，不在每个组件手工拼应用前缀。 |
| `C18` | 对应 root 如果经过服务端渲染，服务端渲染 API 与客户端 `hydrateRoot` 必须使用相同 `identifierPrefix`。 | `R02`、`R05`、`R06` | 不把“不同 root 前缀应区分”误写成“同一 root 的服务端和客户端也应不同”。 |
| `C19` | 页面只有一个 React 应用时，React 官方说明不必传 `identifierPrefix`。 | `R02`、`R03` | 不为普通单 root Demo 修改应用启动代码。 |
| `C20` | `useId` 不应用来生成列表 key；列表 key 应来自数据。 | `R02`、`R03` | 只保留一条负面规则，不展开列表渲染。 |
| `C21` | React 19.2 当前不支持在 async Server Components 中使用 `useId`。 | `R02`、`R03` | 只记录限制，不展示或改造 Server Component。 |

## 核心教学结论

### 1. `useId` 生成关联 ID，不生成数据身份

`useId()` 的最小心智模型是：在组件顶层调用一次，得到属于当前组件实例、当前调用位置的唯一字符串，把它
交给 DOM `id` 和引用该 ID 的属性。它解决的是可复用组件在同一页面出现多次时，硬编码 DOM ID 发生碰撞
的问题。

课程不得把这个值命名成 `courseKey`、`recordId` 或 `databaseId`，也不得保存到后端、URL、LocalStorage
或业务数据中。列表 key 和数据主键都必须来自各自的数据合同，而不是 `useId`。

### 2. 一次调用可以派生一组相关 ID

对一个带帮助和错误说明的字段，推荐在组件顶层只调用一次：

```tsx
const idPrefix = useId()
const inputId = `${idPrefix}-input`
const helpId = `${idPrefix}-help`
const errorId = `${idPrefix}-error`
```

`input`、`help`、`error` 是固定的局部角色后缀。它们让代码可读，并且保留组件实例之间的唯一性。每个
render 都无条件执行同一个 `useId`；是否显示错误只改变普通派生字符串和 JSX，不改变 Hook 调用顺序。

为每个关联元素各调用一次 `useId` 并非官方判定的错误，但本课应采用“一次调用加稳定后缀”的官方用法，
让同一字段的 ID 关系更清晰，也避免把多个 Hook 调用误放进条件分支。

### 3. `htmlFor`、名称与描述是三种不同责任

对普通输入，优先使用原生 `label`：

```tsx
<label htmlFor={inputId}>课程邮箱</label>
<input id={inputId} aria-describedby={helpId} />
<p id={helpId}>请输入学校提供的邮箱。</p>
```

- `htmlFor={inputId}` 与 `id={inputId}` 把可见 label 关联到输入控件；关联目标不是 `name`。
- `aria-labelledby` 引用提供当前元素名称的元素 ID；本课只解释这种 IDREF 关系，不用它替换已有的原生
  `label` 示例。
- `aria-describedby` 引用提供补充说明的元素 ID；帮助文本和错误文本可以同时出现在空格分隔的引用列表中。

当错误显示时，`aria-describedby` 应只引用当前真实存在的描述节点：

```tsx
const describedBy = hasError ? `${helpId} ${errorId}` : helpId
```

不能写成 `${helpId},${errorId}`、`#${helpId} #${errorId}`，也不能把字符串数组直接传给属性。错误节点被
移除时，也要同步从 ID reference list 中移除 `errorId`。

### 4. 多实例与多 root 是两个层级

在一个 React root 内，两个并列 `<AccessibleField />` 各自在顶层调用 `useId`，其派生的 `inputId`、
`helpId`、`errorId` 不会冲突。这是主 Demo 必须直接呈现的层级。

如果同一 HTML 页面挂载多个彼此独立的 React root，则 root 边界需要 `identifierPrefix`。纯客户端 root
可以为不同 root 设置不同前缀；SSR root 还必须保证服务端 API 和对应客户端 `hydrateRoot` 使用相同前缀。
单 root 课程 Demo 不需要修改 `createRoot` 配置。

### 5. SSR 一致性有两个前提

`useId` 支持服务端渲染不等于“任何服务端和客户端输出都会自动一致”。必须同时守住：

1. 服务端和客户端渲染相同组件树，使同一 `useId` 调用拥有相同组件路径。
2. 如果使用 `identifierPrefix`，同一 root 的服务端与客户端配置完全相同。

课程可用下面的静态边界片段说明第二点，但不把它接入主 Demo，也不展开 hydration 实现：

```tsx
// 服务端与对应客户端 root 使用同一个前缀。
renderToPipeableStream(<App />, { identifierPrefix: 'course-app-' })
hydrateRoot(container, <App />, { identifierPrefix: 'course-app-' })
```

parent path 只用于回答“为什么不依赖全局自增计数器也能匹配”的概念问题。学习者不应读取、拆分或用 CSS
选择器依赖 `useId` 的内部字符串格式。

## 高价值易错点矩阵

| 错误 | 为什么不成立 | 可观察后果 | 最小修正 | 来源 |
| --- | --- | --- | --- | --- |
| 在可复用字段中硬编码 `id="email"` | 同一组件可出现多次，但 DOM ID 应唯一 | 多个 label / 描述可能指向同名目标 | 在字段组件顶层调用 `useId` | `C01`、`C06` |
| 在 `if (hasError)` 中调用第二个 `useId` | 错误状态会改变 Hook 调用集合与顺序 | Rules of Hooks 违规，后续 Hook 位置可能错配 | 始终调用一次，并无条件派生 `errorId` | `C03`、`C04`、`C05` |
| 在点击处理器中调用 `useId` | 事件处理器不是组件或自定义 Hook 顶层 | Invalid hook call 或规则检查失败 | render 顶层生成 ID，处理器只更新已有状态 | `C02`、`C03` |
| 为 `input`、`help`、`error` 各写独立硬编码 ID | 组件实例重复时整组冲突 | 关联串到另一个实例 | 一个 `useId` 前缀加三个固定后缀 | `C05`、`C06` |
| `htmlFor={fieldName}`，但 `input id={inputId}` | `htmlFor` 按 ID 匹配，不按 `name` 或变量语义匹配 | 可见 label 没有关联到目标控件 | `htmlFor` 与控件 `id` 使用同一个 `inputId` | `C07`、`C08` |
| `` aria-describedby={`${helpId},${errorId}`} `` | HTML ID reference list 不是逗号分隔 | 整个引用可能无法解析为两个目标 | 使用 `${helpId} ${errorId}` | `C09`、`C11` |
| `` aria-describedby={`#${helpId}`} `` | ID reference 值不是 CSS 选择器 | 找不到实际描述元素 | 直接传 ID 字符串，不加 `#` | `C09`、`C11` |
| 错误节点已移除，属性仍保留 `errorId` | ID reference 指向当前文档中的元素 | 关系悬空，错误描述不可用 | 错误消失时恢复为仅 `helpId` | `C09`、`C13` |
| 用 `aria-labelledby` 统一替代普通输入的原生 label | 混淆平台标记机制与 ARIA IDREF | 基础示例不必要地复杂化 | 普通输入先用 `label` / `htmlFor`；只讲 ARIA 的补充边界 | `C07`、`C08`、`C10` |
| 把帮助文本当名称，或把 label 当长描述 | 名称与描述承担不同职责 | 可访问文本结构难以理解 | 简洁名称用 label；补充说明用 description | `C09`、`C10`、`C12` |
| 用 `useId()` 作为列表 `key` | DOM 关联 ID 不是数据身份 | key 不能表达数据项在列表中的稳定身份 | key 来自数据；本课不展开列表实现 | `C20` |
| 把 `useId` 保存为数据库 ID 或发送给后端 | 官方只承诺关联当前调用与组件的生成 ID | 业务身份与 render 生命周期错误耦合 | 业务 ID 由数据层生成 | `C01`、`C20`、`C21` |
| SSR 时服务端与客户端渲染不同组件树 | `useId` 的匹配依赖相同树 | 生成 ID 与 hydration 输出不匹配 | 修复树与初始输出差异 | `C14`、`C15`、`C16` |
| 同一 SSR root 两端使用不同 `identifierPrefix` | 对应 root 的前缀必须一致 | 服务端与客户端 ID 不同 | 两端复用同一前缀配置 | `C18` |
| 同页多个独立 root 全部复用同一显式前缀 | 前缀失去 root 间隔离作用 | 不同 root 的 ID 仍可能冲突 | 不同 root 使用不同前缀；对应 SSR 两端保持相同 | `C17`、`C18` |
| 在 async Server Component 中调用 `useId` | React 19.2 当前不支持 | 代码不符合当前 API 限制 | 把本课 Demo 保持为普通客户端组件 | `C21` |

## 正文编写合同

### 必须覆盖

1. 从“可复用组件被渲染两次，硬编码 ID 会碰撞”进入问题，不从随机数或数据库 ID 开场。
2. 给出 `const id = useId()`，解释无参数、返回唯一 ID 字符串，以及组件 / 自定义 Hook 顶层调用位置。
3. 明确复用 Hooks 规则：不在条件、循环、事件处理器或提前返回之后调用；每次 render 保持相同调用顺序。
4. 用一个 `useId` 前缀派生 `inputId`、`helpId`、`errorId`，不为三个元素分别设计业务 ID。
5. 用 `label htmlFor={inputId}` 与 `input id={inputId}` 讲清原生 label 关联。
6. 对比 `aria-labelledby` 的“名称引用”和 `aria-describedby` 的“描述引用”，两者都使用一个或多个 IDREF；
   多个 HTML ID 以空格分隔。
7. 展示错误切换时 `aria-describedby` 在 `helpId` 与 `` `${helpId} ${errorId}` `` 之间变化，同时保持
   `useId` 无条件调用。
8. 展示两个并列组件实例，直接观察整组 ID 不冲突。
9. 用一个短小边界小节说明相同服务端 / 客户端组件树、多 root `identifierPrefix`，以及 SSR 两端前缀
   一致；不实现 SSR。
10. 明确列出“不得用于列表 key”和“当前不能用于 async Server Components”两项官方限制。
11. 正文包含易错点、最小练习、小结和官方来源；练习只让学习者修正关联与 Hook 位置，不扩展成表单项目。

### 推荐叙事顺序

1. 硬编码 ID 在单实例看似正常，在双实例中发生冲突。
2. `useId` 的签名、返回值和 Hook 调用规则。
3. 一个前缀派生三个局部 ID。
4. 原生 label 关联与 ARIA 名称 / 描述 IDREF。
5. 错误出现时组合描述列表。
6. 多实例唯一性。
7. SSR 与多 root 的配置边界。
8. key、业务 ID 和 async Server Component 负边界。

### 正文禁止出现

- 课程编号、计划、批次、Gate、构建、测试、浏览器验收、复审、signoff 或研究执行叙事。
- 完整受控 / 非受控表单、提交、`FormData`、验证库、服务端 action 或表单状态架构。
- 列表 `map` 实现、key 教程、排序 / 增删列表；只保留“`useId` 不作 key”的警告。
- `useRef`、回调 Ref、DOM 查询、程序化 focus 或命令式控件操作。
- SSR 项目搭建、流式响应、hydration 失败复现与修复教程、React Server Components 架构。
- `crypto.randomUUID()`、UUID 库、全局计数器方案、数据库自增 ID、分布式 ID 或业务主键生成。
- ARIA role / state / property 全量枚举、可访问名称算法优先级、屏幕阅读器产品差异。
- React 内部 parent path 编码、Fiber、冒号格式、字符串解析或基于生成 ID 的 CSS 选择器。

## Demo 合同

### 目标与稳定身份

- 推荐 Demo ID：`react.core.learn.basics.use-id-accessible-links.accessible-field-demo`。
- 主体只包含一个 `AccessibleField` 组件和一个负责错误开关的最小外层组件。
- 页面直接并列渲染两个 `AccessibleField`，不通过数组或 `map` 创建，避免引入列表 key 教学。
- 每个 `AccessibleField` 只在顶层调用一次 `useId`，并派生 `inputId`、`helpId`、`errorId`。

### 最小结构

```tsx
import { useId, useState } from 'react'

type AccessibleFieldProps = {
  label: string
  help: string
  error: string
  hasError: boolean
}

/** 渲染一组具有唯一名称与描述关联的输入元素。 */
function AccessibleField({ label, help, error, hasError }: AccessibleFieldProps) {
  const idPrefix = useId()
  const inputId = `${idPrefix}-input`
  const helpId = `${idPrefix}-help`
  const errorId = `${idPrefix}-error`
  const describedBy = hasError ? `${helpId} ${errorId}` : helpId

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-describedby={describedBy} />
      <p id={helpId}>{help}</p>
      {hasError ? <p id={errorId}>{error}</p> : null}
      <dl>
        <dt>输入 ID</dt>
        <dd><code>{inputId}</code></dd>
        <dt>帮助 ID</dt>
        <dd><code>{helpId}</code></dd>
        <dt>错误 ID</dt>
        <dd><code>{errorId}</code></dd>
        <dt>当前描述关联</dt>
        <dd><code>{describedBy}</code></dd>
      </dl>
    </div>
  )
}

/** 展示两个实例，并统一切换错误描述是否参与关联。 */
export default function AccessibleFieldDemo() {
  const [showErrors, setShowErrors] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setShowErrors((visible) => !visible)}>
        {showErrors ? '隐藏错误' : '显示错误'}
      </button>
      <div>
        <AccessibleField
          label="课程邮箱"
          help="请输入学校提供的邮箱。"
          error="邮箱格式不完整。"
          hasError={showErrors}
        />
        <AccessibleField
          label="联系邮箱"
          help="用于接收课程通知。"
          error="邮箱格式不完整。"
          hasError={showErrors}
        />
      </div>
    </>
  )
}
```

该结构只冻结语义和交互合同，不要求实现者逐字复制展示文本或 DOM 包装。实际代码中每个前端函数定义上方
继续保留规范中文注释。

### 必须可观察

1. 初始状态下两个输入都只通过各自的 `helpId` 获得描述。
2. 两个实例的 `inputId`、`helpId`、`errorId` 分别不同，label 不会串到另一个实例。
3. 点击“显示错误”后，每个输入的 `aria-describedby` 都变为“当前实例的 help ID + 空格 + 当前实例的
   error ID”，且对应错误节点存在。
4. 点击“隐藏错误”后，错误节点消失，`aria-describedby` 同步恢复为仅当前实例的 help ID。
5. 状态切换前后 `useId` 调用数量与顺序不变；错误 JSX 可以条件渲染，Hook 不可以条件调用。
6. 页面可显示当前 `aria-describedby` 字符串，帮助学习者观察组合变化，但不得把 ID 解释为业务数据。

### 实现限制

- 不把输入做成完整受控表单，不读取或提交输入值，不实现校验器、`FormData` 或后端请求。
- 不使用数组、`map` 或 `useId` 生成 key；两个实例直接写在 JSX 中。
- 不使用 Ref、`querySelector`、`getElementById`、程序化 focus 或 DOM mutation 验证关联。
- 不修改应用 `createRoot` / `hydrateRoot` 配置；多 root 和 SSR 只出现在正文边界说明中。
- 不使用随机数、UUID、时间戳、模块级计数器、数据库 ID 或用户输入生成 DOM 关联 ID。
- 不依赖 `useId` 字符串外观，不把它拼进 CSS selector、URL 或持久化数据。
- 不扩展 `aria-invalid`、live region、role 或全量错误播报策略；本 Demo 只验证 IDREF 组合。
- 样式只使用 Flexbox、margin 与普通文档流，不使用 CSS Grid 或 `gap`；两个实例在窄视口可自然换行。
- 运行组件与展示源码保持同源；不新增持久测试、fixture 或浏览器产物。

## 明确负边界与不采用结论

1. “`useId` 生成随机 UUID”不采用。官方只承诺与特定组件、特定调用关联的唯一字符串，不承诺 UUID
   算法或格式。
2. “`useId` 可以替代数据库主键、业务 ID 或列表 key”不采用。官方明确排除列表 key；本课将其严格限定
   为 DOM 关联。
3. “每个元素都必须各调用一次 `useId`”不采用。官方专门给出一次调用作为共享前缀、再派生多个相关 ID
   的用法。
4. “只有使用 ARIA 才能给输入命名”不采用。HTML `label` / `for` 是原生标记机制；本课用它作为普通
   输入的主路径。
5. “`aria-labelledby` 和 `aria-describedby` 可以互换”不采用。前者建立名称，后者建立更详细的描述。
6. “多个 ID 用逗号、数组或 CSS selector 表达”不采用。HTML 中使用空格分隔的 ID reference list。
7. “错误节点隐藏后可以继续保留悬空引用”不采用。属性应只引用当前存在并承担描述职责的元素。
8. “`useId` 放进条件里，只要当前看起来调用一次就安全”不采用。Hook 集合和顺序必须跨 render 稳定。
9. “`useId` 会自动修复服务端和客户端组件树差异”不采用。官方要求树与初始输出一致。
10. “同一 SSR root 的服务端和客户端应该使用不同前缀来保证唯一”不采用。对应 root 两端必须使用相同
    `identifierPrefix`；不同独立 root 才需要彼此区分。
11. “所有应用都必须设置 `identifierPrefix`”不采用。单 React 应用不需要显式前缀。
12. “当前可以在 async Server Components 中调用 `useId`”不采用。React 19.2 官方仍明确列为不支持。
13. “必须通过 Ref 或 DOM 查询证明关联”不采用。关联合同由匹配的 `id` / IDREF 建立，本课不引入命令式
    DOM 操作。
14. “讲错误描述就必须顺带完成表单校验课程”不采用。错误开关只用于观察 ID reference list 变化。
15. “应教学习者解析 `useId` 的冒号或 parent path”不采用。内部字符串结构不是公共应用合同。

## 写作与交付自检合同

- 每条教学事实必须能回到规范或一手官方来源；MDN 只作补充核验，不使用搜索摘要、二方文章或未核验推断。
- 正文只使用简体中文，TSX 示例保持本科基础可读性；示例函数定义上方使用规范中文注释。
- 正文不得出现课程编号、计划、批次、构建、测试、浏览器验收或复审叙事。
- 课程正文与 Demo 必须遵守本稿的内容边界，不开始表单、列表、Ref、SSR 实现或 ARIA 全量课程。
- 本研究轮只对本文件运行聚焦 Prettier 与 Git whitespace 检查，不运行构建或项目级测试。
- 不执行 `git add`、commit、push、stash、reset、cleanup，也不触碰任何并行修改。
- 研究完成即停止；不授权课程正文、Demo、manifest、Track、计划写回或后续课程。
