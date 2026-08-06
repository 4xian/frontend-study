---
id: engineering.typescript.learn.basics.everyday-types
type: lesson
title: 常用类型
summary: 为 primitive、数组、未知输入和空值选择准确类型，而不是用 any 跳过检查
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - string
  - number
  - boolean
  - array
  - unknown
  - never
  - "null"
  - undefined
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Everyday Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Everyday%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - primitive 类型
      - 数组语法
      - any
      - 类型注解
  - title: "TypeScript Handbook: Narrowing"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Narrowing.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - unknown 的安全收窄
      - never 与穷尽性
      - null 和 undefined 检查
stage: basics
level: beginner
estimatedMinutes: 50
prerequisites:
  - engineering.typescript.learn.basics.type-system-and-inference
objectives:
  - 为字符串、数字、布尔值和同类元素数组选择准确类型
  - 解释 any 与 unknown 对后续检查能力的不同影响
  - 在 strictNullChecks 语义下先处理 null 和 undefined 再使用值
  - 识别 never 表示的不可能值，并避免把它当成普通占位类型
recap:
  - 日常 primitive 使用小写 string、number 和 boolean，数组约束每个元素类型。
  - unknown 要求先取得运行时证据；any 会主动退出该位置的类型检查。
  - null、undefined 和 never 分别表达缺失与不可能，不能互相充当占位符。
---

# 常用类型

## 为什么需要

类型名称的目标不是给每个值贴标签，而是限制下一步允许的操作。string 可以调用字符串方法，number 可以参加数值运算，unknown 必须先取得证据，null 和 undefined 则要求先确认值确实存在。选择过宽的类型会让这些限制失效。

## 核心概念和最小模型

| 类型 | 表达的集合 | 使用前要求 |
| --- | --- | --- |
| string / number / boolean | 对应的 primitive 值 | 直接使用该 primitive 支持的操作 |
| T[] / Array&lt;T&gt; | 元素类型一致的数组 | 元素继续按 T 检查 |
| unknown | 可能是任何值 | 先用运行检查收窄 |
| any | 退出这一位置的类型检查 | 仅用于明确的迁移边界，并尽快收窄 |
| null / undefined | 缺失或尚未得到值 | 先判断再访问 |
| never | 正常控制流中不可能出现的值 | 用于不可达分支或穷尽性证明 |

~~~~ts
const title: string = '常用类型'
const minutes: number = 50
const published: boolean = true
const tags: string[] = ['unknown', 'never']

const payload: unknown = JSON.parse('{"count": 3}')
if (typeof payload === 'object' && payload !== null && 'count' in payload) {
  console.log(payload.count)
}

export { minutes, published, tags, title }
~~~~

## 从 primitive 到边界类型

:::steps
### 从小写 primitive 名称开始

日常值使用 `string`、`number` 和 `boolean`。大写 `String`、`Number`、`Boolean` 是 JavaScript 包装对象类型，不是普通 primitive 的课程默认选择。

### 让数组约束每个元素

`string[]` 与 `Array&lt;string&gt;` 都表示字符串数组。先选项目已有风格；涉及元组时再使用固定位置模型。

### 把未知输入保留为 unknown

unknown 接受任何值，但不允许直接访问属性或调用。它迫使代码通过 typeof、相等判断或自定义类型守卫取得证据。

### 显式处理缺失值

开启 strictNullChecks 时，null 和 undefined 是独立类型。可选值必须先判断、提供默认值或让调用方继续处理缺失。

### 只把 never 用于不可能路径

抛出异常或永不返回的函数可以得到 never；联合被完全排除后也会剩下 never。它不是“暂时不知道”的替代品。
:::

## 配套编译 fixture

临时编译正例覆盖 primitive、字符串数组和 unknown 收窄；负例把字符串赋给 number，并固定 TS2322。验证资产只在 `/tmp` 使用并在结束后删除；编译检查只证明类型检查结果，不把浏览器输出当成类型证据。

## 易错使用提示

:::pitfalls
### 使用大写包装对象类型

**触发条件：** 使用大写包装对象类型

**原因：** `String` 等大写名称表示包装对象。日常文本、数字和布尔值应使用小写 primitive 类型。

**后果：** 包装对象与 primitive 的赋值和相等语义会让合同变得不必要地复杂。

**错误示例：**

~~~~ts
const title: String = new String('TypeScript')
~~~~

**正确写法：**

~~~~ts
const title: string = 'TypeScript'
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 any 接住所有外部输入

**触发条件：** 用 any 接住所有外部输入

**原因：** any 允许任意属性访问和调用，错误会沿数据流继续传播。

**后果：** 拼写错误和形状不匹配无法在编译期被发现。

**错误示例：**

~~~~ts
const value: any = JSON.parse('{}')
value.user.nmae.toUpperCase()
~~~~

**正确写法：**

~~~~ts
const value: unknown = JSON.parse('{}')
if (typeof value === 'object' && value !== null && 'user' in value) {
  // 继续验证 user 后再读取 name
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 未收窄 unknown 就调用方法

**触发条件：** 未收窄 unknown 就调用方法

**原因：** unknown 表示当前没有足够证据，直接操作会触发诊断。

**后果：** 代码无法通过严格类型检查。

**错误示例：**

~~~~ts
declare const value: unknown
value.toFixed(2)
~~~~

**正确写法：**

~~~~ts
declare const value: unknown
if (typeof value === 'number') value.toFixed(2)
~~~~

**验证方式：** 对照正确写法验证结果。

### 忽略 null 或 undefined 分支

**触发条件：** 忽略 null 或 undefined 分支

**原因：** 可选查找结果并不保证存在，strictNullChecks 会保留缺失可能性。

**后果：** 直接访问属性会触发诊断；关闭检查则可能在运行时失败。

**错误示例：**

~~~~ts
const lessons = [{ id: 'types', title: '常用类型' }]
const lesson = lessons.find((item) => item.id === 'missing')
lesson.title.toUpperCase()
~~~~

**正确写法：**

~~~~ts
const lessons = [{ id: 'types', title: '常用类型' }]
const lesson = lessons.find((item) => item.id === 'missing')
const title = lesson?.title ?? '未找到课程'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 never 当成未知占位值

**触发条件：** 把 never 当成未知占位值

**原因：** never 表示没有任何可能值，而未知输入应使用 unknown。

**后果：** 普通值无法赋给 never，合同也无法表达真实输入。

**错误示例：**

~~~~ts
const payload: never = JSON.parse('{}')
~~~~

**正确写法：**

~~~~ts
const payload: unknown = JSON.parse('{}')
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 原理与适用场景

:::steps
### 类型决定允许的操作

官方事实：primitive、数组和联合类型分别约束值及其可用操作。课程推导：先写最窄且真实的值集合，再让编辑器提示可用能力。边界：业务单位或标识符仍可能需要后续更具体的对象或品牌类型。

### unknown 保留检查责任

官方事实：任何值都可赋给 unknown，但在收窄前不能对其执行大多数操作。课程推导：把系统边界输入标为 unknown，可强制验证靠近使用点。边界：unknown 本身不执行校验，仍需编写运行检查。

### never 证明路径已经穷尽

官方事实：never 代表不可达状态，并会在收窄排除所有成员后出现。课程推导：后续可用它检查判别联合是否覆盖全部分支。边界：本课只建立含义，完整穷尽检查在联合与收窄课程实践。
:::

:::exercise
### 为导入课程数据建立安全边界

**要求：** 声明一个 unknown 输入，分别验证它是非空对象、包含 title、且 title 为 string；验证通过后再调用 toUpperCase。另写一个缺失 title 的负例。

**验收：** 正例以严格模式编译成功；代码中没有 any 或强制断言；缺失字段时不会进入字符串操作。
:::

## 总结与下一课

用 primitive 和数组表达已知值，用 unknown 表达待验证输入，用 null/undefined 表达缺失，用 never 表达不可能。下一课“对象、数组与元组”会把这些元素组合成可维护的数据形状。TypeScript Reference 将在 TA 批次提供对应深链。
