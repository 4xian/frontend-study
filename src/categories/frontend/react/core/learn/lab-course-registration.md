---
id: react.core.learn.basics.lab-course-registration
type: lesson
title: 实战：课程报名
summary: 组合受控筛选、派生列表、State 所有权、DOM Props、useId 与原生表单，完成纯客户端课程报名应用。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 180
prerequisites:
  - react.core.learn.basics.list-rendering-and-key
  - react.core.learn.basics.dom-props
  - react.core.learn.basics.use-id-accessible-links
  - react.core.learn.basics.react-forms
  - react.core.learn.basics.state-ownership-and-thinking-in-react
related:
  - react.core.learn.basics.lab-static-course-catalog
  - react.core.learn.basics.lab-task-editor
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-state
tags:
  - React
  - 实战
  - 课程筛选
  - State 所有权
  - useId
  - FormData
appliesTo: React 19.2（运行时 19.2.8）、HTML Living Standard、@types/react 19.2.18
verifiedAt: 2026-08-16
objectives:
  - 能把课程报名需求拆成固定数据、组件、State、派生值和事件合同。
  - 能用受控搜索、分类和可报名开关驱动同一次 render 中的派生列表。
  - 能让根组件统一拥有筛选、课程选择、报名字段和最后提交快照。
  - 能用稳定业务 ID 处理列表 key 与课程值，并用 useId 建立 DOM 关联。
  - 能用原生 radio、required、disabled、email 与表单语义完成报名输入。
  - 能通过 form onSubmit、preventDefault 和 FormData 保存最后一次有效提交快照。
recap:
  - 固定课程数据不是 State，可见列表、匹配数量和可提交课程状态都在 render 中计算。
  - 根组件保存跨区域共同使用的当前值，子组件通过值 Props 和函数 Props 参与单向数据流。
  - 课程业务 ID 用于 key、radio value 和数据属性，useId 只用于控件与标签或描述的关联。
  - 受控文本使用 value，checkbox 和 radio 使用 checked，select 使用字符串 value。
  - required 与 disabled 交给浏览器执行基础约束，提交逻辑统一放在 form 的 onSubmit。
  - 最后提交快照来自真实 FormData；字段继续编辑不会倒改已经提交的历史结果。
sources:
  - title: React Thinking in React
    url: https://react.dev/learn/thinking-in-react
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 固定数据、组件层级、最小 State、State 所有者、派生筛选与 inverse data flow
  - title: React Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 最近共同父组件、单一事实来源、值与事件处理函数 Props
  - title: React useState Reference
    url: https://react.dev/reference/react/useState
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - State、setter、render 快照与顶层调用
  - title: React Responding to Events
    url: https://react.dev/learn/responding-to-events
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 事件处理函数、自定义 handler Prop 与显式更新意图
  - title: React Rendering Lists
    url: https://react.dev/learn/rendering-lists
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - filter、map、数据稳定 ID 与列表 key
  - title: React input Reference
    url: https://react.dev/reference/react-dom/components/input
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - value、checked、onChange、name、required、disabled 与 label
  - title: React select Reference
    url: https://react.dev/reference/react-dom/components/select
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - 受控 select 的 value 与 onChange
  - title: React form Reference
    url: https://react.dev/reference/react-dom/components/form
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - onSubmit、preventDefault 与 FormData
  - title: React useId Reference
    url: https://react.dev/reference/react/useId
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 关联 ID、共享前缀与不得用作列表 key
  - title: React DOM Common Components
    url: https://react.dev/reference/react-dom/components/common
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - className、htmlFor、data-* 与 aria-* DOM Props
  - title: React Using TypeScript
    url: https://react.dev/learn/typescript
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - DOM 事件类型推断与抽取处理器类型
  - title: HTML Forms
    url: https://html.spec.whatwg.org/multipage/forms.html
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - label、fieldset、legend、button 与表单控件语义
  - title: HTML Constraint Validation
    url: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraint-validation
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - required、email 与交互式约束校验
  - title: HTML Constructing the Entry List
    url: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set
    sourceType: specification
    appliesTo: HTML Living Standard
    claims:
      - name、radio、disabled 与表单 entry 规则
  - title: XMLHttpRequest FormData
    url: https://xhr.spec.whatwg.org/#dom-formdata
    sourceType: specification
    appliesTo: XHR Living Standard
    claims:
      - FormData 构造器与有序条目
  - title: WAI-ARIA aria-describedby
    url: https://www.w3.org/TR/wai-aria-1.2/#aria-describedby
    sourceType: specification
    appliesTo: WAI-ARIA 1.2
    claims:
      - 补充描述的 ID 引用关系
---

# 实战：课程报名

## 一、学习目标

- 把一个完整报名流程拆成固定数据、组件职责、State、派生值、Props 和事件入口。
- 使用受控搜索框、分类下拉框和可报名复选框组合筛选条件。
- 为筛选、课程选择、姓名、邮箱和最后提交快照确定唯一 State 所有者。
- 从固定课程与当前筛选直接计算可见列表、匹配数量和是否存在可报名课程。
- 正确区分课程业务 ID、列表 key、radio value、DOM id、name 和 `useId`。
- 使用原生表单语义、约束校验和 `FormData` 完成可观察的提交闭环。

## 二、最终成品与验收结果

要完成的是一个纯客户端课程报名应用。页面使用五门固定课程，刷新后恢复初始状态。

应用包含四个连续区域：

1. 筛选区：按课程名称、课程分类和是否可报名筛选。
2. 课程区：显示匹配数量、可选课程、已满状态和空结果。
3. 报名区：选择课程，填写姓名与邮箱，触发原生约束校验。
4. 结果区：显示最后一次有效提交产生的 `FormData` 条目。

初始结果固定为：

- 共显示五门课程。
- 四门可以报名，一门“数据库设计基础”名额已满。
- 分类为“全部分类”，“只看可报名课程”未选中。
- 课程、姓名和邮箱均为空。
- 最后提交结果显示“尚未提交”。

项目完成后应满足以下行为：

| 操作 | 结果 |
| --- | --- |
| 输入课程名称 | 列表立即按标题包含关系筛选。 |
| 选择分类 | 只保留该分类中的课程。 |
| 勾选只看可报名 | 隐藏名额已满的课程。 |
| 改变任一筛选 | 清空当前课程选择，避免保留不可见选择。 |
| 选择已满课程 | 原生 disabled 阻止选择。 |
| 未选课程或必填字段为空时提交 | 浏览器约束校验阻止 `onSubmit` 产生新快照。 |
| 邮箱格式无效时提交 | 浏览器 email 校验阻止提交。 |
| 输入完整数据并提交 | 页面不导航，结果区显示真实 FormData 条目。 |
| 提交后继续编辑字段 | 当前输入变化，最后提交快照保持不变。 |

## 三、先固定课程数据合同

课程是应用的固定输入，不是用户在当前页面中创建或修改的数据。它适合放在独立模块常量中：

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
```

字段职责不能混用：

| 字段 | 职责 |
| --- | --- |
| `id` | 表达课程稳定身份，用于列表 key、radio value 和数据属性。 |
| `title` | 显示课程名称并参与文本筛选，不承担身份职责。 |
| `category` | 提供程序使用的固定分类值。 |
| `categoryLabel` | 提供页面可读的分类文本。 |
| `format` | 显示线上或线下授课形式。 |
| `available` | 决定课程能否选择，以及是否通过可报名筛选。 |
| `summary` | 简要说明课程内容。 |

固定数据如下：

| ID | 课程 | 分类 | 形式 | 状态 |
| --- | --- | --- | --- | --- |
| `react-ui` | React 界面开发 | 前端 | 线上 | 可报名 |
| `typescript-app` | TypeScript 工程实践 | 前端 | 线下 | 可报名 |
| `java-web` | Java Web 入门 | 后端 | 线下 | 可报名 |
| `database-design` | 数据库设计基础 | 后端 | 线上 | 名额已满 |
| `interaction-design` | 交互设计基础 | 设计 | 线下 | 可报名 |

```ts
export const COURSES: readonly Course[] = [
  {
    id: 'react-ui',
    title: 'React 界面开发',
    category: 'frontend',
    categoryLabel: '前端',
    format: '线上',
    available: true,
    summary: '使用组件与 State 完成可交互的前端界面。',
  },
  // 其余固定课程使用相同合同
]
```

`readonly` 是 TypeScript 的静态只读约束。项目仍要遵守不修改输入的规则，只通过 `filter`、`find` 和
`map` 读取数据。

## 四、拆分组件与职责

组件树只保留真实职责：

```text
LabCourseRegistrationDemo
├── CourseFilters
├── form
│   ├── CourseList
│   │   └── CourseOption × 当前可见课程数
│   ├── RegistrationFields
│   └── submit button
└── 最后提交结果
```

| 组件 | 输入 | 职责 |
| --- | --- | --- |
| `LabCourseRegistrationDemo` | 固定课程模块 | 拥有全部 State，派生列表，定义更新入口，组装表单和提交结果。 |
| `CourseFilters` | 三个筛选值与三个更新函数 | 渲染受控搜索、分类和可报名开关。 |
| `CourseList` | 可见课程、选中 ID、选择函数 | 渲染原生 radio 组、空结果、稳定 key 和已满状态。 |
| `CourseOption` | 单门课程及选择合同 | 显示一门课程，不保存 State。 |
| `RegistrationFields` | 姓名、邮箱与两个更新函数 | 渲染受控报名字段和可访问关联。 |

原生 `<form>` 不是自定义组件。最后提交结果只使用一次，直接留在根组件中，不需要为了文件数量再创建
包装组件。

## 五、确定 State 所有权

根组件保存七份 State：

| State | 类型 | 初始值 | 变化原因 |
| --- | --- | --- | --- |
| `query` | `string` | `''` | 用户编辑课程名称筛选。 |
| `category` | `CourseCategoryFilter` | `'all'` | 用户选择课程分类。 |
| `onlyAvailable` | `boolean` | `false` | 用户切换可报名筛选。 |
| `selectedCourseId` | `string` | `''` | 用户选择一门可报名课程。 |
| `studentName` | `string` | `''` | 用户编辑姓名。 |
| `studentEmail` | `string` | `''` | 用户编辑邮箱。 |
| `submittedEntries` | `readonly SubmittedEntry[] \| null` | `null` | 有效提交产生新的历史快照。 |

```tsx
const [query, setQuery] = useState('')
const [category, setCategory] = useState<CourseCategoryFilter>('all')
const [onlyAvailable, setOnlyAvailable] = useState(false)
const [selectedCourseId, setSelectedCourseId] = useState('')
const [studentName, setStudentName] = useState('')
const [studentEmail, setStudentEmail] = useState('')
const [submittedEntries, setSubmittedEntries] =
  useState<readonly SubmittedEntry[] | null>(null)
```

这样放置的原因是：

- 根组件同时连接筛选区、课程区、报名字段和提交结果。
- 每项可变事实只有一个可写来源。
- 子组件只接收当前值和更新函数，不创建同名副本。
- 提交快照只在提交事件中更新，不与当前输入同步。

State 所有者不等于唯一显示该值的组件。`CourseFilters` 显示筛选值，`CourseList` 显示课程选择，
`RegistrationFields` 显示姓名和邮箱，但这些组件都通过 Props 读取根组件拥有的 State。

## 六、识别派生值

下面的值都能从固定课程和当前 State 直接得到，不应再声明 State：

```tsx
const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')

const visibleCourses = COURSES.filter((course) => {
  const matchesQuery = course.title.toLocaleLowerCase('zh-CN').includes(normalizedQuery)
  const matchesCategory = category === 'all' || course.category === category
  const matchesAvailability = !onlyAvailable || course.available

  return matchesQuery && matchesCategory && matchesAvailability
})

const hasSelectableCourse = visibleCourses.some((course) => course.available)
const selectedCourse = COURSES.find((course) => course.id === selectedCourseId)
```

派生关系如下：

```text
COURSES + query + category + onlyAvailable
  -> visibleCourses
  -> visibleCourses.length
  -> hasSelectableCourse

COURSES + selectedCourseId
  -> selectedCourse
```

若把 `visibleCourses`、`matchCount` 或 `selectedCourse` 再存成 State，同一个事实就会出现两份来源。每次
修改筛选或选择时都要额外维护副本，遗漏一次更新就会产生矛盾界面。

## 七、实现受控筛选

### 1. 搜索框

受控文本输入使用字符串 `value` 和同步 `onChange`：

```tsx
<input
  value={query}
  onChange={(event) => onQueryChange(event.currentTarget.value)}
/>
```

输入框始终接收字符串，不在受控与非受控模式之间切换。筛选时先 `trim()`，让只有空格的查询等同于空
查询；再统一大小写，避免英文标题因大小写不同而无法匹配。

### 2. 分类 select

分类值使用固定联合：

```ts
export type CourseCategoryFilter = CourseCategory | 'all'
```

```tsx
<select value={category} onChange={handleCategoryChange}>
  <option value="all">全部分类</option>
  <option value="frontend">前端</option>
  <option value="backend">后端</option>
  <option value="design">设计</option>
</select>
```

选项值用于程序判断，显示文本用于用户阅读。不要用显示文本同时承担稳定分类值。

### 3. 可报名 checkbox

checkbox 的当前状态来自 `checked`，不是 `value`：

```tsx
<input
  type="checkbox"
  checked={onlyAvailable}
  onChange={(event) => onAvailabilityChange(event.currentTarget.checked)}
/>
```

### 4. 筛选变化清空课程选择

任一筛选变化时，根组件同时更新该筛选并清空课程选择：

```tsx
/** 更新课程分类筛选，并清空可能不再可见的课程选择。 */
function handleCategoryChange(nextCategory: CourseCategoryFilter) {
  setCategory(nextCategory)
  setSelectedCourseId('')
}
```

这是当前应用的产品规则：页面不会保留被筛选隐藏的课程选择。更新发生在用户事件中，不需要额外同步
过程。

## 八、派生课程列表与匹配数量

三项条件在一次 `filter` 中同时判断：

```text
标题匹配
AND 分类匹配
AND 可报名状态匹配
```

空查询匹配全部标题；分类为 `all` 时匹配全部分类；`onlyAvailable` 为 `false` 时不限制名额状态。三个
布尔判断全部为 `true` 的课程才进入结果。

匹配数量直接使用：

```tsx
<output>匹配 {visibleCourses.length} 门课程</output>
```

空结果是合法状态，需要明确显示：

```tsx
{courses.length === 0 ? (
  <p>没有符合当前条件的课程。</p>
) : (
  <ul>{/* 课程项 */}</ul>
)}
```

不要在空结果时继续渲染一个空 `<ul>`，也不要保留已经不可见的选择。

## 九、稳定 key 与业务身份

列表直接项的 key 来自固定课程数据：

```tsx
{courses.map((course) => (
  <CourseOption key={course.id} course={course} />
))}
```

同一业务 ID 还可以承担以下职责：

- radio 的 `value`，提交时识别课程。
- `data-course-id`，在 DOM 中观察当前课程项。
- `selectedCourseId` 的值，表达当前选择。

这些用途都依赖稳定的课程身份。标题可能修改或重复，数组索引会随筛选结果变化，随机数每次 render 都会
变化，因此都不适合作为 key。

`useId` 生成的是组件实例中的 DOM 关联 ID，不是课程业务 ID，也不能替代列表 key。

## 十、实现课程单选组

课程选择使用原生 `fieldset`、`legend` 和 radio：

```tsx
<fieldset>
  <legend>选择一门课程</legend>
  <ul>{/* radio 课程项 */}</ul>
</fieldset>
```

每个课程项的核心合同如下：

```tsx
<input
  id={inputId}
  name="courseId"
  type="radio"
  value={course.id}
  checked={selectedCourseId === course.id}
  disabled={!course.available}
  required
  onChange={handleChange}
/>
<label htmlFor={inputId}>{course.title}</label>
```

各属性职责如下：

| 属性 | 职责 |
| --- | --- |
| `name="courseId"` | 把 radio 组成同一个提交字段。 |
| `value={course.id}` | 指定当前课程被选中时的提交值。 |
| `checked={...}` | 根据根组件 State 决定是否选中。 |
| `onChange` | 把新的业务 ID 交回 State 所有者。 |
| `disabled` | 让已满课程不可交互且不进入提交数据。 |
| `required` | 要求同名 radio 组至少选择一项。 |

`value` 不是“是否选中”。radio 是否选中由布尔 `checked` 表达。

已满状态必须同时有原生 `disabled` 和可见的“名额已满”文字。只改颜色或只写 `aria-disabled` 不会得到
相同的平台行为。

## 十一、区分业务 ID、DOM id 与 name

三个概念容易混淆：

| 标识 | 示例 | 解决的问题 |
| --- | --- | --- |
| 业务 ID | `java-web` | 这是哪门课程。 |
| DOM `id` | `:r3:-java-web` | label 应关联当前页面中的哪个控件。 |
| 表单 `name` | `courseId` | FormData 中使用哪个字段名。 |

业务 ID 可以重复出现在不同页面或组件实例中，但同一文档中的 DOM `id` 应保持唯一。`name` 可以在同一
radio 组中重复，因为相同 name 正是形成单选组和同一提交字段的条件。

## 十二、使用 useId 建立关联

筛选组件、课程列表和报名字段组件分别在函数顶层调用 `useId()`，再添加稳定后缀：

```tsx
const idPrefix = useId()
const queryId = `${idPrefix}-query`
const queryHelpId = `${idPrefix}-query-help`
```

```tsx
<label htmlFor={queryId}>课程名称</label>
<input id={queryId} aria-describedby={queryHelpId} />
<p id={queryHelpId}>支持按课程名称进行包含匹配。</p>
```

这里建立两种关系：

- `htmlFor` 与 `id` 建立 label 和控件的名称关系。
- `aria-describedby` 与帮助文本 `id` 建立补充描述关系。

帮助文本不能代替 label。placeholder 也不能代替 label，因为输入后 placeholder 会消失，而且它没有建立
明确的标签关系。

`useId` 必须在组件顶层无条件调用。不能在 `map`、条件分支、事件处理器或普通工具函数中调用。

## 十三、受控报名字段

报名字段组件不保存姓名和邮箱副本，而是接收当前值与更新函数：

```ts
type RegistrationFieldsProps = {
  studentName: string
  studentEmail: string
  onStudentNameChange: (nextName: string) => void
  onStudentEmailChange: (nextEmail: string) => void
}
```

姓名字段：

```tsx
<input
  id={studentNameId}
  name="studentName"
  value={studentName}
  onChange={handleStudentNameChange}
  aria-describedby={studentNameHelpId}
  autoComplete="name"
  required
/>
```

邮箱字段：

```tsx
<input
  id={studentEmailId}
  name="studentEmail"
  type="email"
  value={studentEmail}
  onChange={handleStudentEmailChange}
  aria-describedby={studentEmailHelpId}
  autoComplete="email"
  required
/>
```

`id` 用于 label 和描述关联，`name` 决定提交字段名，`value` 决定当前显示值。三个属性不能互相替代。

## 十四、原生约束校验

本项目使用三项平台约束：

1. 课程 radio 组 `required`：至少选择一门可报名课程。
2. 姓名 `required`：不能为空。
3. 邮箱 `required` 与 `type="email"`：不能为空，并满足浏览器支持的 email 格式。

提交按钮保持明确类型：

```tsx
<button type="submit" disabled={!hasSelectableCourse}>
  提交报名
</button>
```

只有当前结果中没有任何可报名课程时才禁用按钮。只要存在可选课程，按钮就保持可操作，让浏览器真实
检查 radio、姓名和邮箱。

浏览器发现无效字段时，通常会在 `submit` 事件前阻止交互式提交。因此 `handleSubmit` 不执行，最后提交
快照也不应变化。

原生约束只检查当前表单值。本项目在当前页面读取结果，不把 `FormData` 解释成已经完成远端保存。

## 十五、用 FormData 读取提交数据

提交逻辑放在 `<form onSubmit>`，覆盖点击按钮和键盘提交等正常入口：

```tsx
/** 取消默认导航，并保存浏览器生成的最后提交条目。 */
function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const entries = Array.from(formData.entries(), ([name, value]) => ({
    name,
    value: typeof value === 'string' ? value : value.name,
  }))

  setSubmittedEntries(entries)
}
```

执行顺序必须清楚：

```text
浏览器完成约束校验
  -> form 触发 submit
  -> preventDefault 取消默认导航
  -> FormData 读取当前表单 entry
  -> 新数组替换最后提交快照
  -> React 使用新快照重新 render
```

本项目的有效结果只包含三项：

```text
courseId=java-web
studentName=王小明
studentEmail=wang@example.edu
```

筛选控件没有 `name`，因此不会进入报名数据。已满 radio 是 disabled，也不会进入 entry list。不要从多个
State 手工拼一个看似相同的对象，否则无法验证 `name`、radio 和 disabled 的平台规则。

## 十六、当前值与最后提交快照

`studentName` 和 `studentEmail` 表示当前输入值，`submittedEntries` 表示最后一次有效提交时刻。两者的
时间含义不同：

```text
第一次有效提交：studentName = 王小明
submittedEntries 保存 studentName=王小明

继续输入：studentName = 王小明（更新）
submittedEntries 仍保存 studentName=王小明

再次有效提交
submittedEntries 替换为 studentName=王小明（更新）
```

因此最后提交快照是合理的独立 State。它不能从“当前字段值”直接派生，因为它代表过去某个提交事件的
结果。

提交后不自动清空字段和课程选择，便于直接观察当前值与历史快照的区别。结果区只显示内存内数据投影。

## 十七、完整单向数据流

筛选链路：

```text
用户编辑筛选控件
  -> CourseFilters 调用函数 Prop
  -> 根组件更新筛选 State 并清空 selectedCourseId
  -> 下一次 render 重新计算 visibleCourses
  -> CourseList 接收新的数组
```

课程选择链路：

```text
用户选择 radio
  -> CourseOption 读取 event.currentTarget.value
  -> CourseList 提供的函数 Prop 被调用
  -> 根组件更新 selectedCourseId
  -> 下一次 render 计算 checked 和 selectedCourse
```

报名字段链路：

```text
用户输入姓名或邮箱
  -> RegistrationFields 调用更新函数 Prop
  -> 根组件更新字符串 State
  -> 下一次 render 把 value 传回 input
```

提交链路：

```text
有效 form submit
  -> 根组件 handleSubmit
  -> FormData 读取当前有名控件
  -> submittedEntries 保存新快照
  -> 结果区显示最后提交数据
```

数据通过 Props 向下传递，更新意图通过显式函数调用交回 State 所有者。这不是隐式双向绑定。

## 十八、文件边界

项目使用六个同源文件：

| 文件 | 内容 |
| --- | --- |
| `course-data.ts` | 类型、分类选项和五门固定课程。 |
| `course-filters.tsx` | 受控筛选和筛选字段关联。 |
| `course-list.tsx` | 课程 radio 组、课程项、空结果、key 与 disabled。 |
| `registration-fields.tsx` | 受控姓名、邮箱、label 与描述关联。 |
| `lab-course-registration-demo.tsx` | State、派生值、事件、form、提交快照和组件组装。 |
| `lab-course-registration-demo.css` | 当前界面的布局、状态和窄屏适配。 |

文件按职责拆分。筛选表达式只使用一次，直接留在根组件中；`CourseOption` 只由课程列表使用，留在同一
文件中。

## 十九、实现顺序

### 1. 写固定数据

先确定五门课程、分类联合和稳定 ID。此时不写交互。

### 2. 画组件树

明确筛选、课程列表、报名字段和根组件的职责，避免所有 JSX 堆在一个函数中。

### 3. 声明最小 State

只声明七份必须记住的变化，不创建列表、数量、是否为空或是否可提交的同步副本。

### 4. 完成纯派生计算

用三个条件得到 `visibleCourses`，再得到匹配数量、可报名状态和当前课程对象。

### 5. 接通受控筛选

让子组件只接收值和更新函数；每个筛选变化同时清空课程选择。

### 6. 渲染课程单选组

使用 `map`、稳定 key、同名 radio、业务 value、受控 checked、required 和 disabled。

### 7. 接通报名字段

姓名和邮箱使用受控字符串，补齐 name、label、id、帮助文本与 required。

### 8. 接通 form submit

在 form 上处理提交，取消默认导航，用 `FormData` 保存最后一次有效快照。

### 9. 检查全部状态

依次检查初始、筛选、已满、空结果、无效提交、有效提交和提交后继续编辑。

:::demo{id="react.core.learn.basics.lab-course-registration.course-registration-demo"}
:::

## 二十、固定操作序列

从初始状态按顺序操作，可以覆盖主要合同：

| 步骤 | 操作 | 预期结果 |
| ---: | --- | --- |
| 1 | 直接点击提交 | 原生 required 阻止提交，结果仍为“尚未提交”。 |
| 2 | 分类选择“后端” | 显示 Java Web 入门和数据库设计基础。 |
| 3 | 尝试选择数据库设计基础 | disabled radio 不可选择。 |
| 4 | 勾选只看可报名 | 只显示 Java Web 入门，匹配数量为 1。 |
| 5 | 选择 Java Web 入门 | radio 选中，当前选择摘要更新。 |
| 6 | 姓名输入“王小明”，邮箱输入 `wang`，提交 | email 校验阻止提交。 |
| 7 | 邮箱改为 `wang@example.edu`，提交 | 结果显示三项 FormData，页面不导航。 |
| 8 | 姓名改为“王小明（更新）”，不提交 | 当前输入变化，旧快照仍显示“王小明”。 |
| 9 | 再次提交 | 新快照显示“王小明（更新）”。 |
| 10 | 分类改为“前端” | 显示两门前端课程，课程选择清空，字段和快照保留。 |
| 11 | 不重新选择课程直接提交 | radio required 阻止提交，旧快照不变。 |
| 12 | 搜索“没有这门课” | 匹配数量为 0，显示空结果，提交按钮 disabled。 |
| 13 | 清空搜索、恢复全部分类并取消只看可报名 | 恢复五门固定课程和原始顺序。 |

这条序列同时证明：筛选只改变视图，选择与字段各有唯一事实来源，无效提交不会覆盖历史，有效提交来自
当前表单。

## 二十一、State 与派生值判断表

| 值 | 是否 State | 原因 |
| --- | --- | --- |
| 五门课程 | 否 | 固定模块输入。 |
| 搜索词 | 是 | 用户输入后需要跨 render 保留。 |
| 当前分类 | 是 | 用户选择后需要跨 render 保留。 |
| 只看可报名 | 是 | 用户切换后需要跨 render 保留。 |
| 可见课程 | 否 | 可从课程和三项筛选计算。 |
| 匹配数量 | 否 | 等于可见课程长度。 |
| 是否有可报名课程 | 否 | 可从当前可见课程判断。 |
| 当前课程 ID | 是 | 用户选择后需要跨 render 保留。 |
| 当前课程对象 | 否 | 可用固定课程和 ID 查找。 |
| 姓名与邮箱 | 是 | 用户输入后需要跨 render 保留。 |
| 表单是否满足全部约束 | 否 | 当前交给浏览器约束校验，不建立第二套状态机。 |
| 最后提交条目 | 是 | 代表过去一次有效提交，不等于当前字段值。 |

## 二十二、易错使用提示

:::pitfalls
### 错误一：把筛选结果存成 State

**触发条件：** 同时声明筛选条件和 `filteredCourses`，每次输入时手工更新两份 State。

**原因：** 可见课程本来可以从固定课程和当前筛选直接计算，却被复制成第二份可写事实。

**后果：** 任何遗漏的 setter 都会让筛选控件与课程列表显示不同条件下的结果。

**错误示例：**

```tsx
const [query, setQuery] = useState('')
const [filteredCourses, setFilteredCourses] = useState(COURSES)
```

**正确写法：**

```tsx
const [query, setQuery] = useState('')
const visibleCourses = COURSES.filter((course) => course.title.includes(query.trim()))
```

**验证方式：** 只更新 `query`，列表和匹配数量应在下一次 render 中同时得到新结果。

### 错误二：让筛选子组件保存同名副本

**触发条件：** 根组件与 `CourseFilters` 分别声明同名 `query` State。

**原因：** 同一个搜索条件出现两个互不自动同步的 State 所有者。

**后果：** 输入框可能显示新文本，而根组件仍按旧文本筛选课程。

**错误示例：**

```tsx
/** 错误地保存一份局部搜索副本。 */
function CourseFilters() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
}
```

**正确写法：**

```tsx
/** 显示所有者提供的搜索值并报告更新意图。 */
function CourseFilters({ query, onQueryChange }: CourseFiltersProps) {
  return (
    <input
      value={query}
      onChange={(event) => onQueryChange(event.currentTarget.value)}
    />
  )
}
```

**验证方式：** 输入任意搜索词后，输入框值、匹配数量和课程列表应来自同一根 State。

### 错误三：用 useId 作为课程 key

**触发条件：** 为列表生成 `useId` 前缀，再把该前缀或数组索引拼成课程 key。

**原因：** `useId` 服务于 DOM 关联，课程身份已经由固定数据中的 `course.id` 提供。

**后果：** key 与业务数据脱节，筛选或重排时难以确认同一课程是否保持同一身份。

**错误示例：**

```tsx
const listId = useId()
courses.map((course, index) => (
  <CourseOption key={`${listId}-${index}`} course={course} />
))
```

**正确写法：**

```tsx
courses.map((course) => <CourseOption key={course.id} course={course} />)
```

**验证方式：** 改变筛选后，同一门课程的 key 仍应直接等于固定 `course.id`。

### 错误四：用 radio value 判断是否选中

**触发条件：** 把 `selectedCourseId` 写给每个 radio 的 `value`，却没有声明布尔 `checked`。

**原因：** radio 的 `value` 定义被选中时提交什么，`checked` 才定义当前是否选中。

**后果：** 多个课程拥有相同提交值，界面选中状态也不再受根 State 明确控制。

**错误示例：**

```tsx
<input name="courseId" type="radio" value={selectedCourseId} />
```

**正确写法：**

```tsx
<input
  name="courseId"
  type="radio"
  value={course.id}
  checked={selectedCourseId === course.id}
  onChange={(event) => onCourseChange(event.currentTarget.value)}
/>
```

**验证方式：** 选择任一课程后只能有一个 radio 选中，FormData 中的值应等于该课程业务 ID。

### 错误五：只给已满课程添加灰色样式

**触发条件：** 只根据 `available` 添加灰色 className，没有给 radio 设置 `disabled`。

**原因：** CSS 颜色不会改变原生控件的可交互状态或提交规则。

**后果：** 用户仍可选择已满课程，该值也可能进入 FormData。

**错误示例：**

```tsx
<input className={course.available ? '' : 'is-unavailable'} type="radio" />
```

**正确写法：**

```tsx
<input type="radio" disabled={!course.available} />
```

**验证方式：** 已满课程应不可聚焦或选择，并同时显示可读的“名额已满”状态。

### 错误六：把提交逻辑放在按钮 onClick

**触发条件：** 只在提交按钮的 `onClick` 中构造报名数据。

**原因：** 提交属于 form 事件，不属于某一个按钮的鼠标点击。

**后果：** 键盘提交可能绕过逻辑，约束校验与数据读取也难以保持同一入口。

**错误示例：**

```tsx
<button type="button" onClick={handleSubmit}>提交报名</button>
```

**正确写法：**

```tsx
<form onSubmit={handleSubmit}>
  <button type="submit">提交报名</button>
</form>
```

**验证方式：** 点击按钮或在表单中触发键盘提交，都应经过同一个 form `onSubmit`。

### 错误七：筛选控件也写 name

**触发条件：** 给只负责改变页面视图的搜索和分类控件添加报名字段 `name`。

**原因：** 有效 name 会让控件参与表单 entry list，而筛选值不属于报名数据。

**后果：** 最后提交结果出现 query 或 category 等无关条目。

**错误示例：**

```tsx
<input name="query" value={query} onChange={handleQueryChange} />
```

**正确写法：**

```tsx
<input value={query} onChange={handleQueryChange} />
```

**验证方式：** 有效提交后，结果只能包含 `courseId`、`studentName` 和 `studentEmail`。

### 错误八：手工从 State 拼提交结果

**触发条件：** submit 时直接从 React State 拼接结果，不读取表单 entry list。

**原因：** 手工对象绕过了浏览器根据控件 name、选中和 disabled 状态构造数据的过程。

**后果：** 页面可能显示并不存在于真实 FormData 中的字段或值。

**错误示例：**

```tsx
setSubmittedEntries([
  { name: 'courseId', value: selectedCourseId },
  { name: 'studentName', value: studentName },
  { name: 'studentEmail', value: studentEmail },
])
```

**正确写法：**

```tsx
const formData = new FormData(event.currentTarget)
const entries = Array.from(formData.entries(), ([name, value]) => ({
  name,
  value: String(value),
}))
setSubmittedEntries(entries)
```

**验证方式：** disabled 课程、未选 radio 和无 name 筛选控件都不能出现在快照中。

### 错误九：输入变化立即改写提交快照

**触发条件：** 字段 change handler 同时更新当前输入和最后提交条目。

**原因：** 当前值与过去提交快照代表不同时间点，不能共用同一次字段更新。

**后果：** 用户没有再次提交，历史结果却跟随输入变化。

**错误示例：**

```tsx
/** 错误地让当前输入同步改写提交历史。 */
function handleStudentNameChange(nextName: string) {
  setStudentName(nextName)
  setSubmittedEntries([{ name: 'studentName', value: nextName }])
}
```

**正确写法：**

```tsx
/** 只更新当前姓名值。 */
function handleStudentNameChange(nextName: string) {
  setStudentName(nextName)
}
```

**验证方式：** 完成一次提交后继续编辑姓名，旧快照必须保持到下一次有效提交。

### 错误十：用 placeholder 代替 label

**触发条件：** 输入框只有 placeholder，没有可见 label 和匹配的 DOM 关联。

**原因：** placeholder 是输入提示，不是控件名称，也不会建立 `htmlFor` / `id` 关系。

**后果：** 用户输入后提示消失，控件缺少持续可读的名称与说明关系。

**错误示例：**

```tsx
<input placeholder="姓名" />
```

**正确写法：**

```tsx
<label htmlFor={studentNameId}>姓名</label>
<input id={studentNameId} aria-describedby={studentNameHelpId} />
<p id={studentNameHelpId}>填写报名人姓名。</p>
```

**验证方式：** 点击 label 应聚焦对应输入框，输入后 label 和帮助文本仍然可见。
:::

## 二十三、排查方法

| 现象 | 优先检查 | 正确结果 |
| --- | --- | --- |
| 输入后列表不变化 | `value`、`onChange`、根组件 handler | 三项筛选都由根 State 驱动。 |
| 分类变化后仍保留旧课程 | 分类 handler 是否清空 `selectedCourseId` | 任一筛选变化都清空选择。 |
| 已满课程仍可选择 | radio 是否使用原生 `disabled` | 已满项不可交互。 |
| 多个 radio 同时选中 | `name` 是否一致、`checked` 是否由同一 ID 判断 | 同一时刻最多选中一项。 |
| 点击课程文字没有选中 | label `htmlFor` 与 input `id` 是否相等 | 点击文字激活对应 radio。 |
| 无效邮箱仍生成快照 | input 是否为 `type="email"` 且 required | 浏览器在 submit 前阻止无效数据。 |
| 页面提交后发生导航 | `onSubmit` 是否调用 `preventDefault()` | 页面保留当前状态。 |
| FormData 混入筛选字段 | 筛选控件是否错误添加 `name` | 结果只有三项报名字段。 |
| 修改姓名后旧快照跟着变化 | 是否在 change handler 更新快照 | 快照只在有效 submit 更新。 |
| 空结果时按钮仍可提交 | `hasSelectableCourse` 是否来自可见课程 | 没有可报名课程时按钮 disabled。 |
| 列表身份异常 | key 是否来自稳定 `course.id` | 筛选前后同一课程使用同一 key。 |

排查时沿数据流逐段确认：当前 State、派生结果、传入 Props、DOM 属性、事件入口、下一次 render。不要
增加没有数据来源的同步副本。

## 二十四、适用边界

当前结构适合固定课程、单页、内存内报名流程。它清楚展示筛选、选择、字段与提交之间的所有权关系，
也能使用浏览器原生表单能力完成基础约束。

页面刷新后恢复固定初始值。结果区保存的是当前会话中的最后提交快照，只用于比较表单当前值与提交时刻。

## 二十五、练习

:::exercise
### 练习一：增加固定课程并预测结果

**要求：** 增加一门可报名的设计课程。先写出稳定 ID，再预测初始数量、设计分类数量和只看可报名时的数量；不要把新课程放进 State。

**完成标准：** 新课程使用固定业务 ID 和完整 Course 合同，三个预测数量都与页面派生结果一致。
:::

:::exercise
### 练习二：删除冗余 State

**要求：** 给定 `query`、`category`、`onlyAvailable` 和 `filteredCourses` 四份 State，删除 `filteredCourses` State 与全部同步 setter，改为 render 中的纯筛选。

**完成标准：** 三项筛选仍能共同改变列表和数量，并能说明可见课程为何不需要独立 State。
:::

:::exercise
### 练习三：修复课程身份

**要求：** 找出数组索引 key、随机 radio value 和 `useId` 业务 ID，全部改成固定 `course.id`；同时保留 `useId` 生成的 label/input 关联 ID。

**完成标准：** key、radio value 与 selectedCourseId 都使用业务 ID，DOM 关联 ID 只服务于控件关系。
:::

:::exercise
### 练习四：预测 FormData

**要求：** 在“后端”分类中保留一门可报名课程和一门 disabled 课程，选择可报名课程并填写字段，预测 `FormData` 的三个条目。

**完成标准：** 结果只包含 courseId、studentName 和 studentEmail，并能解释其余控件为何不在 entry list 中。
:::

:::exercise
### 练习五：验证历史快照

**要求：** 完成一次有效提交，再只修改姓名和邮箱，比较当前字段值与最后提交快照；不要在字段 change handler 中更新快照。

**完成标准：** 未再次提交时旧快照保持不变，再次有效提交后快照一次性替换为当前字段值。
:::

## 二十六、本节小结

- 固定课程是只读输入，不需要进入 State。
- 根组件统一拥有三项筛选、课程选择、姓名、邮箱和最后提交快照。
- 可见课程、匹配数量、可报名状态和当前课程对象都在 render 中派生。
- 筛选子组件和字段子组件通过值 Props 与函数 Props 接入单一事实来源。
- 课程业务 ID 用于 key、radio value 和数据身份；`useId` 只建立 DOM 关联。
- radio 的 `checked` 表达选中状态，`value` 表达提交值，`name` 表达提交字段。
- `required`、`type="email"` 与 `disabled` 提供真实平台行为，不需要复制一套校验 State。
- 提交逻辑属于 form `onSubmit`，`preventDefault()` 取消导航，`FormData` 读取当前表单条目。
- 当前输入与最后提交快照代表不同时间点，只有有效提交才替换历史结果。

## 二十七、参考资料

- [Thinking in React](https://react.dev/learn/thinking-in-react) - 组件树、最小 State、所有者、派生列表与反向数据流。
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 单一事实来源、最近共同父与值/函数 Props。
- [`useState`](https://react.dev/reference/react/useState) - State、setter、render 快照与调用规则。
- [Responding to Events](https://react.dev/learn/responding-to-events) - handler、自定义事件 Prop 与显式更新意图。
- [Rendering Lists](https://react.dev/learn/rendering-lists) - `filter`、`map`、业务 ID 与稳定 key。
- [`<input>`](https://react.dev/reference/react-dom/components/input) - value、checked、name、required、disabled 与 label。
- [`<select>`](https://react.dev/reference/react-dom/components/select) - 受控 select 的 value 与 onChange。
- [`<form>`](https://react.dev/reference/react-dom/components/form) - onSubmit、preventDefault 与 FormData。
- [`useId`](https://react.dev/reference/react/useId) - 关联 ID 和不得作为列表 key 的边界。
- [React DOM Common Components](https://react.dev/reference/react-dom/components/common) - className、htmlFor、data-* 与 aria-*。
- [Using TypeScript](https://react.dev/learn/typescript) - DOM 事件类型推断与抽取处理器标注。
- [HTML Forms](https://html.spec.whatwg.org/multipage/forms.html) - label、fieldset、legend、button 与表单语义。
- [HTML Constraint Validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraint-validation) - required 与 email 约束校验。
- [HTML Entry List](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set) - name、radio、disabled 与提交条目。
- [XMLHttpRequest FormData](https://xhr.spec.whatwg.org/#dom-formdata) - FormData 构造器和条目读取。
- [WAI-ARIA `aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby) - 补充描述的 ID 引用关系。
