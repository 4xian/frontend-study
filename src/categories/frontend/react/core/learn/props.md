---
id: react.core.learn.basics.props
type: lesson
title: Props
summary: 从零掌握父组件怎样通过只读 Props 向子组件提供输入，并用 TypeScript 建立清晰合同。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - react.core.learn.basics.module-boundaries-and-component-tree
related: []
tags:
  - React
  - Props
  - TypeScript
  - readonly
  - one-way data flow
appliesTo: React 19.2（运行时 19.2.8）、TypeScript 6.0.3
verifiedAt: 2026-08-15
objectives:
  - 能解释 JSX attribute 怎样成为子组件收到的一个 props 对象。
  - 能用整体读取或参数解构读取 Props，并用 TypeScript 描述必填、可选和联合类型。
  - 能准确判断参数默认值对缺失、undefined、null、0 和 false 的不同结果。
  - 能解释 Props 为什么是每次 render 的只读快照，并避免修改嵌套对象和数组。
  - 能判断何时显式传值、何时由薄封装完整转发同一份 Props 合同。
recap:
  - 父组件在子组件 JSX 上提供值，函数组件每次只接收一个 props 对象。
  - 必填、可选和默认值是不同合同；默认值只处理缺失或 undefined。
  - Props 是当前 render 的只读输入，不得修改 props 或其中引用的既有对象。
  - 函数 prop 应写明参数与返回值；纯格式化函数可以在计算 UI 时调用。
  - 默认显式列出属性，只有薄封装完整转发同一份合同时才克制使用 spread。
sources:
  - title: React Passing Props to a Component
    url: https://react.dev/learn/passing-props-to-a-component
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - JSX 传值、一个 props 对象、解构、默认值、spread 与只读快照
  - title: React Components and Hooks Must Be Pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Props 是不可变快照，组件不能修改 props 或其中的既有值
  - title: React Using TypeScript
    url: https://react.dev/learn/typescript
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 使用 type 或 interface 描述组件 Props
  - title: React 19 Upgrade Guide
    url: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - 函数组件使用参数默认值，不再使用 defaultProps
  - title: TypeScript Object Types
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html
    sourceType: official-reference
    appliesTo: TypeScript current
    claims:
      - 对象类型、可选属性与 readonly 属性的静态语义
  - title: TypeScript More on Functions
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html
    sourceType: official-reference
    appliesTo: TypeScript current
    claims:
      - 函数类型表达式、可选参数与默认参数
  - title: ECMAScript KeyedBindingInitialization
    url: https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-runtime-semantics-keyedbindinginitialization
    sourceType: specification
    appliesTo: ECMAScript current
    claims:
      - 解构默认值只在属性缺失或值为 undefined 时生效
---

# Props

## 一、学习目标

- 理解 Props 是组件的输入合同，不是组件内部可随意修改的数据。
- 掌握 JSX attribute 到 props 对象的映射，以及整体读取和参数解构两种写法。
- 使用 TypeScript 准确描述必填、可选、联合、对象、数组和函数类型的 prop。
- 精确判断默认值的生效条件，避免把 `0`、`false`、空字符串或 `null` 当成缺失。
- 避免修改对象和数组 prop，理解显式传递与受控 spread 的边界。

## 二、为什么需要 Props

没有 Props 时，一个组件只能显示写死在函数内部的内容：

```tsx
// 显示固定课程名称。
function LessonTitle() {
  return <h2>Props</h2>
}
```

如果页面要显示二十门课程，复制二十个结构相同、文字不同的组件会产生重复代码。Props 允许父组件
提供差异数据，子组件只负责按照固定结构计算 UI：

```tsx
type LessonTitleProps = {
  title: string
}

// 显示父组件提供的课程名称。
function LessonTitle({ title }: LessonTitleProps) {
  return <h2>{title}</h2>
}

// 为同一个组件提供两组不同输入。
function CoursePage() {
  return (
    <main>
      <LessonTitle title="Props" />
      <LessonTitle title="Props 实践" />
    </main>
  )
}
```

`LessonTitle` 的结构没有复制，变化的内容由 `title` 输入决定。这就是 Props 最重要的价值：把组件的
固定职责和调用方提供的数据分开。

## 三、Props 是父组件提供的输入

父组件在子组件标签上写 attribute，React 把这些值收集到本次 element 的 `props` 中。组件执行时
收到这个对象，再根据输入计算返回值：

```text
父组件 JSX attribute
  -> 本次 React element 的 props
  -> 子组件收到一个 props 对象
  -> 子组件计算本次 UI
```

下面的 `title` 与 `minutes` 都是 prop：

```tsx
type LessonSummaryProps = {
  title: string
  minutes: number
}

// 根据课程标题和时长计算摘要。
function LessonSummary({ title, minutes }: LessonSummaryProps) {
  return <p>{title} · {minutes} 分钟</p>
}

// 提供课程摘要需要的输入。
function CoursePage() {
  return <LessonSummary title="Props" minutes={20} />
}
```

这里有两个方向不同的职责：

- 父组件决定传什么值。
- 子组件声明需要什么值，并决定怎样显示。

数据从父组件流向子组件，所以常称为单向数据流。它描述所有权和信息方向，不表示 React 会复制每个
对象，也不表示子组件可以反向修改父组件的数据。

## 四、JSX attribute 怎样传值

### 1. 引号传字符串

```tsx
<LessonSummary title="Props" minutes={20} />
```

`title="Props"` 直接传入字符串。若写成 `title="courseTitle"`，组件收到的是文本
`courseTitle`，不会读取同名变量。

### 2. 花括号传 JavaScript expression

数字、变量、对象、数组和函数等值使用花括号：

```tsx
const lessonTitle = 'Props'
const duration = 20

<LessonSummary title={lessonTitle} minutes={duration} />
```

花括号中的表达式先求值，所得结果成为 prop 值。Props 可以承载 JavaScript 值，但组件类型应准确
表达它真正接受的范围。

### 3. 布尔值可以使用简写

对布尔 prop，只有属性名等价于传入 `true`：

```tsx
type CourseStatusProps = {
  published: boolean
}

// 显示父组件提供的发布状态。
function CourseStatus({ published }: CourseStatusProps) {
  return <p>{published ? '已发布' : '草稿'}</p>
}

<CourseStatus published />
<CourseStatus published={false} />
```

这里只观察布尔 prop 的输入结果：简写表示 `true`，显式表达式可以传入 `false`。

## 五、函数组件只接收一个 props 对象

React 不会按 attribute 的顺序给组件传多个位置参数。下面的写法错误地把两个 prop 当作两个形参：

```tsx
// 错误：函数组件不会按位置接收 title 和 minutes。
function LessonSummary(title: string, minutes: number) {
  return <p>{title} · {minutes}</p>
}
```

函数组件接收的是一个对象。可以保留整个对象再逐项读取：

```tsx
type LessonSummaryProps = {
  title: string
  minutes: number
}

// 从完整 props 对象读取字段。
function LessonSummary(props: LessonSummaryProps) {
  return <p>{props.title} · {props.minutes} 分钟</p>
}
```

也可以在唯一参数位置解构：

```tsx
// 在参数位置解构同一个 props 对象。
function LessonSummary({ title, minutes }: LessonSummaryProps) {
  return <p>{title} · {minutes} 分钟</p>
}
```

两种写法的输入模型相同。字段较少时，参数解构通常更紧凑；需要整体转发或多次区分来源时，保留
`props` 也完全正确。

解构中的冒号不是类型标注，而是重命名语法：

```tsx
// 错误：这里把 title 重命名成名为 string 的变量。
function LessonTitle({ title: string }) {
  return <h2>{string}</h2>
}
```

类型应该写在整个参数之后：

```tsx
// 为完整的解构参数声明 Props 类型。
function LessonTitle({ title }: { title: string }) {
  return <h2>{title}</h2>
}
```

## 六、用 TypeScript 声明 Props 合同

### 1. `type` 与 `interface` 都可以

React 官方同时展示 `type` 和 `interface`。两者都可以描述 Props 对象：

```tsx
type LessonTitleProps = {
  title: string
}

interface LessonDurationProps {
  minutes: number
}
```

简单 Props 场景不需要把二者理解成优劣关系。以下示例使用 `type` 保持一致；已有明确编码规范时，
按规范选择即可。

### 2. 必填属性

没有 `?` 的字段是必填属性：

```tsx
type LessonCardProps = {
  title: string
  minutes: number
}
```

调用方必须同时提供 `title` 与 `minutes`，类型和值也必须匹配：

```tsx
<LessonCard title="Props" minutes={20} />
```

缺少字段、把数字写成字符串，或拼错属性名，都应在类型检查阶段暴露。

### 3. 可选属性

`?` 表示调用方可以省略该字段：

```tsx
type LessonCardProps = {
  title: string
  level?: string
}
```

如果没有提供默认值，组件读取 `level` 时必须考虑 `undefined`。可选只说明允许省略，不等于自动拥有
默认值。

### 4. 联合类型限制可选值

当 prop 只允许有限选项时，用联合类型比宽泛的 `string` 更准确：

```tsx
type LessonCardProps = {
  title: string
  level: '基础' | '进阶'
}
```

调用方传入其他文本会被拒绝。这能把组件真正支持的选项直接写进接口。

### 5. 对象和数组要写清结构

```tsx
type Lesson = {
  readonly title: string
  readonly minutes: number
}

type LessonCardProps = {
  lesson: Lesson
  topics: readonly string[]
}

// 读取结构化对象和只读数组。
function LessonCard({ lesson, topics }: LessonCardProps) {
  return <p>{lesson.title} · {topics.join(' / ')}</p>
}
```

不要用宽泛的 `object` 表示已知字段。`object` 只表示“不是原始值”，不能让组件安全读取
`title` 或 `minutes`。

### 6. 函数 prop 要写调用签名

```tsx
type DurationProps = {
  minutes: number
  formatMinutes: (minutes: number) => string
}

// 调用父组件提供的纯格式化函数。
function Duration({ minutes, formatMinutes }: DurationProps) {
  return <span>{formatMinutes(minutes)}</span>
}
```

`(minutes: number) => string` 同时声明参数和返回值。不要写成宽泛的 `Function`，否则接口无法说明
怎样调用，也会丢失重要的类型检查。

函数 prop 可以表达不同种类的调用合同。这里的 `formatMinutes` 是纯格式化函数，可以在组件计算 UI
时调用。带副作用的交互回调只能传递给对应的交互位置，不能在渲染过程中提前调用；Props 合同只需
准确写明它接收什么参数、返回什么结果。

## 七、默认值只处理缺失和 undefined

可选 prop 可以在参数解构处提供默认值：

```tsx
type CourseBadgeProps = {
  label: string
  size?: number
}

// 在调用方省略尺寸时使用默认值。
function CourseBadge({ label, size = 100 }: CourseBadgeProps) {
  return <span>{label} · {size}</span>
}
```

默认值的边界必须精确理解：

| 调用 | 组件内的 `size` | 是否使用默认值 |
| --- | ---: | --- |
| `<CourseBadge label="基础" />` | `100` | 是，属性缺失 |
| `<CourseBadge label="基础" size={undefined} />` | `100` | 是，值为 `undefined` |
| `<CourseBadge label="基础" size={0} />` | `0` | 否，`0` 是明确值 |
| `<CourseBadge label="基础" size={null} />` | `null` | 否，而且当前类型会拒绝 `null` |

`false` 和空字符串也不会触发默认值。默认参数判断的是“读取结果是否为 `undefined`”，不是“值看
起来是否为空”。表格描述的是 JavaScript 运行时行为；TypeScript 是否允许显式传入 `undefined`，还
取决于可选属性的项目配置。

运行时默认行为与调用方类型是两层合同：

```tsx
type CourseBadgeProps = {
  label: string
  size: number
}

// 默认参数不自动把必填属性变成可选属性。
function CourseBadge({ label, size = 100 }: CourseBadgeProps) {
  return <span>{label} · {size}</span>
}
```

上面虽然有 `size = 100`，但类型仍写成 `size: number`，所以调用方仍必须传入 `size`。希望调用方可
省略时，要同时写成 `size?: number`。

React 19 的函数组件使用 JavaScript 参数默认值，不再为函数组件使用 `defaultProps`。

## 八、Props 是每次 render 的只读快照

组件收到的是当前这次 render 的 Props。以后父组件可以提供新值，但子组件不能修改当前输入来请求
变化。

下面的代码修改了父级拥有的对象：

```tsx
type Lesson = {
  title: string
}

type LessonNameProps = {
  lesson: Lesson
}

// 错误：修改了作为 prop 收到的既有对象。
function LessonName({ lesson }: LessonNameProps) {
  lesson.title = lesson.title.toUpperCase()
  return <h2>{lesson.title}</h2>
}
```

正确做法是从输入计算新的局部值：

```tsx
// 从只读输入计算新的显示值。
function LessonName({ lesson }: LessonNameProps) {
  const displayTitle = lesson.title.toUpperCase()
  return <h2>{displayTitle}</h2>
}
```

计算 `displayTitle` 没有改变 `lesson`。同一个对象若还被父组件或另一个子组件使用，也不会受到污染。

### 只读不只针对顶层字段

不能给 `props.title` 赋值，也不能修改 prop 引用的对象和数组：

```tsx
type LessonTopicsProps = {
  lesson: { title: string }
  topics: string[]
}

// 错误：两次操作都修改了父级拥有的输入。
function LessonTopics({ lesson, topics }: LessonTopicsProps) {
  lesson.title = '已修改'
  topics.push('新增主题')
  return <p>{lesson.title} · {topics.join(' / ')}</p>
}
```

React 的单向数据流不会自动深拷贝对象。即使子组件拿到同一个引用，也必须把它当作只读输入。

TypeScript 可以用 `readonly` 和只读数组帮助检查：

```tsx
type Lesson = {
  readonly title: string
}

type LessonTopicsProps = {
  lesson: Lesson
  topics: readonly string[]
}
```

类型只是辅助约束，不是 React 自动执行的深冻结。真正的规则仍是：组件只读取输入，需要不同结果时
计算新值；需要数据变化时，由拥有数据的一方在后续 render 提供新 Props。

`readonly` 默认只约束当前属性或数组接口，不会自动递归约束对象内部的所有层级。嵌套对象也需要按
实际读取结构继续声明只读字段，同时仍要遵守运行时不修改输入的合同。

## 九、显式传递与 spread

默认优先显式列出属性：

```tsx
<LessonCard lesson={lesson} topics={topics} formatMinutes={formatMinutes} />
```

这样可以直接看出当前组件向下提供了哪些值。若一个薄封装确实接受并完整转发同一份合同，可以受控
使用 spread：

```tsx
type LessonCardProps = {
  lesson: Lesson
  topics: readonly string[]
  formatMinutes: (minutes: number) => string
}

// 完整转发同一份 LessonCard Props 合同。
function LessonCardFrame(props: LessonCardProps) {
  return (
    <section>
      <LessonCard {...props} />
    </section>
  )
}
```

`<LessonCard {...props} />` 会逐项转发对象属性，不是传入一个名为 `props` 的属性。下面两种写法含义
不同：

```tsx
<LessonCard {...props} />
<LessonCard props={props} />
```

第二种只有在 `LessonCard` 明确声明了名为 `props` 的字段时才成立。

spread 不应成为少写字段名的默认选择。无差别转发会隐藏真实接口，也可能把无关属性带到错误位置。
组件真正只需要三个字段时，显式列出三个字段通常更清楚。

## 十、Demo：观察两组 Props

下面的静态 Demo 使用同一个 `LessonCard` 接收两组输入：第一组显式传值并省略可选 `level`；第二组
先形成完整 Props 对象，再由薄封装通过 spread 完整转发。组件会格式化标题，但不会修改调用方提供的
对象和数组。

:::demo{id="react.core.learn.basics.props.input-contract-demo"}
:::

观察重点：

1. 两张卡片由同一个函数组件生成，内容由 Props 决定。
2. 第一张省略 `level`，组件得到默认值“基础”。
3. 第二张显式提供“进阶”，并由薄封装完整转发同一份合同。
4. 对象、只读数组和格式化函数都可以成为 prop。
5. 组件只从 `lesson.title` 计算大写文本，没有修改父级对象。

## 十一、易错使用提示

:::pitfalls
### 错误：把 prop 当成位置参数

**触发条件：** 为每个 prop 写一个组件形参。

**原因：** 函数组件收到的是一个 props 对象，不是按 attribute 顺序排列的业务参数。

**后果：** 组件签名与 React 调用模型不一致，读取到错误值或直接出现类型错误。

**错误示例：**

```tsx
// 错误：title 和 minutes 不是两个位置参数。
function LessonCard(title: string, minutes: number) {
  return <p>{title} · {minutes}</p>
}
```

**正确写法：**

```tsx
// 从唯一的 props 对象中解构字段。
function LessonCard({ title, minutes }: LessonCardProps) {
  return <p>{title} · {minutes}</p>
}
```

**验证方式：** 检查组件是否只有一个业务参数，并且该参数类型描述完整 Props 对象。

### 错误：把 expression 写进引号

**触发条件：** 想传变量、数字或对象，却使用字符串 attribute。

**原因：** JSX 引号中的内容是字面字符串，不会执行花括号内的变量读取。

**后果：** 组件收到错误文本或不符合接口的值。

**错误示例：**

```tsx
<LessonCard minutes="20" lesson="{lesson}" />
```

**正确写法：**

```tsx
<LessonCard minutes={20} lesson={lesson} />
```

**验证方式：** 检查非字符串值是否使用花括号，并让 TypeScript 核对实际类型。

### 错误：有默认值却忘记把属性声明为可选

**触发条件：** 参数写了默认值，但 Props 字段仍然必填。

**原因：** 默认参数负责运行时取值，`?` 才负责调用方能否省略。

**后果：** 组件内部有默认值，调用方省略时却仍然报类型错误。

**错误示例：**

```tsx
type BadgeProps = { size: number }

// 错误：默认值不会改变 size 的必填合同。
function Badge({ size = 100 }: BadgeProps) {
  return <span>{size}</span>
}
```

**正确写法：**

```tsx
type BadgeProps = { size?: number }

// 同时声明可选属性和缺失时的默认值。
function Badge({ size = 100 }: BadgeProps) {
  return <span>{size}</span>
}
```

**验证方式：** 分别检查省略 `size` 和显式传入数值的调用是否都符合预期。

### 错误：认为默认值会覆盖所有假值

**触发条件：** 把 `0`、`false`、空字符串或 `null` 都理解成“没有传值”。

**原因：** 参数默认值只处理属性缺失或值为 `undefined`。

**后果：** 合法的 `0` 或 `false` 被错误替换，`null` 的类型边界被误判。

**错误示例：**

```tsx
const requestedSize = 0

<CourseBadge label="基础" size={requestedSize || 100} />
```

**正确写法：**

```tsx
const requestedSize = 0

<CourseBadge label="基础" size={requestedSize} />
```

**验证方式：** 分别检查缺失、`undefined`、`0` 和 `null` 四种输入。

### 错误：修改对象或数组 prop

**触发条件：** 给对象字段赋值，或对数组调用 `push`、`sort`、`splice` 等变异方法。

**原因：** 这些值由父级拥有，Props 是当前 render 的只读输入。

**后果：** 共享数据被污染，其他组件和后续 render 可能观察到意外结果。

**错误示例：**

```tsx
// 错误：直接修改父级提供的对象和数组。
function LessonCard({ lesson, topics }: LessonCardProps) {
  lesson.title = '已修改'
  topics.push('新增主题')
  return <p>{lesson.title}</p>
}
```

**正确写法：**

```tsx
// 只从输入计算局部值。
function LessonCard({ lesson, topics }: LessonCardProps) {
  const displayTitle = lesson.title.toUpperCase()
  const topicText = topics.join(' / ')
  return <p>{displayTitle} · {topicText}</p>
}
```

**验证方式：** 组件执行前后，父级对象和数组内容应保持不变。

### 错误：使用宽泛函数类型

**触发条件：** 把函数 prop 写成全局 `Function` 类型。

**原因：** `Function` 没有表达允许的参数和返回值。

**后果：** TypeScript 无法核对组件是否用正确参数调用函数，也无法核对调用方是否返回正确类型。

**错误示例：**

```tsx
type DurationProps = {
  minutes: number
  formatMinutes: Function
}

// 错误：formatMinutes 的参数与返回值都不明确。
function Duration({ minutes, formatMinutes }: DurationProps) {
  return <span>{formatMinutes(minutes)}</span>
}
```

**正确写法：**

```tsx
type DurationProps = {
  minutes: number
  formatMinutes: (minutes: number) => string
}

// 按明确合同调用纯格式化函数。
function Duration({ minutes, formatMinutes }: DurationProps) {
  return <span>{formatMinutes(minutes)}</span>
}
```

**验证方式：** 分别传入参数类型错误和返回值类型错误的函数，TypeScript 都应拒绝。

### 错误：无差别 spread 所有 Props

**触发条件：** 为省略字段名，把包含额外业务字段的对象全部传给目标组件。

**原因：** spread 隐藏真实接口，并可能携带目标不需要的字段。

**后果：** 调用处看不清目标组件真正需要什么，无关字段也会进入错误层级。

**错误示例：**

```tsx
type TrackedLessonCardProps = LessonCardProps & {
  trackingToken: string
}

// 错误：把 LessonCard 不需要的 trackingToken 一并展开。
function Card(props: TrackedLessonCardProps) {
  return <LessonCard {...props} />
}
```

**正确写法：**

```tsx
// 只把目标组件明确需要的字段继续传递。
function Card({ lesson, topics, formatMinutes }: LessonCardProps) {
  return <LessonCard lesson={lesson} topics={topics} formatMinutes={formatMinutes} />
}
```

**验证方式：** 对照目标组件接口，确认每个被转发字段都属于目标合同。
:::

## 十二、原理与适用场景

Props 合同适合表达“调用方提供输入，组件根据输入计算 UI”。它特别适用于：

- 同一组件结构需要显示多组不同数据。
- 父组件负责数据所有权，子组件负责局部展示。
- 组件需要字符串、数字、对象、数组或纯函数等明确输入。
- 希望用 TypeScript 在调用位置发现缺失字段、拼写错误和类型不匹配。

Props 不适合被当作组件内部可写存储，也不应作为绕过所有权的共享可变对象。组件只读取当前输入并
计算结果；输入值的所有者负责决定以后是否提供不同的值。

从实现角度看，每次父组件建立子组件 element 时都会形成对应的 Props 描述；以后出现新 render 时，
子组件可以收到新的快照。公开编程合同不是“永久保存第一次的对象”，也不是“子组件修改后 React
自动同步父组件”，而是每次 render 都只读取当前输入。

## 十三、练习

:::exercise
### 为 ProfileBadge 建立 Props 合同

**要求：** 定义包含必填 `name: string`、可选 `role?: '学员' | '讲师'` 和
`skills: readonly string[]` 的 Props；编写 `ProfileBadge`，让 `role` 默认等于“学员”，并用同一个
组件渲染两次。一次省略 `role`，另一次显式传入“讲师”；只用 `join` 计算技能文本，不修改原始数组。

**验收：** 两次调用都通过类型检查并显示不同角色；原始 `skills` 数组保持不变；能够解释
`role={undefined}` 会使用默认值，而空字符串既不符合联合类型，也不会自动使用默认值。
:::

## 十四、本节小结

- Props 是父组件提供给子组件的只读输入合同。
- 函数组件只接收一个 props 对象，可以整体读取，也可以在唯一参数中解构。
- JSX 引号传字符串，花括号传 expression 的计算结果。
- TypeScript 中必填、可选、联合、对象、数组和函数 prop 都应准确表达真实接口。
- 默认值只处理属性缺失和 `undefined`；`0`、`false`、空字符串与 `null` 不会触发默认值。
- 不得修改 props 或其中引用的对象和数组；需要显示变化时先计算新的局部值。
- 函数 prop 应准确声明参数和返回值；带副作用的回调不能在渲染过程中提前调用。
- 默认显式列出属性，只有薄封装完整转发同一份合同时才克制使用 spread。

## 十五、参考资料

- [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [Using TypeScript](https://react.dev/learn/typescript)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [TypeScript: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [ECMAScript: KeyedBindingInitialization](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-runtime-semantics-keyedbindinginitialization)
