---
id: engineering.typescript.learn.basics.functions
type: lesson
title: 函数类型
summary: 用参数、返回值、回调、剩余参数和 overload 表达调用合同
domain: frontend
technology: engineering
module: typescript
related:
  - vue.core.learn.basics.emits
tags:
  - TypeScript
  - 函数类型
  - 参数
  - 返回值
  - 回调
  - void
  - rest parameters
  - overload
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: More on Functions"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/More%20on%20Functions.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 函数类型表达式
      - 调用签名
      - 构造签名
      - 泛型函数
      - overload
      - void
  - title: "TypeScript Handbook: Everyday Types - Functions"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Everyday%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 参数注解
      - 返回值注解
      - 上下文类型
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.basics.everyday-types
  - engineering.typescript.learn.basics.objects-arrays-tuples
objectives:
  - 为函数参数、返回值和回调写出可调用合同
  - 根据调用方是否可以省略值选择必需、可选、默认或剩余参数
  - 解释 `() => void` 对回调返回值的处理边界
  - 只在一个实现需要支持多个可区分调用形态时使用 overload
recap:
  - 参数约束调用输入，返回类型约束调用结果，回调可从接收位置获得上下文类型。
  - 可选、默认与剩余参数分别表达不同调用能力，不能只为方便实现而放宽。
  - overload 的实现签名对调用方不可见；联合签名足够时优先保持简单。
---

# 函数类型

## 一、为什么需要

函数把数据模型变成行为合同。参数说明调用方必须提供什么，返回值说明调用后能得到什么，回调类型则把控制权交给调用方。若这些位置写得过宽，错误输入会穿过边界；若可选性或 overload 写得过多，真实调用规则会被隐藏。

## 二、核心概念和最小模型

~~~~ts
type ProgressListener = (completed: number, total: number) => void

/** 将当前课程进度通知给所有监听器。 */
function notifyProgress(
  completed: number,
  total = 8,
  ...listeners: ProgressListener[]
): void {
  for (const listener of listeners) listener(completed, total)
}

notifyProgress(4, 8, (completed, total) => {
  console.log(`${completed}/${total}`)
})
~~~~

函数类型表达式 `(input: T) =&gt; R` 描述可调用值；函数声明上的参数与返回值注解约束实现。默认参数在调用端可省略，剩余参数收集为数组。上下文类型会把回调参数从接收方合同传进函数体。

## 三、知识点详解

### 1. 参数与返回值

**它们是什么：** 参数类型约束调用方可以传入什么，返回类型描述函数完成后提供什么结果。

**它们有什么用：** 完整的调用合同会在调用前发现参数顺序、值类型和返回值使用方式的错误。

**怎么使用：** 给参数写出类型；公共函数显式写返回类型，局部小函数在推导准确时可以省略返回注解。

~~~~ts
/** 根据完成数和总数计算百分比。 */
function getProgress(completed: number, total: number): number {
  return Math.round((completed / total) * 100)
}

const progress = getProgress(3, 8)
~~~~

### 2. 可选参数与默认参数

**它们是什么：** `value?: T` 允许调用方省略参数，函数体内类型为 `T | undefined`；默认参数也允许省略，
但函数体内会先得到默认值。

**它们有什么用：** 它们适合表达真正可省略的配置，同时避免为常用默认行为增加重复调用代码。

**怎么使用：** 需要区分“没传”和实际值时用可选参数；省略后应立即得到常用值时用默认参数。

~~~~ts
/** 按指定前缀生成课程标题。 */
function formatTitle(title: string, prefix = '课程'): string {
  return `${prefix}：${title}`
}

formatTitle('函数')
formatTitle('函数', 'TypeScript')
~~~~

### 3. 函数类型与上下文类型

**它们是什么：** 函数类型描述可调用值的参数和返回值；上下文类型会把这个合同传给实际的箭头函数。

**它们有什么用：** 回调、事件监听器和策略函数可以共享同一合同，调用处无需重复注解每个参数。

**怎么使用：** 先声明回调类型，再把函数作为参数传入；箭头函数参数会从目标位置自动推导。

~~~~ts
type ProgressListener = (completed: number, total: number) => void

/** 向监听器报告当前进度。 */
function report(listener: ProgressListener): void {
  listener(3, 8)
}

report((completed, total) => console.log(`${completed}/${total}`))
~~~~

### 4. 剩余参数

**它是什么：** 剩余参数使用 `...name: T[]` 接收零个或多个同类型实参，函数体内把它当数组处理。

**它有什么用：** 它适合日志参数、监听器列表和批量 ID 等长度不固定但元素合同一致的调用。

**怎么使用：** 把剩余参数放在参数列表末尾，并为每个元素而不是整个实参列表声明类型。

~~~~ts
/** 合并任意数量的课程标签。 */
function joinTags(...tags: string[]): string {
  return tags.join(' / ')
}

joinTags('TypeScript', '函数', '基础')
~~~~

### 5. 函数重载

**它是什么：** 重载用多个公开签名描述同一个实现支持的不同调用方式，实现签名本身不对调用方公开。

**它有什么用：** 当不同输入与不同返回值存在精确对应关系时，重载比宽泛联合返回值提供更准确的提示。

**怎么使用：** 先列出少量真实调用签名，最后写一个能兼容所有签名的实现；没有输入输出对应关系时优先用联合。

~~~~ts
/** 将课程 ID 或序号转换为显示文本。 */
function formatLesson(value: string): string
function formatLesson(value: number): string
function formatLesson(value: string | number): string {
  return `课程 ${value}`
}

const byId = formatLesson('functions')
const byOrder = formatLesson(4)
~~~~

## 四、动手实践：为不同输入保留精确返回类型

当调用形式具有不同返回类型时，用 overload 描述公开调用方式，并让实现签名覆盖所有分支。

~~~~ts
function parseCourse(value: string): { title: string }
function parseCourse(value: { title: string }): { title: string }
function parseCourse(value: string | { title: string }): { title: string } {
  return typeof value === 'string' ? { title: value } : value
}

const fromText = parseCourse('TypeScript')
const fromObject = parseCourse({ title: 'Vite' })
~~~~

再写一个接收回调的 `mapTitles` 函数，让回调参数通过上下文自动推导。最后向 `parseCourse` 传入数字，观察错误落在公开 overload，而不是宽泛的实现签名上。
## 五、易错使用提示

:::pitfalls
### 使用宽泛的 Function 类型

**触发条件：** 使用宽泛的 Function 类型

**原因：** `Function` 不说明参数与返回值，调用者无法得到具体合同。

**后果：** 错误参数和错误返回值假设可能逃过有用的检查。

**错误示例：**

~~~~ts
function run(callback: Function) {
  callback('unexpected', 42)
}
~~~~

**正确写法：**

~~~~ts
type Listener = (completed: number) => void

/** 用确定参数调用进度监听器。 */
function run(callback: Listener): void {
  callback(1)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把回调参数标成无意义的可选

**触发条件：** 把回调参数标成无意义的可选

**原因：** 回调声明中的可选参数表示调用方可能省略它，而不是允许回调实现忽略该参数。实现本来就可以少写参数。

**后果：** 回调内部被迫处理 undefined，即使接收方每次都会提供该值。

**错误示例：**

~~~~ts
function forEach(items: string[], callback: (item?: string) => void): void {
  for (const item of items) callback(item)
}
~~~~

**正确写法：**

~~~~ts
function forEach(items: string[], callback: (item: string) => void): void {
  for (const item of items) callback(item)
}
forEach(['a'], () => console.log('called'))
~~~~

**验证方式：** 对照正确写法验证结果。

### 把实现签名当成公开 overload

**触发条件：** 把实现签名当成公开 overload

**原因：** 有 overload 时，调用方只能使用列出的 overload 签名；实现签名从外部不可见。

**后果：** 即使实现参数联合包含某个调用，也可能因没有对应 overload 而报错。

**错误示例：**

~~~~ts
function parse(value: string): string
function parse(value: number): number
function parse(value: string | number) { return value }

declare const value: string | number
parse(value)
~~~~

**正确写法：**

~~~~ts
function parse(value: string | number): string | number {
  return value
}

declare const value: string | number
parse(value)
~~~~

**验证方式：** 对照正确写法验证结果。

### 误解 void 回调必须实际返回 undefined

**触发条件：** 误解 void 回调必须实际返回 undefined

**原因：** 上下文类型 `() =&gt; void` 表示调用方忽略返回值；被赋值的函数仍可产生值。它不同于显式声明返回 void 的函数实现。

**后果：** 为满足误解而增加无意义包装，或错误地用回调结果参与逻辑。

**错误示例：**

~~~~ts
const values = [] as number[]
const pushValue: () => void = () => values.push(1)
const length = pushValue() // length 的类型是 void，不能当 number 使用
~~~~

**正确写法：**

~~~~ts
const values = [] as number[]
const pushValue: () => void = () => values.push(1)
pushValue()
const length = values.length
~~~~

**验证方式：** 对照正确写法验证结果。

### 把剩余参数写成单个元素

**触发条件：** 把剩余参数写成单个元素

**原因：** 剩余参数在函数体中始终是数组，类型必须描述收集后的元素集合。

**后果：** 参数声明无法编译，或调用合同不能接收多个值。

**错误示例：**

~~~~ts
function total(...values: number): number {
  return values
}
~~~~

**正确写法：**

~~~~ts
function total(...values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0)
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 函数合同同时约束输入与输出

**工作原理：** 参数注解检查输入，返回类型可由实现推导或显式声明。**实践建议：** 内部小函数依赖推导，导出边界明确返回合同。**使用边界：** 类型合同不保证函数无副作用或业务结果正确。

### 上下文类型让回调保持一致

**工作原理：** 回调参数可从所在调用位置获得上下文类型。**实践建议：** 先在接收方定义一次合同，让每个回调实现复用。**使用边界：** 离开上下文单独声明函数时，参数仍需要自己的类型来源。

### overload 只表达真实调用分支

**工作原理：** 调用方看到 overload 签名而看不到实现签名。**实践建议：** 只有输入与输出存在可区分关系时才使用 overload。**使用边界：** 若联合参数已经准确且调用方常持有联合值，单个联合签名通常更合适。
:::

:::exercise
### 设计课程检索函数合同

**要求：** 编写一个按字符串 ID 或数字序号检索课程的函数。先用联合参数实现，再判断调用结果是否真的需要两个 overload；添加一个把对象传入的负例。

**完成标准：** 合法字符串和数字调用通过，错误对象调用产生诊断，并能说明最终选择联合签名或 overload 的理由。
:::

## 七、本节小结

函数类型把对象和 primitive 连接成调用合同；可选、默认、剩余参数和 overload 都应对应真实调用差异。下一课“联合与字面量”会用有限状态替代宽泛 primitive。Vue Emits 课程已作为真实关联上线，可对照组件事件如何复用函数合同。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface Course {
  id: number
  title: string
}

type CourseFormatter = (course: Course) => string
type CourseVisitor = (course: Course) => void

/** 格式化课程标题，可选地添加前缀。 */
function formatCourse(course: Course, prefix = '课程', suffix?: string): string {
  return `${prefix}：${course.title}${suffix ? ` ${suffix}` : ''}`
}

/** 合并任意数量的课程编号。 */
function collectIds(...ids: number[]): number[] {
  return ids
}

/** 依次调用返回 void 的访问回调。 */
function visitCourses(courses: readonly Course[], visitor: CourseVisitor): void {
  courses.forEach(visitor)
}

function findCourse(id: number): Course | undefined
function findCourse(title: string): Course[]
/** 根据编号或标题执行对应查询。 */
function findCourse(query: number | string): Course | Course[] | undefined {
  const courses: Course[] = [
    { id: 1, title: '类型系统' },
    { id: 2, title: '函数类型' },
  ]
  return typeof query === 'number'
    ? courses.find((course) => course.id === query)
    : courses.filter((course) => course.title.includes(query))
}

const formatter: CourseFormatter = (course) => formatCourse(course, '推荐')
const matched = findCourse('类型')
visitCourses(matched, (course) => console.log(formatCourse(course, '匹配', '已找到')))
console.log(formatter(findCourse(1)!), matched, collectIds(1, 2))
~~~~
:::
