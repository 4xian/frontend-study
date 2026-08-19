---
id: react.core.learn.basics.lab-static-course-catalog
type: lesson
title: 实战：静态课程目录
summary: 组合函数组件、Props、children、条件分支与列表渲染，完成一个无交互的静态课程目录。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 90
prerequisites:
  - react.core.learn.basics.list-rendering-and-key
related:
  - react.core.learn.basics.module-boundaries-and-component-tree
  - react.core.learn.basics.props
  - react.core.learn.basics.children-and-composition
  - react.core.learn.basics.conditional-rendering
tags:
  - React
  - 实战
  - 组件组合
  - Props
  - 列表渲染
  - 静态目录
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-16
objectives:
  - 能把静态课程需求拆成数据模块、外壳组件、列表组件和入口组件。
  - 能用只读 TypeScript 类型定义课程数据与组件 Props。
  - 能用 children 和命名 ReactNode 区域组合目录主体与观察面板。
  - 能用固定条件筛选数据，并通过 map 与稳定 key 生成课程列表。
  - 能根据模块依赖树、组件树和可见结果检查项目是否组装正确。
recap:
  - 先固定数据合同和可见结果，再按职责拆分模块与组件。
  - 父组件拥有数据和筛选结果，子组件通过只读 Props 接收所需输入。
  - children 适合主要内容区域，职责明确的命名 ReactNode Prop 适合独立辅助区域。
  - filter 决定保留哪些课程，map 决定每门课程生成什么 JSX，稳定 ID 用作 key。
  - 模块依赖树描述文件引用，组件树描述本次 render 中的组件父子关系。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 当前 React 官方文档版本
  - title: React Your First Component
    url: https://react.dev/learn/your-first-component
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 函数组件、组件嵌套与顶层定义
  - title: React Importing and Exporting Components
    url: https://react.dev/learn/importing-and-exporting-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件跨文件拆分与对应的导入导出
  - title: React Passing Props to a Component
    url: https://react.dev/learn/passing-props-to-a-component
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Props 传递、只读输入与 children
  - title: React Conditional Rendering
    url: https://react.dev/learn/conditional-rendering
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 使用 JavaScript 条件选择 JSX 或空结果
  - title: React Rendering Lists
    url: https://react.dev/learn/rendering-lists
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - filter、map、稳定 key 与 key 的放置位置
  - title: React Understanding Your UI as a Tree
    url: https://react.dev/learn/understanding-your-ui-as-a-tree
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 模块依赖树与 React render tree 的区别
  - title: TypeScript Object Types
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - 对象字段、可选字段与 readonly 属性
  - title: TypeScript JSX
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - TSX 文件与函数组件 Props 的类型检查
  - title: ECMAScript Array.prototype.filter
    url: https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.filter
    sourceType: specification
    appliesTo: ECMAScript 2026
    claims:
      - filter 根据回调结果构造新数组
  - title: ECMAScript Array.prototype.map
    url: https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.map
    sourceType: specification
    appliesTo: ECMAScript 2026
    claims:
      - map 根据回调返回值构造新数组
---

# 实战：静态课程目录

## 一、学习目标

- 把一个静态页面需求拆成数据、组件、Props 和组合关系。
- 为课程数据建立只读 TypeScript 合同，并让组件只接收自己需要的输入。
- 区分源码模块依赖树与本次 render 的组件树。
- 使用固定条件完成 `filter -> map -> stable key` 数据流。
- 同时处理非空列表、空结果和单项推荐标记。
- 从页面结果、组件树和展开源码三个角度检查项目。

## 二、项目结果

要完成的页面是一个静态课程目录。它读取五门固定课程，只显示其中三门已发布课程，并标记唯一的推荐
课程。页面还要显示原始总数、筛选后数量和当前组件树。

最终结果满足以下条件：

1. 页面显示“共 5 门，显示 3 门已发布课程”。
2. 列表只出现三门 `published: true` 的课程。
3. 三个列表项都使用各自的业务 `id` 表达身份。
4. 只有 `featured: true` 的课程显示“推荐”。
5. 课程数组为空时，列表组件返回明确的空结果。
6. 页面只展示固定数据，不出现看似可以操作却不会改变结果的控件。

这个项目的重点不是增加新 API，而是把数据合同、模块边界、组件树、Props、组合、条件和列表放进同一
条可读的数据流。

## 三、先画出数据流

在编写组件前，先把数据从来源到页面结果的过程写清楚：

```text
固定 courses 数组
  -> filter 保留 published 课程
  -> 根组件得到 publishedCourses
  -> Props 传给 CourseList
  -> map 为每门课程创建 CourseCard
  -> course.id 作为直接列表项的 key
```

每一步只有一个职责：

- 数据模块提供完整的静态输入。
- 根组件选择需要显示的数据并计算数量。
- 外壳组件决定页面主要区域和观察区域的位置。
- 列表组件处理空结果与列表生成。
- 列表项组件只显示一门课程。

当某段代码同时负责数据来源、筛选、页面外壳和单项展示时，很难判断错误属于哪一层。先写数据流可以
避免把所有逻辑堆进一个组件。

## 四、定义课程数据合同

课程数据需要稳定身份、展示内容和两个固定判断字段：

```ts
export type Course = {
  readonly id: string
  readonly title: string
  readonly summary: string
  readonly level: '基础' | '进阶'
  readonly published: boolean
  readonly featured: boolean
}
```

字段职责如下：

| 字段 | 职责 |
| --- | --- |
| `id` | 标识同一门课程，并作为列表 key 的来源。 |
| `title` | 显示课程名称，不承担身份职责。 |
| `summary` | 显示课程解决的问题。 |
| `level` | 显示固定难度标签。 |
| `published` | 决定课程是否进入可见列表。 |
| `featured` | 决定是否显示“推荐”标记。 |

`readonly` 表示这些字段不应在当前数据流中被重写。它是 TypeScript 的开发期约束，不会在浏览器中把
对象深冻结。这个项目只读取固定数据，不需要把课程对象改成可写结构。

固定数据放在独立模块中：

```ts
export const courses: readonly Course[] = [
  {
    id: 'tsx-foundations',
    title: 'TSX 页面结构',
    summary: '使用标记、表达式与属性描述页面内容。',
    level: '基础',
    published: true,
    featured: false,
  },
  {
    id: 'component-contracts',
    title: '组件与 Props 合同',
    summary: '用组件边界和只读输入组织重复界面。',
    level: '基础',
    published: true,
    featured: true,
  },
  {
    id: 'list-identity',
    title: '列表与稳定身份',
    summary: '把课程数据转换为带稳定 key 的列表项。',
    level: '基础',
    published: true,
    featured: false,
  },
  {
    id: 'content-layout',
    title: '内容区域组合',
    summary: '组合主要内容与职责明确的辅助区域。',
    level: '进阶',
    published: false,
    featured: false,
  },
  {
    id: 'catalog-review',
    title: '目录结构复查',
    summary: '根据模块树、组件树和页面结果检查结构。',
    level: '进阶',
    published: false,
    featured: false,
  },
]
```

五个 `id` 互不重复，并且不依赖标题、数组位置或运行时生成值。标题可以调整，顺序可以改变，业务身份
仍来自 `id`。

## 五、拆分模块职责

项目使用四个 TypeScript/TSX 模块：

```text
lab-static-course-catalog-demo.tsx
├─ course-data.ts
├─ catalog-frame.tsx
└─ course-list.tsx
```

| 模块 | 对外提供 | 内部职责 |
| --- | --- | --- |
| `course-data.ts` | `Course`、`courses` | 定义数据合同与固定输入。 |
| `catalog-frame.tsx` | `CatalogFrame` | 放置标题、主要内容和观察区域。 |
| `course-list.tsx` | `CourseList` | 处理空结果、列表映射和单项显示。 |
| `lab-static-course-catalog-demo.tsx` | 默认根组件 | 筛选数据、计算数量并组装页面。 |

模块依赖树回答“哪个文件 import 了哪个文件”。它不等于组件树：`course-data.ts` 会出现在模块依赖中，
但它没有定义组件，因此不是组件树节点。

拆分的判断依据是职责，不是“每个函数一个文件”。`CourseCard` 只服务于 `CourseList`，二者共同负责列表
呈现，可以保留在同一模块中。这样既展示模块边界，也不制造只转发一次的文件。

## 六、确定组件树

固定筛选得到三门已发布课程时，组件树是：

```text
StaticCourseCatalogDemo
└─ CatalogFrame
   ├─ CourseList
   │  ├─ CourseCard
   │  ├─ CourseCard
   │  └─ CourseCard
   └─ ComponentTree
```

这棵树只列函数组件。`<section>`、`<ul>`、`<li>` 和 `<aside>` 会形成 DOM 结构，但不是 React 函数组件
节点。三个 `CourseCard` 来自同一个组件定义接收三组不同 Props，不需要复制三个组件函数。

组件树还说明数据应在哪里传递：

- `StaticCourseCatalogDemo` 拥有完整数组和筛选结果。
- `CatalogFrame` 接收页面标题、主要内容和观察面板。
- `CourseList` 接收筛选后的课程数组。
- `CourseCard` 接收当前 `course` 对象。

## 七、实现目录外壳

外壳固定页面结构，但不写死主要目录和观察面板内容：

```tsx
import type { ReactNode } from 'react'

type CatalogFrameProps = {
  title: string
  inspector: ReactNode
  children: ReactNode
}

/** 组合静态目录标题、主要内容与组件树观察区域。 */
export function CatalogFrame({ title, inspector, children }: CatalogFrameProps) {
  return (
    <article className="static-catalog-demo">
      <header className="static-catalog-heading">
        <p>静态数据组装</p>
        <h2>{title}</h2>
      </header>

      <div className="static-catalog-layout">
        <div className="static-catalog-main">{children}</div>
        <aside className="static-catalog-inspector">{inspector}</aside>
      </div>
    </article>
  )
}
```

`children` 表达唯一的主要内容区域，`inspector` 表达语义不同的观察区域。调用处可以直接看出两块内容
分别进入哪里，不需要扫描 child 类型或依赖 child 排列顺序。

外壳只放置收到的 React node，不读取课程数组，也不决定筛选条件。数据选择仍由拥有完整数据的根组件
负责。

## 八、实现列表与列表项

先声明两个精确的 Props 合同：

```tsx
import type { Course } from './course-data'

type CourseCardProps = {
  course: Course
}

type CourseListProps = {
  courses: readonly Course[]
}
```

`CourseCard` 从普通 `course` prop 读取业务数据：

```tsx
/** 显示一门课程的固定标题、摘要、难度与推荐状态。 */
function CourseCard({ course }: CourseCardProps) {
  return (
    <li className="static-catalog-card" data-course-id={course.id}>
      <div className="static-catalog-card-meta">
        <span>{course.level}</span>
        {course.featured && <strong>推荐</strong>}
      </div>
      <h3>{course.title}</h3>
      <p>{course.summary}</p>
      <code>{course.id}</code>
    </li>
  )
}
```

`course.featured` 是 boolean，因此用作 `&&` 左值时，只会在 `true` 时产生推荐标记，不会意外显示
数字 `0`。

列表组件先处理空结果，再映射课程：

```tsx
/** 把筛选后的课程数组转换为带稳定 key 的列表。 */
export function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return <p className="static-catalog-empty">暂无已发布课程</p>
  }

  return (
    <ul className="static-catalog-list">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </ul>
  )
}
```

`key` 放在 `map` 直接返回的 `<CourseCard>` 上。组件需要标题、摘要和业务 ID 时，通过 `course` prop
读取；它不会收到名为 `key` 的普通 prop。

## 九、在根组件完成筛选

根组件拥有完整 `courses` 数组，因此在这里执行固定筛选：

```tsx
const publishedCourses = courses.filter((course) => course.published)
```

`filter` 只回答“保留谁”，不会把课程转换成 JSX。筛选完成后，根组件把结果交给 `CourseList`，列表组件
再用 `map` 回答“每项长成什么”。

完整组装如下：

```tsx
/** 展示当前静态目录实际生成的函数组件树。 */
function ComponentTree() {
  return (
    <section aria-labelledby="static-catalog-tree-title">
      <h3 id="static-catalog-tree-title">本次组件树</h3>
      <ul>
        <li>
          StaticCourseCatalogDemo
          <ul>
            <li>
              CatalogFrame
              <ul>
                <li>
                  CourseList
                  <ul>
                    <li>CourseCard（3 个）</li>
                  </ul>
                </li>
                <li>ComponentTree</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  )
}

/** 用固定课程数据组装静态目录、数量摘要和组件树。 */
export default function StaticCourseCatalogDemo() {
  const publishedCourses = courses.filter((course) => course.published)

  return (
    <CatalogFrame title="React 基础课程目录" inspector={<ComponentTree />}>
      <section aria-labelledby="static-catalog-list-title">
        <div className="static-catalog-summary">
          <span>共 {courses.length} 门</span>
          <strong>显示 {publishedCourses.length} 门已发布课程</strong>
        </div>
        <h3 id="static-catalog-list-title">已发布课程</h3>
        <CourseList courses={publishedCourses} />
      </section>
    </CatalogFrame>
  )
}
```

这里的数量来自数组长度，不另外维护一份手写数字。固定输入为五门课程，固定谓词保留三门，因此每次
进入页面都会得到相同顺序、数量和内容。

## 十、核对完整数据流

可以沿着 Props 从根向下检查：

| 组件 | 拥有或接收的数据 | 产生的结果 |
| --- | --- | --- |
| `StaticCourseCatalogDemo` | 完整 `courses` | `publishedCourses`、数量和页面组装。 |
| `CatalogFrame` | `title`、`children`、`inspector` | 固定的标题、主体和观察区域。 |
| `CourseList` | `readonly Course[]` | 空提示或课程列表。 |
| `CourseCard` | 一条 `Course` | 一项课程内容和可选推荐标记。 |
| `ComponentTree` | 无业务输入 | 固定组件关系说明。 |

检查时不要只看最终 DOM。页面显示正确但数据流混乱，仍可能存在重复筛选、隐式输入或职责错位。反过来，
组件拆分合理但筛选数量错误，也不能算完成。数据、组件和可见结果需要相互对应。

## 十一、Demo 观察要点

:::demo{id="react.core.learn.basics.lab-static-course-catalog.static-catalog-demo"}

**输入与结果：** 数量摘要显示原始五门课程与筛选后的三门课程，列表中没有两门
`published: false` 的课程。

**条件标记：** 只有“组件与 Props 合同”带有“推荐”文本。

**稳定身份：** 三个条目都显示自己的稳定业务 ID。

**组件关系：** 组件树只列函数组件，不列普通 HTML 标签或数据模块。

**源码范围：** 展开源码能同时看到数据、外壳、列表、根组件和样式文件。
:::

页面没有筛选按钮、输入框或下拉框。它展示的是固定数据如何经过固定条件进入组件树，不暗示用户可以
改变筛选条件。

## 十二、易错使用提示

:::pitfalls
### 错误：在根组件内部定义列表项组件

**触发条件：** 每次执行根组件函数时，都在函数体内重新声明 `CourseCard`。

**原因：** 组件定义没有稳定地位于模块顶层，结构边界也被埋在另一个组件实现中。

**后果：** 组件关系难以识别，代码也无法按清晰模块职责组织。

**错误示例：**

```tsx
// 错误：不要在组件函数内部定义另一个组件。
function Catalog() {
  function CourseCard() {
    return <li>课程</li>
  }
  return <CourseCard />
}
```

**正确写法：**

```tsx
/** 显示单个课程条目。 */
function CourseCard() {
  return <li>课程</li>
}

/** 组合课程目录。 */
function Catalog() {
  return <CourseCard />
}
```

**验证方式：** 搜索组件声明，确认每个组件函数都直接位于模块顶层。

### 错误：修改收到的课程数组

**触发条件：** `CourseList` 对 Props 数组调用 `push`、`splice` 或直接重写成员。

**原因：** 数组由父组件拥有，列表组件的职责只是读取和显示筛选结果。

**后果：** 数据所有权不清晰，同一输入可能在不同组件中出现不一致结果。

**错误示例：**

```tsx
// 错误：不要修改 Props 中的数组。
courses.push(nextCourse)
```

**正确写法：**

```tsx
// 只读取数组并把每项转换为 JSX。
const items = courses.map((course) => <span key={course.id}>{course.title}</span>)
```

**验证方式：** `CourseListProps` 使用 `readonly Course[]`，组件内没有数组写操作。

### 错误：外壳接收 children 却没有渲染

**触发条件：** 调用方把 `CourseList` 写在 `CatalogFrame` 标签内部，但外壳返回结果中没有 `{children}`。

**原因：** 嵌套 JSX 只会成为 `children` prop，不会自动出现在外壳 DOM 中。

**后果：** 标题和观察面板可见，主要课程目录消失。

**错误示例：**

```tsx
/** 错误：接收主要内容后没有放入返回结果。 */
function CatalogFrame({ children }: { children: ReactNode }) {
  return <section>课程目录</section>
}
```

**正确写法：**

```tsx
/** 把主要内容放入外壳主体。 */
function CatalogFrame({ children }: { children: ReactNode }) {
  return <section>{children}</section>
}
```

**验证方式：** 沿调用处的嵌套 JSX 查到外壳中的 `{children}` 插入位置。

### 错误：把 key 放在 CourseCard 内部

**触发条件：** `map` 返回 `<CourseCard course={course} />`，却只给组件内部的 `<li>` 设置 key。

**原因：** 父列表直接返回的 element 是 `CourseCard`，React 在这一层比较兄弟项身份。

**后果：** 直接列表项仍然缺少 key，内部 DOM 的 key 不能替代父列表 key。

**错误示例：**

```tsx
/** 错误：内部 li 的 key 不属于父级 map 返回层。 */
function CourseCard({ course }: CourseCardProps) {
  return <li key={course.id}>{course.title}</li>
}

const items = courses.map((course) => <CourseCard course={course} />)
```

**正确写法：**

```tsx
const items = courses.map((course) => <CourseCard key={course.id} course={course} />)
```

**验证方式：** 找到 `map` 回调直接返回的 JSX，确认 key 就写在这个 element 上。

### 错误：使用标题、索引或随机值作为 key

**触发条件：** key 来自 `course.title`、`index` 或 `Math.random()`。

**原因：** 标题可能重复或改变，索引表示位置，运行时随机值每次都会变化，它们都不能稳定表达业务
身份。

**后果：** 数据变化时，列表项身份可能改指其他课程或无法匹配原课程。

**错误示例：**

```tsx
const items = courses.map((course, index) => (
  <CourseCard key={`${index}-${Math.random()}`} course={course} />
))
```

**正确写法：**

```tsx
const items = courses.map((course) => <CourseCard key={course.id} course={course} />)
```

**验证方式：** key 只读取数据创建时已经存在且对同一课程保持不变的 `id`。

### 错误：让列表项自己决定是否已发布

**触发条件：** 根组件把完整数组交给列表，然后每个 `CourseCard` 再返回 `null` 隐藏草稿。

**原因：** “保留哪些数据”和“怎样显示一条数据”被分散到不同层，筛选数量也难以复用。

**后果：** 根组件无法直接得到可见课程数量，列表项同时承担选择与展示职责。

**错误示例：**

```tsx
/** 错误：单项组件同时决定筛选和展示。 */
function CourseCard({ course }: CourseCardProps) {
  if (!course.published) return null
  return <li>{course.title}</li>
}
```

**正确写法：**

```tsx
const publishedCourses = courses.filter((course) => course.published)
const content = <CourseList courses={publishedCourses} />
```

**验证方式：** 根组件能直接读取 `publishedCourses.length`，`CourseCard` 只显示收到的课程。

### 错误：用静态控件伪装可变筛选

**触发条件：** 页面放置不会改变结果的按钮、复选框或下拉框，并使用“点击筛选”等文案。

**原因：** 可见控件向用户承诺了操作行为，但当前数据流只有固定输入和固定谓词。

**后果：** 页面看起来可以操作，实际结果始终不变，观察目标也从静态组装偏离。

**错误示例：**

```tsx
// 错误：没有行为的控件不应出现在静态项目中。
<button>只看已发布</button>
```

**正确写法：**

```tsx
<p>当前固定显示已发布课程</p>
```

**验证方式：** 页面没有暗示可操作性的控件或文案，筛选规则直接体现在数据转换中。
:::

## 十三、原理与适用场景

### 1. 官方事实

1. 函数组件可以嵌套并通过模块导入导出跨文件使用。
2. Props 把 JavaScript 值从父组件传给子组件，收到的 Props 应按只读输入处理。
3. 嵌套 JSX 通过 `children` 进入组件，组件决定它在返回结果中的位置。
4. 条件渲染使用普通 JavaScript 控制流选择 JSX 或空结果。
5. `filter` 构造通过条件的数组，`map` 把数组项转换为另一组结果。
6. `map` 直接返回的列表 element 需要稳定且兄弟级唯一的 key。
7. 模块依赖树的节点是模块，React render tree 的节点是组件。

### 2. 项目推导

固定数据目录适合按“数据来源 -> 固定筛选 -> Props -> 列表映射”的顺序组织。筛选放在拥有完整数据和
数量需求的根组件，列表项就能专注于单条数据显示。外壳通过组合接收主要内容和观察面板，可以复用结构
而不读取内部课程数据。

### 3. 适用边界

这种结构适合文档目录、功能清单、团队成员列表和其他固定数据页面。只要输入在页面运行期间不变化，
固定数组转换就足够。需要由用户改变筛选条件、编辑课程或加载远端数据时，数据流会出现新的输入和更新
职责，不能用静态控件假装已经实现。

## 十四、练习

:::exercise
### 扩展静态课程目录

**要求：** 在固定数组中增加第六门课程，使用新的稳定 `id`、标题、摘要、难度、`published` 和
`featured` 字段。先预测原始总数、已发布数量和推荐数量，再选择该课程是否进入可见列表。保持筛选在
根组件、空结果在 `CourseList`、推荐标记在 `CourseCard`，不要增加操作控件。

**验收：** 原始总数从数据长度得到；已发布数量与 `filter` 结果一致；每个可见课程只出现一次；新增
课程的 key 来自业务 `id`；组件树的父子关系没有因增加数据而改变，只有 `CourseCard` 实例数量随可见
数据变化；页面仍能解释数据模块、组件模块和可见结果之间的对应关系。
:::

## 十五、本节小结

- 从固定需求出发，先定义数据合同和可见结果，再拆分组件。
- 数据模块提供静态输入，根组件负责筛选与数量，列表组件负责空结果和映射，列表项负责单条显示。
- Props 沿组件树向下传递，收到的对象与数组按只读输入处理。
- `children` 承担主要内容区域，命名 `ReactNode` Prop 承担职责不同的观察区域。
- `filter` 负责保留数据，`map` 负责生成 JSX，`course.id` 负责列表身份。
- key 写在 `map` 直接返回的 `CourseCard` 上，不会自动成为组件业务 prop。
- 模块依赖树描述文件引用，组件树描述一次 render 的组件父子关系，两者都不等于 DOM 树。
- 静态项目只展示固定结果，不使用无行为的控件伪装交互。

## 十六、参考资料

- [React Versions](https://react.dev/versions)
- [Your First Component](https://react.dev/learn/your-first-component)
- [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components)
- [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [Rendering Lists](https://react.dev/learn/rendering-lists)
- [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree)
- [TypeScript Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)
- [ECMAScript `Array.prototype.filter`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.filter)
- [ECMAScript `Array.prototype.map`](https://tc39.es/ecma262/2026/multipage/indexed-collections.html#sec-array.prototype.map)
