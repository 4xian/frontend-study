---
id: engineering.typescript.reference.utility-types
type: reference
title: TypeScript Utility Types
summary: 按官方定义查阅 22 个稳定 Utility Type 的签名、推导边界和最小用法
domain: frontend
technology: engineering
module: typescript
group: utility-types
signature: |-
  type Partial<Type> = { [P in keyof Type]?: Type[P] }
  type ReturnType<Type extends (...args: any) => any> = Type extends (...args: any) => infer R ? R : any
  type Awaited<Type> = /* 递归展开 Promise-like */
related:
  - engineering.typescript.learn.intermediate.generics-and-constraints
  - engineering.typescript.learn.intermediate.conditional-types
  - engineering.typescript.learn.intermediate.mapped-types
tags:
  - TypeScript
  - Utility Types
  - 泛型
  - 映射类型
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: TypeScript Utility Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: TypeScript fixed Website snapshot
    url: https://github.com/microsoft/TypeScript-Website/tree/c8170c35bda4811c9516cbb69c39241ae4beb6d9
    sourceType: source-code
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - partial
  - required
  - readonly
  - record
  - pick
  - omit
  - exclude
  - extract
  - nonnullable
  - parameters
  - constructorparameters
  - returntype
  - instancetype
  - awaited
  - noinfer
  - thisparametertype
  - omitthisparameter
  - thistype
  - uppercase
  - lowercase
  - capitalize
  - uncapitalize
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Utility Types

## 一、概述

Utility Types 是全局可用的类型变换。它们只参与编译期推导，不创建运行时函数或校验器；本页保留官方页面的 22
个稳定名称，每个名称都有独立 anchor，合并载体不改变搜索和统计。

## 二、签名与语法

```ts
type Partial<Type> = { [P in keyof Type]?: Type[P] }
type Record<Keys extends keyof any, Type> = { [P in Keys]: Type }
type Exclude<UnionType, ExcludedMembers> = UnionType extends ExcludedMembers ? never : UnionType
```

## 三、Partial

把 `Type` 的所有属性改为可选，适合 patch/update 输入；它不深度递归，也不校验未知字段。

```ts
interface Todo {
  title: string
  done: boolean
}

const patch: Partial<Todo> = { done: true }
```

## 四、Required

把所有属性改为必需，包含原本可选属性。`exactOptionalPropertyTypes` 会影响 `undefined` 是否可作为显式值。

```ts
interface Draft {
  title?: string
}

const ready: Required<Draft> = { title: 'TypeScript' }
```

## 五、Readonly

把所有属性标记为只读；这是静态赋值限制，不等价于 `Object.freeze()` 的运行时冻结，也不递归冻结嵌套对象。

```ts
const config: Readonly<{ mode: 'strict' }> = { mode: 'strict' }
```

## 六、Record

从键联合创建同一值类型的对象，例如 `Record<'draft' | 'published', string>`。它不是同态映射，不会复制输入类型的
属性修饰符。

```ts
type Status = 'draft' | 'published'
const labels: Record<Status, string> = { draft: '草稿', published: '已发布' }
```

## 七、Pick

从 `Type` 选取 `K extends keyof Type` 指定的属性，保留这些属性的类型和修饰符。键不在 `keyof Type` 中会被拒绝。

```ts
interface User {
  id: number
  name: string
  token: string
}

type PublicUser = Pick<User, 'id' | 'name'>
```

## 八、Omit

从 `Type` 排除指定键，得到剩余属性。它表达静态视图，不会从运行时对象删除字段。

```ts
interface Course { id: string; title: string; ownerId: string }
type CourseDraft = Omit<Course, 'id'>

const draft: CourseDraft = { title: '类型体操', ownerId: 'team-ts' }
```

## 九、Exclude

从联合中排除可赋值给 `ExcludedMembers` 的成员；裸类型参数会产生分布行为，常用于过滤字面量联合。

```ts
type Status = 'draft' | 'review' | 'published'
type EditableStatus = Exclude<Status, 'published'>

const status: EditableStatus = 'review'
```

## 十、Extract

保留联合中可赋值给 `Union` 的成员，是 `Exclude` 的反向筛选。它不会从对象属性中提取值，属性提取应使用索引访问。

```ts
type Event = 'course:created' | 'course:deleted' | 'user:created'
type CourseEvent = Extract<Event, `course:${string}`>

const event: CourseEvent = 'course:created'
```

## 十一、NonNullable

从联合中移除 `null` 和 `undefined`。它只改变静态类型，不能证明外部输入在运行时确实非空。

```ts
type MaybeTitle = string | null | undefined
type Title = NonNullable<MaybeTitle>

function printTitle(title: Title) {
  return title.toUpperCase()
}
```

## 十二、Parameters

从函数类型取得参数 tuple。对 overload 会从最后一个签名推导；非函数类型不满足约束，不能用它读取运行时 `arguments`。

```ts
function createCourse(title: string, level: number) {
  return { title, level }
}

type CreateCourseArgs = Parameters<typeof createCourse>
const args: CreateCourseArgs = ['类型系统', 2]
```

## 十三、ConstructorParameters

从构造函数类型取得构造参数 tuple。抽象构造签名可以作为约束；普通对象或函数值不是构造器时会被拒绝。

```ts
class Course {
  constructor(readonly id: string, readonly title: string) {}
}

type CourseArgs = ConstructorParameters<typeof Course>
const args: CourseArgs = ['ts', 'TypeScript']
const course = new Course(...args)
```

## 十四、ReturnType

从函数类型推导返回类型。条件类型使用 `infer`，overload 仍依据最后一个签名，不能在类型层执行完整 overload
解析。

```ts
function loadCourse() {
  return { id: 'ts', title: 'TypeScript' }
}

type LoadedCourse = ReturnType<typeof loadCourse>
const course: LoadedCourse = loadCourse()
```

## 十五、InstanceType

从构造函数类型取得实例类型。它描述 `new C()` 的结果，不是构造器自身的静态成员类型。

```ts
class Course {
  constructor(readonly title: string) {}
  read() { return this.title }
}

type CourseInstance = InstanceType<typeof Course>
const course: CourseInstance = new Course('TypeScript')
```

## 十六、Awaited

递归展开 Promise-like 的 `then` 结果，并在联合上分布，模拟 `await` 和 `.then()` 的类型行为。它不执行 Promise，
也不处理任意运行时 thenable 错误。

```ts
type Result = Awaited<Promise<Promise<string>>>
const result: Result = 'ready'
```

## 十七、NoInfer

阻止某个位置参与泛型参数推导，同时保留该位置的类型约束。它适合让默认值、回退值或关联参数服从已推导的主参数；
它不是 `any`，也不能修复错误的 API 设计。

```ts
// 从主选项推导颜色，并让回退值服从该联合。
function choose<Color extends string>(colors: readonly Color[], fallback: NoInfer<Color>): Color {
  return colors[0] ?? fallback
}

const color = choose(['red', 'yellow'] as const, 'red')
```

## 十八、ThisParameterType

从函数类型的显式 `this` 参数取得 `this` 类型；没有显式 `this` 参数时结果为 `unknown`。它只分析类型，不绑定运行时
调用上下文。

```ts
interface Counter { value: number }
function increment(this: Counter, amount: number) {
  this.value += amount
}

type CounterContext = ThisParameterType<typeof increment>
const counter: CounterContext = { value: 0 }
increment.call(counter, 1)
```

## 十九、OmitThisParameter

移除函数类型的显式 `this` 参数，得到可作为普通函数传递的类型。overload 仍按官方最后签名规则处理。

```ts
interface Counter { value: number }
type Method = (this: Counter, amount: number) => number
type Callback = OmitThisParameter<Method>

const callback: Callback = (amount) => amount + 1
```

## 二十、ThisType

`ThisType<T>` 是对象字面量上下文类型中的 `this` 标记，必须启用 `noImplicitThis` 才能获得对应推导。它不执行
类型变换，也没有运行时值；只有把它放进对象的上下文类型时才会影响方法内的 `this`。

```ts
type ObjectDescriptor<Data, Methods> = {
  data: Data
  methods: Methods & ThisType<Data & Methods>
}

const options: ObjectDescriptor<{ count: number }, { increment(): void }> = {
  data: { count: 0 },
  methods: {
    // ThisType 让这里的 this 同时拥有 data 与 methods。
    increment() { this.count += 1 },
  },
}
```

## 二十一、Uppercase

把字符串字面量类型映射为大写，属于 intrinsic string manipulation type。它处理类型层字符串，不会改变运行时字符串。

```ts
type HttpMethod = Uppercase<'get' | 'post'>
const method: HttpMethod = 'GET'
```

## 二十二、Lowercase

把字符串字面量类型映射为小写。宽泛 `string` 仍是宽泛 `string`，不能产生有限字面量集合。

```ts
type Environment = Lowercase<'PROD' | 'DEV'>
const environment: Environment = 'prod'
```

## 二十三、Capitalize

把字符串字面量的首字符映射为大写；空字符串和非字母首字符遵循字符串 intrinsic 的既定规则。

```ts
type EventName = Capitalize<'open' | 'close'>
const eventName: EventName = 'Open'
```

## 二十四、Uncapitalize

把字符串字面量的首字符映射为小写；它与 `Capitalize` 互为方向，但对已有宽泛字符串不会生成运行时转换。

```ts
type FieldName = Uncapitalize<'UserId'>
const fieldName: FieldName = 'userId'
```

## 二十五、行为边界

- 22 个 utility type 均为 TypeScript 7.0.2 stable；`Intrinsic String Manipulation Types` 只是分组标题。
- 它们是类型别名，编译后被擦除；需要运行时校验、复制、冻结或 Promise 执行时必须编写真实 JavaScript。
- 本页所有工具类型、示例与边界均以 TypeScript 7.0.2 为准。

## 二十六、最小正确示例

```ts
interface Todo { title: string; done: boolean }
// 合并可选的待办更新。
function update(todo: Todo, patch: Partial<Todo>): Todo {
  return { ...todo, ...patch }
}

type Names = Extract<'id' | 'title', keyof Todo>
const title: Names = 'title'
```

## 二十七、综合示例：用 Utility Types 设计更新接口

~~~~ts
interface Course {
  id: string
  title: string
  status: 'draft' | 'published'
  ownerId: string | null
}

type CourseCreate = Omit<Course, 'id'>
type CoursePatch = Partial<Pick<Course, 'title' | 'status'>>
type CourseView = Readonly<Course>
type CourseField = keyof Course
type VisibleStatus = Exclude<Course['status'], 'draft'>
type ExistingOwner = NonNullable<Course['ownerId']>
type CourseTable = Record<Course['status'], readonly Course[]>

function updateCourse(course: Course, patch: CoursePatch): Course {
  return { ...course, ...patch }
}

type UpdateParameters = Parameters<typeof updateCourse>
type UpdateResult = ReturnType<typeof updateCourse>
type LoadedCourse = Awaited<Promise<Course>>
~~~~

Partial、Pick 和 Omit 描述输入视图，Readonly 描述只读消费面，Exclude/NonNullable 过滤联合，Parameters/ReturnType/Awaited 从现有合同派生关系。它们都不会复制、删除、冻结或校验运行时数据。

## 二十八、易错使用提示

:::pitfalls
### 把类型变换当成深层运行时操作

**触发条件：** 用 `Readonly<T>` 代替冻结，或用 `Partial<T>` 认为输入已完成校验。

**原因：** Utility Types 只生成静态视图，不遍历、复制或验证对象。

**后果：** 运行时仍可修改嵌套值，外部缺失字段仍可能导致错误。

**错误示例：**

```ts
const settings = external as Readonly<{ theme: string }>
settings.theme = 'dark'
```

**正确写法：**

```ts
const settings: Readonly<{ theme: string }> = Object.freeze({ theme: 'light' })
```

**验证方式：** 用固定版本 `tsc` 检查类型负例，并单独测试需要的运行时复制、冻结或解析行为。
:::

## 二十九、工作原理与适用边界

1. **工作原理：** 签名和行为来自 Utility Types 官方 Reference 与固定 Website 快照。
2. **实践建议：** 泛型、条件类型和映射类型课程解释构造原理，本页提供查阅入口和版本边界。
3. 适用场景：patch 输入、联合过滤、函数签名提取、Promise 结果建模和字符串协议；不创建无意义浏览器 Demo。

## 三十、版本与官方来源

适用于 TypeScript `7.0.2`；源码固定到 `2bd066d87f5bafd315be9f40889d0a60b9e58e0b`，官网内容固定到
`c8170c35bda4811c9516cbb69c39241ae4beb6d9`。

- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript 7.0 发布说明](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0)
