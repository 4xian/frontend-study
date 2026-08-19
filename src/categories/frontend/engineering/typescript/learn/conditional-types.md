---
id: engineering.typescript.learn.intermediate.conditional-types
type: lesson
title: 条件类型
summary: 根据类型可赋值关系选择结果，并识别联合上的默认分布
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 条件类型
  - extends
  - 类型分支
  - 分布式条件
  - 联合类型
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Conditional Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Conditional%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 条件类型分支
      - 分支约束
      - 分布式条件类型
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.intermediate.generics-and-constraints
  - engineering.typescript.learn.intermediate.keyof-typeof-indexed-access
objectives:
  - "读懂 SomeType extends OtherType ? TrueType : FalseType"
  - 用条件类型表达泛型输入与结果之间的分支关系
  - 在 true 分支使用检查已证明的成员类型
  - 识别裸泛型参数对 union 成员的默认分布行为
recap:
  - 条件类型用 extends、问号和冒号表达类型层分支，不替代运行时判断。
  - true 分支可使用检查已经证明的成员能力。
  - 裸泛型参数接收 union 时默认逐成员分布，结果是各分支结果的联合。
---

# 条件类型

## 一、为什么需要

重载可以描述少量固定调用，但类型工具常需根据任意输入合同计算结果。条件类型把可赋值关系写成类型层分支，让一个泛型类型表达多组输入与输出对应。

## 二、核心概念和最小模型

~~~~ts
type LessonLabel<Type> = Type extends string ? { title: Type } : { id: Type }

type NamedLesson = LessonLabel<'条件类型'>
type NumberedLesson = LessonLabel<12>

const named: NamedLesson = { title: '条件类型' }
const numbered: NumberedLesson = { id: 12 }
~~~~

extends 左侧是否可赋给右侧决定选择哪个分支。这里字符串输入得到 title 合同，数字输入得到 id 合同；条件类型只计算静态结果，不会在运行时生成判断。

## 三、知识点详解

### 1. 条件类型语法

**它是什么：** 条件类型写成 `Type extends Check ? TrueType : FalseType`，根据可赋值关系选择结果类型。

**它有什么用：** 同一个工具类型可以根据输入形状返回不同类型结果，而不必为每种输入复制一个类型别名。

**怎么使用：** 先写出一个清晰、可解释的判断条件，再分别定义满足和不满足条件时的结果。

~~~~ts
type IsString<Type> = Type extends string ? true : false

type TitleCheck = IsString<'TypeScript'>
type OrderCheck = IsString<12>
~~~~

### 2. true 分支中的约束

**它是什么：** 当条件证明 `Type` 满足某个结构后，true 分支可以使用该结构提供的成员。

**它有什么用：** 可以安全提取对象属性、数组元素或函数返回值，而不用事先给所有输入添加统一约束。

**怎么使用：** 把需要读取的能力写进 `extends` 右侧，只在 true 分支索引对应成员。

~~~~ts
type MessageOf<Type> = Type extends { message: unknown } ? Type['message'] : never

type CourseMessage = MessageOf<{ message: '已发布' }>
type MissingMessage = MessageOf<{ title: string }>
~~~~

### 3. 分布式条件类型

**它是什么：** 条件左侧是裸类型参数时，传入联合会对每个成员分别计算，再把结果重新组成联合。

**它有什么用：** 它适合过滤联合成员或把联合中的每个成员转换成对应结果。

**怎么使用：** 直接使用 `Type extends ...` 触发分布，并检查结果是否确实需要逐成员处理。

~~~~ts
type ToArray<Type> = Type extends unknown ? Type[] : never
type Distributed = ToArray<string | number>

const textItems: Distributed = ['泛型', '条件类型']
const numberItems: Distributed = [1, 2]
~~~~

### 4. 阻止条件类型分布

**它是什么：** 把条件两侧包进单元素元组，例如 `[Type] extends [Check]`，可以让联合整体参与比较。

**它有什么用：** 它能表达“整个联合都满足条件吗”，并生成 `(string | number)[]` 这类混合元素数组。

**怎么使用：** 只有确实需要整体判断时才包裹元组，并与分布结果并排验证差异。

~~~~ts
type ToArrayTogether<Type> = [Type] extends [unknown] ? Type[] : never
type Mixed = ToArrayTogether<string | number>

const mixedItems: Mixed = ['条件类型', 12]

export { mixedItems, numberItems, textItems }
export type { CourseMessage, MissingMessage }
~~~~

## 四、动手实践：先写分支，再观察联合分布

用条件类型描述“数组取元素，非数组保持原值”，然后分别传入单一类型和联合类型。

~~~~ts
type ElementOf<T> = T extends readonly (infer Item)[] ? Item : T

type Name = ElementOf<string[]>
type Count = ElementOf<number>
type Mixed = ElementOf<string[] | number[]>

const name: Name = 'Ada'
const count: Count = 1
const mixed: Mixed = Math.random() > 0.5 ? 'Ada' : 1
~~~~

把定义改成 `[T] extends [readonly (infer Item)[]]`，比较联合是否仍逐项分布。这个改动能直观看出 tuple 包裹不是语法装饰，而是在控制条件类型处理联合的方式。
## 五、易错使用提示

:::pitfalls
### 把条件类型当成运行判断

**触发条件：** 把条件类型当成运行判断

**原因：** 条件类型在编译期计算，不会读取运行值或替代 if 分支。

**后果：** 运行时仍可能接收未经验证的数据。

**错误示例：**

~~~~ts
// 条件类型不会验证接口返回值
~~~~

**正确写法：**

~~~~ts
// 运行值先校验，静态关系再由条件类型描述
~~~~

**验证方式：** 对照正确写法验证结果。

### 在证明前索引未知成员

**触发条件：** 在证明前索引未知成员

**原因：** 未约束的 Type 不保证存在 message，不能直接写 Type["message"]。

**后果：** 类型定义本身产生索引诊断。

**错误示例：**

~~~~ts
type MessageOf<Type> = Type['message']
~~~~

**正确写法：**

~~~~ts
type MessageOf<Type> =
  Type extends { message: unknown } ? Type['message'] : never
~~~~

**验证方式：** 对照正确写法验证结果。

### 误把分布结果当成混合数组

**触发条件：** 误把分布结果当成混合数组

**原因：** 裸泛型参数会对 union 每个成员分别求值，再把结果组成 union。

**后果：** 混合成员数组不能赋给 string[] | number[]。

**错误示例：**

~~~~ts
const values: ToArray<string | number> = ['a', 1]
~~~~

**正确写法：**

~~~~ts
const values: ToArray<string | number> = ['a', 'b']
~~~~

**验证方式：** 对照正确写法验证结果。

### 把复杂分支藏进公共别名

**触发条件：** 把复杂分支藏进公共别名

**原因：** 层层嵌套条件会让调用方难以理解错误来源和最终结果。

**后果：** 类型虽然精确，却难以维护和解释。

**错误示例：**

~~~~ts
// 在一个别名中嵌套多层互斥业务规则
~~~~

**正确写法：**

~~~~ts
// 每个条件类型只表达一个明确的类型能力分支
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 可赋值关系选择分支

**工作原理：** 条件类型依据左侧是否可赋给右侧选择结果。**实践建议：** 只用于表达清晰的输入输出关系。**使用边界：** 它不执行运行时校验。

### true 分支获得额外约束

**工作原理：** 检查成立的分支可使用已证明成员。**实践建议：** 先检查能力，再索引成员类型。**使用边界：** false 分支没有这份证明。

### 裸泛型参数默认分布

**工作原理：** 条件作用于裸类型参数时会逐个处理 union 成员。**实践建议：** 看到 union 输入先展开每个成员预测结果。**使用边界：** infer 与主动抑制分布留到高级课程。
:::

:::exercise
### 计算消息类型与联合数组

**要求：** 定义 MessageOf 和 ToArray，分别验证有 message、无 message 以及 string | number 输入；保留混合数组负例。

**完成标准：** 正例严格编译通过，混合数组产生 TS2322，并能解释为什么结果是数组联合。
:::

## 七、本节小结

条件类型按可赋值关系选择静态结果，裸泛型参数会对 union 默认分布。下一课“模板字面量类型”会继续处理有限字符串协议，并与映射类型的键重映射衔接。

:::code-details{title="查看本节完整示例"}
~~~~ts
type MessageOf<T> = T extends { message: unknown } ? T['message'] : never
type ElementOf<T> = T extends readonly (infer Item)[] ? Item : T
type ToArray<T> = T extends unknown ? T[] : never
type ToArrayWithoutDistribution<T> = [T] extends [unknown] ? T[] : never

interface EmailEvent {
  message: string
}

interface RetryEvent {
  message: { count: number }
}

type EmailMessage = MessageOf<EmailEvent>
type RetryMessage = MessageOf<RetryEvent>
type CourseId = ElementOf<readonly ['ts', 'vite']>
type SeparateLists = ToArray<'ts' | 'vite'>
type MixedList = ToArrayWithoutDistribution<'ts' | 'vite'>

const email: EmailMessage = '课程已发布'
const retry: RetryMessage = { count: 2 }
const id: CourseId = 'ts'
const separate: SeparateLists = ['vite']
const mixed: MixedList = ['ts', 'vite']
console.log(email, retry.count, id, separate, mixed)
~~~~
:::
