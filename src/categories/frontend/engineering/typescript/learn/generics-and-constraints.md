---
id: engineering.typescript.learn.intermediate.generics-and-constraints
type: lesson
title: 泛型与约束
summary: 用类型参数保留输入输出关系，并用约束声明最低能力
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 泛型
  - 类型参数
  - 约束
  - 类型推导
  - 默认类型参数
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Generics"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Generics.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 类型参数
      - 泛型约束
      - 类型实参推导
      - 泛型参数默认值
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - engineering.typescript.learn.basics.functions
  - engineering.typescript.learn.basics.aliases-and-interfaces
objectives:
  - 用类型参数保留输入类型与输出类型之间的关系
  - 让调用处优先从值实参推导类型实参
  - 用 extends 约束声明实现真正需要的最低能力
  - 为可选类型实参提供满足约束的默认类型
recap:
  - 类型参数捕获调用方的具体类型，并在输入与输出之间维持关系。
  - extends 约束证明最低能力，不会把具体 Type 扩大为约束类型。
  - 类型实参优先从值推导，默认类型仍必须满足已有约束。
---

# 泛型与约束

## 一、为什么需要

只写 unknown 会丢失输入与输出的对应关系，改成 any 又会放弃检查。泛型把调用方的具体类型捕获为类型参数，使实现只承诺必要能力，返回位置仍能保留准确类型。

## 二、核心概念和最小模型

~~~~ts
/** 原样返回输入，并保留调用方的具体类型。 */
function identity<Type>(value: Type): Type {
  return value
}

const courseId = identity('generics')
const lessonCount = identity(12)
~~~~

Type 是同一次调用中的占位符。传入字符串时，参数和返回值共同使用字符串类型；传入数字时又共同使用数字类型。调用方通常不必写尖括号，编译器会从值实参推导类型实参。

## 三、知识点详解

### 1. 泛型类型参数

**它是什么：** 泛型使用 `<Type>` 声明一个由调用方决定的类型参数，并在输入、输出或成员之间复用它。

**它有什么用：** 它能保留“传入什么类型就返回什么类型”之类的关系，而不是用 `any` 丢失信息。

**怎么使用：** 让类型参数至少出现在两个有意义的位置，调用时通常由实参自动推导。

~~~~ts
/** 返回输入本身，并保留输入的准确类型。 */
function identity<Type>(value: Type): Type {
  return value
}

const title = identity('泛型')
const order = identity(9)
~~~~

### 2. 泛型推导

**它是什么：** 泛型推导是编译器根据值实参计算类型实参的过程，例如从字符串推导出 `Type = string`。

**它有什么用：** 调用代码不必重复写已经存在于值中的类型，且返回值仍保持具体类型。

**怎么使用：** 优先直接传入有准确类型的值；只有值不足以确定类型或需要指定更宽合同时才显式写类型实参。

~~~~ts
const inferred = identity({ id: 'generics', completed: false })
const explicit = identity<string | number>('generics')
~~~~

### 3. 泛型约束

**它是什么：** `Type extends Constraint` 要求类型实参至少拥有约束中的能力。

**它有什么用：** 实现可以安全读取 `length`、`id` 等成员，同时返回值继续保留调用方传入的具体类型。

**怎么使用：** 只约束实现实际会用到的最小成员，不要要求无关的完整业务对象。

~~~~ts
interface HasLength {
  length: number
}

/** 返回输入及其长度，同时保留具体输入类型。 */
function withLength<Type extends HasLength>(value: Type): [Type, number] {
  return [value, value.length]
}

type Box<Type extends HasLength = string> = {
  value: Type
}

const title = withLength('TypeScript')
const defaultBox: Box = { value: '泛型' }

export { defaultBox, title }
~~~~

### 4. 默认类型参数

**它是什么：** `<Type = Default>` 为未显式提供且无法推导的类型参数设置默认类型。

**它有什么用：** 常用调用可以保持简洁，高级调用仍然能够替换类型；默认值也必须满足已有约束。

**怎么使用：** 把具有稳定常用选择的参数放在可选位置，并确保必需类型参数不会排在默认参数之后。

~~~~ts
type Result<Value, ErrorValue = Error> =
  | { ok: true; value: Value }
  | { ok: false; error: ErrorValue }

type CourseResult = Result<{ id: string }>
type MessageResult = Result<string, string>
~~~~

## 四、动手实践：保留输入与输出的对应关系

泛型的价值是保留关系。下面的读取函数让传入的键决定返回值类型，约束只开放实现真正需要的能力。

~~~~ts
function getField<T extends object, K extends keyof T>(value: T, key: K): T[K] {
  return value[key]
}

const course = { id: 1, title: 'Generics', published: false }
const title = getField(course, 'title')
const published = getField(course, 'published')
~~~~

在编辑器中确认 title 是 string、published 是 boolean，再尝试读取不存在的键。随后比较把返回值写成 `unknown` 或 `any` 会丢失哪些信息。
## 五、易错使用提示

:::pitfalls
### 用 any 假装保留关系

**触发条件：** 用 any 假装保留关系

**原因：** any 允许输入和返回值脱离真实对应关系，调用方得不到可靠检查。

**后果：** 错误类型会继续传播，直到运行时才暴露。

**错误示例：**

~~~~ts
/** 返回输入，但丢失其具体类型。 */
function identity(value: any): any {
  return value
}
~~~~

**正确写法：**

~~~~ts
/** 返回输入，并保留其具体类型。 */
function identity<Type>(value: Type): Type {
  return value
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在未约束参数上读取成员

**触发条件：** 在未约束参数上读取成员

**原因：** 未约束的 Type 可能是数字等没有 length 的类型，函数体不能预设成员。

**后果：** 实现产生属性不存在的诊断。

**错误示例：**

~~~~ts
/** 错误地假定所有 Type 都有 length。 */
function size<Type>(value: Type) {
  return value.length
}
~~~~

**正确写法：**

~~~~ts
/** 只接受具有 length 的输入。 */
function size<Type extends { length: number }>(value: Type) {
  return value.length
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把约束误当成返回类型

**触发条件：** 把约束误当成返回类型

**原因：** 约束只规定最低能力，Type 仍代表调用方传入的具体类型。

**后果：** 手动把结果扩大为约束类型会丢失额外属性。

**错误示例：**

~~~~ts
/** 不必要地丢失输入的额外成员。 */
function keep<Type extends HasLength>(value: Type): HasLength {
  return value
}
~~~~

**正确写法：**

~~~~ts
/** 返回同一个具体 Type。 */
function keep<Type extends HasLength>(value: Type): Type {
  return value
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 显式类型实参与值实参矛盾

**触发条件：** 显式类型实参与值实参矛盾

**原因：** 尖括号声明的类型仍会约束后面的值，不能用它强迫不兼容值通过。

**后果：** 调用产生参数不可赋值诊断。

**错误示例：**

~~~~ts
identity<string>(42)
~~~~

**正确写法：**

~~~~ts
identity(42)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 类型参数记录调用关系

**工作原理：** 泛型允许输入类型在返回位置复用。**实践建议：** 只有需要跨位置维持关系时才引入类型参数。**使用边界：** 只出现一次的类型参数通常可由具体类型替代。

### 约束证明实现能力

**工作原理：** extends 约束让函数体安全使用已声明成员。**实践建议：** 约束保持最小，调用面才不会被无关要求收窄。**使用边界：** 约束不是运行时验证。

### 推导减少重复声明

**工作原理：** 类型实参通常可由值实参推导。**实践建议：** 默认依赖推导，只在上下文不足时显式提供。**使用边界：** 显式类型实参仍必须与值兼容。
:::

:::exercise
### 实现保留输入关系的长度工具

**要求：** 编写一个受 `{ length: number }` 约束的函数，返回原输入和长度；分别传入字符串与数组，再保留传入数字的负例。

**完成标准：** 正例严格编译通过，数字负例产生 TS2345，并能说明约束与具体 Type 的区别。
:::

## 七、本节小结

泛型用于维持类型之间的关系，约束只声明实现所需的最低能力。下一课会用 keyof、typeof 与索引访问从已有对象合同继续派生安全的键和值类型。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface HasId {
  id: string
}

interface Page<Result = string> {
  items: Result[]
  next?: string
}

/** 原样返回输入，并保留具体类型。 */
function identity<Value>(value: Value): Value {
  return value
}

/** 合并两个同类型值并保留元素类型。 */
function pair<Value>(left: Value, right: Value): [Value, Value] {
  return [left, right]
}

/** 从满足最低合同的对象中读取编号。 */
function readId<Value extends HasId>(value: Value): string {
  return value.id
}

const course = identity({ id: 'ts-generics', title: '泛型与约束' })
const ids = pair(course.id, 'ts-keyof')
const page: Page<typeof course> = { items: [course] }
console.log(readId(course), ids, page.items[0]?.title)
~~~~
:::
