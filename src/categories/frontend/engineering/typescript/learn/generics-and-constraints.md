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
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
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

## 为什么需要

只写 unknown 会丢失输入与输出的对应关系，改成 any 又会放弃检查。泛型把调用方的具体类型捕获为类型参数，使实现只承诺必要能力，返回位置仍能保留准确类型。

## 核心概念和最小模型

~~~~ts
/** 原样返回输入，并保留调用方的具体类型。 */
function identity<Type>(value: Type): Type {
  return value
}

const courseId = identity('generics')
const lessonCount = identity(12)
~~~~

Type 是同一次调用中的占位符。传入字符串时，参数和返回值共同使用字符串类型；传入数字时又共同使用数字类型。调用方通常不必写尖括号，编译器会从值实参推导类型实参。

## 约束最低能力

:::steps
### 先写需要维持的关系

类型参数应同时出现在至少两个有意义的位置，例如输入与输出，而不是只换一个类型名字。

### 让调用方优先推导

值实参已能确定 Type 时省略显式类型实参，让调用代码更短且减少重复。

### 只约束实现所需成员

实现只读取 length，就约束 `{ length: number }`，不要要求与任务无关的完整对象。

### 谨慎提供默认值

默认类型让对应类型实参成为可选，但默认类型本身仍必须满足已经声明的约束。
:::

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

## 配套编译 fixture

临时编译正例验证 identity 保留关系、字符串满足 length 约束以及 Box 默认类型；负例把数字传给 withLength，固定 TS2345。验证资产只在 `/tmp` 使用并在结束后删除。

## 易错使用提示

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

## 原理与适用场景

:::steps
### 类型参数记录调用关系

官方事实：泛型允许输入类型在返回位置复用。课程推导：只有需要跨位置维持关系时才引入类型参数。边界：只出现一次的类型参数通常可由具体类型替代。

### 约束证明实现能力

官方事实：extends 约束让函数体安全使用已声明成员。课程推导：约束保持最小，调用面才不会被无关要求收窄。边界：约束不是运行时验证。

### 推导减少重复声明

官方事实：类型实参通常可由值实参推导。课程推导：默认依赖推导，只在上下文不足时显式提供。边界：显式类型实参仍必须与值兼容。
:::

:::exercise
### 实现保留输入关系的长度工具

**要求：** 编写一个受 `{ length: number }` 约束的函数，返回原输入和长度；分别传入字符串与数组，再保留传入数字的负例。

**验收：** 正例严格编译通过，数字负例产生 TS2345，并能说明约束与具体 Type 的区别。
:::

## 总结与下一课

泛型用于维持类型之间的关系，约束只声明实现所需的最低能力。下一课会用 keyof、typeof 与索引访问从已有对象合同继续派生安全的键和值类型。
