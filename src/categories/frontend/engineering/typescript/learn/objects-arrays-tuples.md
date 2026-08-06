---
id: engineering.typescript.learn.basics.objects-arrays-tuples
type: lesson
title: 对象、数组与元组
summary: 用属性、修饰符、同类集合和固定位置合同准确描述数据形状
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 对象类型
  - 可选属性
  - readonly
  - 数组
  - 元组
  - tuple
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Object Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Object%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 属性类型
      - 可选属性
      - readonly 属性
      - 索引签名
      - 元组类型
  - title: "TypeScript Handbook: Everyday Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Everyday%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 对象类型
      - 数组类型
      - 类型别名
stage: basics
level: beginner
estimatedMinutes: 55
prerequisites:
  - engineering.typescript.learn.basics.everyday-types
objectives:
  - 用必需、可选和 readonly 属性描述对象合同
  - 根据元素是否同质选择数组或元组
  - 读懂结构类型检查对多余属性和可赋值性的基本影响
  - 通过正负 fixture 验证属性与元组位置约束
recap:
  - 必需、可选与 readonly 属性分别表达存在性和赋值边界。
  - 同质可变集合使用数组，长度与位置属于合同的少量值使用元组。
  - 结构兼容和新鲜对象字面量检查都不是运行时字段过滤。
---

# 对象、数组与元组

## 为什么需要

真实数据通常不是孤立 primitive，而是一组有名字或位置含义的值。对象适合用属性名表达业务角色，数组适合保存同类集合，元组适合表达长度和位置都属于合同的少量值。选错模型会让调用方只能靠约定猜测。

## 核心概念和最小模型

~~~~ts
interface LessonSummary {
  readonly id: string
  title: string
  description?: string
}

const lesson: LessonSummary = {
  id: 'objects-arrays-tuples',
  title: '对象、数组与元组',
}

const topics: string[] = ['object', 'array', 'tuple']
const progress: [completed: number, total: number] = [2, 8]

export { lesson, progress, topics }
~~~~

对象类型按成员检查结构：必需属性必须存在，可选属性可能缺失，readonly 阻止通过该属性位置重新赋值。数组的所有元素共享一个元素类型；元组除了每个位置的类型，还保存长度与位置顺序。

## 从数据形状到集合合同

:::steps
### 先列出稳定属性

把调用方必定需要的字段设为必需，把真实可能缺失的字段写成 `?`。不要因为构造对象暂时麻烦就把所有字段改成可选。

### 只保护需要稳定的入口

readonly 适合 ID、创建时间等不应被重新指向的属性。它是 TypeScript 的赋值检查，不会把嵌套对象自动变成深只读。

### 同类且可变长度时选择数组

课程标签、搜索结果和日志记录通常是 `T[]`。调用方按元素类型处理，不依赖固定位置。

### 位置本身有含义时选择元组

坐标、成对结果或固定协议片段可用元组。给元素加标签能提升可读性，但标签不会改变运行时数组结构。

### 在函数边界检查结构

TypeScript 主要比较值是否拥有目标所需成员，而不是要求它来自某个特定声明。下一课会把对象合同放进参数和返回值。
:::

## 配套编译 fixture

临时编译正例同时验证对象成员、字符串数组和带标签元组；负例颠倒元组两个位置，固定 TS2322。验证资产只在 `/tmp` 使用并在结束后删除。运行时两者都只是对象或数组，因此必须由 tsc 证明合同。

## 易错使用提示

:::pitfalls
### 把所有属性都声明为可选

**触发条件：** 把所有属性都声明为可选

**原因：** 可选属性表示值可能真实缺失，不是为了省掉创建对象时的必需字段。

**后果：** 每个读取点都要处理 undefined，核心业务合同反而不清楚。

**错误示例：**

~~~~ts
interface Lesson {
  id?: string
  title?: string
}
const lesson: Lesson = {}
~~~~

**正确写法：**

~~~~ts
interface Lesson {
  id: string
  title: string
  description?: string
}
const lesson: Lesson = { id: 'types', title: '对象类型' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 误以为 readonly 会冻结运行时对象

**触发条件：** 误以为 readonly 会冻结运行时对象

**原因：** readonly 只限制通过类型化属性重新赋值，不会调用 Object.freeze。

**后果：** 其他引用或运行时代码仍可能修改对象，嵌套成员也不会自动深只读。

**错误示例：**

~~~~ts
interface State { readonly config: { theme: string } }
const state: State = { config: { theme: 'light' } }
state.config.theme = 'dark' // 允许：config 的引用未改变
~~~~

**正确写法：**

~~~~ts
interface State { readonly config: { readonly theme: string } }
const state: State = { config: { theme: 'light' } }
// 需要运行时不可变时，再配合 Object.freeze 或不可变更新
~~~~

**验证方式：** 对照正确写法验证结果。

### 让普通数组代替固定协议元组

**触发条件：** 让普通数组代替固定协议元组

**原因：** 普通联合数组不保存位置与长度，读取结果始终是所有元素类型的联合。

**后果：** 调用方无法知道第一个和第二个位置各自代表什么。

**错误示例：**

~~~~ts
const progress: (number | string)[] = [2, '8 lessons']
const completed = progress[0]
// number | string；开启 noUncheckedIndexedAccess 时还包含 undefined
~~~~

**正确写法：**

~~~~ts
const progress: [completed: number, label: string] = [2, '8 lessons']
const completed = progress[0] // number
~~~~

**验证方式：** 对照正确写法验证结果。

### 颠倒元组位置

**触发条件：** 颠倒元组位置

**原因：** 元组按位置检查类型，即使每个候选值都出现在元组的其他位置也不能互换。

**后果：** 每个不匹配位置都会产生赋值诊断。

**错误示例：**

~~~~ts
const progress: [number, string] = ['2', 8]
~~~~

**正确写法：**

~~~~ts
const progress: [number, string] = [2, '8']
~~~~

**验证方式：** 对照正确写法验证结果。

### 把多余属性检查当成完整运行时过滤

**触发条件：** 把多余属性检查当成完整运行时过滤

**原因：** 新鲜对象字面量会检查未声明属性，但结构类型兼容并不承诺删除或禁止值上的其他成员。

**后果：** 把值赋给较窄类型后，多余运行时属性仍然存在。

**错误示例：**

~~~~ts
interface Named { name: string }
const source = { name: 'TypeScript', internalId: 7 }
const named: Named = source
// 错误假设：named 在运行时已经不含 internalId
~~~~

**正确写法：**

~~~~ts
interface Named { name: string }
const source = { name: 'TypeScript', internalId: 7 }
const named: Named = { name: source.name }
// 需要过滤时，显式构造新对象
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 原理与适用场景

:::steps
### 对象按所需成员比较

官方事实：对象类型描述属性及其类型，赋值关注目标要求的结构。课程推导：让接口围绕调用方真正需要的成员，而不是复制整个来源对象。边界：新鲜对象字面量的多余属性检查不等同于运行时过滤或严格名义类型。

### 修饰符只表达对应层级的合同

官方事实：可选属性读取时可能为 undefined，readonly 属性不能通过该属性重新赋值。课程推导：分别用它们表达缺失与稳定引用。边界：readonly 不提供深冻结，也不改变 JavaScript 对象。

### 数组与元组共享运行时载体

官方事实：元组是知道元素数量和位置类型的数组类型。课程推导：固定协议用元组，普通集合用数组。边界：标签与位置类型会被擦除；运行时验证仍需检查数组长度与元素。
:::

:::exercise
### 为课程目录设计两种集合

**要求：** 定义 LessonSummary 对象、LessonSummary[] 搜索结果，以及 `[current, total]` 进度元组。分别写一个缺少必需 title 和一个颠倒元组位置的负例。

**验收：** 正例严格编译通过；两个负例产生类型诊断；能解释为什么搜索结果不用元组、进度不用普通 number[]。
:::

## 总结与下一课

对象用成员名表达形状，数组表达同类集合，元组表达固定位置协议；可选与 readonly 只承担各自明确的合同。下一课“函数类型”会让这些数据模型通过参数、返回值和回调连接起来。
