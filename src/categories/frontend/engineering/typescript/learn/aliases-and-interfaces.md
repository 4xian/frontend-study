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
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
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

## 为什么需要

对象形状在参数、返回值和状态中重复出现时，需要稳定名称。type 和 interface 有大量重叠能力，但它们并非同一个语法：alias 能命名任意类型，interface 专注对象并允许扩展和声明合并。

## 核心概念和最小模型

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

## 按合同能力选择

:::steps
### 先判断是否一定是对象

若合同可能是 union、primitive、tuple 或条件类型，直接使用 type；纯对象可继续比较扩展需求。

### 封闭组合使用 alias

intersection 与 union 适合在一个位置组合完整合同，不允许其他文件用同名声明悄悄扩展。

### 开放对象使用 interface

库扩展点、宿主声明和模块 augmentation 需要声明合并时，interface 的可重开行为是明确能力。

### 用结构验证兼容性

普通对象只要拥有所需成员即可赋值；不要假设必须由同名 class 或 constructor 创建。
:::

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

## 配套编译 fixture

临时编译正例验证 alias union、interface extends 和声明合并；负例用同名 type alias 尝试重开，固定 TS2300。验证资产只在 `/tmp` 使用并在结束后删除。声明合并是编译器行为，不由页面展示代替。

## 易错使用提示

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

## 原理与适用场景

:::steps
### 普通对象采用结构类型

官方事实：对象兼容主要由所需成员决定。课程推导：参数接受最小能力合同，不强制调用方构造特定声明名。边界：private/protected 成员和 class 仍有额外兼容规则，将在中级课程展开。

### alias 命名完整类型表达式

官方事实：type 可命名对象之外的 union、primitive 与 tuple。课程推导：封闭状态与组合类型优先使用 alias。边界：alias 不能靠同名声明继续扩展。

### interface 提供开放扩展点

官方事实：同名 interface 成员会合并。课程推导：只在明确需要宿主或库扩展时利用它。边界：意外同名也会改变合同，因此应用内部默认保持命名清晰。
:::

:::exercise
### 设计可扩展课程卡片合同

**要求：** 用 interface 声明基础卡片并通过 extends 增加时长；用 type 声明 draft/published union，再组合出最终卡片。最后写一个同名 type alias 负例。

**验收：** 正例严格编译通过，负例产生 TS2300，并能解释哪些部分需要开放扩展、哪些应保持封闭。
:::

## 总结与下一课

type 和 interface 是不同能力的重叠工具，不是新旧替代关系。下一课“模块”会把对象和类型合同放进文件边界，并区分值导入与类型导入。Vue Props 已作为真实关联上线，可观察组件输入合同如何复用对象类型。
