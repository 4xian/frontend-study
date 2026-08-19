---
id: engineering.typescript.learn.advanced.type-design
type: lesson
title: 复杂类型设计
summary: 在精确约束、可读声明、可理解诊断和维护成本之间建立可验证的取舍
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.advanced.infer-and-distribution
  - engineering.typescript.learn.intermediate.mapped-types
  - engineering.typescript.learn.intermediate.template-literal-types
tags:
  - TypeScript
  - 类型设计
  - 判别联合
  - 品牌类型
  - 递归类型
  - 诊断
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
sources:
  - title: "TypeScript Handbook: Narrowing"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Narrowing.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 判别联合
      - never 穷尽检查
  - title: "TypeScript Reference: Type Compatibility"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/reference/Type%20Compatibility.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 结构类型兼容
      - private 与 protected 来源边界
  - title: "TypeScript Handbook: Mapped Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Mapped%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 属性变换
      - 键重映射
  - title: "TypeScript Handbook: Conditional Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Conditional%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 条件分支
      - infer
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - engineering.typescript.learn.advanced.infer-and-distribution
  - engineering.typescript.learn.intermediate.mapped-types
  - engineering.typescript.learn.intermediate.template-literal-types
objectives:
  - 用判别联合表达互斥状态并保持穷尽检查
  - 用品牌交叉类型区分结构相同但语义不同的标识符
  - 为递归和派生类型设置清楚的停止边界
  - 以消费端可读性和诊断质量决定是否保留复杂类型
recap:
  - 复杂类型的目标是减少无效状态，不是展示类型技巧。
  - 品牌是基于结构类型的约束模式，不是 TypeScript 的名义类型特性。
  - 对外合同优先使用具名中间类型、有限递归和可解释诊断。
---

# 复杂类型设计

## 一、为什么需要

类型操作能把大量关系编码进编译器，但“能表达”不等于“值得表达”。过宽的合同会让无效状态进入业务
代码，过度精细的合同则会让声明输出、编辑器提示和错误消息难以理解。高级类型设计的核心是选择一个
足够精确、又能被团队维护的边界。

## 二、核心概念和最小模型

先把运行时真实存在的状态写成判别联合，让每个分支只拥有该状态需要的数据。

~~~~ts
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading'; startedAt: number }
  | { status: 'success'; data: T }
  | { status: 'failure'; message: string; retryable: boolean }
~~~~

这比 `{ loading?: boolean; data?: T; error?: string }` 更精确，因为后者允许 `loading`、`data` 和
`error` 同时存在。

## 三、知识点详解

### 1. 用类型排除无效状态

**它是什么：** 类型设计先把业务不变量写进类型，使不合法状态无法构造，而不是创建一个什么都能接受的对象。

**它有什么用：** 编译器会把状态约束传播到所有调用方，减少运行时才发现“既完成又失败”等矛盾组合。

**怎么使用：** 先列出必须拒绝的组合，再选择判别联合或最小对象结构表达它们。

~~~~ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'failure'; message: string }
~~~~

### 2. 判别联合

**它是什么：** 判别联合用一个稳定字面量字段区分互斥对象分支，每个分支携带自己的数据。

**它有什么用：** 读取 `data` 或 `message` 前必须先确认状态，类型模型不会允许缺少对应数据的组合。

**怎么使用：** 在分支字段上使用 literal union，并在业务函数中按字段收窄。

~~~~ts
/** 读取请求状态的显示消息。 */
function describe(state: RequestState): string {
  switch (state.status) {
    case 'success':
      return state.data
    case 'failure':
      return state.message
    default:
      return state.status
  }
}
~~~~

### 3. 品牌类型

**它是什么：** 品牌类型在基础类型上添加只用于编译期区分的标记，使两个运行时都是 `string` 的值不能互换。

**它有什么用：** ID、URL、用户输入等语义不同的字符串可以在 API 边界保持区分。

**怎么使用：** 先经过运行时校验，再通过集中函数创建品牌值；不要把品牌断言散落在调用方。

~~~~ts
type CourseId = string & { readonly __brand: 'CourseId' }

/** 在校验通过后创建课程 ID。 */
function createCourseId(value: string): CourseId {
  if (!value) throw new Error('课程 ID 不能为空')
  return value as CourseId
}
~~~~

### 4. 派生类型

**它是什么：** 派生类型使用 `Pick`、`Omit`、mapped 或 conditional type 从一个源合同计算另一个合同。

**它有什么用：** 源模型变化时，编辑态、展示态和更新参数会同步变化，避免维护多份属性清单。

**怎么使用：** 先确认派生关系稳定且能降低重复，再给派生结果起业务名称。

~~~~ts
type Course = { id: string; title: string; minutes: number }
type CoursePatch = Partial<Omit<Course, 'id'>>
~~~~

### 5. 递归类型边界

**它是什么：** 递归类型在自身定义中再次引用自己，用于树、嵌套菜单等结构。

**它有什么用：** 任意深度的数据可以共享一个合同，但递归必须与真实数据边界相匹配。

**怎么使用：** 先定义明确的终止分支，避免没有退出条件的递归条件类型；必要时在数据层限制深度。

~~~~ts
type MenuItem = {
  label: string
  children?: MenuItem[]
}
~~~~

## 四、品牌、派生与递归边界

TypeScript 以结构兼容为主。若两个字符串在业务上不能混用，可以添加不可公开构造的品牌成员。

~~~~ts
declare const courseIdBrand: unique symbol
declare const userIdBrand: unique symbol

type CourseId = string & { readonly [courseIdBrand]: 'CourseId' }
type UserId = string & { readonly [userIdBrand]: 'UserId' }

declare function findCourse(id: CourseId): void
~~~~

品牌不会自动验证字符串格式。运行时解析函数必须先检查输入，再在一个受控入口返回 `CourseId`。

重复属性变换适合 mapped type，但保留具名结果能让合同更容易查阅。

~~~~ts
type EditableFields<T> = {
  -readonly [Key in keyof T]?: T[Key]
}

interface Course {
  readonly id: CourseId
  title: string
  published: boolean
}

type CoursePatch = EditableFields<Pick<Course, 'title' | 'published'>>
~~~~

递归类型只应跟随真实数据，并明确终点。若业务只允许三层目录，就直接写出三层合同：

~~~~ts
interface MenuItem {
  title: string
}

interface MenuGroup extends MenuItem {
  children?: MenuItem[]
}

interface MenuRoot extends MenuItem {
  children?: MenuGroup[]
}
~~~~

只有运行数据本身允许任意深度时，递归类型才准确；固定层级不应使用无限递归制造虚假的精度。

## 五、动手实践：把非法业务状态排除在类型之外

先为不同 ID 建立品牌，再用判别联合表达加载流程。

~~~~ts
type Brand<Value, Name extends string> = Value & { readonly __brand: Name }
type CourseId = Brand<string, 'CourseId'>
type UserId = Brand<string, 'UserId'>

type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

function renderCourse(state: LoadState<{ id: CourseId; title: string }>): string {
  switch (state.status) {
    case 'idle': return '尚未加载'
    case 'loading': return '加载中'
    case 'success': return state.data.title
    case 'error': return state.message
  }
}
~~~~

尝试把 UserId 赋给 CourseId，再给状态联合新增 cancelled 分支。编译器应迫使调用方处理新增状态，从而把维护成本放在变更发生的位置。
## 六、易错使用提示

:::pitfalls
### 用可选属性模拟互斥状态

**触发条件：** 把 loading、data 和 error 都建成可选属性。

**原因：** 可选属性只能表达“可能缺失”，不能表达成员之间的互斥关系。

**后果：** 同时有 data 和 error 的无效对象仍可通过类型检查。

**错误示例：**

~~~~ts
interface State<T> {
  loading?: boolean
  data?: T
  error?: string
}
~~~~

**正确写法：**

~~~~ts
type State<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'failure'; error: string }
~~~~

**验证方式：** 尝试在 success 分支同时写 error，应被拒绝。

### 把品牌当成运行时校验

**触发条件：** 直接断言任意字符串为 `CourseId`。

**原因：** 品牌成员只影响结构兼容，不检查字符串格式或数据库存在性。

**后果：** 不可信输入绕过真实校验。

**错误示例：**

~~~~ts
const id = input as CourseId
~~~~

**正确写法：**

~~~~ts
function parseCourseId(input: string): CourseId | null {
  return /^course_[a-z0-9]+$/.test(input) ? (input as CourseId) : null
}
~~~~

**验证方式：** 运行时用合法与非法输入验证解析函数，编译期验证品牌不可混用。

### 为一次性属性变换建立通用框架

**触发条件：** 单个表单需要两个可选字段，却叠加多层 mapped/conditional helper。

**原因：** 复用尚未发生，抽象只隐藏了实际字段。

**后果：** 错误消息展开为无业务含义的工具类型链。

**错误示例：**

~~~~ts
type DeepOptionalMutableSelected<T, K extends keyof T> = {
  -readonly [P in K]?: T[P]
}
~~~~

**正确写法：**

~~~~ts
interface CoursePatch {
  title?: string
  published?: boolean
}
~~~~

**验证方式：** 比较消费端 hover 与错误位置，保留更清楚的合同。

### 无限递归超过真实数据边界

**触发条件：** 为固定层级配置使用无限递归类型。

**原因：** 类型允许的深度大于业务和运行时验证实际支持的深度。

**后果：** 合同虚假、实例化增多，错误难定位。

**错误示例：**

~~~~ts
type Menu = { title: string; children?: Menu[] }
// 实际产品只支持两层
~~~~

**正确写法：**

~~~~ts
type MenuItem = { title: string }
type MenuGroup = MenuItem & { children?: MenuItem[] }
~~~~

**验证方式：** 用第三层 children 负例证明合同与产品边界一致。

### 只测工具类型本身不测消费者

**触发条件：** 只写 `type Result = Helper<Input>`，没有真实函数或对象赋值。

**原因：** 类型别名存在不代表调用提示、诊断或声明输出可用。

**后果：** 发布后才发现消费者面对不可读的展开类型。

**错误示例：**

~~~~ts
type Result = EditableFields<Course>
~~~~

**正确写法：**

~~~~ts
declare function updateCourse(id: CourseId, patch: CoursePatch): void
updateCourse(courseId, { published: true })
~~~~

**验证方式：** consumer 正反例同时检查调用与诊断中的业务类型名。
:::

## 七、工作原理与适用边界

:::steps
### 结构兼容是默认模型

**工作原理：** TypeScript 主要比较成员结构。**实践建议：** 品牌只在确实需要区分同形值时使用。**使用边界：** 品牌
不替代运行时校验，也不把语言变成全面名义类型系统。

### 判别联合连接值与分支

**工作原理：** 公共 literal 成员可驱动控制流收窄，`never` 可检查穷尽。**实践建议：** 用一个稳定判别字段
表达有限状态。**使用边界：** 状态仍必须真实存在于运行数据。

### 派生复杂度必须有回报

**工作原理：** mapped、conditional 与 template literal types 可系统变换类型。**实践建议：** 只有当派生能
消除重复合同漂移时才使用。**使用边界：** 可读性和诊断质量是公共 interface 的一部分。
:::

:::exercise
### 设计发布流程状态

**要求：** 把 draft、reviewing、published、failed 四种状态建成判别联合；published 必须有时间，failed
必须有可重试标记。再为 `CourseId` 与 `UserId` 建立不可混用的品牌。

**完成标准：** 正例能穷尽渲染四种状态；负例缺少 publishedAt、混用两个 ID 均产生稳定诊断。
:::

## 八、本节小结

复杂类型设计先保护业务不变量，再选择最简单的语言工具，并用真实消费者评估诊断与声明可读性。下一课
会把公共合同写成或生成 `.d.ts`，区分模块库、全局库与 augmentation 的边界。

:::code-details{title="查看本节完整示例"}
~~~~ts
type CourseId = string & { readonly __brand: 'CourseId' }

interface Course {
  id: CourseId
  title: string
  lessons: readonly LessonNode[]
}

interface LessonNode {
  id: string
  children?: readonly LessonNode[]
}

type CourseSummary = Pick<Course, 'id' | 'title'>
type PublishState =
  | { kind: 'draft'; changedAt: Date }
  | { kind: 'review'; reviewerId: string }
  | { kind: 'published'; url: string; publishedAt: Date }

/** 在运行时校验字符串后创建品牌编号。 */
function createCourseId(value: string): CourseId {
  if (!value.trim()) throw new Error('课程编号不能为空')
  return value as CourseId
}

/** 只读取递归课程树的第一层标识，限制实际遍历边界。 */
function firstLevelIds(course: Course): string[] {
  return course.lessons.map((lesson) => lesson.id)
}

/** 证明判别联合的分支已处理完整。 */
function assertNever(value: never): never {
  throw new Error(`未处理的发布状态：${String(value)}`)
}

/** 穷尽渲染每一种发布状态。 */
function publishStateLabel(state: PublishState): string {
  switch (state.kind) {
    case 'draft':
      return `草稿更新于 ${state.changedAt.toISOString()}`
    case 'review':
      return `审核人 ${state.reviewerId}`
    case 'published':
      return `已发布至 ${state.url}`
    default:
      return assertNever(state)
  }
}

const course: Course = {
  id: createCourseId('type-design'),
  title: '类型设计',
  lessons: [{ id: 'state' }, { id: 'derive', children: [{ id: 'boundary' }] }],
}
const summary: CourseSummary = course
const state: PublishState = { kind: 'published', url: '/courses/type-design', publishedAt: new Date() }
console.log(summary, publishStateLabel(state), firstLevelIds(course))
~~~~
:::

## 九、参考资料

- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) - 判别联合与穷尽检查。
- [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) - 结构类型兼容模型。
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) - 属性变换与键重映射。
