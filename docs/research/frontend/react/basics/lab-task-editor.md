# BL2「实战：任务清单编辑器」官方研究记录

## 研究状态与冻结边界

- 课程 ID：`react.core.learn.basics.lab-task-editor`
- 左侧短标题与正文标题：`实战：任务清单编辑器`
- 课程类型：React Core 基础阶段实战课，`beginner` 本科基础范围。
- 研究日期：`2026-08-16`
- React 文档基线：React `19.2`。
- 仓库运行时基线：React / React DOM `19.2.8`。
- 类型基线：TypeScript `6.0.3`；仓库声明 `@types/react` `19.2.18`。
- React 固定文档提交：`c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。
- 生产写回边界：本轮只新增本研究文件；不修改课程正文、Demo、CSS、entry/demo
  manifest、Track、计划、进度迁移、依赖或其他资产。

总计划已经冻结 B01-B17 完成，BL2 是唯一下一课。目标文件、课程正文、Demo、entry/demo manifest
登记和 Track 登记在研究开始时都不存在。live Track 仍保留后续旧课程的既有 `available` 项；这些资产
不构成 BL2 可以使用 B18 以后知识的授权。

本课只组合此前已经完成的函数组件、模块边界、Props 与函数 Prop、条件渲染、列表与稳定 `key`、组件
纯度、事件处理、Hook 调用规则、`useState`、State 快照与 updater、对象和数组不可变更新。它不新增
React API，也不把任一前置知识重新扩写成完整专题。

唯一需要窄范围接入的相邻表面是文本输入：新增任务和行内编辑各使用一个
`value + onChange` 受控文本框。它只承担“事件读取当前文本，setter 保存文本”这一条组合职责；正文
不得借此完整教学受控/非受控组件、表单提交、`FormData`、表单校验、`useId` 或 React 表单架构。

## 一、研究方法与来源边界

1. 先核对总计划 BL2 条目、课程规范、BL1 与 B17 调研/正文，以及 live entry manifest、demo
   manifest 和 Track；总计划当前状态明确指向 BL2。
2. React 公共语义以 React `19.2` 官方文档为准，运行时 patch 以仓库依赖和 React 官方
   `v19.2.8` release/tag 为准；不能把 React `19.2` 页面称为“19.2.8 专属文档”。
3. TypeScript 事实只采用 TypeScript Handbook；数组、对象展开和字符串处理的语言语义只采用
   ECMAScript 规范。
4. 同源加载能力采用 Vite 官方文档与仓库现有 `import.meta.glob` / `?raw` 模式。
5. 已知官方 URL 已直接用 `curl -L --fail` 核验，全部可访问；没有进行关键词发现，因此未启动
   Tavily 或后续搜索链路。
6. 搜索摘要、社区文章、问答、第三方教程和当前 Demo 实现都不作为 React 行为的独立事实来源。
7. 本研究记录可以出现 BL2、计划、manifest、验证与停止边界；未来学习者正文不得出现这些生产过程
   叙事。

## 二、一手来源

| ID | 一手来源 | 固定范围 | 本记录采用的证据 |
| --- | --- | --- | --- |
| `R00` | [React Versions](https://react.dev/versions#latest-version) | React 官方当前文档 | 当前官方文档版本是 React `19.2`；官方文档不按每个 patch 单独发布。 |
| `R01` | [React `v19.2.8` release](https://github.com/react/react/releases/tag/v19.2.8)、[tag](https://github.com/facebook/react/tree/v19.2.8) | React 官方仓库 | 锁定仓库 React / React DOM `19.2.8` 运行时 patch；不引用内部实现。 |
| `R02` | [Responding to Events](https://react.dev/learn/responding-to-events)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/responding-to-events.md) | React 文档 `19.2` | 传递而非调用 handler、带参数包装函数、自定义 handler prop 与事件发生时机。 |
| `R03` | [`useState`](https://react.dev/reference/react/useState)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useState.md) | React 文档 `19.2` | 初始值、setter、直接下一值、pending updater、相等值跳过和 updater 纯度。 |
| `R04` | [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/state-a-components-memory.md) | React 文档 `19.2` | State 在 render 间保留数据，setter 请求新的 render，一个组件可有多份 State。 |
| `R05` | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/state-as-a-snapshot.md) | React 文档 `19.2` | 每次 render 得到固定 State 快照；当前 handler 不会因调用 setter 立刻看到新值。 |
| `R06` | [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/queueing-a-series-of-state-updates.md) | React 文档 `19.2` | 事件内 batching、updater 队列、pending State 与 updater 必须纯。 |
| `R07` | [Updating Objects in State](https://react.dev/learn/updating-objects-in-state)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/updating-objects-in-state.md) | React 文档 `19.2` | 对象 State 按只读值使用，以对象展开创建下一对象；展开是浅复制。 |
| `R08` | [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/updating-arrays-in-state.md) | React 文档 `19.2` | 数组 State 按只读值使用；添加用新数组，删除用 `filter`，替换用 `map`。 |
| `R09` | [Rendering Lists](https://react.dev/learn/rendering-lists)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/rendering-lists.md) | React 文档 `19.2` | 列表直接项的 `key` 来自数据，兄弟间唯一且跨 render 稳定；不在 render 中生成。 |
| `R10` | [Conditional Rendering](https://react.dev/learn/conditional-rendering) | React 文档 `19.2` | 使用普通 JavaScript 分支、三元与 boolean `&&` 选择界面。 |
| `R11` | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) | React 文档 `19.2` | 父组件通过 Props 传数据和函数，子组件收到的是当前 render 的只读输入。 |
| `R12` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | React 文档 `19.2` | render 应保持幂等，Props / State 是不可变快照，局部计算不能改写旧输入。 |
| `R13` | [`<input>`](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/input.md) | React DOM 文档 `19.2` | 文本输入接收字符串 `value` 后受控；每个受控输入需要同步更新其后备值的 `onChange`。 |
| `R14` | [Using TypeScript: DOM Events](https://react.dev/learn/typescript#typing-dom-events)、[固定文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/typescript.md#L390-L426) | React 文档 `19.2` | 内联 DOM handler 通常可由 JSX 上下文推断事件类型；抽取 handler 时再显式标注。 |
| `R15` | [Choosing the State Structure: Avoid redundant state](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state) | React 文档 `19.2` | 能由现有 Props 或 State 在 render 中计算的信息不应另存为同步副本。 |
| `R16` | [TypeScript Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)、[Literal Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) | TypeScript Handbook | 字符串字面量联合可限制筛选状态只取三个已知值。 |
| `R17` | [TypeScript `readonly` properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties)、[`ReadonlyArray`](https://www.typescriptlang.org/docs/handbook/2/objects.html#the-readonlyarray-type) | TypeScript Handbook | `readonly` 提供类型检查期写入限制，不改变运行时对象，也不是深冻结。 |
| `R18` | [ECMAScript `Array.prototype.filter`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.filter) | ECMAScript 2026 | `filter` 按 predicate 结果构造新数组，用于筛选与删除。 |
| `R19` | [ECMAScript `Array.prototype.map`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.map) | ECMAScript 2026 | `map` 用回调结果构造新数组，用于替换匹配任务对象。 |
| `R20` | [ECMAScript Object Initializer](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-object-initializer)、[`CopyDataProperties`](https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-copydataproperties) | ECMAScript 2026 | 对象字面量创建新对象；对象展开复制自身可枚举属性值，仍是浅复制。 |
| `R21` | [ECMAScript `String.prototype.trim`](https://tc39.es/ecma262/2026/multipage/text-processing.html#sec-string.prototype.trim) | ECMAScript 2026 | `trim()` 返回移除首尾空白后的字符串，用于空标题判断和保存值归一化。 |
| `R22` | [Vite Glob Import](https://vite.dev/guide/features.html#glob-import)、[Static Asset as String](https://vite.dev/guide/assets.html#importing-asset-as-string) | Vite `8` 官方文档 | 字面量 glob 建立模块加载映射，`?raw` 可把同一源文件作为字符串加载。 |

## 三、逐 claim 事实账本

| Claim | 可采用的准确表述 | 一手来源 | 本课不能推出 |
| --- | --- | --- | --- |
| `C01` | JSX 事件 prop 接收稍后调用的 handler；带任务 ID 时传包装函数。 | `R02` | `onClick={removeTask(id)}` 会等点击后再调用。 |
| `C02` | 自定义组件可以用 `onAdd`、`onToggle`、`onSave` 一类函数 Prop 表达领域动作，但必须由组件显式调用或转交。 | `R02`, `R11` | 名字以 `on` 开头就会被 React 自动派发。 |
| `C03` | `useState` 返回当前 State 与 setter；本项目可分别保存任务、添加草稿、筛选值和编辑缓冲。 | `R03`, `R04` | 所有值必须合并到一个大对象，或必须改用 reducer。 |
| `C04` | setter 请求后续 render；当前 handler 读取的 State 仍属于本次 render 的固定快照。 | `R05` | 调用 `setTasks` 后，同一 handler 中的 `tasks` 变量已经原地改变。 |
| `C05` | 同一事件中的多次 setter 会 batching；界面不会展示只更新一半的中间状态。 | `R06` | 所有异步来源和所有不同事件都遵循一条无限泛化的 batching 时序。 |
| `C06` | 下一任务数组依赖 pending 数组时使用纯 updater：`setTasks(previous => ...)`。 | `R03`, `R06` | 可以在 updater 内调用其他 setter、写存储或改变外部变量。 |
| `C07` | React 会在下一 render 按队列处理 updater；每个 updater只读取参数并返回下一值。 | `R06` | updater 会同步修改当前闭包里的 `tasks`。 |
| `C08` | 对象 State 按只读值处理；切换完成或保存标题时以 `{ ...task, field: next }` 创建匹配项的新对象。 | `R07`, `R20` | 对象展开会深克隆任务，或可以先改写旧任务再展开。 |
| `C09` | 数组 State 按只读值处理；添加返回新数组，删除/清除用 `filter`，切换/保存用 `map`。 | `R08`, `R18`, `R19` | `push`、`splice` 或数组下标赋值在 setter 中会自动变成不可变更新。 |
| `C10` | `map` 或 `filter` 只创建新外层数组；未替换的任务对象可以保持原引用。 | `R08`, `R18`, `R19` | 每次操作都必须深克隆全部任务。 |
| `C11` | 列表 `key` 使用任务数据中的稳定 `id`，放在 `map` 直接返回的 `TaskRow` 上。 | `R09` | 可以使用数组索引、标题、`Math.random()` 或 render 时生成值。 |
| `C12` | 新任务 ID 在添加事件中创建并写进任务数据，之后不会因编辑、筛选或重排而改变。 | `R03`, `R05`, `R09` | `useId` 是列表业务 ID 生成器，或 `key` 会作为普通 Prop 自动传入。 |
| `C13` | 文本输入收到字符串 `value` 时是受控输入；`onChange` 必须同步更新对应字符串 State。 | `R13` | 本课因此需要完整教授 React 表单、提交、校验、`FormData` 或受控/非受控迁移。 |
| `C14` | JSX 中的短内联 `onChange` handler 可以依赖上下文类型，并通过 `event.currentTarget.value` 传出文本。 | `R14` | 本课需要枚举 `ChangeEvent`、`FormEvent` 或全部表单事件类型。 |
| `C15` | `''` 是两个文本 State 的初始值，确保输入从第一次 render 起始终受控。 | `R03`, `R13` | 可以用 `undefined` 初始化，再在输入后切换到字符串。 |
| `C16` | `trim()` 可用于拒绝纯空白标题，并把首尾空白去除后的文本存入任务。 | `R21` | 应在每次按键时破坏用户正在编辑的原始输入。 |
| `C17` | 可见任务、总数、未完成数和已完成数都能从 `tasks` 与当前筛选在 render 中计算。 | `R12`, `R15`, `R18` | 需要额外 State、Effect 或手工同步四份副本。 |
| `C18` | 空列表、编辑行、当前筛选提示和按钮可用普通条件渲染表达。 | `R10` | 需要路由、Portal、Suspense 或命令式 DOM 切换。 |
| `C19` | 子组件通过只读数据 Props 与准确的动作回调连接；子组件不修改任务对象。 | `R11`, `R12`, `R17` | 本课必须引入 Context 或在多处复制 canonical 任务 State。 |
| `C20` | `TaskFilter = 'all' | 'active' | 'completed'` 把筛选状态限制为三个合法值。 | `R16` | TypeScript 联合会在运行时自动校验任意外部字符串。 |
| `C21` | `readonly Task[]` 与 `readonly` 字段可表达只读意图，但运行时正确性仍来自复制更新纪律。 | `R17`, `R07`, `R08` | TypeScript 会冻结对象或阻止浏览器中的运行时变异。 |
| `C22` | 重置可直接把各 State 设置为固定初始值；只有依赖 pending State 的任务变换需要 updater。 | `R03`, `R05`, `R06` | 每个 setter 无条件都必须使用函数形式。 |
| `C23` | `import.meta.glob` 的运行组件与 `?raw` 源码加载器可以指向同一组磁盘文件。 | `R22` | 运行源码与展示源码可以维护两份“看起来相同”的副本。 |

## 四、已学知识与交互可行性

### 4.1 B01-B17 能力映射

| 已学能力 | 本实战中的职责 | 明确边界 |
| --- | --- | --- |
| 函数组件、模块边界 | 根组件、添加区、列表和行组件按职责拆分，全部在模块顶层定义。 | 不教学动态组件、懒加载或新的模块架构。 |
| Props 与函数 Prop | 根组件把数据、编辑状态和 `onXxx` 动作传给子组件。 | 不使用 Context，不让子组件修改 Props。 |
| 条件渲染 | 在普通行/编辑行、空结果和当前筛选提示之间选择。 | 不引入路由或命令式 DOM。 |
| 列表与稳定 `key` | `visibleTasks.map(...)`；`key={task.id}` 放在直接列表项。 | 不用索引、标题、随机值或 `useId`。 |
| 组件纯度 | 统计与筛选在 render 中纯计算；handler 才发起更新。 | 不在 render 中调用 setter或生成 ID。 |
| 事件处理 | 点击触发添加、切换、编辑、保存、取消、删除、筛选、清除与重置；回调通过 Props 下传。 | 不讲传播、默认行为或新事件族；没有 `<form>`。 |
| `useState` | 保存任务数组、添加草稿、筛选值、编辑目标、编辑草稿和下一个数字 ID。 | 不引入 reducer、Context 或外部 store。 |
| State 快照与 updater | handler 使用当前快照决定动作；所有基于旧任务数组的变换都使用纯 updater。 | 不在 setter 后同步读取新数组，不在 updater 中调用其他 setter。 |
| 对象与数组不可变更新 | 展开添加，`map` 切换/保存，`filter` 删除/清除，匹配项用对象展开替换。 | 不直接赋值、`push`、`splice`、深克隆或 Immer。 |
| TypeScript 基础 | `Task`、函数 Props、`number | null` 和字符串字面量联合约束数据。 | 不引入泛型组件、类型体操或宽泛 `Function`。 |

### 4.2 受控输入的窄例外

受控新增和行内编辑无法只靠按钮完成，因此本课必须出现两处文本输入，但只允许以下最小合同：

```tsx
<input value={draft} onChange={(event) => onDraftChange(event.currentTarget.value)} />
```

- 使用 B13 已学的“传 handler”“内联事件可推断”“读取 `currentTarget`”，以及 B15 已学的字符串 State。
- 只说明 `value` 来自当前 State、`onChange` 同步提交下一字符串；不比较 `defaultValue`，不列举
  `ChangeEvent`，不抽取完整表单类型。
- 添加由 `type="button"` 的普通按钮触发；不使用 `<form>`、`onSubmit`、`preventDefault()` 或 Enter
  提交。
- 标签使用 HTML 已有的嵌套 `<label><span>...</span><input ... /></label>`，不需要生成 DOM ID，
  也不借机教学 `useId` 或 ARIA 关联。

### 4.3 在当前范围内可以完整完成的交互

| 交互 | 组合方式 | 不需要的后续能力 |
| --- | --- | --- |
| 添加 | 受控字符串 State + click handler + `trim` + 数组 updater/展开 + 事件时创建稳定 ID。 | 表单 submit、`FormData`、Effect、网络。 |
| 行内编辑 | `editingTaskId` + `editingDraft` 决定条件分支；保存时 `map` 与对象展开，取消时清空编辑 State。 | Ref 自动聚焦、Reducer、表单校验库。 |
| 完成切换 | 按钮 click 传稳定 ID；`map` 替换目标对象并反转 boolean。 | 受控 checkbox、DOM 查询。 |
| 删除 | 按钮 click 传稳定 ID；`filter` 返回不含目标的新数组。 | 确认弹窗、撤销栈、持久化。 |
| 状态筛选 | 三个按钮设置字面量联合；render 中按当前筛选计算可见数组。 | 路由 query、memoization、Effect。 |
| 清除已完成 | `filter(task => !task.completed)`；没有已完成任务时按钮禁用。 | 批量 API、事务、动画。 |
| 派生统计 | `tasks.length` 与 `tasks.filter(...)` 在 render 中计算。 | 冗余统计 State、Effect 同步、`useMemo`。 |
| 重置 | 各 setter 直接恢复固定初始值并退出编辑。 | key 重挂载、Ref、页面刷新。 |

因此 BL2 的全部指定交互都能在 B01-B17 能力内实现。唯一新出现的 React DOM 表面是两处最小受控文本
输入；它被严格限制为事件与字符串 State 的桥接，不承担后续表单课程责任。

## 五、产品需求冻结

### 5.1 页面可见结构

Demo 必须同时提供以下可见区域，不能用说明卡代替真实控件：

1. 标题“任务清单编辑器”和一句当前结果摘要。
2. “新任务”嵌套标签、受控文本框和“添加任务”按钮。
3. “全部 / 未完成 / 已完成”三个筛选按钮，并清楚标出当前筛选。
4. 派生统计：总计、未完成、已完成。
5. 任务列表；普通行显示标题、状态、完成切换、编辑和删除按钮。
6. 同一位置的行内编辑状态：受控文本框、保存和取消按钮。
7. “清除已完成”和“重置清单”按钮。
8. 当前筛选无结果时显示明确空结果，不隐藏整个列表区域。

### 5.2 固定功能规则

1. Demo 初始有三条固定任务，顺序和 ID 不变。
2. 添加与保存前对文本执行 `trim()`；纯空白不能添加或保存，按钮以禁用状态表达这一点。
3. 新任务追加到数组末尾，初始为未完成；成功添加后清空添加草稿。
4. 每次只编辑一条任务。点击“编辑”把该任务当前标题复制到独立编辑草稿。
5. “保存”只替换匹配任务的 `title`，保留 `id`、完成状态和列表位置，然后退出编辑。
6. “取消”丢弃编辑草稿，任务标题保持不变，然后退出编辑。
7. 完成切换只反转目标任务的 `completed`；不改变标题、ID 或顺序。
8. 删除只移除目标任务；若删除的是正在编辑的任务，同时退出编辑。
9. 切换筛选只改变可见数组，不改变 canonical 任务数组、统计或编辑内容。
10. “清除已完成”一次删除全部已完成任务，并退出可能存在的编辑状态；没有已完成任务时按钮禁用。
11. 统计始终基于完整 `tasks`，不能基于 `visibleTasks`，因此切换筛选不会改变总计。
12. “重置清单”恢复三条初始任务、`all` 筛选、空添加草稿、无编辑状态和下一个 ID `4`。

### 5.3 固定初始数据

```ts
export type Task = {
  readonly id: number
  readonly title: string
  readonly completed: boolean
}

export type TaskFilter = 'all' | 'active' | 'completed'

export const INITIAL_TASKS: readonly Task[] = [
  { id: 1, title: '拆分任务组件', completed: false },
  { id: 2, title: '实现添加与编辑', completed: true },
  { id: 3, title: '核对不可变更新', completed: false },
]
```

初始可见结果固定为：总计 `3`、未完成 `2`、已完成 `1`，全部筛选下按 `1 -> 2 -> 3` 显示。

## 六、状态、派生值与身份模型

### 6.1 真实 State

| State | 类型 | 初始值 | 唯一职责 |
| --- | --- | --- | --- |
| `tasks` | `readonly Task[]` | `INITIAL_TASKS` | canonical 任务集合。 |
| `draft` | `string` | `''` | 新任务文本框当前值。 |
| `filter` | `TaskFilter` | `'all'` | 当前可见筛选。 |
| `editingTaskId` | `number | null` | `null` | 当前编辑目标；`null` 表示没有编辑。 |
| `editingDraft` | `string` | `''` | 行内编辑文本框当前值。 |
| `nextTaskId` | `number` | `4` | 下一次成功添加使用的稳定业务 ID。 |

不要新增 `visibleTasks`、`totalCount`、`activeCount`、`completedCount`、`canAdd`、`canSave` 或
`hasCompletedTasks` State；它们都能从上表的当前快照直接得到。

### 6.2 派生值

```ts
const totalCount = tasks.length
const completedCount = tasks.filter((task) => task.completed).length
const activeCount = totalCount - completedCount
const canAdd = draft.trim().length > 0
const canSave = editingDraft.trim().length > 0
```

`visibleTasks` 使用一个普通纯函数或清楚的条件分支：

- `all`：返回完整 `tasks`。
- `active`：`tasks.filter((task) => !task.completed)`。
- `completed`：`tasks.filter((task) => task.completed)`。

这里只落实“不要存同步副本”这一条项目规则，不展开 State 结构、提升 State、单一事实来源或 Thinking in
React 的完整教学。

### 6.3 ID 与 key

1. 初始任务使用固定数字 ID `1`、`2`、`3`。
2. 成功添加时读取该事件 render 的 `nextTaskId`，写进新任务，再用
   `setNextTaskId((previous) => previous + 1)` 更新下一编号。
3. 空白添加不会消费 ID。
4. 编辑、切换、筛选和重置之外的列表操作不改变已有任务 ID。
5. `TaskRow` 同时接收普通 `task.id` Prop，并由调用处写 `key={task.id}`；不能尝试在组件内读取
   `key`。
6. 不使用数组索引、标题、时间戳、随机数、`crypto.randomUUID()` 或 `useId`，避免引入额外 API 和
   不可重复验收结果。

## 七、组件与模块边界

### 7.1 组件树

```text
LabTaskEditorDemo
├── TaskComposer
└── TaskList
    └── TaskRow × visible task count
```

筛选按钮、统计、批量动作和重置在根组件中只出现一次，不为单次使用额外创建薄包装组件。

| 组件 | 输入 | 职责 | 禁止承担 |
| --- | --- | --- | --- |
| `LabTaskEditorDemo` | 无 | 拥有六份 State、计算筛选与统计、定义全部任务更新 handler、组装界面。 | 网络、存储、Effect、Context、Reducer。 |
| `TaskComposer` | `draft`、`canAdd`、`onDraftChange`、`onAdd` | 显示嵌套标签的受控输入与添加按钮，把领域动作回传根组件。 | 自己保存另一份任务或草稿 State、提交 form。 |
| `TaskList` | 可见任务、编辑 ID/草稿和全部行级回调 | 处理空结果并以稳定 `key` 渲染列表。 | 保存筛选副本、修改任务 Props。 |
| `TaskRow` | 单个任务、是否编辑、编辑草稿和行级回调 | 在普通行和编辑行之间切换，呈现完成/编辑/删除或保存/取消控件。 | 拥有 canonical 任务 State、生成 ID、直接修改任务。 |

所有函数组件和命名 handler 都使用简单函数声明，并在定义紧邻上方写一句规范中文职责注释。Props 使用
准确调用签名，例如 `onToggle: (taskId: number) => void`，不使用 `Function`、`any` 或无关泛型。

### 7.2 文件职责

| 文件 | 固定职责 |
| --- | --- |
| `task-data.ts` | 导出 `Task`、`TaskFilter` 与 `INITIAL_TASKS`，不包含 React State 或副作用。 |
| `task-composer.tsx` | 导出无本地 State 的 `TaskComposer`。 |
| `task-list.tsx` | 导出 `TaskList`，在同文件内保留单次使用的 `TaskRow`。 |
| `lab-task-editor-demo.tsx` | 默认导出根组件，拥有 State、派生值和全部更新 handler，并导入 CSS。 |
| `lab-task-editor-demo.css` | 只负责布局与可读状态；使用 Flexbox、margin 和正常文档流。 |

不新增 barrel、hook、store、utility 目录、测试文件、fixture 或第二套示例数据。

## 八、更新算法合同

### 8.1 添加

```tsx
const title = draft.trim()
if (!title) return

setTasks((previous) => [
  ...previous,
  { id: nextTaskId, title, completed: false },
])
setNextTaskId((previous) => previous + 1)
setDraft('')
```

这里用当前事件快照中的 `nextTaskId` 创建业务对象；任务数组与 ID 计数分别更新。React 会在 handler
结束后处理这些更新，但当前 handler 不应再读取 `tasks` 并声称已经包含新任务。

### 8.2 切换完成

```tsx
setTasks((previous) =>
  previous.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  ),
)
```

只有匹配任务获得新对象；未匹配任务可保持原引用。不能先执行 `task.completed = !task.completed`。

### 8.3 保存编辑

保存前先检查 `editingTaskId !== null` 和 `editingDraft.trim()` 非空，再使用 `map` 只替换目标任务的
`title`。更新入队后直接把 `editingTaskId` 设为 `null`、`editingDraft` 设为 `''`；不需要等待 DOM 或
Effect。

### 8.4 删除与清除

- 删除：`previous.filter((task) => task.id !== taskId)`。
- 清除已完成：`previous.filter((task) => !task.completed)`。
- 两种操作都不使用 `splice`，也不先修改旧数组。
- 删除当前编辑项或清除已完成时退出编辑，防止编辑器指向已经不存在的任务。

### 8.5 重置

重置 handler 依次把六份 State 设回第 6.1 节初始值。它们都是固定下一值，不需要强行写成 updater，
也不通过修改组件 `key`、刷新页面或重新挂载实现。

## 九、单一同源 Demo 合同

### 9.1 Demo 身份

- Demo ID：`react.core.learn.basics.lab-task-editor.task-editor-demo`
- Demo 标题：`任务清单编辑器`
- runtime：`react`
- 运行入口：
  `./demos/lab-task-editor/lab-task-editor-demo.tsx`
- 正文只使用这一项真实 Demo，不创建静态截图、伪控件或另一套精简运行实现。

### 9.2 同源文件顺序

`demo-manifest.ts` 后续实现必须按以下顺序定义源码文件列表：

1. `task-data.ts`
2. `task-composer.tsx`
3. `task-list.tsx`
4. `lab-task-editor-demo.tsx`
5. `lab-task-editor-demo.css`

运行组件由现有 `demoComponents['./demos/lab-task-editor/lab-task-editor-demo.tsx']` 加载；展示源码中的
TS、TSX、CSS 分别由现有 `demoTypeScriptSources`、`demoSources`、`demoStyleSources` 指向上述同一组
磁盘文件。聚合函数只执行：

```ts
files.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
```

禁止复制源码到字符串、手工删节、为展示维护第二份代码，或遗漏运行入口实际导入的 `task-data.ts`、
子组件和 CSS。后续同源验收应比较运行文件按固定顺序拼接后的字符数、UTF-8 字节数和 SHA-256；具体
值只能在实现快照产生后记录，本研究不猜测。

### 9.3 样式边界

- 禁止 CSS Grid 和 `gap`，使用 Flexbox、margin 和正常文档流。
- 行布局在窄屏可换行，长任务标题与长按钮文字不能撑出容器。
- 固定控件尺寸与 `flex-wrap` 不能因完成标记、编辑框、空结果或按钮禁用状态导致整体跳动。
- 完成状态不能只靠颜色表达；必须同时有可见文字。
- 不添加动画、渐变装饰、拖拽手柄、图标库或与任务功能无关的视觉资产。

## 十、固定验收序列

所有行为验收必须从重新加载后的固定初始状态开始，按同一序列执行，避免不同验证者使用不同数据。

| 步骤 | 操作 | 必须观察到的结果 |
| ---: | --- | --- |
| `0` | 初始加载 | 顺序为 ID `1/2/3`；总计 `3`、未完成 `2`、已完成 `1`；筛选为全部；两个草稿为空。 |
| `1` | 输入三个空格 | “添加任务”保持禁用，任务数和下一 ID 不变。 |
| `2` | 输入 `  整理验收清单  ` 并点击添加 | 新任务标题为去空白后的“整理验收清单”，位于末尾，ID 为 `4` 且未完成；统计为 `4/3/1`，添加框清空。 |
| `3` | 切换 ID `1` 完成状态 | ID `1` 标为已完成；标题、ID、顺序不变；统计为 `4/2/2`。 |
| `4` | 编辑 ID `3`，把草稿改为“这次不保存”，点击取消 | 行退出编辑，原标题仍为“核对不可变更新”，统计不变。 |
| `5` | 再次编辑 ID `3`，输入 `  核对对象与数组更新  `，点击保存 | ID `3` 标题更新并去除首尾空白；ID、完成状态、顺序不变。 |
| `6` | 选择“未完成” | 只显示 ID `3` 和 `4`；统计仍为 `4/2/2`。 |
| `7` | 删除 ID `4` | 未完成筛选只显示 ID `3`；统计为总计 `3`、未完成 `1`、已完成 `2`。 |
| `8` | 选择“已完成” | 只显示 ID `1` 和 `2`，顺序不变。 |
| `9` | 点击“清除已完成” | 已完成筛选显示空结果；canonical 数据只剩 ID `3`；统计为 `1/1/0`，清除按钮禁用。 |
| `10` | 选择“全部” | 只显示已改名的 ID `3`，统计仍为 `1/1/0`。 |
| `11` | 点击“重置清单” | 完整恢复步骤 `0`；ID `4` 数据不存在，下一个成功添加仍应获得 ID `4`。 |

固定序列之外还要核对：

1. 开始编辑一项后点击另一项“编辑”，只有后一项保持编辑状态。
2. 编辑草稿为纯空白时“保存”禁用；取消后旧标题不变。
3. 删除正在编辑的任务后没有残留编辑框。
4. 在筛选之间切换不会改变 canonical 任务完成状态、标题、顺序或统计。
5. 展开的五文件源码与磁盘运行文件逐字同源；源码中没有 `useReducer`、Context、Effect、Ref、
   `useId`、`FormData`、存储、请求、拖拽或第三方库。
6. 正式页面在桌面、`390px` 和 `390px + 32px` 根字号下无横向溢出、裁切、按钮重叠或不可达控件；
   console error/warning、page error、失败请求和 `>=400` 响应均为 `0`。

## 十一、课程正文建议

### 11.1 元数据建议

| 字段 | 建议值或约束 |
| --- | --- |
| `id` | `react.core.learn.basics.lab-task-editor` |
| `title` | `实战：任务清单编辑器` |
| `summary` | `组合事件、useState、State 快照与不可变更新，完成可添加、编辑、筛选和重置的任务清单。` |
| `stage` | `basics` |
| `difficulty` | `beginner` |
| `prerequisites` | 至少包含事件处理、`useState`、React 更新模型、State 的不可变更新；列表与 Props 可按正文真实引用补入。 |
| `related` | 只指向已经开放且正文确实引用的基础课程；不预先指向尚未调整的 B18-B21 或 BL3。 |
| `tags` | `React`、`实战`、`事件`、`useState`、`不可变更新`、`任务清单` |
| Demo | 只登记 `react.core.learn.basics.lab-task-editor.task-editor-demo` |

### 11.2 学习目标

正文保留五个可验收目标：

1. 用 `Task`、`TaskFilter` 和固定初始数据建立可更新清单。
2. 用受控文本 State 与事件回调完成添加、编辑、保存和取消。
3. 用 updater、对象展开、数组展开、`map` 和 `filter` 实现不可变增删改。
4. 用稳定 ID/key 保持任务身份，并从当前任务数组派生筛选结果与统计。
5. 按固定操作序列验证清除、重置、空结果和 State 快照边界。

### 11.3 正文顺序

1. **学习目标**：直接列出上面五项，不解释课程生产过程。
2. **最终成品与操作地图**：先展示要完成的真实编辑器及九类交互，让学习者知道结果。
3. **任务数据与稳定身份**：定义 `Task`、`TaskFilter`、三条初始数据和 ID/key 规则。
4. **区分 State 与派生值**：列出六份真实 State，再说明筛选数组、统计和按钮能力由当前快照计算。
5. **拆分组件与 Props 合同**：给出四组件树和准确函数 Prop；解释为什么更新入口仍在根组件。
6. **接入两个文本输入**：只解释 `value`、内联 `onChange`、空字符串初值和 `trim`；立刻声明表单专题边界。
7. **实现添加**：展示事件快照、任务数组 updater、稳定 ID、清空草稿的先后关系。
8. **实现切换与删除**：并列说明 `map + 对象展开` 与 `filter`，明确未命中项保持原引用。
9. **实现行内编辑**：解释编辑目标和编辑草稿为什么与 canonical 标题分开；覆盖保存、取消和空白禁用。
10. **实现筛选与统计**：用三值联合、纯筛选与派生计数，说明统计不随可见筛选改变。
11. **实现清除与重置**：区分基于 pending 数组的清除与固定下一值的重置。
12. **组装并观察 Demo**：按第十节固定序列操作，并展开五份同源源码。
13. **高价值错误与排查**：只保留第十二节错误清单，不重复前置课程的完整理论。
14. **练习与验收**：要求增加一条固定功能变体并按可见结果判断，不要求引入新 API。
15. **本节小结与官方来源**：收束为身份、快照、updater、不可变更新和派生值五条开发规则。

正文表达应详细但直接。可以用“任务”“实现步骤”“验收结果”描述学习者正在完成的应用，不能出现
BL2、B13、B15-B17、路线、总计划、批次、复审、测试、构建、manifest、Track、前后课、行数、字数
或固定生产哈希等叙事。来源区只保留实际支撑正文的 React、TypeScript、ECMAScript 官方页面，不把
研究文件本身当作官方来源。

### 11.4 练习建议

只选择不扩展知识边界的练习：

- 给 `TaskFilter` 增加不了第四个值的类型预测题，说明联合类型的约束。
- 增加“恢复 ID `2` 为未完成”的固定操作，预测三个统计值和两个筛选结果。
- 为编辑保存补一个“标题没有变化时仍退出编辑”的行为，并解释为什么不需要 Effect。
- 从一段使用 `push`、索引 `key` 和冗余 `completedCount` State 的代码中指出三个错误并改正。

不布置存储、网络、拖拽、撤销、搜索防抖、自动聚焦、Context、Reducer 或表单提交练习。

## 十二、高价值错误清单

| 错误 | 触发写法或条件 | 后果 | 正确处理 | 依据 |
| --- | --- | --- | --- | --- |
| render 时调用动作 | `onClick={deleteTask(task.id)}` | render 期间立即删除或得到非函数值 | 传 `() => deleteTask(task.id)` | `C01` |
| 直接改任务对象 | `task.completed = true` | 破坏旧快照与共享引用 | `map` 命中后返回 `{ ...task, completed: true }` | `C08` |
| 原地改数组 | `tasks.push(nextTask)` 或 `tasks.splice(...)` | 复用旧数组引用，破坏更新纪律 | 展开添加，`filter` 删除 | `C09` |
| 基于快照构造任务后覆盖并发更新 | `setTasks([...tasks, nextTask])` 被复杂同事件更新复用 | 可能漏掉 pending 数组变化 | `setTasks(previous => [...previous, nextTask])` | `C04`、`C06` |
| 在 updater 内调用别的 setter | `setTasks(previous => { setDraft(''); return ... })` | updater 不再纯，开发期重复调用会暴露问题 | 文本清理放在 updater 外的 handler 顺序中 | `C07` |
| 用索引或标题当 key | `key={index}` / `key={task.title}` | 删除、编辑或重名时身份不稳定 | 使用创建时写入数据的 `task.id` | `C11`、`C12` |
| 在 render 中生成 ID | `key={Math.random()}` 或 render 时递增 | 每次 render 身份变化，输入可能被重建 | 只在成功添加事件中消费 `nextTaskId` | `C11`、`C12` |
| 以 `undefined` 初始化受控文本 | `useState<string | undefined>()` | 输入在受控和非受控之间切换 | 从 `''` 开始并同步更新字符串 | `C13`、`C15` |
| 按键时立即 trim | `onChange={e => setDraft(e.currentTarget.value.trim())}` | 用户无法保留编辑中的首尾空格，光标体验混乱 | 只在添加/保存动作中 trim | `C16` |
| 修改 canonical 标题作为编辑草稿 | 每次输入直接 `map` 改任务 | 取消无法恢复原值 | 独立 `editingDraft`，保存时才写回 | `C03`、`C08` |
| 把筛选结果或统计存成 State | 同时维护 `tasks`、`visibleTasks`、三个计数 | 多个 setter 容易失同步 | render 中从 `tasks` 与 `filter` 派生 | `C17` |
| 基于可见数组统计 | 完成筛选只显示两项就把总计显示为二 | 筛选改变业务统计含义 | 始终从完整 `tasks` 计算 | `C17` |
| setter 后立刻读取新值 | `setTasks(...); console.log(tasks.length)` | 读到当前 render 的旧快照 | 根据已知输入推导或等待下一 render 显示 | `C04` |
| 保存空标题 | 只检查原始字符串长度 | 空白任务进入数据 | 保存前 `trim()` 并禁用空白动作 | `C16` |
| 用 `useId` 生成任务 key | 把 DOM 关联 ID 当业务身份 | ID 不来自任务数据，职责错误 | 使用任务创建时固定的业务 ID | `C11`、`C12` |

## 十三、明确排除项

以下内容不得进入 BL2 正文、Demo、练习或 manifest 描述：

1. `useReducer`、reducer/action、Context、provider 或外部状态库。
2. `useEffect`、Effect 同步、依赖数组、cleanup、`useRef`、DOM Ref、自动聚焦或 `useId`。
3. `<form>`、`onSubmit`、`FormData`、Action、表单校验 API、受控/非受控比较、多个表单字段架构或
   表单库。
4. localStorage、IndexedDB、cookie、URL 状态、文件存储、服务器持久化或离线同步。
5. fetch、XHR、WebSocket、REST、GraphQL、乐观更新、并发请求或错误重试。
6. 拖拽、排序、动画、撤销/重做、键盘快捷键、搜索、防抖、分页或虚拟列表。
7. `useMemo`、`memo`、`useCallback`、性能测量、并发 UI、Transition 或 Suspense。
8. UUID、时间戳、随机数、`crypto.randomUUID()`、第三方 ID 库、Immer 或任意第三方依赖。
9. 深克隆、数据规范化、领域状态机、复杂校验或跨组件 State 所有权的完整理论。
10. checkbox 受控专题、Enter 提交、原生表单默认行为或完整无障碍关联教学；当前项目只使用按钮和
    嵌套 label 完成指定交互。
11. 持久测试文件、fixture、`data-testid`、验收命令、浏览器工具说明、生产哈希或审查结论出现在
    学习者正文中。

## 十四、不采用的结论

1. “任务清单天然需要 `useReducer`”不成立；当前六份局部 State 与少量直接 handler 足以清楚表达指定
   功能，且 reducer 尚未进入学习范围。
2. “派生统计应同步到独立 State 才高效”不成立；三个小数组计算应直接来自当前 `tasks`，本课不做
   没有测量依据的 memoization。
3. “受控输入出现就必须提前完整讲 B20 表单”不成立；本课只保留两个输入的最小桥接合同，并避开 form
   submit、`FormData`、校验与 ID 关联。
4. “`useId` 可以同时解决列表 key”不成立；列表身份来自任务数据，DOM 关联与业务身份是不同职责。
5. “每次更新都深克隆全部任务更安全”不成立；只替换数组与实际变化的任务对象即可，未变化对象可以
   共享。
6. “筛选后的数组就是新的业务数据源”不成立；它只是当前 render 的派生视图，更新仍按稳定 ID 作用于
   canonical `tasks`。
7. “重置必须通过改变组件 key 或刷新页面”不成立；把六份 State 设回固定初始值即可完整验收。
8. “研究记录中的 BL2、命令和验证步骤也应写进正文”不成立；这些只属于生产依据，学习者正文只讲
   应用需求、实现与可观察结果。

## 十五、实施准入与停止点

本研究完成只证明 BL2 的官方事实、范围与实施合同已冻结，不等于课程已经可访问或新路线已经增加完成
数。后续实施必须在同一原子批次内完成正文、五文件真实 Demo、entry/demo manifest、Track、必要状态
写回、临时验证、质量命令、生产浏览器验收和复杂修改复审；具体哈希、内容块数量和浏览器证据只能在
实现快照产生后填写。

当前停止点如下：

- 只保留本研究文件；不创建 `src/categories/frontend/react/core/learn/lab-task-editor.md`。
- 不创建 `src/categories/frontend/react/core/demos/lab-task-editor/` 或任何临时仓库测试资产。
- 不登记 entry manifest、demo manifest 或 Track，不修改总计划完成状态。
- 不读取、研究、实现或登记 B18、B19、B20、B21、BL3 及任何中级/高级课程。
- 不暂存、不提交、不清理、不恢复工作区中的任何文件。

## 十六、本研究文件验证要求

- 只对本文件运行聚焦 Prettier 检查，不格式化仓库其他文件。
- 对本文件执行 whitespace / `git diff --check` 检查；目标应保持 untracked。
- 核对禁用范围关键词只出现在研究边界和排除说明中，不把它们误写成 Demo 依赖。
- 最终再次确认除本文件外没有产生新的修改，不提交代码。
