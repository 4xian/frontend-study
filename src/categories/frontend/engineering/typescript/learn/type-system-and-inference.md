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
appliesTo: TypeScript 7.0.2
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
  - 用 tsc 正反例区分可编译代码与真实类型错误
recap:
  - TypeScript 在执行前检查 JavaScript，但不会自动验证运行时外部数据。
  - 局部值优先依赖准确推导，公共边界和额外意图再使用显式注解。
  - 类型注解会被擦除，编译诊断与运行行为需要不同的验证载体。
---

# 类型系统与推导

## 一、为什么需要

JavaScript 允许同一个变量在运行中装入不同形状的值，很多错误要到具体分支执行时才暴露。TypeScript 在执行前分析源码，把不一致的赋值、参数和属性访问变成诊断；它不会替你运行程序，也不会自动验证网络或存储中的外部数据。

## 二、核心概念和最小模型

~~~~ts
const course = 'TypeScript' // 推导为字符串字面量 "TypeScript"
let completed = 1 // 推导为 number

completed += 1
// completed = '2' // TS2322：string 不能赋给 number

const label: string = `${course}：${completed}`
export { label }
~~~~

可以把流程分成三层：源码提供值和约束，类型检查器建立并比较类型，运行时只执行生成的 JavaScript。注解属于检查层；在通常的编译输出中，变量上的 `: string` 等类型语法会被移除。

## 三、知识点详解

### 1. 类型推导

**它是什么：** 类型推导是编译器根据初始值自动计算变量类型的能力。`let count = 1` 会被推导为
`number`，之后再赋字符串就会报错。

**它有什么用：** 它能减少重复注解，同时让类型随着真实表达式保持准确。局部变量、函数内部计算结果和
简单返回值通常优先使用推导。

**怎么使用：** 先写出真实初始值，再把鼠标移到变量上查看推导结果；只有推导结果比业务合同更宽或更窄时
才补注解。

~~~~ts
let completed = 0
completed += 1

const course = {
  id: 'typescript',
  title: 'TypeScript',
}
~~~~

### 2. 上下文类型

**它是什么：** 上下文类型是表达式从所在位置反向获得的类型。回调参数即使没有手写注解，也能从
`map`、事件处理器或函数参数合同中获得类型。

**它有什么用：** 它能让回调与调用方保持同一个类型来源，避免重复写出更宽或不一致的参数类型。

**怎么使用：** 先给接收回调的数组或函数建立准确类型，再直接编写箭头函数；编译器会推导回调参数和返回值。

~~~~ts
const lessonMinutes: number[] = [35, 40, 50]
const labels = lessonMinutes.map((minutes) => `${minutes} 分钟`)
~~~~

### 3. 类型注解

**它是什么：** 类型注解是开发者显式写出的合同，例如参数后的 `: string` 和函数后的 `: Course`。

**它有什么用：** 注解适合约束导出函数、公共对象、空数组或尚无初始值的变量，使未来实现不能悄悄改变
公共边界。

**怎么使用：** 把注解写在模块边界和函数边界上，局部值仍然交给推导；这样合同清楚但不会充斥重复类型。

~~~~ts
interface Course {
  id: string
  title: string
}

/** 根据课程标识创建公共课程数据。 */
export function createCourse(id: string): Course {
  return { id, title: 'TypeScript' }
}
~~~~

### 4. 静态类型与运行时数据

**它是什么：** TypeScript 类型只在编译期检查代码，编译后不会自动验证 JSON、表单或接口响应。

**它有什么用：** 分清静态检查与运行时验证，可以避免把类型断言误当成数据校验。外部值应先保持为
`unknown`，检查后再进入业务类型。

**怎么使用：** 为外部数据编写运行时判断，并让判断结果成为类型证据；不要直接使用 `as Course` 跳过检查。

~~~~ts
/** 判断未知值是否包含可用的课程标题。 */
function hasTitle(value: unknown): value is { title: string } {
  return typeof value === 'object' && value !== null && 'title' in value
}

const payload: unknown = JSON.parse('{"title":"类型推导"}')
const title = hasTitle(payload) ? payload.title : '未命名课程'
~~~~

## 四、从零准备 TypeScript 项目

创建目录并安装 TypeScript，然后初始化严格配置：

~~~~sh
npm init -y
npm install --save-dev typescript@7.0.2
npx tsc --init
~~~~

把 tsconfig.json 收敛为适合学习的最小配置：

~~~~json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

在 src/index.ts 中先让编译器推导变量，再为公共函数写明确合同：

~~~~ts
const courseName = 'TypeScript 基础'

function formatProgress(completed: number, total: number): string {
  return `${completed}/${total}`
}

console.log(courseName, formatProgress(1, 24))
~~~~

运行 `npx tsc`。把 completed 改成字符串观察错误，再恢复为 number；这就是后续每一课都可以复用的最小反馈循环。
## 五、易错使用提示

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

## 六、工作原理与适用边界

:::steps
### 静态检查与运行时分工

**工作原理：** TypeScript 在执行前检查程序，类型注解会从输出中移除。**实践建议：** 用类型表达代码内部合同，用运行校验处理外部数据。**使用边界：** 类型正确不代表业务逻辑或网络结果正确。

### 推导优先但不取代设计

**工作原理：** 编译器会使用初始化值、候选类型和上下文推导类型。**实践建议：** 局部实现优先依赖推导，公共边界显式表达意图。**使用边界：** 推导描述当前代码，不会猜测未来允许的状态集合。

### 诊断是反馈而不是运行证明

**工作原理：** 不兼容类型会产生编译诊断，但 TypeScript 不能替代运行测试。**实践建议：** 用负例锁定关键诊断，用运行测试验证行为。**使用边界：** 不同编译器版本的完整诊断文字可能变化，所以这里只固定诊断码。
:::

:::exercise
### 用推导修正一组状态变量

**要求：** 复制本课正例，新增一个由初始化值推导的变量和一个显式联合类型变量；随后尝试写入非法值，记录 tsc 诊断码，再修正代码。

**完成标准：** 最终正例以 `--strict --noEmit` 编译成功，并能解释哪一个类型来自推导、哪一个注解表达了额外意图。
:::

## 七、本节小结

先区分检查期与运行期，再决定推导和注解的分工。下一课“常用类型”会把这套判断用于 primitive、数组、unknown、never、null 与 undefined；对应语言与类型主题可在 TypeScript Reference 中独立查阅。

:::code-details{title="查看本节完整配置"}
~~~~text
// 1. 创建项目并安装教程版本
npm init -y
npm install -D typescript@7.0.2

// 2. tsconfig.json：开启严格检查并声明输入边界
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}

// 3. src/index.ts
interface CourseInput { id: string; duration: number }

const courseTitle = '类型系统与推导' // 推导为 string
const lessonDurations = [12, 18, 15] // 推导为 number[]
const formatDuration: (minutes: number) => string = (minutes) => `${minutes} 分钟`

/** 在运行时验证外部数据，再交给静态合同。 */
function parseCourse(value: unknown): CourseInput {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !('duration' in value) ||
    typeof value.duration !== 'number'
  ) {
    throw new Error('课程数据无效')
  }
  return { id: value.id, duration: value.duration }
}

const course = parseCourse({ id: 'inference', duration: 45 })
console.log(courseTitle, lessonDurations.map(formatDuration), course)

// 4. 执行静态检查
npx tsc
~~~~
:::
