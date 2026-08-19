# 事件处理研究记录

## 一、冻结范围与版本

- 课程 ID：`react.core.learn.basics.event-handling`
- 标题：事件处理
- 路线位置：`B13`
- 计划动作：复用并去重
- 核验日期：`2026-08-16`
- 研究状态：官方调研完成；后续 B13 实施必须遵守本文处置合同
- 版本基线：React 文档 `19.2`、React / React DOM `19.2.8`、`@types/react` `19.2.18`

新路线只包含以下八项：

1. 把 handler 传给事件 prop，而不是在 render 时调用。
2. React 事件对象的公共字段与方法。
3. click 的 capture、target 与冒泡顺序。
4. `stopPropagation()` 的传播边界。
5. `preventDefault()` 的默认行为边界。
6. React DOM 事件的 TypeScript 类型。
7. 自定义组件的 handler prop。
8. render 与事件发生时机的最小区别。

以下内容不进入本课：`useState` 教学、State 更新模型、快照、队列、批处理、对象或数组更新、受控输入、
表单与 submit 专题、Hook、Effect、性能优化、函数身份、事件插件、事件委托、根级监听、事件优先级以及
其他 React DOM 内部实现。标题继续保持“事件处理”，不得改成 SyntheticEvent 或事件系统。

## 二、核验方法

1. 先调用 Tavily 检索官方候选，接口返回套餐用量上限；按仓库顺位改用 Exa，只用其定位候选 URL。
2. 候选结论随后逐项回到 React `19.2` 官方文档、固定 React 文档提交、
   `@types/react@19.2.18`、DOM Living Standard、HTML Living Standard 与 TypeScript 官方文档核验。
3. React 版本页说明当前文档对应 React `19.2`。React / React DOM `19.2.8` 仍是运行时版本基线，
   但公共文档已经足以回答本课问题，因此没有用固定运行时源码或测试推导教学结论。
4. `@types/react` 只固定静态类型合同；DOM 与 HTML Standard 固定事件传播、取消和超链接默认动作。
5. 搜索摘要、社区文章、MDN、旧版 React 教程和当前仓库实现都不单独充当课程事实来源。

## 三、一手来源

| ID | 一手来源 | 适用范围 | 本课实际采用的事实 |
| --- | --- | --- | --- |
| `R00` | [React Versions](https://react.dev/versions#latest-version) | React 文档 | 当前文档对应 React `19.2`。 |
| `R01` | [Responding to Events](https://react.dev/learn/responding-to-events) | React `19.2` | handler 传递、自定义 handler prop、传播、capture、stop、prevent 和事件时机。 |
| `R01-fixed` | [固定 Responding to Events](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md) | 文档提交 `c7d6b700...` | 固定 `R01` 的具体文字与示例。 |
| `R02` | [React event object](https://react.dev/reference/react-dom/components/common#react-event-object) | React DOM `19.2` | React 事件对象、公共字段和方法、`nativeEvent` 非稳定映射边界。 |
| `R02-fixed` | [固定 common event reference](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md) | 文档提交 `c7d6b700...` | 固定 `onClickCapture`、`onScroll` 和事件对象 Reference。 |
| `R03` | [Using TypeScript: DOM Events](https://react.dev/learn/typescript#typing-dom-events) | React `19.2` | 内联 handler 推断与抽取 handler 的显式事件类型。 |
| `R03-fixed` | [固定 Using TypeScript](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/typescript.md#L390-L426) | 文档提交 `c7d6b700...` | 固定 DOM 事件类型说明。 |
| `R04` | [`@types/react@19.2.18`](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts) | 固定类型声明 | `SyntheticEvent`、`MouseEventHandler`、`onClick`、`onClickCapture` 与目标类型。 |
| `R05` | [DOM Event](https://dom.spec.whatwg.org/#interface-event) | DOM Living Standard | `target`、`currentTarget`、事件阶段、停止传播、取消与 `defaultPrevented`。 |
| `R05-fixed` | [固定 DOM Standard](https://github.com/whatwg/dom/blob/8a5f57c61ca1de8dc21b7e114501b1b57882e935/dom.bs#L545-L573) | DOM Standard 固定提交 | 固定 stop 与 prevent 的规范步骤。 |
| `R06` | [Links created by `a` and `area`](https://html.spec.whatwg.org/multipage/links.html#links-created-by-a-and-area-elements) | HTML Living Standard | 带 `href` 的链接激活会跟随超链接或下载。 |
| `R07` | [TypeScript contextual typing](https://www.typescriptlang.org/docs/handbook/type-inference.html#contextual-typing) | TypeScript 官方文档 | 函数表达式可以从所在位置取得上下文类型。 |
| `R07-fixed` | [固定 Type Inference](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/reference/Type%20Inference.md#L76-L90) | TypeScript 文档固定提交 | 固定 contextual typing 的定义。 |

不再采用旧研究中的 `SyntheticEvent.js`、`DOMPluginEventSystem.js`、纯度规则页面和四个 MDN 页面作为
本课来源。前两项属于明确排除的内部实现；纯度已经由前一课负责，本课只保留事件时机边界；其余事实由
React Reference 与 Web Standards 直接覆盖。

## 四、逐 claim 事实账本

| ID | 官方事实 | 证据 | B13 教学决策 |
| --- | --- | --- | --- |
| `C01` | React 事件处理函数是传给 JSX 事件 prop 的函数，交互发生后才触发。 | [`R01-fixed` 第 92-100 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L92-L100) | 用 click 建立最小模型。 |
| `C02` | `onClick={handleClick()}` 会在 render 时立即求值；`onClick={handleClick}` 才是传递函数。 | [`R01-fixed` 第 92-121 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L92-L121) | 必须保留“传递而非调用”及带参数包装函数。 |
| `C03` | 命名 handler 与短内联 handler 都是官方支持的写法。 | `R01` | 只按可读性和复用选择，不讨论函数身份或性能。 |
| `C04` | 内置元素只支持其 React DOM 事件名；自定义组件可以自定义 handler prop 名，惯例是 `on` 加大写字母。 | [`R01-fixed` 第 232-272 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L232-L272) | 保留 `onOpenCourse: () => void` 一类领域动作合同。 |
| `C05` | 自定义组件收到 handler prop 后，必须显式调用或传给内部交互元素；明确调用回调也是传播的替代方案。 | [`R01-fixed` 第 191-230 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L191-L230)、[第 446-465 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L446-L465) | 不把任意 `onXxx` prop 写成 React 会自动触发的事件。 |
| `C06` | React handler 接收 React event object，也称 synthetic event；它实现常用 DOM Event 接口。 | [`R02-fixed` 第 287-303 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md#L287-L303) | 只介绍本课会读取的公共字段和方法。 |
| `C07` | `nativeEvent` 暴露底层事件，但 React 事件与原生事件的具体映射不是公共 API。 | [`R02-fixed` 第 297-316 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md#L297-L316) | 最多保留一句边界，不写映射示例或独立章节。 |
| `C08` | `target` 是事件实际发生的节点；`currentTarget` 是当前 handler 所附着的节点，两者可能不同。 | [`R02-fixed` 第 303-316 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md#L303-L316)、[`R05`](https://dom.spec.whatwg.org/#dom-event-currenttarget) | 点击嵌套 `span` 说明差异；读按钮自身属性时使用 `currentTarget`。 |
| `C09` | `@types/react@19.2.18` 把 `SyntheticEvent<T>` 的 `currentTarget` 建模为 `EventTarget & T`，`target` 保持 `EventTarget`。 | [`R04` 第 2029-2054 行](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts#L2029-L2054) | 不通过未经证明的断言把 `target` 当成按钮。 |
| `C10` | JSX 内联 handler 通常由事件 prop 上下文推断参数类型；抽取函数后应显式标注事件类型。 | [`R03-fixed` 第 390-426 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/typescript.md#L390-L426)、`R07` | 保留内联推断与抽取标注两个层次。 |
| `C11` | `MouseEventHandler<T>` 接收 `MouseEvent<T>`；`onClick` 与 `onClickCapture` 都使用该 handler 类型。 | [`R04` 第 2231-2252 行](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts#L2231-L2252)、[第 2381-2385 行](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts#L2381-L2385) | 只教学 `MouseEvent<HTMLButtonElement>` 与 `MouseEventHandler<HTMLButtonElement>`，不列举表单类型。 |
| `C12` | click 从实际目标向祖先传播；目标 handler 先于祖先普通 `onClick`。 | [`R01-fixed` 第 323-362 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L323-L362) | 所有顺序图都明确限定为 click，不能写成任意事件的统一算法。 |
| `C13` | React 文档明确指出 `onScroll` 不冒泡，只在绑定它的 JSX 元素上工作。 | [`R02-fixed` 第 131-136 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md#L131-L136) | 只保留一句反例，不展开事件类型目录。 |
| `C14` | click 的教学顺序是祖先 `onClickCapture` 从外向内、目标 `onClick`、普通 `onClick` 从内向外。 | [`R01-fixed` 第 425-442 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L425-L442) | 保留三阶段顺序；不得把 capture 写成无条件绕过所有停止传播。 |
| `C15` | `stopPropagation()` 停止事件继续通过 React tree；它不取消浏览器默认动作。 | [`R01-fixed` 第 366-421 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L366-L421)、[`R02-fixed` 第 320-329 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md#L320-L329)、`R05-fixed` | 说明目标阶段调用 stop 不会撤销此前已运行的祖先 capture。 |
| `C16` | `preventDefault()` 请求取消可取消事件的默认动作；成功后 `defaultPrevented` 为 `true`。 | [`R02-fixed` 第 303-329 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md#L303-L329)、[`R05`](https://dom.spec.whatwg.org/#dom-event-preventdefault) | 只教学 `cancelable` 与 `defaultPrevented`，passive listener 留在课外。 |
| `C17` | `stopPropagation()` 与 `preventDefault()` 控制不同事情，互不替代。 | [`R01-fixed` 第 467-517 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L467-L517) | 必须用独立观察结果对照传播与默认动作。 |
| `C18` | 带 `href` 的 `a` 元素激活会跟随超链接或下载。 | `R06`、[Following hyperlinks](https://html.spec.whatwg.org/multipage/links.html#following-hyperlinks) | 本课用链接演示 prevent，表单提交全部移到表单专题。 |
| `C19` | React 官方把交互 handler 与 render 区分：handler 可以执行由该交互触发的副作用，render 时不应提前调用它。 | [`R01-fixed` 第 98-121 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L98-L121)、[第 519-523 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md#L519-L523) | 合并成一个时机边界，不重讲组件纯度，不引入 State 或 Effect。 |
| `C20` | React DOM Reference 公开了 `persist()` 不用于 React DOM，但这是历史兼容信息，不是完成本课目标的必要条件。 | [`R02-fixed` 第 325-334 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md#L325-L334) | 删除池化、`persist()` 和异步保存事件对象教学，避免把历史兼容升级为主线。 |

## 五、事实结论与教学边界

### 1. handler 的核心是“稍后执行”

正文先建立“render 传函数，交互发生后 React 调函数”的时间线，再说明传函数引用、短内联 handler 和
带参数包装函数。现有关于“内联函数每次 render 创建”以及是否影响性能的段落必须删除；它既不影响
事件语法正确性，也属于明确排除的性能和函数身份话题。

### 2. 自定义 handler prop 是组件合同，不是浏览器事件注册

保留领域名称、`on` 加大写字母惯例，以及组件内部显式映射到真实交互元素。默认用 `() => void` 表达
领域动作；只有调用方确实需要 React click 对象时才把事件类型纳入 prop 合同。不要顺带展开设计系统、
键盘快捷键或完整可访问性专题。

### 3. 事件对象只讲完成本课判断所需的公共表面

保留 `target`、`currentTarget`、`cancelable`、`defaultPrevented`、`stopPropagation()` 与
`preventDefault()`。`nativeEvent` 只用一句说明映射不是公共 API。删除异步读取 `currentTarget`、事件池、
`persist()`、原生构造器判断以及内部派发时怎样设置和清空字段。

### 4. 传播顺序必须限定为 click 示例

保留 `onClickCapture -> 目标 onClick -> 祖先 onClick`，并说明目标阶段 stop 不会撤销已经运行的 capture。
保留 `onScroll` 不冒泡这一句，阻止学习者把 click 顺序泛化到所有事件；其他事件族的特殊传播语义不在
本课展开。

### 5. 传播与默认行为是两条独立控制链

保留 stop 与 prevent 对照，并继续用真实 `href` 链接观察默认导航。删除 submit、`FormEvent`、表单刷新
和受控输入例子；这些内容统一移动到 `form-submit-and-default-behavior` 或受控表单课程。

### 6. TypeScript 只建立两种直接写法

内联 handler 依靠上下文推断；抽取的 click handler 使用 `MouseEvent<HTMLButtonElement>`，需要约束整个
函数时使用 `MouseEventHandler<HTMLButtonElement>`。删除 `onChange` 示例、`ChangeEvent`、`FormEvent`
枚举和 `ComponentProps<'button'>['onClick']` 推导，避免把本课扩成表单或类型工具课。

### 7. render / 事件时机不再形成独立纯度课程

保留“不要在 render 时调用交互逻辑；用户明确触发的副作用可以放进对应 handler”两句即可。现有独立
纯 render 章节、`navigator.share` 示例和纯度 Reference 应合并删除，组件纯度由既有课程负责。

## 六、高价值易错点

| 错误 | 触发条件 | 后果 | B13 正确处理 | 证据 |
| --- | --- | --- | --- | --- |
| render 时调用 handler | `onClick={openCourse(id)}` | 用户交互前已经执行 | 传函数，带参数时传包装函数 | `C02` |
| 包装函数只返回目标函数 | `onClick={() => handleClick}` | 点击后没有调用目标逻辑 | 函数体中写 `handleClick()` | `C01`、`C02` |
| 从 `target` 读取按钮字段 | 点击按钮内的后代元素 | 类型和运行结果都不保证是按钮 | 读取 `currentTarget` | `C08`、`C09` |
| 把 stop 当 prevent | 想阻止链接导航却只 stop | 传播停止，默认动作仍可发生 | 对默认动作调用 prevent | `C15`、`C17` |
| 把 prevent 当 stop | 想隔离父级 handler 却只 prevent | 父级仍收到冒泡事件 | 确有边界需要时调用 stop | `C16`、`C17` |
| 自定义 prop 未映射 | 组件接收 `onOpenCourse` 后不使用 | 调用方回调永远不执行 | 在组件内调用或传给内置元素 | `C04`、`C05` |
| 把 click 顺序推广到所有事件 | 依赖祖先 `onScroll` 接收后代滚动 | handler 不会按预期执行 | 将三阶段结论限定为 click | `C12` 至 `C14` |

不再把返回 `false`、事件池、异步 `currentTarget`、`nativeEvent.constructor` 和 render 性能拆成 B13
pitfall。它们会挤压单知识点主线，其中池化和内部映射还会诱导学习者依赖历史或非公共实现。

## 七、现有课程正文处置合同

| 现有内容 | 处置 | 精确要求 |
| --- | --- | --- |
| 标题与稳定 ID | 保留 | 左侧标题、一级标题继续使用“事件处理”。 |
| 前置关系 | 修改 | 当前正文只写到“列表渲染与 key”；实施时应按新路线改为已完成的 B12 课程，不在本研究任务改正文或 manifest。 |
| 学习目标与 recap | 合并收窄 | 只覆盖冻结的八项，删除 SyntheticEvent 内部和独立纯度措辞。 |
| 开场与最小心智模型 | 保留并合并 | 去掉 submit 和“事件处理器不是组件”等旁支，直接建立 render / event 时间线。 |
| 传递、调用、带参数包装 | 保留 | 命名和内联均可；删除性能判断。 |
| 内置与自定义 handler prop | 保留并收窄 | 保留显式转交和领域回调；可访问性只使用语义按钮，不展开专题。 |
| `target` / `currentTarget` | 保留 | 保留嵌套元素对照；删除异步 microtask 章节。 |
| TypeScript | 保留并收窄 | 只保留内联推断、`MouseEvent<T>`、`MouseEventHandler<T>`。 |
| capture / target / bubble | 保留 | 明确是 click 顺序，`onScroll` 只留一句例外。 |
| stop / prevent | 保留 | 使用按钮传播与链接导航，不使用 form / submit。 |
| SyntheticEvent 独立章节 | 删除并合并 | 只在事件对象段保留一句公共边界；删除池化、`persist()` 和内部映射示例。 |
| 事件处理器与纯 render 独立章节 | 删除并合并 | 合并到“传函数而非调用”的时机说明。 |
| 九项 pitfalls | 收敛 | 使用“高价值易错点”中的七项，不按数量保留旧条目。 |
| 内部源码推导 | 删除 | 改为公共 API 与 Standards 的“原理与适用场景”，不得写 listener 收集、派发或委托节点。 |
| 练习 | 保留并收窄 | 保留 click 顺序、target/currentTarget、自定义 prop、stop 与链接 prevent；不得要求 State、表单或内部映射。 |
| frontmatter `sources` | 替换 | 只登记实际进入正文的 `R01`、`R02`、`R03`、`R04`、`R05`、`R06`、`R07` 子集。 |

正文面向本科阶段学习者，不能因为“复用并去重”按行数删减必要定义、因果解释、正确示例、错误示例、
观察结果、练习或总结。去重只删除重复课程、邻接专题、历史兼容和内部实现。

学习者正文不得出现 `B13`、计划、批次、任务、测试、复审、Gate、下一课、篇幅或实施状态。所有新增
示例函数，包括抽取 handler 和自定义组件，必须在定义紧邻上方写中文职责注释；匿名 handler 若无法用
紧邻注释清楚表达职责，应抽成有注释的命名函数。

## 八、现有 Demo 处置合同

当前 `event-handling-demo.tsx` 的概念目标正确，但不能原样保留：

- 可保留 `EventAction` 自定义 prop、嵌套 `span`、普通传播按钮、停止传播按钮和真实 `href` 预览链接。
- 可保留 click 的 capture、target、bubble，以及父级读取 `defaultPrevented` 的观察目标。
- 必须删除三个 `useState`、全部 setter、函数式更新、轨迹数组、`map` / `key`、结果面板和重置按钮。
- 原因不是 State 代码行数，而是 Demo 展开的运行源码会直接向 B13 学习者暴露 `useState`、函数式更新与
  数组 State；B13 位于 State 与更新模型课程之前，不能再称这些代码为“不可见基础设施”。
- 后续实施应把 Demo 缩成无 State 的事件观察：由带紧邻中文职责注释的 handler 在交互时直接产生
  可观察结果，优先采用 React 官方同类示例使用的对话框输出；不得改成直接操作 DOM 文本的教学写法。
- CSS 只随被删除的结果面板和重置控件做孤儿样式清理；不得借机重设计，也不得使用 `grid` 或 `gap`。

若无 State 的 Demo 无法同时给出清楚、可访问、可重复的观察结果，应删除 B13 的 Demo 引用，改用正文
最小代码与练习，不能为保留 Demo 提前教学 B15/B16/B17。该选择须在 B13 实施时一次冻结。

## 九、实施验收合同

1. 正文标题仍为“事件处理”，只出现本课冻结的八项知识。
2. 正文与示例不出现 `useState`、State 更新、表单/submit、Effect/Hook、性能或事件内部实现教学。
3. handler 传递、event object、click 三阶段、stop、prevent、TypeScript 与自定义 prop 都有定义、示例、
   结果解释和至少一个对应易错点。
4. 链接 prevent 示例保留真实 `href`；传播与默认动作必须能被分别观察。
5. TypeScript 示例不使用 `any`，读取 handler 元素属性时使用 `currentTarget`。
6. 所有新增示例函数都有紧邻中文职责注释。
7. sources 只收录实际支撑正文的一手来源；不再用内部源码解释公共行为。
8. 学习者正文不出现生产叙事；调研过程和路线冻结只保留在本文。
9. 若保留 Demo，展开源码不得出现 State、Hook、表单、内部事件系统或后续更新模型。
10. B13 完成聚焦验证与独立复审前，不开始任何后续课程。

## 十、研究结论与停止点

B13 可以按“传函数而非调用 -> 自定义 handler prop -> React 事件对象与 TypeScript -> click 的 capture /
target / bubble -> stop 与 prevent -> render / event 时机边界”重写。现有正文的大部分概念可以复用，
主要去重对象是表单、State、独立纯度、性能、事件池和内部派发实现。

本轮只完成官方调研并修改本研究文件，不修改正文、Demo、CSS、manifest、Track 或计划，不进入任何后续
课程。
