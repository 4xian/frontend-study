---
id: engineering.typescript.learn.advanced.infer-and-distribution
type: lesson
title: infer 与分布式条件
summary: 从既有类型结构提取信息，并明确控制条件类型是否逐个处理联合成员
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.intermediate.conditional-types
  - engineering.typescript.learn.intermediate.generics-and-constraints
tags:
  - TypeScript
  - infer
  - 条件类型
  - 分布式条件类型
  - never
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
sources:
  - title: "TypeScript Handbook: Conditional Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Conditional%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - infer 模式提取
      - overload 最后签名推导
      - 联合分布与方括号控制
  - title: "TypeScript Handbook: Utility Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/reference/Utility%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - Awaited
      - ReturnType
      - Exclude
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.intermediate.conditional-types
  - engineering.typescript.learn.intermediate.generics-and-constraints
objectives:
  - 用 infer 从函数、数组和 Promise 结构中提取内部类型
  - 预测条件类型面对联合时的分布结果
  - 用 tuple 包裹让整个联合一次参与条件判断
  - 解释 never 如何在分布式条件结果中消除成员
recap:
  - infer 在条件类型的匹配模式中声明待提取类型，不是任意位置的类型变量。
  - 裸类型参数触发联合分布；方括号包裹可改为整体判断。
  - never 在联合中消失，使分布式条件适合筛选成员。
---

# infer 与分布式条件

## 一、为什么需要

条件类型不仅能问“是否满足约束”，还可以在匹配成功时取出结构内部的信息。库作者常要从回调取返回值、
从 Promise 取完成值，或从联合中过滤不符合条件的成员。若没有统一模型，这些工具类型很容易在联合输入
上得到意外结果。

## 二、核心概念和最小模型

`infer` 只在条件类型的匹配模式中声明一个待提取类型。匹配成功后，提取结果只在 true 分支可用。

~~~~ts
type ResultOf<T> = T extends (...args: never[]) => infer Result ? Result : never

type Course = ResultOf<() => { id: string; published: boolean }>
// { id: string; published: boolean }
~~~~

这不是执行函数，也不是读取运行时反射信息。编译器只比较类型结构，把匹配位置上的类型绑定给
`Result`。

## 三、知识点详解

### 1. infer 基本语法

**它是什么：** `infer Name` 只能出现在条件类型的匹配模式中，为匹配到的内部类型创建临时名称。

**它有什么用：** 工具类型可以从数组、Promise、函数或其他结构中提取类型，而不需要调用方重复传入。

**怎么使用：** 先写要匹配的外层形状，在需要提取的位置放 `infer`，并只在条件的成功分支使用该名称。

~~~~ts
type ElementOf<Type> = Type extends readonly (infer Item)[] ? Item : never

type Lesson = ElementOf<readonly ['基础', '进阶']>
~~~~

### 2. 提取数组与元组元素

**它是什么：** `Type extends readonly (infer Item)[]` 会把数组或元组所有元素位置的类型提取为 `Item`。

**它有什么用：** 只拿到集合类型时，可以复用其元素合同，不必重新声明对象或字面量联合。

**怎么使用：** 同时接受可变和只读集合时保留 `readonly`，非数组输入在失败分支返回 `never` 或原类型。

~~~~ts
type LessonTuple = readonly [
  { id: 'types'; minutes: 40 },
  { id: 'generics'; minutes: 55 },
]

type LessonItem = ElementOf<LessonTuple>
~~~~

### 3. 提取 Promise 与函数结果

**它是什么：** `infer` 可以放在 `PromiseLike<...>` 或函数签名的返回位置，捕获内部结果类型。

**它有什么用：** 异步数据和函数 API 的返回合同能够自动同步到下游工具类型。

**怎么使用：** 为每种外层结构写最小匹配模式；需要递归展开多层 Promise 时再增加递归，而不是默认无限展开。

~~~~ts
type AwaitedOnce<Type> = Type extends PromiseLike<infer Value> ? Value : Type
type ReturnOf<Type> = Type extends (...args: never[]) => infer Result ? Result : never

type Course = AwaitedOnce<Promise<{ id: string }>>
type Label = ReturnOf<() => string>
~~~~

### 4. infer 与联合分布

**它是什么：** 含裸类型参数的条件类型会对联合逐项匹配；用 `[Type]` 包裹后则把联合当作整体。

**它有什么用：** 同一个提取工具可以选择“分别提取每个成员”或“所有成员一起满足才提取”。

**怎么使用：** 先明确期望的联合语义，再决定是否包裹元组；不要把分布当成偶然结果。

~~~~ts
type DistributedElement<Type> = Type extends readonly (infer Item)[] ? Item : never
type WholeArray<Type> = [Type] extends [readonly (infer Item)[]] ? Item : never

type Distributed = DistributedElement<string[] | number[]>
type Whole = WholeArray<string[] | number[]>
~~~~

## 四、控制联合分布

~~~~ts
type ToArray<T> = T extends unknown ? T[] : never
type ToArrayTogether<T> = [T] extends [unknown] ? T[] : never

type Separate = ToArray<string | number>
// string[] | number[]

type Together = ToArrayTogether<string | number>
// (string | number)[]
~~~~

分布式条件相当于对联合的每个成员分别求值再合并。若某个分支返回 `never`，该成员会从合并后的联合中
消失。

~~~~ts
type OnlyStrings<T> = T extends string ? T : never
type Keys = OnlyStrings<'id' | 404 | 'title'>
// 'id' | 'title'
~~~~

## 五、动手实践：提取内部类型并控制分布

从 Promise、数组和函数中分别提取内部类型，保持每个工具只承担一种关系。

~~~~ts
type AwaitedValue<T> = T extends PromiseLike<infer Value> ? Value : T
type ArrayItem<T> = T extends readonly (infer Item)[] ? Item : never
type FunctionResult<T> = T extends (...args: never[]) => infer Result ? Result : never

type Course = AwaitedValue<Promise<{ id: string }>>
type Tag = ArrayItem<readonly ['ts', 'vite']>
type Result = FunctionResult<() => { ok: true }>
~~~~

再分别实现 `KeepStrings<T>` 与 `KeepStringsTogether<T>`：前者直接使用裸类型参数，后者用 tuple 包裹。给它们传入 `string | number`，比较逐项过滤和整体判断的结果。
## 六、易错使用提示

:::pitfalls
### 在普通类型别名中直接写 infer

**触发条件：** 把 `infer Item` 当成可在任意位置声明的类型变量。

**原因：** `infer` 只能出现在条件类型 `extends` 子句的匹配模式中。

**后果：** 语法或类型检查失败，无法得到提取结果。

**错误示例：**

~~~~ts
type Item = infer Value
~~~~

**正确写法：**

~~~~ts
type ItemOf<T> = T extends readonly (infer Value)[] ? Value : never
~~~~

**验证方式：** 正确写法对 `readonly string[]` 得到 `string`。

### 忽略裸类型参数会触发分布

**触发条件：** 把 `T extends unknown ? T[] : never` 理解为始终得到一个联合元素数组。

**原因：** 裸类型参数面对联合输入会逐成员实例化。

**后果：** 得到 `string[] | number[]`，而不是 `(string | number)[]`。

**错误示例：**

~~~~ts
type Batch<T> = T extends unknown ? T[] : never
~~~~

**正确写法：**

~~~~ts
type Batch<T> = [T] extends [unknown] ? T[] : never
~~~~

**验证方式：** 用双向类型断言区分两种数组合同。

### 把 never 当成可保留的联合成员

**触发条件：** 期望过滤结果仍包含 `never` 占位。

**原因：** `never | T` 会化简为 `T`。

**后果：** 错误估计最终联合成员或穷尽分支。

**错误示例：**

~~~~ts
type Result = OnlyStrings<'id' | 404> // 不是 'id' | never 的可观察二元结构
~~~~

**正确写法：**

~~~~ts
type Result = OnlyStrings<'id' | 404> // 'id'
~~~~

**验证方式：** 向结果赋值 `404`，应得到 `TS2322`。

### 用 infer 伪装运行时解析

**触发条件：** 认为 `infer` 能检查真实 Promise 值、JSON 内容或函数执行结果。

**原因：** 所有提取都发生在类型检查阶段，运行时没有这些类型变量。

**后果：** 外部数据未经校验就被当成可信值。

**错误示例：**

~~~~ts
type Payload<T> = T extends Promise<infer Value> ? Value : never
// 不能验证网络响应确实符合 Value
~~~~

**正确写法：**

~~~~ts
// 类型提取描述静态合同；运行时数据仍由解析器或校验器验证。
~~~~

**验证方式：** 检查生成 JavaScript，确认没有 infer 产生的运行逻辑。

### 期待从 overload 的指定签名推导

**触发条件：** 对多重调用签名使用条件类型，并期望编译器按某组参数选择其中一个签名。

**原因：** 条件推导从最后一个签名取候选，不执行 overload resolution。

**后果：** 返回类型比预期更宽。

**错误示例：**

~~~~ts
declare function parse(value: string): string
declare function parse(value: number): number
declare function parse(value: string | number): string | number
type Parsed = ResultOf<typeof parse> // string | number
~~~~

**正确写法：**

~~~~ts
type ParseString = ResultOf<(value: string) => string>
~~~~

**验证方式：** 用小型示例分别断言 `Parsed` 与 `ParseString`。
:::

## 七、工作原理与适用边界

:::steps
### 模式匹配提取结构

**工作原理：** 条件类型可在 true 分支通过 `infer` 引入类型变量。**实践建议：** 先匹配最小外层形状，再提取
一个有业务意义的位置。**使用边界：** 这不是运行时反射。

### 裸参数决定分布

**工作原理：** 泛型条件类型的裸 checked type 对联合分布。**实践建议：** 过滤联合时保留分布，整体约束时用
tuple 包裹。**使用边界：** 不要依赖读者猜测是否分布。

### 最后签名只提供推导候选

**工作原理：** 多调用签名从最后签名推导。**实践建议：** 需要精确结果时传入单一函数类型。**使用边界：** 条件类型
不能替代调用表达式的 overload resolution。
:::

:::exercise
### 实现可控的 Promise 提取

**要求：** 写出 `UnwrapEach<T>`，让联合成员逐个提取 Promise 值；再写 `UnwrapTogether<T>`，只在整个
联合都可赋给 `PromiseLike<unknown>` 时提取，否则保留原联合。

**完成标准：** 为 `Promise<string> | Promise<number>` 和 `Promise<string> | boolean` 分别写类型断言，并
解释哪一个工具发生分布。
:::

## 八、本节小结

`infer` 负责从匹配结构中命名类型，裸类型参数决定联合是否分布，`never` 则承担成员过滤。下一课会把
这些工具与映射类型、品牌和有限状态组合，并优先保护公共合同的可读性与诊断质量。

:::code-details{title="查看本节完整示例"}
~~~~ts
type ElementOf<T> = T extends readonly (infer Item)[] ? Item : never
type PromiseValue<T> = T extends Promise<infer Value> ? Value : T
type FunctionResult<T> = T extends (...args: never[]) => infer Result ? Result : never
type DistributedElement<T> = T extends readonly unknown[] ? ElementOf<T> : never
type WholeUnionElement<T> = [T] extends [readonly (infer Item)[]] ? Item : never

type CourseTuple = readonly ['typescript', 'vite']
type CourseId = ElementOf<CourseTuple>
type LoadedCourse = PromiseValue<Promise<{ id: CourseId }>>
type Label = FunctionResult<() => `course:${CourseId}`>
type Distributed = DistributedElement<string[] | number[]>
type Whole = WholeUnionElement<string[] | number[]>

const course: LoadedCourse = { id: 'typescript' }
const label: Label = 'course:vite'
const distributed: Distributed = 42
const whole: Whole = 'lesson'
console.log(course, label, distributed, whole)
~~~~
:::

## 九、参考资料

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) - `infer`、联合分布与控制方式。
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) - `Awaited`、`ReturnType` 与 `Exclude` 的官方应用。
