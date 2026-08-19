---
id: react.core.learn.basics.list-rendering-and-key
type: lesson
title: 列表渲染与 key
summary: 使用数组转换生成 JSX 列表，并用稳定 key 表达同级列表项的业务身份。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.core.learn.basics.conditional-rendering
related: []
tags:
  - React
  - 列表渲染
  - key
  - map
  - filter
  - Fragment
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-15
objectives:
  - 能把数据数组转换为 React node 列表，并区分 filter 与 map 的职责。
  - 能正确使用箭头函数的隐式返回和显式 return。
  - 能说明 key 的兄弟级唯一性、稳定性以及在插入、删除、重排时表达的身份。
  - 能把 key 放在数组直接返回的 element 上，并为多节点列表项使用显式 Fragment。
  - 能识别索引、随机值、可变展示字段、缺失 key 和重复 key 的问题。
recap:
  - filter 决定保留哪些数据，map 决定每条数据生成什么 JSX。
  - key 是 React 匹配同级列表项的身份提示，不是显示内容、普通 prop 或 DOM id。
  - 稳定业务 ID 是动态列表的首选 key，索引只适合不会变化的少数静态列表。
  - key 应放在 map 直接返回的 element 上；多个同级节点使用显式 Fragment。
sources:
  - title: React Rendering Lists
    url: https://react.dev/learn/rendering-lists
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 使用 filter 和 map 渲染列表
      - key 的唯一性、稳定性、放置位置以及索引和随机 key 风险
      - 多节点列表项需要带 key 的 Fragment
  - title: React Fragment
    url: https://react.dev/reference/react/Fragment
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 显式 Fragment 接收 key 且不会增加 DOM 包装元素
  - title: React Special Props Warning
    url: https://react.dev/warnings/special-props
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - key 不会作为普通 prop 传给组件
  - title: React 19.2.8 ReactChildFiber.js
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 开发环境对缺失和重复 key 的诊断边界
  - title: React 19.2.8 ReactChildReconciler tests
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactChildReconciler-test.js
    sourceType: source-code
    appliesTo: React DOM 19.2.8
    claims:
      - 重复 key 的结果不受支持且不能依赖
  - title: TypeScript Everyday Types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - 数组元素类型的基础标注
  - title: MDN Array.prototype.map
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    sourceType: official-reference
    appliesTo: ECMAScript
    claims:
      - map 对每项执行回调并返回新数组
  - title: MDN Array.prototype.filter
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    sourceType: official-reference
    appliesTo: ECMAScript
    claims:
      - filter 返回通过测试的新浅拷贝数组
  - title: MDN Arrow function expressions
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
    sourceType: official-reference
    appliesTo: ECMAScript
    claims:
      - 箭头函数表达式体与块体的返回规则
---

# 列表渲染与 key

## 一、学习目标

- 理解 React 列表渲染的本质是普通 JavaScript 数组转换。
- 使用 `map` 生成 JSX，使用 `filter` 选择数据。
- 理解 `key` 为什么用于同级列表项身份，而不是只为消除警告。
- 正确处理组件列表、多节点列表项和业务 ID。
- 识别缺失、重复、索引、随机和可变 key 带来的问题。

## 二、为什么需要列表渲染

页面经常需要把同一种结构重复应用到不同数据：课程目录、消息、商品和导航项都属于列表。手写多个
几乎相同的 `<li>` 会让数据与标记混在一起，也很难随数据数量变化。React 直接使用 JavaScript 数组
方法，把每条数据转换成一个 React node：

```tsx
type Course = {
  id: string
  title: string
}

const courses: readonly Course[] = [
  { id: 'react-props', title: 'Props' },
  { id: 'react-lists', title: '列表渲染与 key' },
]

// 把每条课程数据转换为一个列表项。
function CourseList() {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>{course.title}</li>
      ))}
    </ul>
  )
}
```

这里没有 React 专属的 `for` 指令。`map` 先返回一个新数组，数组中的每个成员都是 `<li>` element；
React 再处理这组 children。`key` 则告诉 React，每个同级 element 对应哪一条数据。

## 三、最小心智模型

列表渲染可以拆成三个问题：

```text
原始数据
  -> 选择哪些数据
  -> 把每项映射成 React node
  -> 用 key 标明每个同级项目的稳定身份
```

这三个问题分别回答：

1. `filter` 决定“哪些数据进入结果”。
2. `map` 决定“一条数据长成什么 JSX”。
3. `key` 决定“前后两次列表中，哪些 element 仍对应同一条数据”。

`key` 不会显示在页面上，也不会代替数据内容。标题、ID、状态等业务信息仍需通过文本、attribute 或
Props 明确传递。

## 四、使用 map 生成 JSX 列表

### 1. map 返回一个新数组

`map` 对原数组中的每一项调用回调，并把每次回调的返回值收集到新数组中：

```tsx
type Member = {
  id: number
  name: string
}

// 把成员数组映射为带姓名的列表项数组。
function MemberList({ members }: { members: readonly Member[] }) {
  const memberItems = members.map((member) => <li key={member.id}>{member.name}</li>)
  return <ul>{memberItems}</ul>
}
```

也可以把 `map` 直接写在 JSX 花括号中。转换较长或需要单独命名时，可以先保存变量；转换很短时
可以直接内联。输入为空数组时，回调不会执行，结果仍是空数组，因此不会生成列表项。

### 2. 箭头函数的返回规则

圆括号或单个 expression 会隐式返回：

```tsx
const items = members.map((member) => <li key={member.id}>{member.name}</li>)
```

花括号表示函数块体，必须显式写 `return`：

```tsx
const items = members.map((member) => {
  const label = member.name.toUpperCase()
  return <li key={member.id}>{label}</li>
})
```

若写成 `member => { <li /> }`，花括号中的 JSX 只是一个没有被返回的 expression statement，回调结果
是 `undefined`，页面不会得到预期列表项。

### 3. 抽取列表项组件

列表项结构变长时，可以抽成组件：

```tsx
type CourseRowProps = {
  courseId: string
  title: string
}

// 显示一条课程记录，并通过普通 prop 接收业务 ID。
function CourseRow({ courseId, title }: CourseRowProps) {
  return <li data-course-id={courseId}>{title}</li>
}

// 把 key 放在 map 直接返回的 CourseRow element 上。
function CourseRows({ courses }: { courses: readonly Course[] }) {
  return (
    <ul>
      {courses.map((course) => (
        <CourseRow key={course.id} courseId={course.id} title={course.title} />
      ))}
    </ul>
  )
}
```

`map` 直接返回的是 `<CourseRow />`，因此 `key` 必须放在这里。把 `key` 写进 `CourseRow` 内部返回的
`<li>` 已经太晚：父级要区分的是一组 `CourseRow` element。

## 五、先 filter，再 map

### 1. 使用 filter 表达“保留谁”

```tsx
type Lesson = {
  id: string
  title: string
  published: boolean
}

// 只把已发布课程转换为列表项。
function PublishedLessons({ lessons }: { lessons: readonly Lesson[] }) {
  const publishedLessons = lessons.filter((lesson) => lesson.published)

  return (
    <ul>
      {publishedLessons.map((lesson) => (
        <li key={lesson.id}>{lesson.title}</li>
      ))}
    </ul>
  )
}
```

`filter` 返回一个新数组，但其中的对象仍是原对象引用，这叫浅拷贝。可以重新排列或筛选新数组，不能
因此修改项目对象本身。条件较短时可写成 `lessons.filter(...).map(...)`；条件复杂时给中间结果命名
更容易解释。

### 2. 条件与 map 的选择

若不符合条件的项目根本不属于结果列表，先 `filter` 更清楚。若每条数据都要占据一个位置，只是内容
不同，可以在 `map` 中使用条件渲染：

```tsx
// 保留每条课程记录，并显示其发布状态。
function LessonStates({ lessons }: { lessons: readonly Lesson[] }) {
  return (
    <ul>
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          {lesson.title}：{lesson.published ? '已发布' : '草稿'}
        </li>
      ))}
    </ul>
  )
}
```

未通过条件的数据不应出现在结果中时使用 `filter`；每条数据都要保留、只改变显示内容时，
在 `map` 中使用条件渲染。

## 六、列表变化与稳定 key

### 1. key 是同级列表项的身份提示

当列表发生插入、删除或重排时，只看位置无法判断某条数据去了哪里。稳定 `key` 让 React 能在同一个
父级的前后两组 children 之间匹配对应项目：

```tsx
{courses.map((course) => (
  <li key={course.id}>{course.title}</li>
))}
```

这里的 `course.id` 表示数据身份。标题可以修改，显示位置可以变化，但同一课程仍使用同一个
ID。`key` 不只是关闭开发警告，它表达前后两组同级列表项之间的对应关系。

### 2. 插入、删除与重排

初始结果为：

```text
位置 0: A
位置 1: B
位置 2: C
```

把 A 移到末尾后：

```text
位置 0: B
位置 1: C
位置 2: A
```

位置 0 前后对应了不同数据。稳定 key 使用数据身份表达“B 仍是原来的 B，只是从位置 1 移到位置 0”：

| 数据 | 变化前位置 | 变化后位置 | key |
| --- | ---: | ---: | --- |
| A | 0 | 2 | `A` |
| B | 1 | 0 | `B` |
| C | 2 | 1 | `C` |

在开头插入 D 时，A、B、C 的位置都向后移动，但它们仍分别使用 `A`、`B`、`C`；
新数据 D 使用新身份 `D`。删除 B 时，C 的位置向前移动，但 key 仍为 `C`。同一数据的
位置可以变化，稳定 key 不随位置变化。

## 七、key 的唯一性和稳定来源

### 1. 只需在兄弟项之间唯一

`key` 不要求全应用唯一。两个彼此独立的列表可以都出现 `key="course-1"`；React 只需要区分同一个
父级下这一次映射得到的兄弟项。

每个父级都只比较自己的直接 children，因此不同父级中的独立列表可以复用相同 key。

### 2. key 必须稳定

“唯一”只解决同一时刻能否区分项目，“稳定”解决前后两次 render 能否认出同一项目。适合的 key
通常来自：

- 数据库或接口提供的不可变主键。
- 创建本地数据时生成一次并保存在数据对象中的 ID。
- 数据本身拥有的、不会因展示内容或位置变化的稳定标识。

不要在 render 中临时生成 key。`Math.random()`、`crypto.randomUUID()` 或当前时间每次都会产生新值，
React 会把原项目视为另一组项目。若需要生成 ID，应在创建数据时生成一次并随数据保存。

### 3. 索引何时有风险

未显式提供 `key` 时，React 会使用项目位置。把 `index` 写成 key 也保留了同样问题：

```tsx
// 错误倾向：插入、删除或重排后，index 会指向另一条课程数据。
{courses.map((course, index) => (
  <li key={index}>{course.title}</li>
))}
```

只在列表完全静态、永不重排、不会插入和删除，并且数据确实没有稳定 ID 时，索引才可能是可接受的
退路。一旦列表会变化，应让数据拥有稳定身份。

### 4. 可变展示字段不适合

标题、状态、排名和显示位置可能变化或重复，通常不适合作为 key：

```tsx
{courses.map((course) => (
  <li key={course.title}>{course.title}</li>
))}
```

标题修改会让同一项目获得新 key，两个同名项目还会产生重复 key。显示字段负责内容，稳定 ID 负责
身份，两者职责不同。

## 八、key 应该放在哪里

### 1. 放在数组直接返回的 element 上

判断位置的方法是：找到 `map` 回调本次直接返回的最外层 element，把 `key` 放在那里。

```tsx
// 正确：CourseRow 是数组的直接成员。
courses.map((course) => (
  <CourseRow key={course.id} courseId={course.id} title={course.title} />
))
```

组件内部的 `<li>` 不是父列表直接看到的 element，放在那里无法标识这组 `CourseRow` 兄弟。

### 2. 多个同级节点使用显式 Fragment

一条数据若必须输出多个同级节点，又不希望增加 DOM wrapper，可以使用显式 `Fragment`：

```tsx
import { Fragment } from 'react'

type Term = {
  id: string
  name: string
  description: string
}

// 用带 key 的 Fragment 把同一术语的名称和解释组成一个列表项。
function TermList({ terms }: { terms: readonly Term[] }) {
  return (
    <dl>
      {terms.map((term) => (
        <Fragment key={term.id}>
          <dt>{term.name}</dt>
          <dd>{term.description}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
```

简写 `<>...</>` 没有属性位置，不能接收 `key`。显式 `Fragment` 不会为页面增加额外 DOM element。

### 3. key 不会进入 Props

`key` 与 `ref` 是 React 使用的特殊提示，不会作为普通 Props 传给组件：

```tsx
type ItemProps = {
  itemId: string
  title: string
}

// 通过 itemId 读取业务 ID，而不是尝试读取 key。
function Item({ itemId, title }: ItemProps) {
  return <li data-item-id={itemId}>{title}</li>
}

const row = <Item key="course-1" itemId="course-1" title="列表渲染" />
```

若组件需要同一个值，像 `itemId` 这样再传一个明确的业务 prop。`key` 也不会自动成为 DOM `id` 或
`data-*` attribute。

## 九、开发警告与 TypeScript 边界

React 开发环境会对数组 child 缺少 key 或同级 key 重复给出警告。这些警告很重要，但只能发现部分
问题：

- 没有警告，不代表展示标题作为 key 就稳定。
- 没有警告，不代表索引 key 能应对重排。
- 重复 key 的项目可能重复或遗漏，具体结果不受支持，不能依赖。
- 生产代码不能依赖警告是否出现来决定业务逻辑。

基础业务数据通常使用稳定的 `string` 或 `number` ID。TypeScript 可以检查 `id` 字段是否
存在、值的类型是否符合 JSX 要求，却不能证明它在兄弟集合中唯一，也不能证明同一项目的值跨
render 稳定：

```tsx
type Item = {
  id: string
  title: string
}

type ItemListProps = {
  items: readonly Item[]
}

// 把只读项目数组转换为列表项。
function ItemList({ items }: ItemListProps) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  )
}
```

`readonly Item[]` 描述组件按只读数组接收数据；它不检查运行时是否存在重复 ID，也不判断某个
字段是否真正代表业务身份。

## 十、Demo

下面的 Demo 展示 `filter` 后 `map`、组件 element 上的稳定 key、业务 ID 的普通 prop、
显式 `Fragment`、静态重排以及索引和随机 key 的风险对照。

:::demo{id="react.core.learn.basics.list-rendering-and-key.data-identity-demo"}
:::

## 十一、易错使用提示

:::pitfalls
### 错误：map 的块体漏写 return

**触发条件：** 箭头函数使用 `{}` 块体，却只写 JSX，不写 `return`。

**原因：** 块体不会隐式返回其中的 expression。

**后果：** `map` 得到一组 `undefined`，预期列表项不显示。

**错误示例：**

```tsx
const items = courses.map((course) => {
  <li key={course.id}>{course.title}</li>
})
```

**正确写法：** 显式返回 JSX，或改用圆括号隐式返回。

```tsx
const items = courses.map((course) => (
  <li key={course.id}>{course.title}</li>
))
```

**验证方式：** 检查 `items` 的每个成员都应是 element，而不是 `undefined`。

### 错误：使用数组索引标识动态项目

**触发条件：** 列表可能插入、删除或重排，却使用 `index` 作为 key。

**原因：** 索引描述当前位置，不描述数据身份。

**后果：** 位置变化后，同一个 key 会指向另一条数据，React 无法按业务项目正确匹配。

**错误示例：**

```tsx
{courses.map((course, index) => (
  <li key={index}>{course.title}</li>
))}
```

**正确写法：** 使用项目自己的稳定 ID。

```tsx
{courses.map((course) => (
  <li key={course.id}>{course.title}</li>
))}
```

**验证方式：** 推演首项移动到末尾的结果，确认同一数据始终携带同一个 key。

### 错误：在 render 中生成随机 key

**触发条件：** `map` 中调用 `Math.random()`、`crypto.randomUUID()` 或读取当前时间。

**原因：** 相同数据每次 render 都得到不同身份。

**后果：** React 会重新创建列表项目；现有 DOM 与用户输入可能丢失。

**错误示例：**

```tsx
{courses.map((course) => (
  <li key={Math.random()}>{course.title}</li>
))}
```

**正确写法：** 在数据创建时保存 ID，render 只读取它。

```tsx
{courses.map((course) => (
  <li key={course.id}>{course.title}</li>
))}
```

**验证方式：** 对同一数据重复计算列表，记录的每个项目 key 应保持不变。

### 错误：使用会变化或可能重复的展示字段

**触发条件：** 使用标题、排名、状态或显示顺序作为 key。

**原因：** 展示字段可能修改或重复，不是稳定业务身份。

**后果：** 字段变化会让同一项目看起来像新项目，重复值还会触发重复 key 警告。

**错误示例：**

```tsx
{courses.map((course) => (
  <li key={course.title}>{course.title}</li>
))}
```

**正确写法：** 使用不可变主键，标题只负责显示。

```tsx
{courses.map((course) => (
  <li key={course.id}>{course.title}</li>
))}
```

**验证方式：** 修改标题或重排后，项目 key 应保持不变；同级 key 集合大小应等于项目数。

### 错误：把 key 放进列表项组件内部

**触发条件：** `map` 返回 `<CourseRow />`，却把 key 写在 `CourseRow` 返回的 `<li>` 上。

**原因：** 父列表的直接 children 是 `CourseRow` element，不是组件内部的 DOM element。

**后果：** 父列表仍缺少 key，并出现开发警告。

**错误示例：**

```tsx
// 错误：这个 key 不在 map 直接返回的 element 上。
function CourseRow({ course }: { course: Course }) {
  return <li key={course.id}>{course.title}</li>
}

const rows = courses.map((course) => <CourseRow course={course} />)
```

**正确写法：** 把 key 移到调用组件的位置。

```tsx
// 列表项组件只负责显示自己的内容。
function CourseRow({ course }: { course: Course }) {
  return <li>{course.title}</li>
}

const rows = courses.map((course) => <CourseRow key={course.id} course={course} />)
```

**验证方式：** 找到 `map` 回调直接返回的 element，确认它自己带有 key。

### 错误：尝试从组件 Props 读取 key

**触发条件：** 组件把 `key` 声明为普通业务 prop 并尝试显示它。

**原因：** `key` 是 React 的特殊字段，不会按普通 prop 转发。

**后果：** 组件拿不到预期业务 ID，读取 `key` 也不能建立业务输入合同。

**错误示例：**

```tsx
// 错误：不要把 React 的特殊 key 当业务输入读取。
function CourseIdentity({ key }: { key: string }) {
  return <span>{key}</span>
}
```

**正确写法：** 另外传递有业务名称的 prop。

```tsx
// 通过 courseId 明确接收业务身份。
function CourseIdentity({ courseId }: { courseId: string }) {
  return <span>{courseId}</span>
}
```

**验证方式：** 组件 Props 类型中不声明 `key`；需要的 ID 由调用方显式传入。
:::

## 十二、原理与适用场景

适合使用列表渲染的情况包括：数据天然是一组同构记录，项目数量由数据决定，每条记录使用相同或
相近的 JSX 结构，或者项目可能筛选、插入、删除和重排。少量、语义完全不同且固定不变的页面区块
通常直接写 JSX 更清楚。

选择规则是：

1. 数据变成 UI 前，先用 `filter` 选择需要显示的项目。
2. `map` 的每个直接结果都要有能表达该数据身份的 key。
3. key 只在同一父级兄弟集合中比较，不需要制造全局路径。
4. 若数据没有稳定 ID，应让数据模型提供身份，而不是在 render 中临时生成。
5. 开发警告与 TypeScript 只能辅助发现问题，不能证明业务 key 唯一且稳定。

`filter` 负责“保留谁”，`map` 负责“生成什么”，key 负责“这是谁”。把三项职责分开，
列表代码就能按数据选择、节点生成、身份标记的顺序阅读。

## 十三、练习

:::exercise
### 实现已发布课程目录

**要求：** 定义 `Course` 数据，包含稳定 `id`、`title`、`description` 和 `published`。
组件接收 `readonly Course[]`，先筛选已发布课程，再用 `map` 渲染。把列表项抽成
`CourseRow`，key 放在 `map` 直接返回的组件 element 上，并通过 `courseId` 普通 prop
传入业务 ID。另一组结果使用带 key 的显式 `Fragment` 输出标题和说明两个同级节点。不得使用
索引、随机值、标题或状态作为 key。

**验收：** 只出现已发布课程；每条结果只出现一次；同级 key 唯一且来自稳定 ID；把第一项移到末尾
后，同一课程仍携带原来的 ID；`CourseRow` 能通过 `courseId` 显示业务 ID；显式 Fragment
没有增加额外 DOM wrapper。
:::

## 十四、本节小结

- 列表渲染先用普通 JavaScript 选择数据，再用 `map` 生成 JSX。
- `filter` 负责保留符合条件的数据，`map` 负责把数据转换为 React node。
- `key` 表达同一父级下的项目身份，只需兄弟级唯一，但必须跨 render 稳定。
- 插入、删除和重排会改变位置，稳定业务 ID 不随位置变化。
- 优先使用数据主键；动态列表不要使用索引、随机值或会变化的展示字段。
- `key` 放在 `map` 直接返回的 element 上，多节点项目使用带 key 的显式 `Fragment`。
- `key` 不是普通 prop 或 DOM id；组件需要业务 ID 时必须另外传递。
- 开发警告和静态类型不能替代业务身份设计。

## 十五、参考资料

- [Rendering Lists](https://react.dev/learn/rendering-lists)
- [Fragment](https://react.dev/reference/react/Fragment)
- [Special Props Warning](https://react.dev/warnings/special-props)
- [React 19.2.8 `ReactChildFiber.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js)
- [React 19.2.8 `ReactChildReconciler-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactChildReconciler-test.js)
- [TypeScript Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [MDN Array.prototype.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN Array.prototype.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
