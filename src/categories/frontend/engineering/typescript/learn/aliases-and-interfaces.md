---
id: engineering.typescript.learn.basics.aliases-and-interfaces
type: lesson
title: type 与 interface
summary: 根据命名、组合、扩展和声明合并需求选择对象合同
domain: frontend
technology: engineering
module: typescript
related:
  - vue.core.learn.basics.props
tags:
  - TypeScript
  - type alias
  - interface
  - extends
  - intersection
  - 声明合并
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Everyday Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Everyday%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - type alias
      - interface
      - 两者差异
  - title: "TypeScript Handbook: Object Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Object%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - interface extends
      - intersection
      - 结构类型
  - title: "TypeScript Reference: Declaration Merging"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/reference/Declaration%20Merging.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - interface 声明合并
stage: basics
level: beginner
estimatedMinutes: 55
prerequisites:
  - engineering.typescript.learn.basics.objects-arrays-tuples
  - engineering.typescript.learn.basics.functions
  - engineering.typescript.learn.basics.unions-and-literals
  - engineering.typescript.learn.basics.narrowing
objectives:
  - 用 type alias 与 interface 为重复对象形状命名
  - 根据 union、tuple、extends 与声明合并需求选择语法
  - 解释普通对象为什么按结构而不是声明名称兼容
  - 避免把个人偏好包装成两种语法的绝对规则
recap:
  - type 可命名任意类型表达式，interface 专注可扩展的对象合同。
  - 同名 interface 可以声明合并，同名 type alias 会产生重复标识符诊断。
  - 选择语法应依据 union、组合与开放扩展需求，而不是绝对风格口号。
---

# type 与 interface

## 一、为什么需要

对象形状在参数、返回值和状态中重复出现时，需要稳定名称。type 和 interface 有大量重叠能力，但它们并非同一个语法：alias 能命名任意类型，interface 专注对象并允许扩展和声明合并。

## 二、核心概念和最小模型

~~~~ts
interface Lesson {
  id: string
  title: string
}

interface TimedLesson extends Lesson {
  minutes: number
}

type LessonStatus = 'draft' | 'published'
type LessonCard = TimedLesson & { status: LessonStatus }

const card: LessonCard = {
  id: 'aliases-and-interfaces',
  title: 'type 与 interface',
  minutes: 55,
  status: 'published',
}
~~~~

interface 与对象 type alias 都能描述属性和调用签名。区别应从合同需要出发：union、primitive 或 tuple 只能由 type 命名；需要开放扩展或声明合并的对象适合 interface。

## 三、知识点详解

### 1. type alias

**它是什么：** `type` 为任意类型表达式建立名称，可以命名对象、联合、交叉、元组或 primitive。

**它有什么用：** 它适合把复杂表达式收进可读名称，并在一个位置定义封闭的类型组合。

**怎么使用：** 在 `=` 右侧写出完整类型表达式；需要联合或元组时直接选择 alias。

~~~~ts
type CourseId = string
type CourseStatus = 'draft' | 'published'
type Progress = [completed: number, total: number]
~~~~

### 2. interface

**它是什么：** `interface` 专门描述对象、函数或 class 实例的结构，可以通过 `extends` 继续扩展。

**它有什么用：** 它适合稳定对象合同和明确的扩展点，尤其是类实现、库声明和模块增强场景。

**怎么使用：** 在接口体中列出对象成员，通过 `extends` 复用另一个对象合同。

~~~~ts
interface ContentItem {
  id: string
}

interface Course extends ContentItem {
  title: string
}
~~~~

### 3. 声明合并

**它是什么：** 同名 `interface` 声明会合并成员；同名 `type` 不能再次声明。

**它有什么用：** 声明合并用于框架或库预留的开放扩展点，使不同声明文件能补充同一个对象合同。

**怎么使用：** 只在确实需要开放扩展时使用同名 interface；普通业务模型优先保持单一声明来源。

~~~~ts
interface CourseContext {
  locale: string
}

interface CourseContext {
  readonly version: string
}

const context: CourseContext = {
  locale: 'zh-CN',
  version: '7.0.2',
}

export { context }
~~~~

### 4. 结构类型兼容

**它是什么：** TypeScript 主要根据值是否拥有目标要求的成员判断对象兼容，而不是比较类型名称。

**它有什么用：** 不同模块或不同声明创建的对象可以共享最小能力合同，不必继承同一个 class。

**怎么使用：** 让参数只要求实际会读取的成员，任何满足这些成员的对象都可以传入。

~~~~ts
/** 读取任何带有标题的对象。 */
function readTitle(value: { title: string }): string {
  return value.title
}

const course = { id: 'interfaces', title: '接口' }
readTitle(course)
~~~~

## 四、动手实践：为课程数据建立可扩展合同

先用 type alias 表达有限状态和值的组合，再用 interface 描述允许第三方扩展的对象合同。把下面代码放入项目源码，编辑器会立即提示每个分支允许访问的字段。

~~~~ts
type CourseStatus = 'draft' | 'published'
type CourseId = string | number

interface Course {
  id: CourseId
  title: string
  status: CourseStatus
}

interface Course {
  updatedAt: Date
}

const course: Course = {
  id: 1,
  title: 'TypeScript 入门',
  status: 'draft',
  updatedAt: new Date(),
}
~~~~

运行 `npx tsc --noEmit`。随后把 `status` 改成未声明的字符串，再尝试用同名 type 重复声明，观察“值不在联合中”和“重复标识符”这两类错误。最后恢复代码，并说明为什么开放对象合同适合 interface、有限状态适合 type。
## 五、易错使用提示

:::pitfalls
### 用 interface 命名联合

**触发条件：** 用 interface 命名联合

**原因：** interface 声明对象形状，不能直接等同于一组 primitive 或对象 union。

**后果：** 语法无法表达目标，或被迫创建无意义包装对象。

**错误示例：**

~~~~ts
interface Status = 'draft' | 'published'
~~~~

**正确写法：**

~~~~ts
type Status = 'draft' | 'published'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 type alias 当作可重开声明

**触发条件：** 把 type alias 当作可重开声明

**原因：** 同名 type alias 不会合并，而会触发重复标识符诊断。

**后果：** 原本想扩展合同的代码无法编译。

**错误示例：**

~~~~ts
type Preferences = { theme: string }
type Preferences = { locale: string }
~~~~

**正确写法：**

~~~~ts
interface Preferences { theme: string }
interface Preferences { locale: string }
~~~~

**验证方式：** 对照正确写法验证结果。

### 用交叉类型隐藏冲突成员

**触发条件：** 用交叉类型隐藏冲突成员

**原因：** 交叉对象中同名属性若不兼容，结果可能收窄为 never，而不是选择其中一个。

**后果：** 生成看似存在却无法构造的属性合同。

**错误示例：**

~~~~ts
type Left = { id: string }
type Right = { id: number }
type Broken = Left & Right
~~~~

**正确写法：**

~~~~ts
interface Base { id: string }
interface Extended extends Base { title: string }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把语法偏好当成绝对规则

**触发条件：** 把语法偏好当成绝对规则

**原因：** 两者大量重叠，选择应由合同是否开放、是否需要非对象类型决定。

**后果：** 团队为统一口号增加转换代码，却没有改善类型能力。

**错误示例：**

~~~~ts
// 所有对象都必须用 type，不允许例外
~~~~

**正确写法：**

~~~~ts
// 开放扩展的对象用 interface；封闭 union 与组合用 type
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 普通对象采用结构类型

**工作原理：** 对象兼容主要由所需成员决定。**实践建议：** 参数接受最小能力合同，不强制调用方构造特定声明名。**使用边界：** private/protected 成员和 class 仍有额外兼容规则，将在中级课程展开。

### alias 命名完整类型表达式

**工作原理：** type 可命名对象之外的 union、primitive 与 tuple。**实践建议：** 封闭状态与组合类型优先使用 alias。**使用边界：** alias 不能靠同名声明继续扩展。

### interface 提供开放扩展点

**工作原理：** 同名 interface 成员会合并。**实践建议：** 只在明确需要宿主或库扩展时利用它。**使用边界：** 意外同名也会改变合同，因此应用内部默认保持命名清晰。
:::

:::exercise
### 设计可扩展课程卡片合同

**要求：** 用 interface 声明基础卡片并通过 extends 增加时长；用 type 声明 draft/published union，再组合出最终卡片。最后写一个同名 type alias 负例。

**完成标准：** 正例严格编译通过，负例产生 TS2300，并能解释哪些部分需要开放扩展、哪些应保持封闭。
:::

## 七、本节小结

type 和 interface 是不同能力的重叠工具，不是新旧替代关系。下一课“模块”会把对象和类型合同放进文件边界，并区分值导入与类型导入。Vue Props 已作为真实关联上线，可观察组件输入合同如何复用对象类型。

:::code-details{title="查看本节完整示例"}
~~~~ts
type CourseId = string & { readonly __brand: 'CourseId' }
type CourseLevel = 'beginner' | 'advanced'
type CourseLabel = string | { text: string; color: string }

interface CourseCard {
  id: CourseId
  title: string
  level: CourseLevel
  label?: CourseLabel
}

interface CourseCard {
  published: boolean
}

interface FeaturedCourseCard extends CourseCard {
  featuredAt: Date
}

const source = {
  id: 'ts-basics' as CourseId,
  title: 'TypeScript 基础',
  level: 'beginner' as const,
  published: true,
  featuredAt: new Date(),
  author: '课程组',
}

const card: CourseCard = source
const featured: FeaturedCourseCard = source
console.log(card.title, featured.featuredAt)
~~~~
:::
