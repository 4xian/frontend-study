---
id: engineering.typescript.learn.basics.unions-and-literals
type: lesson
title: 联合与字面量
summary: 用有限状态代替宽泛 primitive，并为分支建立可判别的合同
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 联合类型
  - 字面量类型
  - 判别联合
  - never
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Everyday Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Everyday%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 联合类型
      - 字面量类型
      - type alias
  - title: "TypeScript Handbook: Narrowing"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Narrowing.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 判别联合
      - never
      - 控制流收窄
stage: basics
level: beginner
estimatedMinutes: 50
prerequisites:
  - engineering.typescript.learn.basics.everyday-types
  - engineering.typescript.learn.basics.objects-arrays-tuples
objectives:
  - 解释联合类型未收窄时为什么只能使用成员共有的操作
  - 用 string、number 或 boolean 字面量建模有限状态
  - 用共同 discriminant 把对象联合收窄到具体分支
  - 用 never 检查状态分支是否穷尽
recap:
  - 联合未收窄时只能使用成员共有能力，字面量可表达有限允许集合。
  - 判别联合把状态和值绑定，分支检查后才能访问专属字段。
  - never 穷尽检查让新增状态变成编译期反馈，不是运行时校验。
---

# 联合与字面量

## 一、为什么需要

状态值如果只是 string，拼写错误和不支持的状态都会进入系统。联合与字面量把允许的值写进合同；对象联合再通过共同字段表达不同状态，让每个分支只读取自己拥有的数据。

## 二、核心概念和最小模型

~~~~ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'failure'; message: string }

/** 抛出理论上不可到达的状态。 */
function assertNever(value: never): never {
  throw new Error(`未处理状态：${String(value)}`)
}

/** 返回请求状态对应的显示文本。 */
function describeState(state: RequestState): string {
  switch (state.status) {
    case 'idle':
      return '尚未开始'
    case 'loading':
      return '加载中'
    case 'success':
      return `得到 ${state.data.length} 项`
    case 'failure':
      return state.message
    default:
      return assertNever(state)
  }
}

describeState({ status: 'success', data: ['TypeScript'] })
~~~~

联合 `A | B` 描述“值来自 A 或 B”，所以未收窄时只能使用 A 与 B 的共同能力。字面量把允许集合缩小到具体值；判别联合让 status 等共同字段成为分支选择器。

## 三、知识点详解

### 1. 联合类型

**它是什么：** 联合类型使用 `|` 表示一个值可以属于多个候选类型，例如 `string | number`。

**它有什么用：** 它能准确描述函数确实支持的多种输入或状态，而不必退回 `any`。

**怎么使用：** 写出所有允许成员，并在执行成员专属操作前通过条件判断收窄。

~~~~ts
/** 把字符串或数字课程标识转换为文本。 */
function normalizeId(id: string | number): string {
  return typeof id === 'number' ? String(id) : id
}
~~~~

### 2. 字面量类型

**它是什么：** 字面量类型把值限制为某个具体字符串、数字或布尔值；多个字面量组成有限值集合。

**它有什么用：** 页面模式、请求方法和业务状态不再是任意 `string`，拼写错误会在编译期暴露。

**怎么使用：** 从业务真实允许的值建立 literal union，并让变量、参数或对象字段使用这个联合。

~~~~ts
type Mode = 'view' | 'edit'
let mode: Mode = 'view'
mode = 'edit'

export { mode }
~~~~

### 3. 判别联合

**它是什么：** 判别联合是一组对象联合，每个对象都包含同名但值不同的字面量字段，例如 `status`。

**它有什么用：** 它能让每个状态拥有自己的数据，并避免用大量可选字段组合出不合法状态。

**怎么使用：** 为每个分支定义共同判别字段，在 `if` 或 `switch` 中比较该字段后访问分支专属成员。

~~~~ts
type LoadState =
  | { status: 'loading' }
  | { status: 'success'; title: string }
  | { status: 'failure'; error: Error }

/** 根据加载状态返回可显示文本。 */
function getStateText(state: LoadState): string {
  if (state.status === 'success') return state.title
  if (state.status === 'failure') return state.error.message
  return '加载中'
}
~~~~

### 4. 穷尽检查

**它是什么：** 穷尽检查把所有已知分支排除后剩余的值赋给 `never`，证明没有遗漏成员。

**它有什么用：** 联合新增状态时，旧的 `switch` 会立即报错，提醒维护者补上处理逻辑。

**怎么使用：** 在 `switch` 的 `default` 分支调用接收 `never` 的函数，或直接把剩余值赋给 `never`。

~~~~ts
/** 报告没有被处理的联合成员。 */
function assertNever(value: never): never {
  throw new Error(`未处理状态：${String(value)}`)
}
~~~~

## 四、动手实践：用判别联合描述完整状态机

不要把所有字段都做成可选项。让每个状态只携带自己真正拥有的数据：

~~~~ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading'; startedAt: number }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string }

function messageOf(state: RequestState): string {
  switch (state.status) {
    case 'idle': return '尚未请求'
    case 'loading': return `开始于 ${state.startedAt}`
    case 'success': return `共 ${state.data.length} 条`
    case 'error': return state.message
  }
}
~~~~

新增 cancelled 分支并观察 switch 中的变化，再尝试让 idle 携带 data。通过这些改动体会“非法状态不可表示”比在运行时反复判断可选字段更可靠。
## 五、易错使用提示

:::pitfalls
### 把有限状态放宽成 string

**触发条件：** 把有限状态放宽成 string

**原因：** 普通 string 不能告诉调用方哪些状态真的被支持。

**后果：** 拼写错误只能到运行时或业务分支中才暴露。

**错误示例：**

~~~~ts
let status: string = 'publised'
~~~~

**正确写法：**

~~~~ts
let status: 'draft' | 'published' = 'published'
~~~~

**验证方式：** 对照正确写法验证结果。

### 未收窄就读取分支字段

**触发条件：** 未收窄就读取分支字段

**原因：** 联合值只保证成员共有字段，data 并不属于 loading 分支。

**后果：** 代码会产生属性不存在的诊断，或被迫加入不准确断言。

**错误示例：**

~~~~ts
type Result = { status: 'loading' } | { status: 'success'; data: string[] }
declare const result: Result
result.data.length
~~~~

**正确写法：**

~~~~ts
if (result.status === 'success') result.data.length
~~~~

**验证方式：** 对照正确写法验证结果。

### 用可选字段代替判别联合

**触发条件：** 用可选字段代替判别联合

**原因：** 把所有字段都写成可选会丢失“哪个状态拥有哪个数据”的关系。

**后果：** loading 也可能同时出现 data 和 error，分支合同变得模糊。

**错误示例：**

~~~~ts
interface Response {
  status: string
  data?: string[]
  error?: string
}
~~~~

**正确写法：**

~~~~ts
type Response =
  | { status: 'success'; data: string[] }
  | { status: 'failure'; error: string }
~~~~

**验证方式：** 对照正确写法验证结果。

### 新增状态却不更新分支

**触发条件：** 新增状态却不更新分支

**原因：** 联合增加成员后，旧 switch 可能仍然编译通过，除非显式做穷尽检查。

**后果：** 新状态落入默认路径，用户看不到正确结果。

**错误示例：**

~~~~ts
type Status = 'idle' | 'done'
/** 返回状态文本。 */
function label(status: Status): string {
  if (status === 'idle') return '未开始'
  return '完成'
}
~~~~

**正确写法：**

~~~~ts
type Status = 'idle' | 'done'
/** 只接受已经穷尽的状态。 */
function assertNever(value: never): never {
  throw new Error(String(value))
}
/** 返回状态文本并检查所有成员都已处理。 */
function label(status: Status): string {
  if (status === 'idle') return '未开始'
  if (status === 'done') return '完成'
  return assertNever(status)
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 联合描述值，不保证分支

**工作原理：** 联合只保留所有成员共有的事实。**实践建议：** 先写最小公共合同，再用检查取得分支证据。**使用边界：** 类型联合不会在运行时验证外部字符串。

### 字面量是协议的一部分

**工作原理：** literal type 可组合为有限集合，判别字段可收窄对象联合。**实践建议：** 网络消息和 UI 状态适合使用 discriminant。**使用边界：** 状态集合变化时必须同步更新生产者与消费者。

### never 是维护反馈

**工作原理：** 穷尽收窄后剩余类型为 never。**实践建议：** 把 never 放在边界函数中可以让新增状态触发编译反馈。**使用边界：** 它不能替代运行时对未知输入的校验。
:::

:::exercise
### 为课程任务建模有限状态

**要求：** 定义 todo、doing、done 三个状态，其中 done 才拥有 completedAt。写一个按 discriminant 返回文字的函数，再添加一个未声明状态的负例。

**完成标准：** 正例严格编译通过，负例产生 TS2322，并能说明为什么 completedAt 不应写成所有分支的可选字段。
:::

## 七、本节小结

用 literal union 写有限值，用 discriminant 连接状态和数据，用 never 守住穷尽分支。下一课“类型收窄”会把这些合同交给 typeof、in、instanceof 和 type predicate。

:::code-details{title="查看本节完整示例"}
~~~~ts
type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
type LoadState =
  | { status: 'idle' }
  | { status: 'loading'; requestId: string }
  | { status: 'success'; title: string }
  | { status: 'error'; message: string }

/** 在新增联合成员时让编译器指出未处理分支。 */
function assertNever(value: never): never {
  throw new Error(`未处理状态：${JSON.stringify(value)}`)
}

/** 根据判别字段安全读取各分支数据。 */
function renderState(state: LoadState): string {
  switch (state.status) {
    case 'idle':
      return '等待加载'
    case 'loading':
      return `加载中：${state.requestId}`
    case 'success':
      return `课程：${state.title}`
    case 'error':
      return `失败：${state.message}`
    default:
      return assertNever(state)
  }
}

const level: CourseLevel = 'advanced'
const state: LoadState = { status: 'success', title: '联合与字面量' }
console.log(level, renderState(state))
~~~~
:::
