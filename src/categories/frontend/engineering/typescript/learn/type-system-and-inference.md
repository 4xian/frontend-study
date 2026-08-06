---
id: engineering.typescript.learn.basics.type-system-and-inference
type: lesson
title: 类型系统与推导
summary: 区分源码、类型检查和运行结果，并判断何时依赖推导、何时补充注解
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 类型系统
  - 类型推导
  - 类型注解
  - 类型擦除
  - tsc
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: The Basics"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Basics.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 静态类型检查
      - 类型注解会被擦除
      - 类型检查不改变 JavaScript 运行行为
  - title: "TypeScript Reference: Type Inference"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/reference/Type%20Inference.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 初始化推导
      - 最佳公共类型
      - 上下文类型
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites: []
objectives:
  - 解释 TypeScript 在 JavaScript 运行前检查哪些信息，以及哪些信息不会保留到运行时
  - 根据初始化表达式和使用上下文读出编译器推导的类型
  - 在推导已经准确时省略重复注解，在需要稳定公共合同时写出注解
  - 用本地 tsc fixture 区分可编译代码与真实类型错误
recap:
  - TypeScript 在执行前检查 JavaScript，但不会自动验证运行时外部数据。
  - 局部值优先依赖准确推导，公共边界和额外意图再使用显式注解。
  - 类型注解会被擦除，编译诊断与运行行为需要不同的验证载体。
---

# 类型系统与推导

## 为什么需要

JavaScript 允许同一个变量在运行中装入不同形状的值，很多错误要到具体分支执行时才暴露。TypeScript 在执行前分析源码，把不一致的赋值、参数和属性访问变成诊断；它不会替你运行程序，也不会自动验证网络或存储中的外部数据。

## 核心概念和最小模型

~~~~ts
const course = 'TypeScript' // 推导为字符串字面量 "TypeScript"
let completed = 1 // 推导为 number

completed += 1
// completed = '2' // TS2322：string 不能赋给 number

const label: string = `${course}：${completed}`
export { label }
~~~~

可以把流程分成三层：源码提供值和约束，类型检查器建立并比较类型，运行时只执行生成的 JavaScript。注解属于检查层；在通常的编译输出中，变量上的 `: string` 等类型语法会被移除。

## 从推导到公共合同

:::steps
### 先读取初始化推导

查看变量的初始值：`let count = 1` 给后续赋值建立 number 约束。不要为了“看起来像 TypeScript”重复写 `let count: number = 1`。

### 再读取上下文类型

回调参数可以从接收它的函数获得类型。上下文已经明确时，让编译器保留输入输出关系通常比手写一个更宽的类型准确。

### 在边界写出意图

导出的函数、共享对象或尚无初始值的变量需要稳定合同。此时注解用于限制未来实现，而不是修饰已经显然的局部值。

### 把外部数据留在运行时验证

JSON、表单和接口响应不因注解变得可信。先把它们视为 unknown，再通过运行检查建立类型证据。
:::

## 配套编译验证

需要复验时，在 `/tmp` 的一次性目录分别创建可编译正例与预期 TS2322 的负例，使用本地 TypeScript 6.0.3 和 `--strict --noEmit --ignoreConfig` 检查。这样不会读取应用 tsconfig 或生成课程产物；验证结束后删除临时目录，仓库不保留 fixture。

## 易错使用提示

:::pitfalls
### 把类型注解当成运行时校验

**触发条件：** 把类型注解当成运行时校验

**原因：** 注解只参与静态检查，无法证明 JSON 解析结果真的包含声明的字段。类型断言同样不会插入校验。

**后果：** 不可信数据一旦缺字段，代码仍会在运行时访问 undefined 并失败。

**错误示例：**

~~~~ts
type Course = { minutes: number }
const course = JSON.parse('{"title":"TS"}') as Course
course.minutes.toFixed()
~~~~

**正确写法：**

~~~~ts
type Course = { minutes: number }

/** 判断外部值是否具有课程所需的最小形状。 */
function isCourse(value: unknown): value is Course {
  return typeof value === 'object' && value !== null &&
    'minutes' in value && typeof value.minutes === 'number'
}

const value: unknown = JSON.parse('{"title":"TS"}')
if (isCourse(value)) value.minutes.toFixed()
~~~~

**验证方式：** 对照正确写法验证结果。

### 在局部变量上重复显然注解

**触发条件：** 在局部变量上重复显然注解

**原因：** 初始化值已经给出准确类型时，重复注解没有增加约束，反而增加维护噪音。

**后果：** 代码更长，却没有更早发现新的错误。

**错误示例：**

~~~~ts
const title: string = '类型推导'
const minutes: number = 45
const published: boolean = true
~~~~

**正确写法：**

~~~~ts
const title = '类型推导'
const minutes = 45
const published = true
~~~~

**验证方式：** 对照正确写法验证结果。

### 改变变量最初推导出的类型

**触发条件：** 改变变量最初推导出的类型

**原因：** let 允许重新赋值，但不意味着后续值可以跨越已经推导出的类型。

**后果：** 把 number 写入最初为 string 的变量会触发 TS2322。

**错误示例：**

~~~~ts
let status = 'draft'
status = 1
~~~~

**正确写法：**

~~~~ts
let status: 'draft' | 'published' = 'draft'
status = 'published'
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 any 消除未知值的检查

**触发条件：** 用 any 消除未知值的检查

**原因：** any 会允许属性访问和调用继续传播，编译器不再帮助验证这些操作。

**后果：** 拼写或数据形状错误会延后到运行时。

**错误示例：**

~~~~ts
const payload: any = JSON.parse('{}')
payload.course.titel.toUpperCase()
~~~~

**正确写法：**

~~~~ts
const payload: unknown = JSON.parse('{}')
if (typeof payload === 'object' && payload !== null && 'course' in payload) {
  // 继续验证 course 的形状后再读取
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把类型名称当成运行时值

**触发条件：** 把类型名称当成运行时值

**原因：** type 和 interface 只存在于检查阶段，不能传给 instanceof 或在运行时读取。

**后果：** 代码会产生“仅表示类型，但在此处却作为值使用”的诊断。

**错误示例：**

~~~~ts
type Course = { title: string }
declare const value: unknown
if (value instanceof Course) console.log(value.title)
~~~~

**正确写法：**

~~~~ts
class Course {
  /** 保存课程标题。 */
  constructor(readonly title: string) {}
}
declare const value: unknown
if (value instanceof Course) console.log(value.title)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 原理与适用场景

:::steps
### 静态检查与运行时分工

官方事实：TypeScript 在执行前检查程序，类型注解会从输出中移除。课程推导：用类型表达代码内部合同，用运行校验处理外部数据。边界：类型正确不代表业务逻辑或网络结果正确。

### 推导优先但不取代设计

官方事实：编译器会使用初始化值、候选类型和上下文推导类型。课程推导：局部实现优先依赖推导，公共边界显式表达意图。边界：推导描述当前代码，不会猜测未来允许的状态集合。

### 诊断是反馈而不是运行证明

官方事实：不兼容类型会产生编译诊断，但 TypeScript 不能替代运行测试。课程推导：用 negative fixture 锁关键诊断，用运行测试验证行为。边界：不同编译器版本的完整诊断文字可能变化，所以这里只固定诊断码。
:::

:::exercise
### 用推导修正一组状态变量

**要求：** 复制本课 positive fixture，新增一个由初始化值推导的变量和一个显式联合类型变量；随后尝试写入非法值，记录 tsc 诊断码，再修正代码。

**验收：** 最终正例以 `--strict --noEmit` 编译成功，并能解释哪一个类型来自推导、哪一个注解表达了额外意图。
:::

## 总结与下一课

先区分检查期与运行期，再决定推导和注解的分工。下一课“常用类型”会把这套判断用于 primitive、数组、unknown、never、null 与 undefined。TypeScript Reference 将在 TA 批次上线后从课程末尾提供真实链接。
