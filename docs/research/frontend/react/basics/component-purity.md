# B12「组件与 Hook 的纯度」官方研究记录

## 研究状态与冻结边界

- 课程 ID：`react.core.learn.basics.component-purity`
- 标题：组件与 Hook 的纯度
- 核验与访问日期：`2026-08-16`
- React 文档基线：React `19.2`
- React 固定文档提交：`reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- React 源码与测试基线：React / React DOM `v19.2.8`
- React `v19.2.8` tag commit：`1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- TypeScript 基线：仓库实装 `6.0.3`
- TypeScript 固定文档提交：
  `microsoft/TypeScript-Website@7adb2a619c0e1f3fbde87f6d9faec5c585f33d88`
- ECMAScript 基线：ECMAScript `2026` 在线规范
- 写回边界：本轮只新增本研究文件，不修改课程正文、Demo、CSS、manifest、Track、计划、依赖或测试资产。

本记录只冻结以下知识：

1. 组件与 Hook 的幂等性；
2. `props`、`state`、`context` 是 render 的只读输入；
3. render 不修改先前存在的值，也不执行会影响外部系统的副作用；
4. render 内本次新建且不泄漏的局部值可以修改；
5. 由用户动作触发的副作用进入事件处理器，需要与外部系统同步时才考虑 Effect；
6. 开发 StrictMode 的重复调用只作为发现不纯逻辑的诊断提示。

以下内容明确排除：Hook 调用位置与调用顺序、`use` 例外、State 更新队列、批处理、快照展开、Effect
依赖/清理/重放等生命周期、完整 StrictMode 行为、`memo` 与性能优化、Fiber、Reconciliation 或任何
协调算法。B12 位于 Hook 调用规则和 `useState` 之前，State 与 Context 在这里仅作为 render 输入类别
说明，不引入对应 API；建议 Demo 也不得引入 State、Context API、Effect 或事件机制。研究元数据可以
记录版本、检索、实现边界和验证建议；面向学习者的拟写内容只使用知识本身，不带批次、任务、门禁、
复审、下一课、篇幅或生产命令等叙事。

## 调研方法与直接访问证据

1. 外部检索严格先调用 Tavily，分别查询 React 纯度规则、React v19.2.8 StrictMode 源码/测试、固定
   React 文档、ECMAScript 时间/随机值/数组变异和 TypeScript `readonly`。五次请求都返回同一错误：
   `This request exceeds your plan's set usage limit`。
2. Tavily 未返回候选结果后，按仓库搜索顺序切换到 Exa；Exa 结果只用于发现候选 URL，没有把搜索摘要
   或社区文章作为事实证据。最终结论均回到 React、TypeScript、ECMAScript 官方页面、固定源码或官方
   测试核验。
3. `react.dev`、TypeScript Handbook 与 ECMAScript 已知官方 URL 通过
   `curl -L --fail --silent --show-error` 直接访问并返回 HTTP `200`。部分 GitHub blob/raw 请求一度连接
   超时；固定提交、tag 与文件内容通过 GitHub commit/Contents API 复核，指定行从固定内容逐行核对。
4. React 公共规则以 `react.dev` 的 `19.2` 文档为主；固定文档提交用于稳定措辞；React 内部行为只用
   `v19.2.8` 源码与官方测试说明当前开发诊断，不上升为生产环境公共承诺。
5. TypeScript 资料只说明静态约束，ECMAScript 规范只说明 JavaScript 操作本身；二者都不能替代 React
   对 render 纯度的要求。

## 官方来源卡

下列来源的访问日期均为 `2026-08-16`。

| ID | 一方来源 | 固定版本 | 本记录采用的证据 |
| --- | --- | --- | --- |
| `R01` | [React Versions](https://react.dev/versions) | React 官方当前文档 | `react.dev` 当前公共文档版本为 `19.2`。 |
| `R02` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | React 文档 `19.2` | 幂等、render 无副作用、不修改非局部值、局部修改、Props/State 不可变、事件处理器与 Effect 的 render 外边界。 |
| `R03` | [固定纯度规则文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/rules/components-and-hooks-must-be-pure.md#L17-L205) | `react.dev` 提交 `383a1e923...` | 固定 `R02` 的三条规则、幂等、局部修改、DOM 副作用和 Props/State 不可变措辞。 |
| `R04` | [Keeping Components Pure](https://react.dev/learn/keeping-components-pure) / [固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/keeping-components-pure.md#L19-L198) | React `19.2` / 文档提交 `383a1e923...` | 相同输入得到相同 JSX；Props/State/Context 只读；局部数组修改例外；事件处理器与开发 StrictMode 提示。 |
| `R05` | [StrictMode](https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development) / [固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/StrictMode.md#L133-L143) | React `19.2` / 文档提交 `383a1e923...` | 开发环境对本应纯净的函数执行额外调用，帮助暴露收到数据被修改等不纯逻辑。 |
| `R06` | [Responding to Events](https://react.dev/learn/responding-to-events#can-event-handlers-have-side-effects) / [固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/responding-to-events.md#L519-L523) | React `19.2` / 文档提交 `383a1e923...` | 事件处理器由交互触发、在 render 外执行，是交互副作用的合适位置。 |
| `R07` | [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events) / [固定文档](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/learn/synchronizing-with-effects.md#L21-L35) | React `19.2` / 文档提交 `383a1e923...` | render 只计算；Effect 在 render 后用于同步 React 外部系统；事件与 Effect 的触发原因不同。 |
| `R08` | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L567-L627) | React `v19.2.8`，tag commit `1dd4ecbd...` | 当前开发构建在 `StrictLegacyMode` 下二次调用函数组件，源码注释说明目的是帮助发现副作用。 |
| `R09` | [`ReactStrictMode-test.internal.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/__tests__/ReactStrictMode-test.internal.js#L84-L104) | React `v19.2.8`，tag commit `1dd4ecbd...` | 官方测试在 StrictMode 样例中断言两条 render 日志；只用作固定版本的开发诊断实现证据。 |
| `R10` | [固定 Hook/JSX 不可变规则](https://github.com/reactjs/react.dev/blob/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/rules/components-and-hooks-must-be-pure.md#L269-L364) | `react.dev` 提交 `383a1e923...` | Hook 参数与返回值不可修改；值传给 Hook 或 JSX 后不可继续修改。 |
| `R11` | [`ReactJSXElement.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSXElement.js#L267-L270) | React `v19.2.8`，tag commit `1dd4ecbd...` | 当前开发路径在 `Object.freeze` 可用时冻结 element 的 props 容器和 element。 |
| `R12` | [`ReactElementClone-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/__tests__/ReactElementClone-test.js#L359-L364) | React `v19.2.8`，tag commit `1dd4ecbd...` | 官方测试只在 `__DEV__` 下断言 element 与 props 容器已冻结。 |
| `T01` | [TypeScript Object Types：`readonly`](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) / [固定文档 L179-L225](https://github.com/microsoft/TypeScript-Website/blob/7adb2a619c0e1f3fbde87f6d9faec5c585f33d88/packages/documentation/copy/en/handbook-v2/Object%20Types.md#L179-L225) | Handbook 固定提交 `7adb2a619...` | `readonly` 在类型检查期禁止写入，不改变运行时行为，且对象属性默认不是递归深只读。 |
| `T02` | [TypeScript Object Types：`ReadonlyArray`](https://www.typescriptlang.org/docs/handbook/2/objects.html#the-readonlyarray-type) / [固定文档 L850-L897](https://github.com/microsoft/TypeScript-Website/blob/7adb2a619c0e1f3fbde87f6d9faec5c585f33d88/packages/documentation/copy/en/handbook-v2/Object%20Types.md#L850-L897) | Handbook 固定提交 `7adb2a619...` | `ReadonlyArray<T>` / `readonly T[]` 表达“不应修改数组”的静态意图并拒绝 `push` 等写操作。 |
| `T03` | [`lib.es5.d.ts`](https://github.com/microsoft/TypeScript/blob/v6.0.3/src/lib/es5.d.ts#L1189-L1345) | TypeScript `v6.0.3` | `ReadonlyArray<T>` 不暴露变异方法；普通 `Array<T>.push` 会追加成员并返回新长度。 |
| `E01` | [ECMAScript `Math.random`](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html#sec-math.random) 与 [`Date.now`](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html#sec-date.now) | ECMAScript `2026` | 连续随机序列和调用时刻都不是由组件输入决定的值。 |
| `E02` | [ECMAScript `Array.prototype.push`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.push) 与 [`sort`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.sort) | ECMAScript `2026` | `push` 向接收数组追加元素，`sort` 对接收数组原地排序；是否允许取决于数组所有权，而不是方法名称本身。 |
| `E03` | [ECMAScript `Array.prototype.toSorted`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.tosorted) | ECMAScript `2026` | `toSorted` 创建新数组并写入已排序的元素值，不原地排序接收数组；元素对象仍沿用原引用，因此只是浅复制。 |

## 最小术语与教学合同

### 幂等

在本知识点中，“幂等”只表示：给组件相同的 `props`、`state`、`context`，或给 Hook 相同参数，每次
执行都得到相同结果。它不要求每次返回同一个对象引用；render 内重新创建数组、对象或 JSX，只要结果
仍由相同输入决定且没有改变外部值，就不违反该合同。

### render 纯度

render 纯度可压缩为三个检查问题：

1. 结果是否只由本次输入决定；
2. 是否修改了本次 render 开始前已经存在的值；
3. 是否在返回结果之外改变了 DOM、全局变量或其他外部系统。

“副作用”是比 React `Effect` 更宽的编程概念。Effect 是一种放在 render 后执行、用于同步外部系统的
React 机制；不能把两者当作同义词，也不能因为副作用必须离开 render 就推导出“所有副作用都必须写进
Effect”。

### 输入所有权与局部所有权

- `props`、`state`、`context` 都是本次 render 收到的输入，不归当前计算任意修改。
- 模块级数组、缓存、其他组件持有的对象和传入的嵌套对象，也不是本次 render 新建的局部值。
- 在组件或 Hook 本次执行中创建、尚未传给 JSX、Hook 或外部持有者、下次执行会重新创建的数组或对象
  属于局部值，可以先修改再返回计算结果。
- “本地创建”不是永久许可：引用一旦传给 JSX 或 Hook 就不能继续修改；一旦泄漏给外部持有，也不再满足
  不影响其他观察者的局部修改条件。

判断 mutation 是否允许，关键不是“有没有调用 `push`”，而是“被修改的值是谁创建的、修改是否会被
下一次 render 或其他组件观察到”。

## 逐 claim 事实账本

下表中的 Demo 编号对应后文建议；`无` 表示该结论更适合正文代码对照，不应为了形式制造交互。

| Claim | 官方事实与可教结论 | 来源与版本 | 必须保留的边界 | 建议 Demo |
| --- | --- | --- | --- | --- |
| `C01` | 组件与 Hook 都必须保持纯度：幂等、render 无副作用、不修改非局部值。 | `R02`、`R03`；React `19.2` | 这是 render 合同，不是“整个应用永远没有副作用”。 | `D01` |
| `C02` | 组件的相同输入是 `props`、`state`、`context`；Hook 的相同输入是参数。相同输入应得到相同结果。 | `R02`、`R04`；React `19.2` | 不讲 Hook 调用规则，也不把“相同结果”误写成“相同对象身份”。 | `D01` |
| `C03` | 为保持组件/Hook 幂等，所有在 render 中执行的代码也必须幂等。 | `R02`；React `19.2` | 普通局部计算、条件、`map` 和 `filter` 可以运行；只要结果由输入决定。 | `D01` |
| `C04` | `new Date()`、`Date.now()` 和 `Math.random()` 的结果会随调用时刻或随机序列变化，不由相同 render 输入决定。 | `R02`、`E01`；React `19.2`、ECMAScript `2026` | 不说这些 API “永远不能用”；只禁止在需要幂等的 render 计算中直接取新值。 | `D03` |
| `C05` | render 的主要结果是计算下一份 UI；副作用必须与 render 分离。 | `R02`、`R07`；React `19.2` | 不展开 render/commit、并发、中断或协调算法。 | `D04` |
| `C06` | render 中修改模块级变量、外部数组或其他先前存在的对象会留下可观察变化，使重复执行依赖次数或顺序。 | `R02`、`R04`；React `19.2` | “读取外部常量”与“修改外部值”要区分；动态外部读值还需单独检查幂等性。 | `D02` |
| `C07` | 在 render 中设置 `document.title` 或直接操作 DOM 会在返回 JSX 之外改变页面，因此不允许。 | `R02`、`R07`；React `19.2` | 只建立 DOM 副作用边界，不讲 Ref 或具体 Effect 写法。 | `D03` |
| `C08` | Props 是本次 render 的不可变快照；既不能给 prop 重新赋值，也不能修改 prop 引用的既有对象或数组。 | `R02`、`R04`；React `19.2` | 浅复制容器不等于深复制嵌套对象；本课只要求保留输入。 | `D02` |
| `C09` | State 也是不可变快照；需要变化时使用 React 提供的更新入口，不直接修改现有 state 值。 | `R02`、`R04`；React `19.2` | 不讲 setter 队列、批处理、updater、快照时序或具体 State 课程内容。 | 无 |
| `C10` | Context 是组件 render 输入之一，应作为只读值使用；若它引用对象，消费者不能在 render 中修改该对象。 | `R02`、`R04`；React `19.2` | 这是“输入只读”与“非局部值不可修改”的直接合并，不展开 Provider、传播或 `useContext` API。 | 无 |
| `C11` | render 内刚创建的局部数组或对象可以修改，例如创建 `items` 后用 `push` 组装 JSX。 | `R02`、`R04`、`E02`；React `19.2`、ECMAScript `2026` | 局部值必须在每次执行重新创建，且不能把可变引用泄漏给外部长期持有。 | `D02` |
| `C12` | 局部修改之所以安全，是因为下次 render 会重新创建该值，前一次修改不会被记住，也不会影响其他组件。 | `R02`、`R04`；React `19.2` | 不能简化成“组件函数里的所有修改都安全”；修改输入、闭包共享值或模块级值仍然错误。 | `D02` |
| `C13` | `push` 和 `sort` 都会修改接收数组；对本次新建局部数组可以允许，对 prop、state、context 引用或模块数组不允许。 | `E02`、`R02`；ECMAScript `2026`、React `19.2` | 规则基于所有权与可观察性，不基于“某个数组方法一律好/坏”。 | `D02` |
| `C14` | TypeScript `readonly` 与 `readonly T[]` 能在类型检查期阻止常见写操作，但不改变运行时，也默认不是深只读。 | `T01`、`T02`、`T03`；TypeScript `6.0.3` | 类型通过不证明运行时没有别名修改；React 纯度仍是运行时设计合同。 | `D02` |
| `C15` | 事件处理器在用户交互后运行，不在 render 中运行，是用户动作副作用的首选位置。 | `R02`、`R06`、`R07`；React `19.2` | 这里只说明时机；不讲事件对象、传播、默认行为，也不承诺处理器只运行一次。 | `D04` |
| `C16` | 没有合适事件、且组件必须与 React 外部系统同步时，Effect 提供 render 后的边界。 | `R02`、`R07`；React `19.2` | Effect 是后备同步手段，不是普通派生计算的默认容器；不讲依赖、清理或生命周期。 | `D04` |
| `C17` | 副作用是“返回值之外的可观察影响”；React `Effect` 只是承载特定 render 驱动外部同步的一种机制。 | `R02`、`R07`；React `19.2` | 不把 side effect 与 `useEffect` 同义化，也不把事件副作用搬进 render。 | `D04` |
| `C18` | 开发 StrictMode 会额外调用本应纯净的函数，使修改输入或外部变量的错误更容易暴露。 | `R05`、`R08`、`R09`；React `19.2` / `v19.2.8` | 只作为开发诊断提示；不把重复调用次数写成所有环境、所有函数、所有未来版本的业务合同。 | `D05` |
| `C19` | 纯函数重复执行仍应给出相同结果；StrictMode 没暴露问题也不能反向证明代码完全纯净。 | `R04`、`R05`；React `19.2` | 不教完整 StrictMode，不依赖 console 次数或生产环境“必定只 render 一次”。 | `D05` |
| `C20` | render 中创建新数组、对象、JSX 或派生字符串本身不是副作用；只要这些值局部、结果确定且输入未被修改。 | `R02`、`R04`；React `19.2` | 不把纯度误写成“不能分配新对象”或“只能写一条表达式”。 | `D01`、`D02` |
| `C21` | 传给 Hook 的参数与 Hook 返回的普通对象/数组值都不能被调用方任意原地改写；需要变化时创建新值。 | `R10`；React `19.2` | 不展开 Hook 调用规则、依赖或 memo；特定 Hook 明示的专用更新入口按其 API 合同处理，也不在本课展开。 | 无 |
| `C22` | 本次 render 新建的值可以在本地组装，但传给 JSX 或 Hook 后不能继续修改。 | `R02`、`R10`；React `19.2` | “在组件函数内创建”不是充分条件；可修改窗口止于引用被交给其他观察边界。 | `D02` |
| `C23` | 事件处理器可以承担用户动作副作用，但仍不能直接修改 props、现有 state、context 或 Hook 参数/返回值。 | `R02`、`R06`、`R10`；React `19.2` | 离开 render 只改变了副作用时机，没有把 React 输入变成当前组件拥有的可变数据。 | `D04` |
| `C24` | React `19.2.8` 当前开发实现会浅冻结 element 的 props 容器，并由官方测试在 `__DEV__` 下断言。 | `R11`、`R12`；React `v19.2.8` | 仅为开发实现证据，只冻结容器而不递归冻结嵌套值；不能当作公共运行时保证。 | 无 |
| `C25` | `toSorted` 返回排序后的新数组，可避免对输入数组原地 `sort`；新数组仍复用元素值，不能据此修改嵌套对象。 | `E02`、`E03`；ECMAScript `2026` | 它解决数组容器的原地排序，不提供深复制，也不替代 React 的所有权判断。 | `D02` |

## 高价值错误矩阵

| 错误 | 触发条件 | 原因与可观察后果 | 正确判断 | 来源 |
| --- | --- | --- | --- | --- |
| render 内生成随机展示值 | JSX 直接读取 `Math.random()` 或当前时间 | 相同输入可能得到不同输出 | 把已确定的值作为输入；真正外部同步放到 render 外 | `C02`、`C04` |
| 修改数组 prop | 对收到的数组调用 `push`、`sort` 或改写成员 | 调用方数据被改变，重复 render 会累积或错序 | 只读输入；需要派生结果时创建本地新值 | `C08`、`C13` |
| 修改 context 对象 | 消费者在 render 中改写 context 引用 | 组件修改了不归自己所有的输入，其他消费者也可能观察到 | 把 context 当只读输入 | `C10` |
| 把所有 mutation 都判错 | 禁止对 render 内新建数组执行 `push` | 混淆局部所有权与外部可观察修改 | 允许不泄漏、每次重建的局部修改 | `C11`、`C12` |
| 传给 JSX 后继续修改局部对象 | 先用局部对象创建 JSX，再修改同一对象供另一段 JSX 使用 | “本地创建”被误当成整个 render 期间的永久修改许可 | 在传给 JSX 前完成修改，或为后续用途创建新值 | `C22` |
| 修改 Hook 参数或普通返回值 | Hook 内修改参数，或调用后原地修改其返回对象/数组 | 破坏 Hook 对输入/输出的不可变合同，其他观察者可能得到不一致结果 | 为变化创建新对象或数组 | `C21` |
| 在 render 中写 DOM | 组件函数设置标题、class 或调用外部部件方法 | 调用组件本身就改变页面，脱离返回 JSX | 把外部同步移出 render | `C05`、`C07` |
| 为点击动作提前调用函数 | JSX 构造时执行本应等待交互的动作 | 副作用发生在 render 而不是交互时 | 只把函数交给事件位置 | `C15` |
| 所有副作用都塞进 Effect | 用户动作也绕道 Effect | 混淆“由交互触发”和“由显示/外部同步触发” | 交互用 handler，外部同步才考虑 Effect | `C15`、`C16`、`C17` |
| 在事件处理器中修改 prop/state/context | 因处理器允许副作用，就原地改写 React 输入 | 混淆副作用时机与值的所有权 | 处理器可发起动作；React 输入仍只读 | `C23` |
| 把 `readonly` 当运行时冻结 | 依赖 TypeScript 阻止任意别名或嵌套写入 | JavaScript 运行时仍可改变值，浅层类型也可能保留可写嵌套 | `readonly` 只作静态辅助，仍遵守所有权合同 | `C14` |
| 把开发浅冻结当公共保证 | 依赖 props 在所有构建中都抛错，或认为嵌套对象也被冻结 | 固定版本开发实现被扩张成生产与深冻结合同 | 以不可变规则设计代码，不依赖冻结兜底 | `C24` |
| 把 `toSorted` 当深复制 | 修改新数组内的对象并期待输入对象不受影响 | 新旧数组仍持有同一元素对象引用 | 只把它用于避免数组容器原地排序 | `C25` |
| 把 StrictMode 次数当业务规则 | 用 render 计数或 console 次数驱动页面逻辑 | 开发诊断行为被错误当成产品语义 | 只把重复调用当发现不纯逻辑的提示 | `C18`、`C19` |

## 建议 Demo 与验证载体

### `D01`：相同输入的静态双实例

建议站内 Demo 使用同一个 `readonly Course[]` 同时渲染两个 `CourseSummary` 实例。两个实例只做筛选、
计数和 JSX 组装，并显示相同的标题、数量与列表。它帮助观察“相同输入得到相同界面”，但不能声称两个
视觉结果已经证明所有实现都纯净。

### `D02`：局部数组组装与输入保留

`CourseSummary` 内创建新的 `items` 数组，用 `push` 组装 JSX；页面同时显示传入数组长度、两个输出
长度和输入顺序，结果必须一致。Props 类型使用 `readonly Course[]`。错误的 prop `push`、模块级数组
和原地 `sort` 只作为不执行的代码对照；需要排序派生时可对比 `toSorted`，但不要把它解释成深复制。
局部 `items` 必须在全部 `push` 完成后再传给 JSX，不能让正式 Demo 真的污染共享输入或演示“传出后继续
修改”。

### `D03`：非幂等值与 DOM 写入的代码对照

以不执行的源码片段并排展示 `Math.random()` / `Date.now()` 和 `document.title = ...` 为什么越过
render 边界。不要在正式 Demo 中运行随机、计时或 DOM 写入，也不要制造依赖刷新次数的结果。

### `D04`：render、事件与 Effect 的最小时机图

只显示三列静态判断：纯派生计算进入 render；明确用户动作进入事件处理器；由组件显示而需要同步的
外部系统才考虑 Effect。这里不放按钮、不调用 Hook、不展示事件机制、依赖数组或 cleanup，避免提前
教授后续独立知识点。

### `D05`：StrictMode 诊断提示

正式 Demo 不应通过模块级 render 计数制造不纯逻辑。若后续实现需要验证，只在 `/tmp` 建立一次性
React `19.2.8` 开发 fixture，确认纯组件在 StrictMode 额外调用下输出不变，并让故意修改输入的隔离
样例暴露重复追加；验证完成即删除。不验证或展开 Effect/ref 重跑。课程最多保留一句“开发 StrictMode
可让不纯逻辑更明显”。

### 推荐主 Demo 合同

- 建议稳定 ID：`react.core.learn.basics.component-purity.local-mutation-demo`。
- 运行内容只实现 `D01` 与 `D02`；`D03`、`D04` 适合正文静态代码或说明，`D05` 只适合临时验证。
- 永久 Demo 只使用 Props、本次 render 新建的局部数组，以及接收相同输入的两个组件实例来观察边界。
- 不使用 State、Context API、Effect、事件机制、自定义 Hook、随机值、当前时间、timer、网络、存储或
  直接 DOM 写入；State/Context 只在正文中作为 render 输入类别出现。
- 运行组件与展示源码同源；初始结果确定，重复进入页面时输入摘要和两个输出保持一致。
- 如果需要样式，继续使用 Flexbox、margin 和普通文档流，不使用 CSS Grid 或 `gap`。

## 源码推导与公共边界

1. **官方事实：** React `v19.2.8` 的 `ReactFiberHooks.js` 在开发构建并处于
   `StrictLegacyMode` 时设置 `shouldDoubleRenderDEV`，随后再次调用函数组件；注释明确说明目的是帮助
   发现副作用。`ReactStrictMode-test.internal.js` 的固定测试确认该 StrictMode 样例记录两次 render。
2. **可教推导：** 组件与 Hook 不能把“这次大概只执行一次”作为正确性的前提。相同输入下重复计算应
   保持结果不变，且不累积外部修改。
3. **边界：** `StrictLegacyMode`、`renderWithHooksAgain`、`Fiber` mode 位和具体调用次数都是固定版本
   内部/测试证据，不进入学习者心智模型。公共合同只有“保持 render 纯净；开发 StrictMode 可帮助发现
   某些错误”。
4. **官方事实：** 同一 tag 的 `ReactJSXElement.js` 在开发路径中对 element 的 props 容器调用
   `Object.freeze`，对应测试只在 `__DEV__` 下断言 element 和 props 容器已冻结。
5. **边界：** 这只能说明 React `19.2.8` 当前开发实现提供浅层辅助检测。源码没有递归冻结 props 的嵌套
   对象，公共文档也没有承诺所有构建都以运行时冻结阻止修改；课程规则必须独立于这项实现细节成立。

## 不采用的结论

1. “纯组件不能创建新数组或对象”不成立；本次 render 新建且不泄漏的局部值可以修改。
2. “只要 TypeScript 写了 `readonly`，运行时就绝不可能修改”不成立；`readonly` 是静态辅助且默认浅层。
3. “相同输入必须返回同一个对象引用”不成立；合同关注由输入决定的结果与外部可观察影响。
4. “事件处理器也必须和 render 一样纯”不成立；事件处理器位于 render 外，可以承担用户动作副作用，
   但这不允许它直接修改 props、state、context 或 Hook 输入/输出。
5. “任何副作用都必须使用 Effect”不成立；明确用户动作优先放在事件处理器，Effect 只承担必要外部同步。
6. “开发 StrictMode 渲染两次，所以生产环境永远只渲染一次”不成立；不能从诊断样例推出生产调用次数。
7. “没有 StrictMode 警告或重复现象就证明组件纯净”不成立；StrictMode 只是帮助暴露部分问题的工具。
8. “纯度要求来自 Fiber 或协调算法”不作为课程结论；公共规则由 React 官方文档直接给出。
9. “讲纯度必须同时讲 Hook 调用规则、State 队列或 Effect 生命周期”不成立；这些是独立知识点。
10. “在 render 内创建的值到函数返回前都可以任意修改”不成立；传给 Hook 或 JSX 后就不能继续修改。
11. “React 会在所有环境深冻结 props”不成立；固定版本证据只显示开发路径浅冻结 props 容器。
12. “`toSorted` 会深复制数组元素”不成立；它创建新数组，但对象元素仍是原引用。

## 本研究文件自检合同

- 每条课程事实必须能回到上表一方来源，不用 Tavily 错误、搜索摘要或二方文章支撑结论。
- 只对本文件运行聚焦 Prettier 与 diff whitespace 检查，不格式化仓库其他文件。
- 目标文件保持 untracked，不执行 `git add`、commit、push、stash、reset 或清理。
- 不创建持久测试、fixture、截图、构建产物或后续课程资产。
- 研究完成即停在本文件，不授权课程正文、Demo、manifest、Track 或计划写回。
