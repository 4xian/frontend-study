---
id: engineering.typescript.reference.language-foundations
type: reference
title: TypeScript Handbook v2 语言基础与类型操作
summary: 集中查阅 Handbook v2 的基础类型、函数、类、模块和类型操作符，并为每个官方主题保留独立锚点
domain: frontend
technology: engineering
module: typescript
group: handbook-v2
signature: |-
  type Example<T> = T extends object ? { value: T } : never
  function example<T>(value: T): T
related:
  - engineering.typescript.learn.basics.type-system-and-inference
  - engineering.typescript.learn.intermediate.conditional-types
  - engineering.typescript.learn.intermediate.mapped-types
tags:
  - TypeScript
  - Handbook
  - 类型系统
  - 类型操作符
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: TypeScript Handbook v2
    url: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: TypeScript fixed Website snapshot
    url: https://github.com/microsoft/TypeScript-Website/tree/c8170c35bda4811c9516cbb69c39241ae4beb6d9
    sourceType: source-code
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - the-basics
  - everyday-types
  - narrowing
  - more-on-functions
  - object-types
  - type-declarations
  - understanding-errors
  - classes
  - modules
  - generics
  - keyof-type-operator
  - typeof-type-operator
  - indexed-access-types
  - conditional-types
  - mapped-types
  - template-literal-types
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Handbook v2 语言基础与类型操作

## 一、概述

本页承接 Handbook v2 的 16 个稳定主题。索引中的每个 `officialKey` 都有独立锚点，因此可以从总览、搜索
和深链直接定位；同一 Markdown 载体只减少重复模板，不合并官方键的语义。

## 二、签名与语法

Handbook v2 的共同 interface 是“JavaScript 形状 + TypeScript 类型关系”：值层写对象、函数和模块，类型层
使用泛型、`keyof`、索引访问、条件、映射和模板字面量类型。以下示例组合这些能力，但每个官方主题仍以自己的
小节说明边界。

```ts
type EventName = 'open' | 'close'

type EventPayload = {
  [K in EventName]: { type: K; at: number }
}[EventName]

// 读取事件负载中的判别字段。
function readPayload<T extends EventPayload>(payload: T): T['type'] {
  return payload.type
}
```

## 三、The Basics

基础类型描述值的静态形状；类型注解不会生成运行时代码，类型断言也不会替输入做校验。优先让推导保留字面量
和联合关系，只有公共边界或推导不足时再写注解。

```ts
const label: string = 'TypeScript'
const enabled = true
```

## 四、Everyday Types

`string`、`number`、`boolean`、数组、tuple、`unknown`、`never`、`void` 和 `null`/`undefined` 各有不同职责。
`any` 会关闭检查，不能把它当作“未知值”的同义词；未知输入应先收窄再使用。

```ts
const names: string[] = ['Ada']
const point: [number, number] = [12, 24]
const input: unknown = names
```

## 五、Narrowing

控制流分析会根据 `typeof`、`in`、`instanceof`、判别属性和用户自定义 predicate 缩小联合类型。收窄只在可证明
的分支内成立，离开分支或改变可变值后不能假设旧结论仍然有效。

```ts
// 根据运行时检查收窄输入。
function format(value: string | number) {
  return typeof value === 'number' ? value.toFixed(2) : value.trim()
}
```

## 六、More on Functions

函数类型包括参数、返回值、可选/剩余参数、回调和 overload。实现签名必须兼容所有 overload；回调参数的严格函数
类型检查会影响可赋值关系，不能用“参数少所以一定安全”的经验规则替代检查。

```ts
type Formatter = (value: string, prefix?: string) => string
const format: Formatter = (value, prefix = '') => `${prefix}${value}`
```

## 七、Object Types

对象类型描述属性、可选属性、只读属性、索引签名和调用/构造签名。TypeScript 采用结构类型系统，多余属性检查主要
发生在新鲜对象字面量位置，不等于运行时 schema 验证。

```ts
interface User {
  readonly id: number
  name?: string
}

const user: User = { id: 1 }
```

## 八、Type Declarations

TypeScript 的类型信息来自内置声明、由 `target`/`lib` 选择的标准库声明、包内自带的声明、
DefinitelyTyped 的 `@types` 包，以及项目自己的声明。这里说明编译器从哪里取得声明；具体 `.d.ts` 编写与
模板由 Declaration Files Reference 承接。声明只影响类型检查，不会创建缺失的运行时值。

```ts
// course-clock.d.ts：为已有 JavaScript 模块声明公共合同。
declare module 'course-clock' {
  export function now(): Date
}
```

```ts
// app.ts：消费声明中的函数，运行时实现仍由 course-clock 提供。
import { now } from 'course-clock'

const startedAt: Date = now()
```

## 九、Understanding Errors

错误报告通常从最外层赋值关系逐层比较：先确认目标类型，再追踪属性、联合成员和调用参数。优先缩小最小失败
表达式，不要通过 `as any` 抹掉诊断；那会隐藏真正的合同不一致。

```ts
interface Course {
  id: string
  title: string
}

const raw: unknown = { id: 'ts', title: 'TypeScript' }

function isCourse(value: unknown): value is Course {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value
  )
}

if (isCourse(raw)) {
  raw.title.toUpperCase()
}
```

## 十、Classes

类同时有运行时构造器和实例类型。`implements` 只检查实例是否满足合同，不会改变类内部推导；`private` 与
`protected` 会参与兼容性身份，继承、可见性和参数属性要分别理解。

```ts
class User {
  name = 'Ada'
}

const user: { name: string } = new User()
```

## 十一、Modules

包含顶层 `import`/`export` 的文件是模块。使用 `import type` 可明确擦除的类型依赖；模块 Handbook 页只讲语言
边界，模块解析、`exports` 和配置选择由 Modules Reference 承接。

```ts
// course.ts
export interface Course {
  id: string
}

export const course: Course = { id: 'ts' }

// app.ts
import { course } from './course.js'
import type { Course } from './course.js'

const selected: Course = course
console.log(selected.id)
```

## 十二、Generics

泛型保留输入与输出之间的关系，而不是把值扩大成 `any`。约束（如 `T extends object`）只允许安全操作，不代表
调用者一定传入具体实现；推导失败时才在调用点补类型参数。

```ts
// 返回只读数组的第一个成员。
function first<T>(values: readonly T[]): T | undefined {
  return values[0]
}

const firstName = first(['Ada', 'Grace'])
```

## 十三、Keyof Type Operator

`keyof T` 取得可用属性键的联合。字符串、数字和 symbol 索引签名会改变结果；它描述的是类型层可访问键，不是
运行时 `Object.keys()` 的数组结果。

```ts
interface User {
  id: number
  name: string
}

const key: keyof User = 'name'
```

## 十四、Typeof Type Operator

类型位置的 `typeof` 从已有值取得类型，适合让类型合同跟随实现值。它不是运行时 `typeof` 表达式，也不能从一个
尚未声明的值推导类型。

```ts
const defaults = { theme: 'light', compact: false }
type Settings = typeof defaults
```

## 十五、Indexed Access Types

`T[K]` 取得属性或索引访问结果；在泛型函数中通常写成 `K extends keyof T`，从而保留键与返回值的对应关系。非法
键会在编译期被拒绝。

```ts
type User = { id: number; name: string }
type UserName = User['name']
```

## 十六、Conditional Types

`T extends U ? X : Y` 在类型层表达分支。裸类型参数会产生 distributive 行为，包裹在 tuple 中可阻止分布；条件
类型可以通过 `infer` 提取内部类型，但不应递归到无法收敛的复杂结构。

```ts
type ElementType<T> = T extends readonly (infer Item)[] ? Item : T
type Name = ElementType<readonly string[]>
```

## 十七、Mapped Types

`[K in keyof T]` 遍历属性并可改变可选、只读修饰符或值类型。基于 `keyof T` 的同态映射会保留原属性修饰符；
`Record` 等从独立键集合创建属性的类型则不是同态映射。

```ts
type Flags<T> = { [Key in keyof T]: boolean }
type FeatureFlags = Flags<{ search: unknown; export: unknown }>
```

## 十八、Template Literal Types

模板字面量类型把字符串字面量联合组合成有限协议，并可与 mapped type 的 key remapping 配合。它适合事件名、
路径和命名约定；开放字符串会使结果重新变宽，不能假装已经枚举所有值。

```ts
type Field = 'name' | 'age'
type ChangedEvent = `${Field}Changed`
```

## 十九、行为边界

- 这些主题描述 TypeScript 7.0.2 的语言模型，类型会在 JavaScript emit 中擦除。
- 项目使用其他 TypeScript 版本时，应以该版本实际诊断为准，不把 7.0.2 的默认行为直接外推。
- Handbook 的 `Modules` 与 Modules Reference 是两个官方范围，链接和统计保持分离。

## 二十、最小正确示例

```ts
type Key = 'name' | 'age'
type Value<T> = { [K in keyof T]: T[K] }

// 按键读取对象属性并保留返回类型。
function get<T, K extends keyof T>(value: T, key: K): T[K] {
  return value[key]
}

const user = { name: 'Ada', age: 36 }
const name: string = get<Value<typeof user>, 'name'>(user, 'name')
```

## 二十一、综合示例：从未知输入得到可用模型

下面把对象类型、泛型、keyof、条件类型、mapped type 和收窄放进一条实际数据流。

~~~~ts
interface Course {
  id: string
  title: string
  status: 'draft' | 'published'
}

type CoursePatch = Partial<Pick<Course, 'title' | 'status'>>
type FieldValue<Key extends keyof Course> = Course[Key]
type AsyncValue<T> = T extends PromiseLike<infer Value> ? Value : T

function isCourse(value: unknown): value is Course {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'status' in value
  )
}

function updateCourse(course: Course, patch: CoursePatch): Course {
  return { ...course, ...patch }
}
~~~~

外部数据先通过 isCourse，进入业务层后再由 Course、CoursePatch 和具体键关系约束操作；类型不会替代最前面的运行时检查。

## 二十二、易错使用提示

:::pitfalls
### 用断言掩盖错误

**触发条件：** 赋值或调用关系无法满足目标类型时直接写 `as any`。

**原因：** 断言只改变静态视图，不修复值、控制流或模块边界。

**后果：** 错误延迟到运行时，且后续推导失去可读的诊断。

**错误示例：**

```ts
const value = externalInput as any
value.missing()
```

**正确写法：**

```ts
// 判断未知输入是否为普通记录对象。
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
```

**验证方式：** 用 `tsc` 检查正例和负例，并在输入边界执行真实运行时校验。
:::

## 二十三、工作原理与适用边界

1. **工作原理：** 上表 URL、官方 Handbook 导航和固定 Website 快照定义 16 个稳定主题。
2. **实践建议：** 已有课程负责循序学习；本页只提供查阅签名、边界和主题之间的组合关系。
3. 适用场景：库类型合同、应用状态建模和编译期错误定位；运行时校验、模块解析和配置差异需使用对应工具。

## 二十四、版本与官方来源

适用于 TypeScript `7.0.2`，源码固定到 `2bd066d87f5bafd315be9f40889d0a60b9e58e0b`；官网内容固定到
`c8170c35bda4811c9516cbb69c39241ae4beb6d9`。

- [Handbook v2](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- [TypeScript 7.0 发布说明](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0)
- [固定 Website commit](https://github.com/microsoft/TypeScript-Website/commit/c8170c35bda4811c9516cbb69c39241ae4beb6d9)
