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
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
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

## 为什么需要

重载可以描述少量固定调用，但类型工具常需根据任意输入合同计算结果。条件类型把可赋值关系写成类型层分支，让一个泛型类型表达多组输入与输出对应。

## 核心概念和最小模型

~~~~ts
type LessonLabel<Type> = Type extends string ? { title: Type } : { id: Type }

type NamedLesson = LessonLabel<'条件类型'>
type NumberedLesson = LessonLabel<12>

const named: NamedLesson = { title: '条件类型' }
const numbered: NumberedLesson = { id: 12 }
~~~~

extends 左侧是否可赋给右侧决定选择哪个分支。这里字符串输入得到 title 合同，数字输入得到 id 合同；条件类型只计算静态结果，不会在运行时生成判断。

## 理解约束与联合分布

:::steps
### 先写清分支条件

条件应对应真实类型能力，例如是否具有 message 属性，而不是把复杂业务规则塞进一个表达式。

### 在 true 分支使用证明

通过 `{ message: unknown }` 检查后，true 分支可以安全索引 Type["message"]。

### 观察裸类型参数

`Type extends ...` 中 Type 若直接接收 union，条件会分别作用于每个成员。

### 区分联合数组结果

分布后的 `string[] | number[]` 要求数组内部保持同类，不等于 `(string | number)[]`。
:::

~~~~ts
type MessageOf<Type> = Type extends { message: unknown } ? Type['message'] : never
type ToArray<Type> = Type extends unknown ? Type[] : never

type CourseMessage = MessageOf<{ message: '已发布' }>
type Distributed = ToArray<string | number>

const textItems: Distributed = ['泛型', '条件类型']
const numberItems: Distributed = [1, 2]

export { numberItems, textItems }
export type { CourseMessage }
~~~~

## 配套编译 fixture

临时编译正例验证 true 分支读取已证明成员，以及裸泛型参数对 string | number 分布；负例把混合数组赋给 `string[] | number[]`，固定 TS2322。验证资产只在 `/tmp` 使用并在结束后删除。

## 易错使用提示

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

## 原理与适用场景

:::steps
### 可赋值关系选择分支

官方事实：条件类型依据左侧是否可赋给右侧选择结果。课程推导：只用于表达清晰的输入输出关系。边界：它不执行运行时校验。

### true 分支获得额外约束

官方事实：检查成立的分支可使用已证明成员。课程推导：先检查能力，再索引成员类型。边界：false 分支没有这份证明。

### 裸泛型参数默认分布

官方事实：条件作用于裸类型参数时会逐个处理 union 成员。课程推导：看到 union 输入先展开每个成员预测结果。边界：infer 与主动抑制分布留到高级课程。
:::

:::exercise
### 计算消息类型与联合数组

**要求：** 定义 MessageOf 和 ToArray，分别验证有 message、无 message 以及 string | number 输入；保留混合数组负例。

**验收：** 正例严格编译通过，混合数组产生 TS2322，并能解释为什么结果是数组联合。
:::

## 总结与下一课

条件类型按可赋值关系选择静态结果，裸泛型参数会对 union 默认分布。下一课“模板字面量类型”会继续处理有限字符串协议，并与映射类型的键重映射衔接。
