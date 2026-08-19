---
id: react.core.learn.basics.component-purity
type: lesson
title: 组件与 Hook 的纯度
summary: 掌握 React render 的幂等、无副作用、不可变输入与局部修改规则，让组件和 Hook 可以安全重复计算。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 85
prerequisites:
  - react.core.learn.basics.lab-static-course-catalog
related:
  - react.core.learn.basics.props
  - react.core.learn.basics.event-handling
tags:
  - React
  - 组件纯度
  - Hook 纯度
  - 幂等
  - 不可变输入
  - 副作用
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-16
objectives:
  - 能用幂等、无 render 副作用和不修改非局部值三条规则判断代码是否纯净。
  - 能列出组件 render 的 Props、State、Context 输入与 Hook 参数，并把它们视为只读值。
  - 能区分修改输入或共享值与修改本次执行中新建局部值。
  - 能识别随机值、当前时间、网络、存储和 DOM 写入为什么不属于 render 计算。
  - 能根据触发原因区分纯派生计算、用户动作副作用和外部系统同步。
  - 能正确理解 TypeScript readonly 的静态、浅层辅助作用和边界。
recap:
  - 相同 Props、State、Context 或 Hook 参数应得到相同结果，但不要求返回同一个对象引用。
  - Render 只计算下一份 UI，不在返回结果之外修改外部系统。
  - Props、State、Context、Hook 参数和其他先前存在的值都不是本次计算可以随意修改的数据。
  - 本次执行内新建且没有泄漏的数组或对象可以局部修改。
  - 用户动作副作用进入事件处理器；只有需要随显示结果同步外部系统时才考虑 Effect。
  - readonly 只提供静态浅层约束，不能代替运行时的纯度设计。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 当前 React 官方文档版本
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件与 Hook 的幂等、无副作用和非局部值不可修改规则
      - Props、State 与局部修改边界
      - 事件处理器与 Effect 的 render 外职责
  - title: Keeping Components Pure
    url: https://react.dev/learn/keeping-components-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 相同输入得到相同 JSX
      - Props、State、Context 只读与局部数组修改
      - StrictMode 开发诊断提示
  - title: Responding to Events
    url: https://react.dev/learn/responding-to-events#can-event-handlers-have-side-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 用户交互触发的副作用属于事件处理器
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Render、事件处理器与 Effect 的触发原因和职责边界
  - title: TypeScript readonly Properties
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - readonly 是静态浅层约束且不改变运行时行为
  - title: TypeScript ReadonlyArray
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html#the-readonlyarray-type
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - readonly 数组拒绝 push 等变异操作
  - title: ECMAScript Math.random and Date.now
    url: https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html
    sourceType: specification
    appliesTo: ECMAScript 2026
    claims:
      - 随机序列和当前时刻不由组件输入决定
  - title: ECMAScript Array methods
    url: https://tc39.es/ecma262/2026/multipage/indexed-collections.html
    sourceType: specification
    appliesTo: ECMAScript 2026
    claims:
      - push 与 sort 修改接收数组
---

# 组件与 Hook 的纯度

## 一、学习目标

- 能把“纯度”拆成幂等、render 无副作用、不修改非局部值三项可检查规则。
- 能找出一次组件 render 的输入，并判断结果是否只由这些输入决定。
- 能判断数组或对象的所有者，区分错误的输入修改与安全的局部修改。
- 能解释为什么当前时间、随机值、模块计数、网络请求和 DOM 写入不能直接放在 render 中。
- 能为普通派生计算、用户动作和外部系统同步选择正确的执行位置。
- 能说明 `readonly` 可以约束什么，又不能证明什么。

## 二、为什么 React 要求纯度

函数组件看起来像普通 JavaScript 函数：接收输入，执行代码，返回 JSX。它与一次性脚本的关键区别是，
React 负责决定何时调用组件。组件不能把“只会从上到下执行一次”当作正确性的前提。

如果组件每次执行都向模块数组追加一项、修改收到的对象或直接写 DOM，那么调用次数和调用顺序就会
改变程序结果。相反，如果组件只读取本次输入并计算 JSX，React 再次调用它也不会留下额外修改。

纯度带来的直接价值是可预测：

1. 相同输入可以重新计算，不依赖上次留下的隐藏状态。
2. 一个组件的计算不会偷偷改变另一个组件使用的数据。
3. 调试时可以从输入推导输出，不需要寻找 render 中的外部写操作。
4. React 可以检查、重复计算或放弃一次计算，而不会触发重复的外部动作。

这里的“纯”不是要求应用没有请求、存储、日志或 DOM 同步。应用当然需要副作用；规则只要求把副作用
移出 render，并根据真正的触发原因放到合适边界。

## 三、纯度的三个判断问题

React 对组件和 Hook 的 render 逻辑提出三项互相配合的要求。

### 1. 相同输入是否得到相同结果

组件的主要输入是本次 render 的 Props、State 和 Context；Hook 的输入还包括它收到的参数。输入相同时，
计算结果应相同：相同标题仍得到相同标题，相同课程数组仍得到相同筛选结果。

可以把关系写成：

~~~~text
Props + State + Context -> 组件结果
Hook 参数 + Hook 读取的 render 输入 -> Hook 结果
~~~~

“相同结果”关注值和可见含义，不要求每次返回同一个对象引用。下面的两个数组引用不同，但值结果相同：

~~~~ts
const first = ['TSX', 'Props']
const second = ['TSX', 'Props']

console.log(first === second) // false
console.log(first.join('|') === second.join('|')) // true
~~~~

每次 render 新建 JSX、数组和对象很常见。只要内容由输入决定，并且创建过程没有修改外部值，就仍然
符合幂等要求。

### 2. 是否在返回值之外改变外部系统

组件的主要职责是计算下一份 UI 描述。网络请求、写本地存储、直接修改 DOM、启动计时器和调用外部
部件方法都会在返回 JSX 之外产生可观察变化，因此属于副作用。

副作用不能在 render 中执行。否则 React 只要重新计算一次，外部动作就可能重复一次；即使 JSX 值没有
变化，外部系统也已经被改变。

### 3. 是否修改了先前存在的值

Props、State、Context、模块变量和传入的嵌套对象都在本次执行开始前已经存在。当前组件没有所有权去
直接修改它们。修改这些值会把一次局部计算变成其他调用也能观察到的共享变化。

本次执行中新建的局部数组或对象不同：只要它没有泄漏出去，每次执行都会重新创建，修改它不会影响
输入、其他组件或下一次计算。这是纯度规则允许的局部修改。

## 四、幂等：结果只由输入决定

### 1. 纯派生计算

字符串格式化、数学运算、条件判断、筛选、映射和创建 JSX 都可以是纯计算：

~~~~tsx
type CourseSummaryProps = {
  title: string
  completed: number
  total: number
}

// 只根据本次 Props 计算摘要。
function CourseSummary({ title, completed, total }: CourseSummaryProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <section>
      <h2>{title}</h2>
      <p>{percent}%</p>
    </section>
  )
}
~~~~

相同 `title`、`completed` 和 `total` 会得到相同百分比和 JSX 内容。局部变量 `percent` 不会被其他组件
读取，也不会在下一次调用中保留。

### 2. 当前时间和随机值不是 render 输入

下面的值会随调用时刻或随机序列变化：

~~~~tsx
// 错误：相同 Props 也可能得到不同文本。
function SessionCode() {
  return <code>{Math.random()}</code>
}

// 错误：结果由执行时刻决定，而不是本次 render 输入。
function CurrentTime() {
  return <time>{Date.now()}</time>
}
~~~~

问题不在于这些 API 永远不能使用，而在于组件每次执行都会主动取得一个新值。若界面需要显示一个已经
确定的会话码或时间点，应把该值作为明确输入传给组件：

~~~~tsx
type TimestampProps = {
  timestamp: number
}

// 根据明确输入格式化时间值。
function Timestamp({ timestamp }: TimestampProps) {
  return <time>{new Date(timestamp).toISOString()}</time>
}
~~~~

这里的格式化仍由 `timestamp` 决定。相同时间戳会得到相同文本。

### 3. 读取常量与读取可变外部值不同

读取不会变化的模块常量可以保持幂等：

~~~~tsx
const PRODUCT_NAME = 'React 学习中心'

// 读取稳定模块常量并展示产品标题。
function ProductHeading() {
  return <h1>{PRODUCT_NAME}</h1>
}
~~~~

`PRODUCT_NAME` 在模块初始化后不再改变，因此不会让相同输入得到不同结果。若模块值会被其他代码修改，
组件直接读取它就会依赖未声明输入，结果不再只由本次 render 输入决定。

## 五、副作用必须离开 Render

### 1. 什么是副作用

副作用是函数返回值之外的可观察影响。例如：

- 修改 DOM 属性或调用浏览器 UI API。
- 发起网络请求或发送分析数据。
- 写入 `localStorage`、IndexedDB 或其他外部存储。
- 启动、取消计时器或订阅外部事件。
- 修改模块变量、外部缓存或传入对象。
- 调用会改变第三方部件状态的方法。

“副作用”是通用编程概念，React `Effect` 是承载特定外部同步的一种机制，两者不是同义词。

### 2. Render 只计算结果

下面的组件返回标题，同时直接修改浏览器标题：

~~~~tsx
// 错误：调用组件函数本身就改变了 DOM。
function CoursePage() {
  document.title = '组件纯度'
  return <h1>组件纯度</h1>
}
~~~~

即使返回的 `<h1>` 每次相同，`document.title = ...` 仍是返回值之外的 DOM 写入。React 再次计算组件
时，这条写操作会再次执行。

### 3. 不要用“只执行一次”解释 Render 代码

模块计数器会把调用次数变成页面结果：

~~~~tsx
let renderCount = 0

// 错误：每次执行都修改模块级变量。
function CounterLabel() {
  renderCount += 1
  return <p>第 {renderCount} 次</p>
}
~~~~

第一次和第二次调用得到不同文本，组件结果依赖隐藏的模块状态。把变量改成更隐蔽的对象属性、缓存字段
或数组长度也不会改变问题本质。

## 六、Props、State 与 Context 都是只读输入

### 1. Props 是调用方提供的快照

组件可以读取 Props，但不能修改 Props 对象或它引用的既有数据：

~~~~tsx
type Course = {
  title: string
}

type CourseListProps = {
  courses: Course[]
}

// 错误：sort 会原地修改调用方提供的数组。
function CourseList({ courses }: CourseListProps) {
  courses.sort((a, b) => a.title.localeCompare(b.title))
  return <p>{courses.map((course) => course.title).join('、')}</p>
}
~~~~

`sort` 会修改接收数组。若父组件、另一个子组件或后续 render 继续使用同一数组，它们都会看到被改变的
顺序。

需要排序结果时，先创建当前 render 的局部数组：

~~~~tsx
type CourseListProps = {
  courses: readonly Course[]
}

// 先复制为局部数组，再排序局部副本。
function CourseList({ courses }: CourseListProps) {
  const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title))
  return <p>{sortedCourses.map((course) => course.title).join('、')}</p>
}
~~~~

现代 JavaScript 也提供返回新数组的 `toSorted`：

~~~~tsx
const sortedCourses = courses.toSorted((a, b) => a.title.localeCompare(b.title))
~~~~

`toSorted` 避免修改输入数组容器，但不会深复制数组中的对象。无论使用展开复制还是 `toSorted`，都不能
继续修改 `sortedCourses` 中原有对象的字段。

### 2. State 是 React 提供的快照

State 也是本次 render 的输入。组件读取当前值来计算界面，需要变化时使用 React 提供的更新入口，
不能直接改写现有 State 对象或数组。

这条规则在这里不涉及更新队列、批处理或具体 Hook 签名。只需记住：当前 State 值属于本次输入，不是
可以在 render 中原地修改的临时容器。

### 3. Context 也是共享输入

Context 值可能由更高层提供，并被多个组件读取。消费者不能因为拿到了对象引用，就在 render 中修改
对象字段。否则一次组件计算会改变其他消费者也在使用的数据。

Context 的创建、提供和读取方式不影响这条所有权规则：从外部收到的值按只读输入处理。

### 4. 浅复制不等于复制嵌套对象

复制数组只创建新容器，数组中的对象仍是原来的引用：

~~~~tsx
const localCourses = [...courses]

// 错误：仍然修改了输入中的第一个 Course 对象。
localCourses[0].title = localCourses[0].title.trim()
~~~~

若只需要显示规范化文本，直接计算新的局部字符串即可：

~~~~tsx
const displayTitle = courses[0].title.trim()
~~~~

不要为了显示派生值修改输入对象。

## 七、本次执行内的局部修改是允许的

### 1. 规则看所有权，不看方法名称

`push` 会修改接收数组，但修改哪个数组决定它是否安全。下面的 `items` 在每次执行时重新创建：

~~~~tsx
type Course = Readonly<{
  id: string
  title: string
  published: boolean
}>

type PublishedCoursesProps = {
  courses: readonly Course[]
}

// 只修改本次 render 新建的局部数组。
function PublishedCourses({ courses }: PublishedCoursesProps) {
  const items = []

  for (const course of courses) {
    if (course.published) {
      items.push(<li key={course.id}>{course.title}</li>)
    }
  }

  return <ul>{items}</ul>
}
~~~~

`items` 不在模块级定义，不来自 Props，也没有被写入外部缓存。下一次调用会得到一份新的空数组，因此
这次 `push` 不会被下一次调用观察到。

### 2. 局部值不能泄漏成共享可变状态

仅仅在函数体里创建变量还不够；如果把引用交给外部长期保存，后续修改仍可能被观察到：

~~~~tsx
const savedLists: string[][] = []

// 错误：局部数组被写入模块级集合并逃逸。
function SavedCourseList({ titles }: { titles: readonly string[] }) {
  const localTitles = [...titles]
  savedLists.push(localTitles)
  return <p>{localTitles.join('、')}</p>
}
~~~~

`localTitles` 最初是局部创建的，但 `savedLists.push(localTitles)` 把它和一次 render 之外的共享状态连接
起来。真正安全的局部值只服务当前计算结果。

### 3. map、filter 与局部累加器都可以使用

下面三种写法都能保持纯度：

~~~~ts
const published = courses.filter((course) => course.published)
const titles = published.map((course) => course.title)

const accumulated: string[] = []
for (const course of courses) {
  if (course.published) accumulated.push(course.title)
}
~~~~

前两行创建新数组；后面的 `accumulated` 也属于本次调用。纯度不要求只能写函数式链式表达式，关键是
输入保持不变，结果只由输入决定。

### 4. 传给 JSX 或 Hook 后停止修改

局部值的可修改窗口不是从创建到函数结束。一个对象或数组一旦传给 JSX 或 Hook，就可能被其他计算
读取；继续修改同一引用会让两个使用位置观察到不一致的阶段。

~~~~tsx
const course = { title: 'Props' }
const heading = <h2>{course.title}</h2>

// 错误：course 已经参与前面的 JSX 计算。
course.title = '事件处理'
const paragraph = <p>{course.title}</p>
~~~~

应在传出前完成局部组装，或者为后面的用途创建新值：

~~~~tsx
const course = { title: 'Props' }
const heading = <h2>{course.title}</h2>
const nextCourse = { ...course, title: '事件处理' }
const paragraph = <p>{nextCourse.title}</p>
~~~~

## 八、Hook 也遵守同一套 Render 合同

### 1. Hook 不是副作用豁免区

Hook 在组件 render 过程中参与计算。把随机值、网络请求或模块变量修改从组件函数移动到 Hook 函数，
不会让这些操作变纯。只要代码在 render 中执行，就要满足相同输入得到相同结果、没有 render 副作用、
不修改非局部值。

### 2. Hook 参数按只读输入处理

组件把数组或对象交给 Hook 时，Hook 不应修改这些参数。Hook 可以读取参数、计算局部值并返回结果；
需要组装数组时，同样可以创建本次执行的局部数组。

### 3. Hook 的普通返回值也按不可变结果处理

Hook 返回的普通对象或数组可能与 React 状态、缓存或其他调用者共享。调用方不应对这些结果执行原地
排序、追加或字段改写；需要派生结果时创建新数组或对象。

某些 Hook 会明确返回专用更新函数，这种变化入口按对应 API 合同使用。不能从“返回了更新函数”推导
其他返回值也可以直接修改。

### 4. 不在这里推导 Hook 调用规则

纯度回答“执行的代码能否安全重复”，调用规则回答“Hook 可以在哪里以及按什么顺序调用”。两个问题
相关但不相同。纯度规则不能代替 Hook 的调用位置、命名和顺序规则。

同样，某个 Hook 是否允许事件、订阅或外部同步，要由该 Hook 的公开合同决定；不能因为函数名以 `use`
开头，就默认其中任何副作用都合理。

## 九、TypeScript Readonly 是静态辅助

### 1. 为 Props 表达只读意图

可以在类型中明确对象字段和数组不可修改：

~~~~tsx
type Course = Readonly<{
  id: string
  title: string
}>

type CourseListProps = {
  courses: readonly Course[]
}
~~~~

`readonly Course[]` 不提供 `push`、`pop`、`sort` 等变异方法，`Readonly<...>` 阻止给列出的顶层字段
重新赋值。它们能让许多输入修改在类型检查时直接暴露。

### 2. readonly 不改变 JavaScript 运行时

TypeScript 类型会在编译后消失。`readonly` 不会自动执行 `Object.freeze`，也不能阻止通过其他可写别名
修改同一个 JavaScript 对象。

因此不能把“类型检查通过”当作运行时纯度证明。类型只帮助表达设计，代码仍要遵守输入所有权和副作用
边界。

### 3. readonly 默认是浅层的

下面只把 `profile` 属性本身标记为不可重新赋值，没有自动把内部对象递归变成只读：

~~~~ts
type Student = {
  readonly profile: {
    name: string
  }
}
~~~~

需要只读嵌套字段时，应在相应层级继续声明 `readonly`。无论类型写到哪一层，React 的运行时规则仍是
不修改不归当前 render 所有的输入值。

## 十、根据触发原因放置工作

### 1. 纯派生计算放在 Render

只由当前 Props、State、Context 或 Hook 参数决定的值，直接在 render 中计算：

- 格式化标题和数字。
- 按条件选择 JSX。
- 筛选、映射或排序局部副本。
- 计算数量、布尔值和显示文本。
- 组装本次返回所需的局部数组或对象。

这些工作不需要先写入另一个存储位置再读回来。

### 2. 用户动作放在事件处理器

保存表单、提交请求、记录一次点击等动作由明确交互触发，应在对应事件处理器中执行。事件处理器在
render 之外运行，因此可以承担由该用户动作引起的副作用。

离开 render 只改变副作用的执行时机，不改变数据所有权。事件处理器仍不能直接改写 Props、当前 State、
Context、Hook 参数或 Hook 的普通返回对象；需要变化时使用数据所有者提供的更新入口。

这里的判断只依赖触发原因，不涉及事件对象、传播阶段、默认行为或 TypeScript 事件类型。

### 3. 外部系统同步才考虑 Effect

若组件因为出现在页面上而必须连接、订阅或同步 React 之外的系统，并且没有明确用户动作可以承载，
才考虑 Effect 边界。

普通派生计算不应为了“避免在 render 中计算”而搬进 Effect。Effect 的依赖、清理和生命周期属于该机制
自身的合同，不由纯度规则代替。

### 4. 三问选择法

面对一段代码，可以依次问：

1. 它是否只根据当前输入计算一个值？是，就留在 render。
2. 它是否由一次明确的用户动作触发？是，就放在对应事件处理器。
3. 它是否因为组件显示而必须同步外部系统？是，才考虑 Effect。

若三项都不是，应重新检查这段工作是否属于 React 组件，或者是否存在更清楚的数据所有者。

## 十一、可运行示例：重复计算与局部所有权

下面的 Demo 使用同一份只读课程数组执行两次计算。计算函数在每次调用中创建一个新的局部数组，并用
`push` 收集已发布课程；它不修改输入数组，也不读取随机值、当前时间或外部可变数据。

:::demo{id="react.core.learn.basics.component-purity.local-mutation-demo"}
:::

观察三项结果：

1. 两次计算的摘要和课程顺序相同，说明值结果由相同输入决定。
2. 两次结果数组不是同一引用，说明幂等不要求复用对象身份。
3. 计算前后的输入指纹相同，说明局部 `push` 没有修改收到的数据。

这个 Demo 证明当前实现满足列出的可观察条件，不代表只凭两个相同画面就能证明任意组件完全纯净。
源码中的输入所有权和外部写入仍要检查。

## 十二、易错使用提示

:::pitfalls
### 错误：在 Render 中生成随机界面值

**触发条件：** 组件函数直接调用 `Math.random()`、`Date.now()` 或 `new Date()` 生成当前显示内容。

**原因：** 这些值由随机序列或调用时刻决定，不是本次 Props、State、Context 或 Hook 参数。

**后果：** 相同输入重复计算可能得到不同文本或属性，界面结果依赖调用时机。

**错误示例：**

~~~~tsx
// 错误：每次 render 都生成新的随机值。
function TicketCode() {
  return <code>{Math.random()}</code>
}
~~~~

**正确写法：**

~~~~tsx
// 根据调用方提供的稳定输入展示票据码。
function TicketCode({ code }: { code: string }) {
  return <code>{code}</code>
}
~~~~

**验证方式：** 使用同一个 `code` 调用组件两次，返回文本一致；组件内部不获取新的随机值或当前时间。

### 错误：修改模块级数组或计数器

**触发条件：** 组件执行时向模块数组追加项目，或给模块变量自增。

**原因：** 模块值在本次 render 前已经存在，修改会被后续调用和其他组件观察到。

**后果：** 结果依赖组件执行次数与顺序，重复 render 会累积额外数据。

**错误示例：**

~~~~tsx
const renderedTitles: string[] = []

// 错误：把本次标题写入模块级共享数组。
function CourseTitle({ title }: { title: string }) {
  renderedTitles.push(title)
  return <h2>{title}</h2>
}
~~~~

**正确写法：**

~~~~tsx
// 使用局部字符串规范化并展示课程标题。
function CourseTitle({ title }: { title: string }) {
  const normalizedTitle = title.trim()
  return <h2>{normalizedTitle}</h2>
}
~~~~

**验证方式：** 搜索组件函数中的模块赋值与变异调用；重复计算前后模块数据保持不变。

### 错误：原地排序数组 Prop

**触发条件：** 对 Props 接收的数组直接调用 `sort`、`push`、`splice` 或改写索引成员。

**原因：** 数组属于调用方；这些操作修改了本次 render 开始前已经存在的输入。

**后果：** 父组件和其他消费者看到意外顺序或内容，重复计算可能继续累积变化。

**错误示例：**

~~~~tsx
// 错误：原地排序调用方提供的标题数组。
function CourseNames({ titles }: { titles: string[] }) {
  titles.sort()
  return <p>{titles.join('、')}</p>
}
~~~~

**正确写法：**

~~~~tsx
// 排序局部副本并展示课程名称。
function CourseNames({ titles }: { titles: readonly string[] }) {
  const sortedTitles = [...titles].sort()
  return <p>{sortedTitles.join('、')}</p>
}
~~~~

**验证方式：** 记录输入顺序，计算后再次读取原数组；原数组顺序不变，排序只发生在局部副本。

### 错误：浅复制后继续修改输入中的对象

**触发条件：** 先展开数组，再修改副本中的对象字段。

**原因：** 新数组仍引用原来的嵌套对象，字段写入会修改输入对象。

**后果：** 其他读取同一对象的组件观察到未经所有者更新的值。

**错误示例：**

~~~~tsx
const localCourses = [...courses]
localCourses[0].title = localCourses[0].title.trim()
~~~~

**正确写法：**

~~~~tsx
const visibleTitles = courses.map((course) => course.title.trim())
~~~~

**验证方式：** 计算前后比较输入对象字段；原对象不变，显示值来自新字符串或新对象。

### 错误：把所有局部 Mutation 都判为不纯

**触发条件：** 看到任何 `push` 或赋值都要求删除，即使目标值在本次执行中创建且未泄漏。

**原因：** 把方法名称当成规则，忽略数据所有权和外部可观察性。

**后果：** 代码被迫改成更难读的形式，却没有提高输入保护或幂等性。

**错误示例：**

~~~~text
任何 push 都一定破坏纯度。
~~~~

**正确写法：**

~~~~tsx
const items = []
for (const course of courses) {
  items.push(<li key={course.id}>{course.title}</li>)
}
~~~~

**验证方式：** 确认 `items` 每次执行重新创建、只服务当前返回结果、没有写入外部容器。

### 错误：在 Render 中同步 DOM 或外部系统

**触发条件：** 组件函数设置 `document.title`、写存储、发请求、启动计时器或调用外部部件方法。

**原因：** 组件执行除了返回 JSX，还改变了 React 之外的系统。

**后果：** 重复计算会重复外部动作，外部状态可能与最终界面不一致。

**错误示例：**

~~~~tsx
// 错误：render 时直接写入浏览器存储。
function CoursePage() {
  localStorage.setItem('last-page', 'purity')
  return <h1>组件纯度</h1>
}
~~~~

**正确写法：**

~~~~tsx
// 只计算并返回课程页面标题。
function CoursePage() {
  return <h1>组件纯度</h1>
}
~~~~

**验证方式：** 调用组件计算时不发生网络、存储、计时器或直接 DOM 写入；外部动作按触发原因移到
render 之外。

### 错误：把所有副作用都塞进 Effect

**触发条件：** 明确由点击、提交等用户动作引起的工作，也先写入状态再由 Effect 转发。

**原因：** 混淆了用户交互和“组件显示后需要外部同步”两种触发原因。

**后果：** 数据流增加不必要中转，动作与真正触发位置分离。

**错误示例：**

~~~~text
用户点击 -> 设置标记 -> Effect 观察标记 -> 执行动作
~~~~

**正确写法：**

~~~~text
用户点击 -> 对应事件处理器执行动作
外部系统需随显示同步 -> 才考虑 Effect
~~~~

**验证方式：** 为每个副作用写出触发原因；明确用户动作由对应 handler 承担，没有用户动作的外部同步
才进入 Effect 边界。

### 错误：把 Readonly 当作运行时深冻结

**触发条件：** 只要类型写了 `readonly`，就认为任何别名、嵌套对象和运行时代码都不可能修改数据。

**原因：** TypeScript 类型不改变 JavaScript 运行时，`readonly` 默认也只是声明位置的浅层约束。

**后果：** 代码仍可能通过其他别名改写对象，却被误判为已经满足纯度。

**错误示例：**

~~~~text
类型检查通过 = 运行时对象已深冻结
~~~~

**正确写法：**

~~~~text
readonly 提供静态辅助 + 代码仍遵守所有权和不变性合同
~~~~

**验证方式：** 除类型结果外继续检查对象来源、嵌套引用和运行时写操作。

:::

## 十三、纯度排查清单

### 1. 先列输入

写出当前计算读取的全部值：

- Props 字段及其嵌套对象。
- 当前 State 值。
- 当前 Context 值。
- Hook 参数和 Hook 读取的 render 输入。
- 不会变化的模块常量。

若结果还依赖当前时间、随机数、可变模块值或浏览器全局状态，说明存在未声明输入。

### 2. 再找写操作

检查赋值、`++`、`push`、`sort`、`splice`、对象字段写入、DOM 调用、存储、请求和计时器。对每个写操作
追问目标值的所有者：

- 来自 Props、State、Context 或参数：不能修改。
- 模块级或闭包共享值：不能在 render 中修改。
- 本次执行新建且没有泄漏：可以局部修改。
- React 外部系统：必须移出 render。

### 3. 最后重复计算

使用同一组输入执行纯辅助函数两次，比较值结果，并确认输入和外部状态没有变化。重复计算是一种有用
检查，但不能代替源码中的所有权与副作用检查。

## 十四、原理与适用场景

### 1. 官方公共规则

React 官方把组件与 Hook 纯度定义为幂等、render 无副作用、不修改非局部值。Props 和 State 是不可变
快照；Context 也是组件结果的输入。本次执行中创建的局部值可以修改。

### 2. 可直接推导的开发规则

从上述规则可以得到：

1. 组件和 Hook 不能依赖“这次只调用一次”才能正确。
2. 判断 mutation 要看数据所有权，不看是否使用某个特定方法。
3. 相同值结果不要求相同引用身份。
4. 纯派生值直接计算，不需要用副作用保存一份副本。
5. 用户动作与外部系统同步都在 render 外，但两者的触发原因不同。
6. 静态类型和开发诊断能帮助发现错误，不能代替运行时设计合同。

### 3. 本知识点的边界

纯度不解释 Hook 的调用位置和调用顺序，不解释 State 更新队列，不展开事件传播，不给出 Effect 依赖与
清理规则，也不讨论性能缓存、协调算法或 Fiber。遇到这些问题时，应使用对应 API 的独立合同，而不是
从“纯函数”三个字继续推导。

开发 StrictMode 可以让部分不纯逻辑更明显，但它只是诊断提示，组件仍需依靠纯度规则保证正确性。

## 十五、练习

:::exercise
### 重构课程摘要组件

**要求：** 编写 `CourseSummary`，接收 `readonly Course[]`。删除 render 中的 `Math.random()`、模块级
计数器、对输入数组的 `sort` 和 `document.title` 写入。使用本次调用内新建的数组收集已发布课程，
输出稳定标题、数量和列表。为输入对象及数组添加合适的 `readonly` 类型，但不要把类型当作运行时冻结。

**验收：** 同一输入重复计算两次得到相同标题、数量和课程顺序；两次结果可以是不同数组引用；计算前后
输入数组及课程对象字段不变；render 期间没有随机值、当前时间、模块写入、网络、存储、计时器或直接
DOM 写入；局部数组没有保存到外部容器。
:::

## 十六、本节小结

- 组件与 Hook 的 render 逻辑必须幂等、无 render 副作用、不修改非局部值。
- 组件结果由 Props、State、Context 决定；Hook 结果由参数和它读取的 render 输入决定。
- 相同结果不等于相同对象引用，每次创建新的局部数组、对象或 JSX 可以保持纯度。
- Props、State、Context、模块共享值和传入的嵌套对象都不是本次 render 可以修改的数据。
- 本次执行中新建且不泄漏的局部值可以修改；判断依据是所有权和可观察性，不是方法名称。
- 当前时间和随机值不由 render 输入决定；网络、存储、计时器和 DOM 写入属于副作用。
- 纯派生计算留在 render，用户动作进入事件处理器，必要外部同步才考虑 Effect。
- TypeScript readonly 是静态浅层辅助，不能代替运行时的纯度设计。

## 十七、参考资料

- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [Responding to Events：Can event handlers have side effects?](https://react.dev/learn/responding-to-events#can-event-handlers-have-side-effects)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events)
- [TypeScript readonly properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties)
- [TypeScript ReadonlyArray](https://www.typescriptlang.org/docs/handbook/2/objects.html#the-readonlyarray-type)
- [ECMAScript Numbers and Dates](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html)
- [ECMAScript Indexed Collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
