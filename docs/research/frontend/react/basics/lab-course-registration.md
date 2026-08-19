# BL3「实战：课程报名」官方研究记录

## 研究状态、版本与冻结边界

- 课程 ID：`react.core.learn.basics.lab-course-registration`。
- 总计划暂定标题：`实战：课程筛选与报名表单`。
- 建议左侧短标题与正文标题：`实战：课程报名`。
- 课程类型：React Core 基础阶段实战课，`beginner` 本科基础范围。
- 研究日期：`2026-08-16`。
- React 文档基线：React `19.2`。
- 仓库运行时基线：React / React DOM `19.2.8`。
- 类型基线：TypeScript `6.0.3`、`@types/react 19.2.18`。
- 生产写回边界：本轮只新增本研究文件；不修改课程正文、Demo、CSS、entry/demo
  manifest、Track、总计划、依赖、测试或任何后续课程资产。

总计划已经确认 B01-B21、BL1-BL2 完成，BL3 是基础阶段唯一当前目标，也是基础 Gate 的最后一课。
本课只把此前已经学过的固定数据、组件、Props、条件与列表、事件、`useState`、render 派生值、DOM
Props、`useId`、原生表单和 State 所有权组合成一个纯客户端、内存内的小应用，不新增 React API。

明确禁止：Effect、Context、Reducer、Ref、异步请求、持久化、路由、第三方库、复杂校验、Form
Action、服务端提交、文件上传、性能缓存和任何中级课程的新知识。研究完成后停止，不读取、研究、编写
或登记 I01 及任何下一课。

### 标题评估

总计划标题“实战：课程筛选与报名表单”准确列出了两个功能，但作为学习路径左侧标题偏长，也把实现手段
“表单”并列写进产品名称。按照“左侧标题使用简短、稳定的知识点名称，详细说明放入 summary 和正文”的
规则，建议收短为“实战：课程报名”：

- “课程报名”保留了学习者最终完成的真实产品对象和动作。
- “筛选”仍是核心功能与验收要求，写入 summary、学习目标和正文，不会因标题收短而丢失。
- “表单”是实现报名流程的主要载体，正文会完整覆盖，但不需要占用左侧导航标题。
- 标题不使用课程序号，也不使用“综合”“全解”等模糊词，符合此前 BL1、BL2 的稳定命名方式。

建议 summary：`组合受控筛选、派生列表、State 所有权、DOM Props、useId 与原生表单，完成一个纯客户端的课程报名应用。`

## 一、研究方法与证据边界

1. 先完整读取总计划中的 BL3 范围、逐课执行合同、基础 Gate 和标题规则，再读取课程内容规范与调研来源
   规范。
2. 完整读取 B18 DOM Props、B19 `useId`、B20 React 表单、B21 State 所有权的已完成研究，复用其中
   已由一手来源核验的公共合同；同时读取 BL1、BL2 研究，复用实战课的功能、组件、同源 Demo 和固定
   验收结构。
3. 当前研究需要的 React、WHATWG HTML、XHR 与 WAI-ARIA URL 都已知，使用
   `curl -L --fail --silent --show-error` 直接回读；全部关键入口在 `2026-08-16` 返回 HTTP `200`，
   没有进行关键词搜索，也没有采用搜索摘要、社区文章或二手教程。
4. React 公共行为以 React `19.2` 官方文档为准；仓库 `package.json` / `package-lock.json` 仅用于确认
   当前实际运行时和类型版本，不能把 React Learn 页面称为 `19.2.8` patch 专属文档。
5. 本实战不重新承担 B18-B21 的完整理论教学。正文只在实现当前产品所需的位置回顾已学合同，并让每条
   合同产生可观察结果。
6. `submittedEntries` 表示“最后一次真正触发 `onSubmit` 时的提交快照”，不是当前字段值的同步副本；
   因而它可以成为独立 State。可见课程、匹配数量和当前选中课程仍必须在 render 中派生，不能复制进
   State。

## 二、一手来源卡

| ID | 规范 / 官方来源 | 本研究采用范围 |
| --- | --- | --- |
| `R00` | [React Versions](https://react.dev/versions) | 当前 React 文档版本为 `19.2`，官方文档不按每个 patch 单独发布。 |
| `R01` | [React 19.2.8 release](https://github.com/facebook/react/releases/tag/v19.2.8) | 仓库 React / React DOM `19.2.8` 的官方 patch 身份；不采用内部实现。 |
| `R02` | [Thinking in React](https://react.dev/learn/thinking-in-react) | 固定数据、组件层级、静态 Props 流、最小 State、owner、render 派生筛选和 inverse data flow。 |
| `R03` | [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) | 最近共同父组件、值与 handler Props、每项 State 的单一事实来源。 |
| `R04` | [`useState`](https://react.dev/reference/react/useState) | 当前 State、setter、下一次 render 和函数组件顶层调用。 |
| `R05` | [Responding to Events](https://react.dev/learn/responding-to-events) | 传递 handler、带参数包装函数、自定义 handler Prop 和显式事件响应。 |
| `R06` | [Conditional Rendering](https://react.dev/learn/conditional-rendering) | 使用普通 JavaScript 分支显示空结果、状态文字和可选结果。 |
| `R07` | [Rendering Lists](https://react.dev/learn/rendering-lists) | `filter` / `map`、数据稳定 ID 和列表直接项的 `key`。 |
| `R08` | [`<input>`](https://react.dev/reference/react-dom/components/input) | 文本 `value`、checkbox / radio `checked`、同步 `onChange`、`name`、`required`、`disabled` 和 label。 |
| `R09` | [`<select>`](https://react.dev/reference/react-dom/components/select) | 受控单选 `select` 的字符串 `value` 与同步 `onChange`。 |
| `R10` | [`<form>`](https://react.dev/reference/react-dom/components/form#handle-form-submission-with-an-event-handler) | 客户端 `onSubmit`、`preventDefault()` 和使用 `FormData` 读取当前表单。 |
| `R11` | [`useId`](https://react.dev/reference/react/useId) | 组件顶层生成关联 ID、共享前缀派生多个 ID，以及不得用于列表 key。 |
| `R12` | [React DOM Common Components](https://react.dev/reference/react-dom/components/common) | `className`、`htmlFor`、`data-*`、`aria-*`、camelCase DOM props 与布尔 prop。 |
| `R13` | [Using TypeScript: DOM Events](https://react.dev/learn/typescript#typing-dom-events) | 内联 handler 优先依靠 JSX 推断；抽取 handler 时再标注准确事件类型。 |
| `H01` | [WHATWG HTML: The label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element) | `label[for]` 通过同一树中控件的 `id` 建立关联。 |
| `H02` | [WHATWG HTML: Constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraint-validation) | 原生约束校验可能在 submit event 前阻止提交。 |
| `H03` | [WHATWG HTML: Constructing the entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) | 有效 `name`、未选 radio、disabled 控件和表单 entry 的纳入/排除规则。 |
| `H04` | [WHATWG HTML: The button element](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element) | 表单按钮默认提交边界；提交与普通命令应显式声明 `type`。 |
| `X01` | [XHR: `FormData`](https://xhr.spec.whatwg.org/#dom-formdata) | `new FormData(form)`、entry 迭代、`get()` / `getAll()` 的公共合同。 |
| `A01` | [WAI-ARIA 1.2: `aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby) | 使用一个或多个元素 ID 为控件建立补充描述关系。 |

## 三、逐 claim 事实账本

| Claim | 可用于本实战的准确事实 | 一手来源 | 当前边界 |
| --- | --- | --- | --- |
| `C01` | `react.dev` 当前文档基线为 React `19.2`；当前仓库运行时是官方 `19.2.8` patch。 | `R00`、`R01`、仓库锁文件 | 正文只在 frontmatter 写适用版本，不展开 patch 差异。 |
| `C02` | Thinking in React 先从数据模型和组件层级建立静态版本，再找最小 State、选择 owner 并通过 handler 完成交互。 | `R02` | 实战按该分析顺序组织，但不把它写成 runtime 阶段。 |
| `C03` | 保持不变、由上层提供或能从当前 Props / State 计算的值不应成为新的 State。 | `R02` | 固定课程、可见列表、匹配数量和是否存在可报名课程都不存 State。 |
| `C04` | 需要由多个组件共同消费的 State 通常由它们最近的共同父组件拥有，再通过 Props 向下分发。 | `R02`、`R03` | 这是当前组件树的 owner 选择，不推出全应用集中状态。 |
| `C05` | 每项 State 有一个明确事实来源；需要统一组装、提交和观察的字段可以由共同父组件集中拥有。 | `R03` | 筛选、课程选择、姓名、邮箱和提交快照都由根组件拥有，字段组件只接收值与更新函数。 |
| `C06` | 父组件把当前值和 handler 作为 Props 向下传，子组件通过显式调用 handler 请求 owner 更新。 | `R02`、`R03`、`R05` | 不使用“回调自动向上流动”或“双向绑定”措辞。 |
| `C07` | `useState` 返回当前 render 的 State 与 setter；setter 请求一次新的 render。 | `R04` | 当前事件中的变量仍是当前快照，不声称 setter 原地改值。 |
| `C08` | 固定数组可先按条件 `filter`，再用 `map` 生成 JSX；直接列表项的 `key` 来自数据中的稳定 ID。 | `R02`、`R07` | 不使用索引、随机值、标题或 `useId` 作为 key。 |
| `C09` | 受控文本 input 使用字符串 `value` 与同步更新该字符串的 `onChange`。 | `R08` | 姓名、邮箱和搜索词都从空字符串开始，不切换受控模式。 |
| `C10` | checkbox / radio 的选中状态使用 boolean `checked`；受控单选 `select` 使用字符串 `value` 与同步 `onChange`。 | `R08`、`R09` | radio 的 `value` 是提交值，不是选中状态。 |
| `C11` | 客户端接管普通 form 提交时，handler 调用 `preventDefault()`；提交逻辑应挂在 form `onSubmit`，而不是只监听按钮 click。 | `R10` | 不引入 Action、请求、pending 或服务端行为。 |
| `C12` | `new FormData(form)` 按表单当前 entry list 生成提交数据，可迭代观察实际 `name=value` 条目。 | `R10`、`X01`、`H03` | 输出只作为内存中的最后提交快照，不持久化。 |
| `C13` | `name` 决定提交字段名；`id` 负责元素身份与关联，不能替代 `name`。 | `R08`、`H03` | 筛选控件故意不写 `name`，不进入报名数据。 |
| `C14` | 未选中的 radio 不产生 entry；同名 radio 组只提交当前选中的可用选项。 | `R08`、`H03` | 课程单选使用统一 `name="courseId"`。 |
| `C15` | `required` 参与原生约束校验；无效控件可能让浏览器在 submit event 之前阻止提交。 | `R08`、`H02` | 不编写自定义错误状态机，验收以 `onSubmit` 未触发、快照未变化为准。 |
| `C16` | disabled 原生控件不可交互，并且不进入表单 entry list。 | `R08`、`H03` | 已满课程的 radio 直接使用 `disabled`，不仿造自定义禁用控件。 |
| `C17` | `label` 的 `htmlFor` / HTML `for` 必须匹配目标控件 `id`；点击 label 可激活对应控件。 | `R08`、`R12`、`H01` | `name`、placeholder 或显示文本都不能代替该 ID 关系。 |
| `C18` | `useId()` 在组件顶层生成用于可访问关联的唯一 ID；一次调用可作为多个相关 ID 的共享前缀。 | `R11` | 不解析字符串格式，不保存为业务 ID，不用于课程 key。 |
| `C19` | `aria-describedby` 通过元素 ID 引用补充说明；描述不能替代 label 提供名称。 | `A01`、`C17` | 本实战只连接稳定帮助文本，不扩展复杂错误播报或 ARIA widget。 |
| `C20` | React DOM props 通常使用 camelCase；`className`、`htmlFor` 是常用映射，`data-*` 与 `aria-*` 保持连字符。 | `R12` | Demo 只使用当前业务真实需要的 props，不展开完整属性词典。 |
| `C21` | 表单中的提交按钮和普通命令应显式写 `type="submit"` / `type="button"`，避免默认提交歧义。 | `H04`、`R10` | 本实战只有一个提交按钮；筛选重置若后续增加，只能是普通按钮。 |
| `C22` | 最后提交快照与当前字段值是两个不同时间点：字段继续编辑不会改变过去已提交的结果，直到再次提交。 | `C07`、`C11`、`C12` 的项目推导 | 这是本实战的观察设计，不宣称浏览器自动保存提交历史。 |
| `C23` | JSX 上的短内联 DOM handler通常可由上下文推断类型；抽取 handler 时使用与目标元素匹配的事件类型。 | `R13` | 不为了展示类型而枚举整个 React 事件体系。 |
| `C24` | 当前筛选变化时由同一 owner 同步清空已选课程，可以避免被过滤掉的课程仍作为不可见选择残留。 | `C04`、`C06`、`C07` 的项目规则 | 这是明确产品规则，不使用 Effect 事后同步，也不冒充 React 通用要求。 |

## 四、实战范围与学习终点

### 4.1 唯一产品目标

学习者完成一个单页“课程报名”应用：从固定课程数据中按名称、分类和是否可报名进行受控筛选，在派生
结果中选择一门可报名课程，填写姓名与邮箱，通过原生表单约束后提交，并在页面中看到浏览器实际生成的
`FormData` 条目。

整个应用只存在当前页面内存中。刷新页面恢复固定初始状态；没有服务器、网络、存储、路由或第三方
依赖。

### 4.2 可验证学习终点

完成本实战后，学习者应能：

1. 从需求和固定数据画出组件树，并为每项 State 标出唯一 owner。
2. 用受控搜索词、分类和可报名开关驱动 render 派生列表，不复制可见列表或数量到 State。
3. 用稳定业务 ID 同时处理列表 key、课程选择值和可观察 DOM 数据，但不混用 `useId`。
4. 用 `className`、`data-*`、`disabled`、`required`、`htmlFor`、`aria-describedby` 等已学 DOM props
   构建真实界面。
5. 用 `useId` 为筛选和报名字段派生唯一 label / description 关联 ID。
6. 用 form `onSubmit`、`preventDefault()` 和 `FormData` 生成并显示最后一次有效提交快照。

课程到此停止。它不教授如何把数据发送到服务器，也不教授更复杂的 State 结构、跨层共享、异步同步或
表单 Action。

## 五、已学知识清单与组合职责

| 已学能力 | 本实战中的唯一职责 | 不重新展开 |
| --- | --- | --- |
| TSX、函数组件、模块边界 | 建立数据、筛选、列表、报名字段和根组件文件。 | JSX Runtime、Root 生命周期、构建原理。 |
| Props、函数 Prop、组合 | 根组件向筛选和课程列表传当前值与动作；form 组合列表与字段。 | 通用组件库、render prop 新设计。 |
| 条件渲染 | 显示空结果、已满状态和提交结果。 | Suspense、Portal 或命令式切换。 |
| 列表与稳定 `key` | `visibleCourses.map(...)`，`key={course.id}`。 | 排序、分页、虚拟列表或随机 key。 |
| 组件纯度 | 固定数据不被修改，render 中只做纯筛选与查找。 | Fiber、StrictMode 深入或性能优化。 |
| 事件处理 | 输入、选择、开关和提交 handler；动作通过函数 Prop 显式连接。 | 传播专题、全事件类型枚举。 |
| Hook 调用规则 | `useState` / `useId` 均在所属函数组件顶层无条件调用。 | 条件 Hook、custom Hook 或 `use` 例外。 |
| `useState` 与更新模型 | 记住筛选、课程选择、字段当前值和最后提交快照。 | Reducer、transition 或并发 UI。 |
| State 不可变更新 | `submittedEntries` 每次提交替换为新数组。 | 深层业务对象编辑或 Immer。 |
| DOM Props | 使用准确名称和值表达 class、关联、布尔状态和可观察业务 ID。 | props spread 抽象、style 系统或自定义元素。 |
| `useId` | 生成当前组件实例的 DOM 关联前缀。 | 列表 key、数据库 ID、URL ID 或 SSR 实现。 |
| React 表单 | 受控字段、radio、`required`、`disabled`、form submit 与 `FormData`。 | 上传、复杂校验、Form Action、异步提交。 |
| State 所有权 | 最小 State、最近共同父、局部 owner、单一事实来源和 render 派生。 | 中级状态结构、完整提升重构或跨层共享。 |

## 六、功能与数据合同

### 6.1 页面可见区域

1. 标题“课程报名”和一句当前匹配摘要。
2. 筛选区：课程名称搜索、课程分类 select、“只看可报名”checkbox。
3. 课程结果区：匹配数量、课程单选列表、已满课程的原生禁用状态、空结果。
4. 报名字段区：姓名、邮箱及各自帮助文本。
5. 唯一提交按钮“提交报名”。只要当前至少有一门可选择课程，按钮就保持可操作，让原生 `required` /
   `type="email"` 约束可被真实观察；只有当前结果没有任何可报名课程时，按钮才使用原生 `disabled`，
   防止页面中根本没有可参与 required 校验的 radio 时产生无课程提交。
6. 最后提交结果：按 FormData entry 顺序显示字段名和值；首次有效提交前显示“尚未提交”。

### 6.2 固定课程数据

建议只用五门课程，覆盖三类、两个授课形式和一个不可报名状态：

```ts
export type CourseCategory = 'frontend' | 'backend' | 'design'

export type Course = {
  readonly id: string
  readonly title: string
  readonly category: CourseCategory
  readonly categoryLabel: string
  readonly format: '线上' | '线下'
  readonly available: boolean
  readonly summary: string
}

export const COURSES: readonly Course[] = [
  {
    id: 'react-ui',
    title: 'React 界面开发',
    category: 'frontend',
    categoryLabel: '前端',
    format: '线上',
    available: true,
    summary: '使用组件与状态完成交互界面。',
  },
  {
    id: 'typescript-app',
    title: 'TypeScript 工程实践',
    category: 'frontend',
    categoryLabel: '前端',
    format: '线下',
    available: true,
    summary: '用类型约束组织前端应用代码。',
  },
  {
    id: 'java-web',
    title: 'Java Web 入门',
    category: 'backend',
    categoryLabel: '后端',
    format: '线下',
    available: true,
    summary: '认识 Web 后端的请求与响应。',
  },
  {
    id: 'database-design',
    title: '数据库设计基础',
    category: 'backend',
    categoryLabel: '后端',
    format: '线上',
    available: false,
    summary: '从数据关系出发设计基础表结构。',
  },
  {
    id: 'interaction-design',
    title: '交互设计基础',
    category: 'design',
    categoryLabel: '设计',
    format: '线下',
    available: true,
    summary: '把用户目标转化为清楚的操作流程。',
  },
]
```

数据是模块常量，不进入 State，不在运行时新增、编辑、排序或删除。`id` 同时作为数据身份、列表 key、
radio `value` 和 `data-course-id`；DOM label / description ID 由 `useId` 生成，两类身份不能互换。

### 6.3 筛选规则

- `query` 去除首尾空白后，对课程 `title` 执行包含匹配；空字符串匹配全部。
- `category === 'all'` 时不限制分类，否则与 `course.category` 精确匹配。
- `onlyAvailable === true` 时只保留 `available` 课程；为 false 时保留全部，并让已满课程以 disabled radio
  真实呈现。
- 三个条件在同一次 render 中共同计算 `visibleCourses`；`matchCount` 直接使用
  `visibleCourses.length`。
- 任一筛选条件发生变化时，根 owner 同步把 `selectedCourseId` 设回空字符串。该规则保持选择可见、
  可解释，且不需要 Effect 追赶派生结果。

### 6.4 课程选择与报名规则

1. 每张课程项使用同名 radio：`name="courseId"`、`value={course.id}`、
   `checked={selectedCourseId === course.id}`。
2. 可报名课程的 radio 可选择；已满课程写 `disabled={!course.available}`，不能选择也不会进入 FormData。
3. 可见课程 radio 写 `required`，姓名和邮箱也写 `required`；邮箱使用 `type="email"`。
4. 姓名、邮箱是受控字符串，初始值均为 `''`，每次 `onChange` 同步更新对应 State。
5. 点击提交由 form `onSubmit` 统一处理，先 `preventDefault()`，再读取
   `new FormData(event.currentTarget)`；不监听提交按钮 `onClick` 承担业务逻辑。
6. 每次有效提交把有序 `name/value` 条目转换为新的只读字符串数组并替换
   `submittedEntries`。不请求、不延时、不显示伪 pending 或成功持久化提示。
7. 提交后不清空字段或选择。学习者可以比较“当前受控字段”与“最后提交快照”；继续编辑只改变当前值，
   再次有效提交才替换快照。
8. 筛选控件不写 `name`，因此不会混入报名 FormData。结果应只有 `courseId`、`studentName`、
   `studentEmail` 三项。

## 七、State、派生值与 owner 合同

### 7.1 真实 State

| State | 类型 | 初始值 | owner | 唯一职责 |
| --- | --- | --- | --- | --- |
| `query` | `string` | `''` | `CourseRegistrationDemo` | 当前课程名称筛选词。 |
| `category` | `CourseCategory \| 'all'` | `'all'` | `CourseRegistrationDemo` | 当前分类筛选。 |
| `onlyAvailable` | `boolean` | `false` | `CourseRegistrationDemo` | 是否隐藏已满课程。 |
| `selectedCourseId` | `string` | `''` | `CourseRegistrationDemo` | 当前课程单选值。 |
| `submittedEntries` | `readonly SubmittedEntry[] \| null` | `null` | `CourseRegistrationDemo` | 最后一次有效 submit 的历史快照。 |
| `studentName` | `string` | `''` | `CourseRegistrationDemo` | 姓名 input 当前值。 |
| `studentEmail` | `string` | `''` | `CourseRegistrationDemo` | 邮箱 input 当前值。 |

姓名、邮箱、课程选择和最后提交快照共同组成当前报名流程。根组件统一拥有这些值，既能把当前值通过
Props 交给字段组件，又能在提交后保留独立的历史快照。`RegistrationFields` 不保存副本，只负责渲染
字段并把更新意图交回根组件。

### 7.2 只在 render 中计算

以下值禁止声明 State，也不使用 `useMemo`：

```ts
type SubmittedEntry = {
  readonly name: string
  readonly value: string
}

const normalizedQuery = query.trim()
const visibleCourses = COURSES.filter((course) => {
  const matchesQuery = course.title.includes(normalizedQuery)
  const matchesCategory = category === 'all' || course.category === category
  const matchesAvailability = !onlyAvailable || course.available

  return matchesQuery && matchesCategory && matchesAvailability
})
const matchCount = visibleCourses.length
const hasSelectableCourse =
  visibleCourses.filter((course) => course.available).length > 0
```

禁止新增对应 State：`filteredCourses`、`matchCount`、`hasSelectableCourse`、`canSubmit`、`hasResults`、
`isFormValid`、`isSubmitting`、`isSubmitted` 等同步或伪异步 State。

### 7.3 更新入口

- 根组件为三个筛选条件提供 `handleQueryChange`、`handleCategoryChange`、
  `handleAvailabilityChange`；每个 handler 更新自己的筛选 State，并同步清空 `selectedCourseId`。
- `CourseList` 通过 `onCourseChange(courseId)` 请求根 owner 更新选择，不保留本地副本。
- `RegistrationFields` 的姓名与邮箱 handler 把新字符串交给根组件提供的更新函数。
- 根 form 的 `handleSubmit` 只负责取消默认导航、构造 FormData 和替换最后提交快照。
- 所有命名函数和函数组件在未来 TSX 实现中都必须在定义紧邻上方写规范中文职责注释。

## 八、组件树与 Props 合同

### 8.1 组件树

```text
CourseRegistrationDemo
├── CourseFilters
├── form（原生宿主元素，onSubmit 在根 owner）
│   ├── CourseList
│   │   └── CourseOption × visible course count
│   └── RegistrationFields
└── 最后提交结果（根组件内的语义 section）
```

`form` 是宿主元素，不是 React 函数组件。最后提交结果只使用一次，直接保留在根组件中，不为形式统一创建
薄包装组件。

### 8.2 组件职责

| 组件 | 主要输入 | 职责 | 禁止承担 |
| --- | --- | --- | --- |
| `CourseRegistrationDemo` | 无 | 拥有根级七份 State，派生列表、计数和可选择状态，定义筛选、选择、字段与 submit handler，组装 form 和结果。 | 请求、存储、Effect、Context、Reducer、校验状态机。 |
| `CourseFilters` | 三个筛选值与三个准确 handler | 用一次 `useId` 派生筛选控件 ID，渲染受控搜索、分类和可报名开关。 | 保存筛选副本、提交报名数据。 |
| `CourseList` | `courses`、`selectedCourseId`、`onCourseChange` | 渲染 fieldset / legend、空结果和稳定 key 课程项。 | 再次筛选、修改固定数据、保存选择副本。 |
| `CourseOption` | 单门课程、是否选中、选择 handler | 渲染课程 radio、状态、标题、摘要与 `data-course-id`。 | 生成业务 ID、读取 key、保存 State。 |
| `RegistrationFields` | 姓名、邮箱与两个更新函数 | 用一次 `useId` 派生字段与帮助文本 ID，渲染受控字段并报告更新意图。 | 保存字段副本、提交、持久化或复杂校验。 |

### 8.3 最小 Props 形状

```tsx
type CourseFiltersProps = {
  query: string
  category: CourseCategory | 'all'
  onlyAvailable: boolean
  onQueryChange: (nextQuery: string) => void
  onCategoryChange: (nextCategory: CourseCategory | 'all') => void
  onAvailabilityChange: (nextValue: boolean) => void
}

type CourseListProps = {
  courses: readonly Course[]
  selectedCourseId: string
  onCourseChange: (courseId: string) => void
}

type RegistrationFieldsProps = {
  studentName: string
  studentEmail: string
  onStudentNameChange: (nextName: string) => void
  onStudentEmailChange: (nextEmail: string) => void
}
```

Props 类型只表达值和函数的调用形状，不能自动证明 State owner。owner 仍由 State 声明位置、全部消费者和
更新入口共同证明。

## 九、DOM Props、useId 与原生表单合同

### 9.1 筛选关联

`CourseFilters` 在顶层调用一次 `useId()`，派生 `queryId`、`categoryId`、`availabilityId` 和
`filterHelpId`。搜索和分类使用 `label htmlFor`，搜索输入以 `aria-describedby={filterHelpId}` 引用简短
帮助文本；checkbox 可用 label 包裹或显式 `htmlFor`，两种方式只选一种。

筛选控件不写 `name`。它们是 UI 控制 State，不是报名提交字段。

### 9.2 报名字段关联

`RegistrationFields` 在顶层调用一次 `useId()`，派生：

- `studentNameId` / `studentNameHelpId`。
- `studentEmailId` / `studentEmailHelpId`。

每个 `label htmlFor` 与 input `id` 精确相等；每个 input 的 `aria-describedby` 只引用当前真实存在的帮助
文本 ID。不得用 placeholder 替代 label，不得给 ID 加 `#`，不得解析 `useId` 返回字符串。

### 9.3 课程列表 DOM

- 外层使用 `fieldset` 与 `legend` 表达一组课程选择。
- `CourseOption` 根项使用 `className` 表达 selected / unavailable 样式，并写
  `data-course-id={course.id}` 作为可观察业务数据。
- radio 的 checked 来自 `selectedCourseId === course.id`，`value` 使用稳定 `course.id`。
- unavailable 课程同时显示“名额已满”文字并使用原生 `disabled`，不能只靠颜色。
- 不添加正数 `tabIndex`、`aria-disabled` 模拟、`role="button"` 或 div click 伪控件。

### 9.4 校验与提交

- 课程 radio、姓名和邮箱使用原生 `required`；邮箱同时使用 `type="email"`。
- 提交按钮显式写 `type="submit"`，不因字段为空而 disabled，确保浏览器约束校验边界可观察；仅在
  `hasSelectableCourse` 为 false 时写 `disabled`，因为此时 DOM 中不存在可被选择的课程 radio。
- 浏览器阻止无效提交时，`handleSubmit` 不执行，`submittedEntries` 保持原值。
- 有效提交后显示真实 FormData 条目；不要声称已发送、已保存或报名成功。
- disabled 已满课程和没有 `name` 的筛选控件不会出现在结果中。结果不得手工拼成一个与 FormData
  无关的“看起来正确”对象。

## 十、完整交互与固定验收序列

所有行为验收从刷新后的固定初始状态开始，并按同一顺序执行：

| 步骤 | 操作 | 必须观察到的结果 |
| ---: | --- | --- |
| `0` | 初始加载 | 显示 5 门课程、4 门可报名、1 门“数据库设计基础”已满；分类为“全部”，只看可报名未选中，无课程选择，姓名/邮箱为空，结果为“尚未提交”。 |
| `1` | 直接点击“提交报名” | 原生 required 校验阻止 submit；没有页面导航，`onSubmit` 不产生结果，仍显示“尚未提交”。 |
| `2` | 分类选择“后端” | 显示“Java Web 入门”和“数据库设计基础”两门；课程选择保持空。 |
| `3` | 尝试选择“数据库设计基础” | disabled radio 不可选择；`selectedCourseId` 仍为空。 |
| `4` | 勾选“只看可报名” | 列表只剩“Java Web 入门”，匹配数量为 1；筛选变化同步清空课程选择。 |
| `5` | 选择“Java Web 入门”，姓名输入“王小明”，邮箱输入 `wang`，点击提交 | radio 被选中；原生 email 校验阻止 submit，最后提交结果仍未产生。 |
| `6` | 把邮箱改为 `wang@example.edu` 并提交 | 页面不导航；结果按顺序显示 `courseId=java-web`、`studentName=王小明`、`studentEmail=wang@example.edu`，没有筛选字段或已满课程条目。 |
| `7` | 姓名改为“王小明（更新）”，不提交 | 当前输入立即变化，但最后提交快照仍显示“王小明”。 |
| `8` | 再次提交 | 最后提交快照被新数组替换，`studentName` 更新为“王小明（更新）”，其他两项不变。 |
| `9` | 分类改为“前端” | 显示两门可报名的前端课程；课程选择同步清空，姓名、邮箱和最后提交快照保持不变。 |
| `10` | 不重新选择课程，直接提交 | radio required 再次阻止 submit；最后提交快照仍保持步骤 `8` 的值。 |
| `11` | 搜索词输入“没有这门课” | 结果数量为 0，显示明确空结果；没有不可达的隐藏 radio，课程选择为空，提交按钮因没有可选课程而 disabled。 |
| `12` | 清空搜索词、分类恢复“全部”、取消“只看可报名” | 恢复 5 门固定课程和初始顺序；已满课程仍 disabled，字段值与最后提交快照未被伪重置。 |

固定序列之外还必须核对：

1. 搜索、分类和 checkbox 都是受控控件，UI 与对应 owner State 始终一致。
2. 任意筛选变化只影响可见列表并清空选择，不修改 `COURSES`、字段 State 或最后提交快照。
3. 课程项顺序始终遵循固定数据，key 与 `data-course-id` 均来自 `course.id`。
4. 两次有效提交之间编辑字段不会偷偷同步旧快照；无效提交也不会清空或覆盖旧快照。
5. 运行源码中没有 Effect、Context、Reducer、Ref、Action、请求、存储、路由、第三方库或新 API。

## 十一、Demo 多文件建议

建议新增目录 `src/categories/frontend/react/core/demos/lab-course-registration/`，只包含六个文件：

| 文件 | 固定职责 |
| --- | --- |
| `course-data.ts` | 导出 `Course`、`CourseCategory` 和固定 `COURSES`；不含 React、函数或可变存储。 |
| `course-filters.tsx` | 导出无本地筛选 State 的 `CourseFilters`；负责受控筛选和 `useId` 关联。 |
| `course-list.tsx` | 导出 `CourseList`，同文件保留重复使用的 `CourseOption`；负责 fieldset、空结果、map、key 和 disabled radio。 |
| `registration-fields.tsx` | 导出受控 `RegistrationFields`；负责 `useId`、label、帮助文本、required 字段和字段更新回调。 |
| `lab-course-registration-demo.tsx` | 默认导出根组件；拥有根 State、派生值、筛选/选择/submit handler、form 与结果。 |
| `lab-course-registration-demo.css` | 只负责当前 Demo 的布局、可读状态和响应式边界。 |

不新增 barrel、hook、store、filter utility、schema、service、测试文件、fixture、第二套数据或一次性通用
包装组件。筛选表达式只在根组件使用一次，直接保留在根文件比抽象 helper 更清楚。

### 同源建议

- Demo ID 建议冻结为
  `react.core.learn.basics.lab-course-registration.course-registration-demo`。
- Demo 标题与可见标题使用“课程报名”。
- `loadComponent` 只加载 `lab-course-registration-demo.tsx` 的默认导出。
- `loadSource` 按上表顺序合并五个 TS/TSX 文件和 CSS，每段以 `// <filename>` 标明来源。
- 运行组件与展开源码必须指向同一组磁盘文件，不复制、删节或维护第二份展示代码。
- 同源字符数、UTF-8 字节数和 SHA-256 只能在实现快照形成后计算，本研究不猜测。

## 十二、无障碍与移动端边界

### 12.1 无障碍

- 所有文本输入与 select 都有可见 label；`htmlFor` 与 `id` 一一对应。
- 帮助文本使用 `aria-describedby` 补充说明，不代替 label。
- 课程选择使用原生 radio、fieldset、legend 和 label；不用可点击 div 伪造。
- 已满状态使用 `disabled` 加“名额已满”文字，不只依赖灰色。
- 空结果、匹配数量和最后提交结果都使用真实文本；不要求 live region 或复杂播报策略。
- 保持自然 DOM 与键盘顺序，不使用正数 `tabIndex`，不在禁用项上添加伪交互。
- `useId` 只承担 DOM 关联；课程 key 与 radio value 始终来自固定数据 ID。

### 12.2 移动端与放大文本

- CSS 禁止 Grid 和 `gap`，只使用 Flexbox、margin 和正常文档流。
- 卡片圆角不超过 `8px`；筛选控件、课程项和报名字段在窄屏转为纵向正常流。
- 可换行的 flex 行必须设置合适的 `min-width: 0`，长标题、邮箱和帮助文本可以断行，不能撑出容器。
- radio / label 的可点击区域保持完整，disabled 文案不覆盖控件；按钮文字不裁切。
- 桌面、`390px` 和 `390px + 200%` 文本下不得出现页面级横向溢出、控件重叠、结果被遮挡或不可达
  提交按钮。
- 不添加动画、拖拽、横向滚动课程带、仅 hover 可见信息或与报名流程无关的装饰。

## 十三、保留、新增、禁止与移交清单

### 13.1 保留并组合

- BL1 的固定课程数据、模块拆分、列表、稳定 key 和同源多文件 Demo 结构。
- BL2 的事件回调、字符串 State、受控输入窄合同、派生列表/统计和固定交互验收方式。
- B18 的 `className`、`htmlFor`、`data-*`、`aria-*`、`required`、`disabled` 等 DOM props。
- B19 的一次 `useId` 调用加稳定后缀、label / description 关联和“不作列表 key”边界。
- B20 的受控字段、form `onSubmit`、`preventDefault()`、FormData entry、原生 required / disabled。
- B21 的最小 State、owner、单一事实来源、值与 handler Props、render 派生结果。

### 13.2 当前实战新增

新增的只是产品组合与明确规则，不是新 API：

- 五门固定课程与三项筛选的业务数据合同。
- 筛选变化同步清空课程选择的交互规则。
- 筛选、课程列表、报名字段和提交快照形成的一条完整用户路径。
- “当前受控值”和“最后提交快照”两个时间点的可观察对照。
- disabled 已满课程、required 课程/姓名/邮箱共同组成的原生平台验收。

### 13.3 明确禁止

- `useEffect` 或任何 Effect 同步筛选、选择、提交结果。
- `useReducer`、Context、Provider、Ref、自定义 Hook、外部 Store。
- fetch / XHR 请求、Promise、timer、loading、重试、错误边界、服务端 API。
- LocalStorage、IndexedDB、cookie、URL query、文件或其他持久化。
- Router、第三方表单库、schema 校验、第三方组件或样式库。
- Form Action、`useActionState`、`useFormStatus`、Server Function、乐观更新。
- 自定义校验状态机、错误数组、复杂 ARIA widget、文件上传、多步骤报名。
- `useMemo`、`memo`、`useCallback`、性能测量、并发 UI。
- 动态新增/编辑课程、分页、排序、收藏、批量选择、撤销、自动保存。
- 随机数、时间戳、UUID 或 `useId` 生成课程业务 ID / key。

### 13.4 移交而不预教

- 相关 State 的合并/拆分、矛盾状态、重复对象、完整派生数据结构与缓存：留给后续状态结构课程；本研究
  不读取其正文或研究。
- 提升 State 的完整重构、受控/非受控组件 API 与默认值合同：留给后续对应课程。
- State 保留、位置身份与 key 重置：留给后续对应课程。
- Reducer、Context、Ref、Effect、异步数据、错误处理、性能和并发表单：全部保持后续路线边界。
- 真实提交、pending、服务端校验、Action 与成功重置：留给高级表单 Action 范围。

## 十四、高价值易错点

| 错误 | 触发方式 | 可观察后果 | 最小修正 | 依据 |
| --- | --- | --- | --- | --- |
| 把 `visibleCourses` / `matchCount` 存 State | 筛选 handler 同时维护原始条件和结果副本 | 多个 setter 可能失同步 | 每次 render 从固定数据与三个筛选值计算 | `C03` |
| 让 `CourseFilters` 自己保存筛选副本 | 根组件又需要筛选列表 | 两处可写事实来源 | 根 owner 保存，子组件接收值与 handler | `C04`-`C06` |
| 用 Effect 清除隐藏选择 | render 后再追赶当前筛选 | 出现一帧陈旧选择并引入未学 API | 在筛选事件中由同一 owner 同步清空 | `C24` |
| 用 `useId` 作为课程 key/value | 把 DOM 关联 ID 当数据身份 | 列表与提交身份不来自课程数据 | key/value 使用 `course.id` | `C08`、`C18` |
| 把 radio `value` 当选中状态 | 忽略 `checked` 的 boolean 合同 | 单选 UI 与 State 不一致 | `checked={selectedCourseId === course.id}` | `C10` |
| 已满课程只写 `aria-disabled` | 元素仍可能可交互并进入提交集合 | UI 与平台行为不一致 | 原生 radio 直接写 `disabled` 并加文字 | `C16` |
| 提交按钮按字段空值 disabled | 用自定义逻辑替代 required 观察 | 学习者看不到原生校验边界 | 有可选课程时保持可提交；仅无可选课程时 disabled | `C15`、`C16` |
| 只监听提交按钮 `onClick` | 键盘等提交入口绕过逻辑 | 表单行为不完整 | handler 放到 form `onSubmit` | `C11` |
| 把筛选 input 写上 `name` | FormData 收集了 UI 筛选条件 | 报名结果混入无关字段 | 筛选控件不写 name | `C12`、`C13` |
| 手工从 State 拼“提交结果” | 绕过浏览器 entry list | disabled / name 边界无法观察 | 从 `new FormData(form)` 生成结果 | `C12`、`C16` |
| 字段变化同步修改上次结果 | 把历史快照当当前派生值 | 无法区分编辑与提交时间点 | 只在有效 submit 替换快照 | `C22` |
| placeholder 替代 label | 没有稳定可见名称与关联 | 字段语义不完整 | label + htmlFor/id；帮助文本另用 describedby | `C17`-`C19` |
| 条件调用 `useId` | 空结果或错误状态改变 Hook 顺序 | 违反 Hook 调用规则 | 组件顶层无条件调用一次并派生后缀 | `C18` |
| 直接改 `COURSES` 或排序原数组 | 固定输入被 render / 事件修改 | 重复验收结果漂移 | 数据只读，当前项目只 filter / find | `C03`、`C08` |

## 十五、课程正文结构建议

面向学习者的正文建议按以下顺序编写，使用唯一一级标题与连续中文二级标题：

1. **学习目标**：保留 5-6 项可验收目标，覆盖筛选、owner、派生列表、表单关联和提交快照。
2. **最终成品与操作地图**：先展示真实应用与一条从筛选到提交的完整路径。
3. **固定课程数据**：定义 `Course`、分类联合、五门数据和稳定业务 ID。
4. **拆分组件与标注 owner**：画组件树，逐项列 State、消费者、owner 和更新入口。
5. **实现受控筛选**：搜索、分类、可报名开关；说明筛选变化同步清空选择。
6. **派生可见课程**：组合三个条件，计算列表与数量，处理空结果，使用稳定 key。
7. **实现课程选择**：同名受控 radio、checked/value、已满 disabled、fieldset/legend。
8. **建立可访问报名字段**：`useId` 前缀、label/htmlFor、帮助文本/aria-describedby、姓名和邮箱 State。
9. **接入原生校验与提交**：required、email、form onSubmit、preventDefault 与 FormData。
10. **显示最后提交快照**：解释当前值与提交时刻，不伪装服务器成功。
11. **组装并操作 Demo**：按固定序列验证筛选、禁用、无效提交、有效提交和再次编辑。
12. **易错使用提示**：保留上表中与当前项目直接相关的 5-8 个高价值错误，不重抄前置课百科。
13. **原理与适用边界**：分开官方事实、项目规则和禁止扩展；明确纯客户端内存边界。
14. **练习与验收**：修改固定数据、预测筛选计数、标 owner、修复冗余 State 或错误 FormData。
15. **本节小结与官方来源**：收束为最小 State、派生值、数据身份、DOM 关联和提交快照五条规则。

正文可以写“需求”“实现步骤”“验收结果”，但不得出现 `BL3`、总计划、路线、批次、Gate、下一课、
manifest、Track、构建、测试、浏览器工具、复审、signoff、行数、字数、本地依赖、源码哈希或研究过程。

### 练习边界

可采用：

- 增加一门固定、可报名的“设计”课程，预测初始数量和分类筛选数量。
- 从一段存储 `visibleCourses` State 的代码中删除冗余 State，并解释 owner。
- 修复错误的 radio `value` / `checked`、随机 key、`useId` 业务 ID 或筛选控件 `name`。
- 给现有字段补齐 label / description 关联并检查多实例 ID 不冲突。
- 预测 disabled 课程、未选 radio、无 name 筛选控件最终是否进入 FormData。

不得布置请求、存储、路由、多步骤、复杂校验、自动保存、Context、Reducer、Ref、Effect 或 Action 练习。

## 十六、最终验收清单

### 16.1 范围与教学

- [ ] ID 保持 `react.core.learn.basics.lab-course-registration`。
- [ ] 左侧与正文标题采用审核后的短标题“实战：课程报名”；summary 明确筛选与报名表单。
- [ ] 正文只组合已经完成的基础知识，没有引入未学 React API。
- [ ] 固定数据、功能要求、State owner、派生值、组件树和固定验收序列彼此一致。
- [ ] 学习者正文没有生产叙事、路线编号或下一课信息。

### 16.2 State 与行为

- [ ] `COURSES` 是只读模块常量，不是 State。
- [ ] 根组件拥有三项筛选、课程选择、姓名、邮箱和最后提交快照。
- [ ] `RegistrationFields` 不保存字段副本，只接收当前值和更新函数。
- [ ] `visibleCourses`、`matchCount` 在 render 中计算，没有 setter、Effect 或 useMemo。
- [ ] `hasSelectableCourse` 在 render 中计算；没有可报名 radio 时提交按钮 disabled，有可选课程时字段完整性仍交给原生校验。
- [ ] 任一筛选变化同步清空课程选择，字段与最后提交快照不受影响。
- [ ] disabled 已满课程不可选择；required / email 无效时 `onSubmit` 不产生新结果。
- [ ] 有效提交结果来自真实 FormData，只有三项报名字段；再次编辑不会自动改写旧快照。

### 16.3 DOM、无障碍与源码

- [ ] DOM props 使用准确名称和值：`className`、`htmlFor`、`data-*`、`aria-*`、`required`、
  `disabled`。
- [ ] `CourseFilters` 和 `RegistrationFields` 分别在组件顶层调用一次 `useId` 并派生稳定后缀。
- [ ] `useId` 不用于课程 key、radio value、持久数据或 CSS selector。
- [ ] 每个字段有可见 label；帮助文本由 `aria-describedby` 引用。
- [ ] 课程选择使用 fieldset / legend / 原生 radio；已满状态有文字，不只靠颜色。
- [ ] 每个前端函数定义上方有规范中文注释；逻辑直接，没有一次性抽象或过度防御。
- [ ] 运行组件与展开的六文件源码逐文件同源。
- [ ] CSS 不使用 Grid 或 `gap`，卡片圆角不超过 `8px`。

### 16.4 生产验证

- [ ] 临时验证资产只存在 `/tmp`，成功后清理，仓库不保留测试文件。
- [ ] type-check、lint、聚焦 Prettier、限定 diff check、build 和空测试目录命令按实现范围通过。
- [ ] 桌面、`390px` 与 `390px + 200%` 文本完成固定交互序列，无横向溢出、裁切或重叠。
- [ ] console error/warning、page error、失败请求和 HTTP `>=400` 响应均为 `0`。
- [ ] 正文 Demo ID、entry/demo manifest、Track、前置与 related 一致。
- [ ] 新课程、Demo、manifest、教学合同属于复杂修改，正式实现后完成一次独立 Standards/Spec 审查并
  达到 `PASS / 0 finding`。

## 十七、不采用的结论与当前停止点

1. “课程筛选需要 Effect 同步结果”不采用。可见课程和数量直接从当前筛选 State 在 render 中计算。
2. “字段组件应再保存姓名和邮箱副本”不采用。根组件统一拥有当前报名流程的可变值，字段组件只通过
   受控 Props 显示当前值并报告更新意图。
3. “提交结果就是当前字段值的别名”不采用。它表示最后一次有效提交时刻，字段后续变化不应倒改历史。
4. “禁用提交按钮比 required 更安全”不采用。本实战需要真实观察原生约束校验；没有业务依据的重复
   `canSubmit` 会形成第二套校验规则。
5. “已满课程只要显示灰色即可”不采用。使用原生 disabled 与可见文字，行为和语义同时成立。
6. “直接显示 State 对象等于验证 FormData”不采用。提交结果必须来自浏览器实际构造的 entry list。
7. “筛选控件也应写 name，信息更完整”不采用。它们不是报名字段，写 name 会污染提交结果。
8. “用 `useId` 统一所有 ID 最省事”不采用。课程业务身份来自固定数据，`useId` 只做 DOM 关联。
9. “实战应顺手加入请求、LocalStorage 或 Form Action 才完整”不采用。基础阶段终点是纯客户端、内存内
   的可验证组合应用。
10. “研究完成即可开始 I01”不采用。当前只完成 BL3 的单文件研究记录，未授权正文、Demo、manifest、
    Track、计划写回、基础 Gate 关闭或下一课研究。

当前严格停止于本文件。后续若获授权实施，仍需在同一原子批次完成正文、六文件同源 Demo、entry/demo
manifest、Track、浏览器验证、质量命令、独立复审和计划记录；在 BL3 完整闭环前不得打开或开始 I01。
