---
id: engineering.typescript.learn.basics.narrowing
type: lesson
title: 类型收窄
summary: 从真实运行检查取得分支内可用的安全类型
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 类型收窄
  - typeof
  - in
  - instanceof
  - type predicate
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Narrowing"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Narrowing.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 控制流分析
      - typeof
      - in
      - instanceof
      - type predicate
      - 判别联合
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.basics.unions-and-literals
  - engineering.typescript.learn.basics.functions
objectives:
  - 用 typeof、等值比较、in 和 instanceof 为分支取得类型证据
  - 解释 truthiness 检查可能丢弃哪些合法值
  - 通过判别字段和 type predicate 收窄对象联合
  - 区分真实运行检查与只改变编译器看法的断言
recap:
  - 控制流分析利用真实检查移除不可能成员，未收窄时不能读取专属字段。
  - typeof、in、instanceof 和 discriminant 适用于不同运行证据。
  - type predicate 只传递函数声明的承诺，函数体仍要完成真实验证。
---

# 类型收窄

## 为什么需要

联合和 unknown 只说明值可能来自哪些集合，不能直接证明当前值是哪一个。收窄把 JavaScript 的真实检查交给控制流分析，使每个分支只使用已经获得证据的属性和方法。

## 核心概念和最小模型

~~~~ts
type CourseInput = string | { title: string; minutes: number }

/** 把课程输入转换为稳定显示文本。 */
function formatCourse(input: CourseInput): string {
  if (typeof input === 'string') return input
  return `${input.title} · ${input.minutes} 分钟`
}

formatCourse('类型收窄')
formatCourse({ title: '类型收窄', minutes: 60 })
~~~~

检查 `typeof input === "string"` 同时具有运行语义和类型意义。编译器沿着 return、if、switch 等可达路径分析变量，在不同分支中移除不可能成员。

## 选择与值匹配的收窄方式

:::steps
### primitive 使用 typeof 与等值比较

typeof 适合 string、number、boolean 等运行标签；与 literal 比较可继续缩小有限集合。

### 属性能力使用 in

`"run" in value` 检查属性是否存在；可选属性可能同时保留在两个分支，不能假设互斥。

### 真实实例使用 instanceof

instanceof 沿原型链判断 class 实例，不能用于已经被擦除的 interface 或 type alias。

### 复用复杂检查时封装 predicate

返回 `value is Course` 的函数让调用处复用证据，但函数体必须真的验证所承诺的形状。
:::

:::demo{id="engineering.typescript.learn.basics.narrowing.control-flow-demo"}
切换不同运行值，观察同一个分类函数如何进入对应分支。
:::

## 配套编译 fixture

临时编译正例覆盖 typeof、in、instanceof、判别字段和 type predicate；负例在未检查前读取联合专属字段，固定 TS2339。验证资产只在 `/tmp` 使用并在结束后删除。Demo 只展示运行分支，不替代编译证据。

## 易错使用提示

:::pitfalls
### 用 truthiness 丢弃合法空字符串

**触发条件：** 用 truthiness 丢弃合法空字符串

**原因：** `if (value)` 会同时排除 undefined 和空字符串，可能比业务条件更宽。

**后果：** 合法但为空的输入被当成缺失，分支行为与合同不一致。

**错误示例：**

~~~~ts
declare const title: string | undefined
if (title) console.log(title)
~~~~

**正确写法：**

~~~~ts
if (title !== undefined) console.log(title)
~~~~

**验证方式：** 对照正确写法验证结果。

### 忘记 typeof null 是 object

**触发条件：** 忘记 typeof null 是 object

**原因：** JavaScript 中 `typeof null` 返回 `"object"`，单独检查 object 不足以取得对象证据。

**后果：** 分支仍可能接收 null，直接读取属性会失败或产生诊断。

**错误示例：**

~~~~ts
declare const value: object | null
if (typeof value === 'object') Object.keys(value)
~~~~

**正确写法：**

~~~~ts
if (typeof value === 'object' && value !== null) Object.keys(value)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 in 当成可选属性的互斥判断

**触发条件：** 把 in 当成可选属性的互斥判断

**原因：** 可选属性可能存在也可能缺失，因此包含该属性的类型会出现在 in 的两侧。

**后果：** else 分支仍不能排除带可选属性的成员。

**错误示例：**

~~~~ts
type User = { name: string; fly?: () => void }
type Bird = { fly: () => void }
declare const value: User | Bird
if (!('fly' in value)) value.name
~~~~

**正确写法：**

~~~~ts
type User = { kind: 'user'; name: string; fly?: () => void }
type Bird = { kind: 'bird'; fly: () => void }
if (value.kind === 'user') value.name
~~~~

**验证方式：** 对照正确写法验证结果。

### 编写会说谎的 type predicate

**触发条件：** 编写会说谎的 type predicate

**原因：** predicate 的返回类型是对调用方的承诺，编译器不会自动证明函数体完整验证了形状。

**后果：** 错误承诺会让不可信值绕过检查，并在后续属性访问时失败。

**错误示例：**

~~~~ts
type Course = { title: string }
/** 未验证就承诺输入是课程。 */
function isCourse(_value: unknown): _value is Course {
  return true
}
~~~~

**正确写法：**

~~~~ts
/** 验证课程所需的最小运行形状。 */
function isCourse(value: unknown): value is Course {
  return typeof value === 'object' && value !== null &&
    'title' in value && typeof value.title === 'string'
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 原理与适用场景

:::steps
### 控制流携带证据

官方事实：编译器根据检查和可达性收窄变量。课程推导：让 guard 靠近使用点，分支越短越容易确认。边界：异步变化或外部数据仍需各自的运行保证。

### 检查方式必须匹配运行值

官方事实：typeof、in 与 instanceof 各自遵循 JavaScript 语义。课程推导：primitive、能力属性和实例身份使用不同 guard。边界：interface 在运行时不存在，不能交给 instanceof。

### predicate 是可复用合同

官方事实：`parameter is Type` 会影响调用处的控制流分析。课程推导：只为重复且真实的检查封装 predicate。边界：返回注解不会替函数体生成校验。
:::

:::exercise
### 收窄一组外部课程输入

**要求：** 从 unknown 开始，验证值是非空对象、包含 title 且 title 为 string；再用判别字段区分 video 与 article，并为每个分支返回不同说明。

**验收：** 正例没有 any 或强制断言，未收窄的属性访问保留为 TS2339 负例，运行分支结果可解释。
:::

## 总结与下一课

收窄来自可执行检查而不是愿望式断言。选择与运行值匹配的 guard，并让 predicate 忠实验证合同。下一课“type 与 interface”会比较这些对象合同的命名、组合和扩展方式。
