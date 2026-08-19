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
appliesTo: TypeScript 7.0.2
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

## 一、为什么需要

类型名称的目标不是给每个值贴标签，而是限制下一步允许的操作。string 可以调用字符串方法，number 可以参加数值运算，unknown 必须先取得证据，null 和 undefined 则要求先确认值确实存在。选择过宽的类型会让这些限制失效。

## 二、核心概念和最小模型

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

## 三、知识点详解

### 1. string、number 与 boolean

**它们是什么：** `string` 表示文本，`number` 表示 JavaScript 数值，`boolean` 表示 `true` 或 `false`。
它们是最常用的 primitive 类型，应使用小写名称。

**它们有什么用：** primitive 类型决定值可以执行哪些操作，并让函数在调用前就拒绝明显错误的输入。

**怎么使用：** 在参数和公共字段上写出对应类型；有明确初始值的局部变量可以让编译器自动推导。

~~~~ts
const title: string = '常用类型'
const minutes: number = 45
const published: boolean = true
~~~~

### 2. 数组类型

**它是什么：** 数组类型描述一组同类、长度可变的值。`string[]` 与 `Array<string>` 含义相同。

**它有什么用：** 它会同时约束写入的元素和读取后的元素，使 `map`、`filter` 等操作获得准确的参数类型。

**怎么使用：** 简单元素通常写成 `T[]`，复杂泛型组合可写成 `Array<T>`；需要固定位置含义时应改用元组。

~~~~ts
const tags: string[] = ['基础', 'TypeScript']
tags.push('类型系统')

const durations: Array<number> = [35, 40, 50]
~~~~

### 3. unknown

**它是什么：** `unknown` 是安全的顶层类型，任何值都能赋给它，但在收窄前不能访问属性或调用方法。

**它有什么用：** 它适合接收 JSON、异常和接口响应等不可信输入，强制调用方先证明值的真实类型。

**怎么使用：** 先把外部值声明为 `unknown`，再使用 `typeof`、`instanceof`、`in` 或自定义类型守卫收窄。

~~~~ts
const input: unknown = 'TypeScript'

if (typeof input === 'string') {
  console.log(input.toUpperCase())
}
~~~~

### 4. null 与 undefined

**它们是什么：** `null` 表示显式的空值，`undefined` 常表示值尚未提供。开启 `strictNullChecks` 后，
它们不会自动当作其他类型使用。

**它们有什么用：** 独立建模缺失值可以迫使代码处理“课程不存在”“参数未传”等真实分支。

**怎么使用：** 用联合类型声明可能缺失的值，然后通过判断、可选链或空值合并提供处理路径。

~~~~ts
const selectedTitle: string | undefined = undefined
const visibleTitle = selectedTitle ?? '请选择课程'

const archivedAt: Date | null = null
~~~~

### 5. never

**它是什么：** `never` 表示不可能产生值的类型。始终抛出异常的函数、无限循环和已穷尽联合后的剩余分支
都会得到 `never`。

**它有什么用：** 它可以证明某条路径不可到达，并在联合新增成员时提醒开发者补充分支。

**怎么使用：** 不要把 `never` 当作未知占位值；只在永不返回的函数或穷尽检查中使用它。

~~~~ts
/** 创建一个必定中断当前流程的错误。 */
function fail(message: string): never {
  throw new Error(message)
}
~~~~

## 四、动手实践：从表单输入安全得到业务值

浏览器输入始终先得到字符串。下面的函数用 `unknown` 接住外部值，再把它转换为业务真正需要的类型。

~~~~ts
interface CourseDraft {
  title: string
  minutes: number
  tags: string[]
}

function createDraft(title: unknown, minutes: unknown): CourseDraft | undefined {
  if (typeof title !== 'string' || title.trim() === '') return undefined
  const parsedMinutes = Number(minutes)
  if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) return undefined

  return { title: title.trim(), minutes: parsedMinutes, tags: [] }
}
~~~~

分别传入合法字符串、空标题和不能转换为数字的课时。确认所有分支都不需要 `any` 或强制断言，并尝试给 `tags` 放入数字，观察数组元素类型如何阻止错误数据进入状态。
## 五、易错使用提示

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

## 六、工作原理与适用边界

:::steps
### 类型决定允许的操作

**工作原理：** primitive、数组和联合类型分别约束值及其可用操作。**实践建议：** 先写最窄且真实的值集合，再让编辑器提示可用能力。**使用边界：** 业务单位或标识符仍可能需要后续更具体的对象或品牌类型。

### unknown 保留检查责任

**工作原理：** 任何值都可赋给 unknown，但在收窄前不能对其执行大多数操作。**实践建议：** 把系统边界输入标为 unknown，可强制验证靠近使用点。**使用边界：** unknown 本身不执行校验，仍需编写运行检查。

### never 证明路径已经穷尽

**工作原理：** never 代表不可达状态，并会在收窄排除所有成员后出现。**实践建议：** 后续可用它检查判别联合是否覆盖全部分支。**使用边界：** 本课只建立含义，完整穷尽检查在联合与收窄课程实践。
:::

:::exercise
### 为导入课程数据建立安全边界

**要求：** 声明一个 unknown 输入，分别验证它是非空对象、包含 title、且 title 为 string；验证通过后再调用 toUpperCase。另写一个缺失 title 的负例。

**完成标准：** 正例以严格模式编译成功；代码中没有 any 或强制断言；缺失字段时不会进入字符串操作。
:::

## 七、本节小结

用 primitive 和数组表达已知值，用 unknown 表达待验证输入，用 null/undefined 表达缺失，用 never 表达不可能。下一课“对象、数组与元组”会把这些元素组合成可维护的数据形状；对应语言主题可在 TypeScript Reference 中按深链查阅。

:::code-details{title="查看本节完整示例"}
~~~~ts
type CourseState = 'draft' | 'published'

const title: string = 'TypeScript 常用类型'
const duration: number = 45
const published: boolean = true
const tags: string[] = ['typescript', '基础']
let selectedId: string | null = null
let description: string | undefined
// any 会跳过属性检查；这里只用于对照，新输入应使用 unknown
const unsafeInput: any = { tags: '不是数组' }
const uncheckedTags: string[] = unsafeInput.tags

/** 判断未知输入是否为字符串数组。 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/** 在使用课程编号前处理 null。 */
function selectedLabel(value: string | null): string {
  return value === null ? '未选择课程' : value.toUpperCase()
}

/** 在读取描述长度前处理 undefined。 */
function descriptionLength(value: string | undefined): number {
  return value?.length ?? 0
}

/** 保证课程状态分支已经处理完整。 */
function assertNever(value: never): never {
  throw new Error(`未处理状态：${String(value)}`)
}

/** 根据有限状态生成显示文本。 */
function stateLabel(state: CourseState): string {
  if (state === 'draft') return '草稿'
  if (state === 'published') return '已发布'
  return assertNever(state)
}

const importedTags: unknown = ['课程', '类型安全']
if (isStringArray(importedTags)) tags.push(...importedTags)
console.log(selectedLabel(selectedId), descriptionLength(description), Array.isArray(uncheckedTags))
selectedId = 'ts-everyday'
description = `${title}，${duration} 分钟`
console.log(description, published, tags, selectedId, stateLabel('published'))
~~~~
:::
