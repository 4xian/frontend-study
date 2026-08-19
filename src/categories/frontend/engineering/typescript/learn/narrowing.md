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
appliesTo: TypeScript 7.0.2
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

## 一、为什么需要

联合和 unknown 只说明值可能来自哪些集合，不能直接证明当前值是哪一个。收窄把 JavaScript 的真实检查交给控制流分析，使每个分支只使用已经获得证据的属性和方法。

## 二、核心概念和最小模型

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

## 三、知识点详解

### 1. typeof 与等值收窄

**它是什么：** `typeof` 检查 JavaScript 运行时标签，等值比较则把值缩小到某个具体字面量。

**它有什么用：** 它适合区分 `string`、`number`、`boolean` 等 primitive，以及有限状态中的具体成员。

**怎么使用：** 在 `if` 分支中比较 `typeof value` 或直接比较字面量，分支内就能使用对应类型的操作。

~~~~ts
/** 把字符串或数字值转换为显示文本。 */
function formatValue(value: string | number): string {
  if (typeof value === 'number') return value.toFixed(0)
  return value.toUpperCase()
}
~~~~

### 2. in 操作符收窄

**它是什么：** `"property" in value` 在运行时检查对象或原型链上是否存在指定属性。

**它有什么用：** 当联合成员拥有不同能力字段时，可以根据属性存在性选择正确分支。

**怎么使用：** 先确认值是非空对象，再用 `in` 检查字段；可选属性可能同时出现在两个分支中，不能当作
绝对互斥标记。

~~~~ts
type Content = { title: string } | { run: () => void }

/** 使用内容值当前具备的能力。 */
function useContent(content: Content): void {
  if ('run' in content) content.run()
  else console.log(content.title)
}
~~~~

### 3. instanceof 收窄

**它是什么：** `instanceof` 沿真实原型链判断一个值是否由某个 class 构造。

**它有什么用：** 它适合 `Date`、`Error` 和自定义 class 等具有运行时身份的对象，分支内能访问实例成员。

**怎么使用：** 右侧必须是运行时存在的构造函数；`interface` 和 `type` 编译后会消失，不能用于
`instanceof`。

~~~~ts
/** 统一读取未知异常的消息。 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
~~~~

### 4. 自定义类型谓词

**它是什么：** 返回类型 `value is Course` 声明函数在返回 `true` 时已经证明参数满足 `Course`。

**它有什么用：** 复杂运行时检查可以封装并复用，`filter`、接口边界和表单解析都能获得准确结果类型。

**怎么使用：** 函数体必须逐项验证它承诺的结构，不能只通过断言返回 `true`。

~~~~ts
interface Course {
  id: string
  title: string
}

/** 判断未知值是否为课程对象。 */
function isCourse(value: unknown): value is Course {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    typeof value.id === 'string' &&
    typeof value.title === 'string'
  )
}
~~~~

:::demo{id="engineering.typescript.learn.basics.narrowing.control-flow-demo"}
切换不同运行值，观察同一个分类函数如何进入对应分支。
:::

## 四、动手实践：从未知响应收窄到判别联合

下面先判断外层对象，再用判别字段处理成功和失败两种响应。

~~~~ts
type CourseResponse =
  | { ok: true; data: { id: string; title: string } }
  | { ok: false; message: string }

function isCourseResponse(value: unknown): value is CourseResponse {
  if (typeof value !== 'object' || value === null || !('ok' in value)) return false
  return typeof value.ok === 'boolean'
}

function renderResponse(value: unknown): string {
  if (!isCourseResponse(value)) return '响应格式错误'
  return value.ok ? value.data.title : value.message
}
~~~~

先传入两种合法分支，再传入 null、数组和缺少 ok 的对象。随后在收窄前直接读取 data，观察为什么编译器拒绝访问联合专属字段。
## 五、易错使用提示

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

## 六、工作原理与适用边界

:::steps
### 控制流携带证据

**工作原理：** 编译器根据检查和可达性收窄变量。**实践建议：** 让 guard 靠近使用点，分支越短越容易确认。**使用边界：** 异步变化或外部数据仍需各自的运行保证。

### 检查方式必须匹配运行值

**工作原理：** typeof、in 与 instanceof 各自遵循 JavaScript 语义。**实践建议：** primitive、能力属性和实例身份使用不同 guard。**使用边界：** interface 在运行时不存在，不能交给 instanceof。

### predicate 是可复用合同

**工作原理：** `parameter is Type` 会影响调用处的控制流分析。**实践建议：** 只为重复且真实的检查封装 predicate。**使用边界：** 返回注解不会替函数体生成校验。
:::

:::exercise
### 收窄一组外部课程输入

**要求：** 从 unknown 开始，验证值是非空对象、包含 title 且 title 为 string；再用判别字段区分 video 与 article，并为每个分支返回不同说明。

**完成标准：** 正例没有 any 或强制断言，未收窄的属性访问保留为 TS2339 负例，运行分支结果可解释。
:::

## 七、本节小结

收窄来自可执行检查而不是愿望式断言。选择与运行值匹配的 guard，并让 predicate 忠实验证合同。下一课“type 与 interface”会比较这些对象合同的命名、组合和扩展方式。

:::code-details{title="查看本节完整示例"}
~~~~ts
class VideoLesson {
  constructor(public duration: number) {}
}

type CourseInput =
  | string
  | { kind: 'article'; content: string }
  | { kind: 'quiz'; questions: number }
  | VideoLesson

/** 忠实判断对象是否为文章课程。 */
function isArticle(value: CourseInput): value is { kind: 'article'; content: string } {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'article'
}

/** 根据运行时证据处理每一种输入。 */
function describe(input: CourseInput): string {
  if (typeof input === 'string') return input === '' ? '空标题' : `标题：${input}`
  if (input instanceof VideoLesson) return `视频：${input.duration} 分钟`
  if (isArticle(input)) return `文章：${input.content.length} 字`
  if ('questions' in input) return `测验：${input.questions} 题`
  return '未知课程'
}

console.log(
  describe('类型收窄'),
  describe(new VideoLesson(20)),
  describe({ kind: 'article', content: '控制流证据' }),
  describe({ kind: 'quiz', questions: 5 }),
)
~~~~
:::
