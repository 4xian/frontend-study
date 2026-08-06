---
id: engineering.typescript.learn.intermediate.mapped-types
type: lesson
title: 映射类型
summary: 遍历对象键，系统变换属性修饰符、值类型和公开键名
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 映射类型
  - keyof
  - 修饰符
  - 键重映射
  - as
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Mapped Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Mapped%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 键迭代
      - 映射修饰符
      - 键重映射
      - never 过滤键
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.intermediate.keyof-typeof-indexed-access
objectives:
  - 用 Property in keyof Type 遍历对象合同的键
  - 用 Type[Property] 保留每个属性原有的值类型
  - 用 +、- 调整 readonly 与可选修饰符
  - 用 as 子句完成有限键重映射并识别 never 过滤边界
recap:
  - 映射类型遍历 keyof 结果，并用 Type[Property] 保留键和值关系。
  - readonly 与 ? 可用加号添加、用减号移除，省略前缀等同于添加。
  - as 支持键重映射与 never 过滤，但应服务清晰、有限的类型协议。
---

# 映射类型

## 为什么需要

当同一对象需要草稿、只读视图或 getter 合同时，逐个复制属性会产生多个容易漂移的类型。映射类型遍历源对象的键，并为每个键统一计算修饰符、名称和值类型。

## 核心概念和最小模型

~~~~ts
interface CourseDraft {
  readonly id?: string
  readonly title?: string
  readonly minutes?: number
}

type CompleteMutable<Type> = {
  -readonly [Property in keyof Type]-?: Type[Property]
}

type Course = CompleteMutable<CourseDraft>

const course: Course = {
  id: 'mapped-types',
  title: '映射类型',
  minutes: 60,
}
~~~~

`Property in keyof Type` 逐个遍历源键，`Type[Property]` 取得当前属性类型。`-readonly` 移除只读修饰符，`-?` 移除可选修饰符，因此结果要求三个可写且必填的属性。

## 从属性变换到键重映射

:::steps
### 确定唯一源合同

让映射类型从既有对象类型派生，不再手写第二份属性列表。

### 逐键计算值类型

使用 Type[Property] 保留每个键自己的值类型，而不是把所有属性统一扩大。

### 显式调整修饰符

省略前缀等同于添加修饰符；需要删除 readonly 或 ? 时使用减号。

### 只在公开协议需要时改名

as 子句可生成新键，也可映射为 never 过滤键；简单模板字面量只服务有限命名协议。
:::

~~~~ts
type Getters<Type> = {
  [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
}

type CourseGetters = Getters<Course>

/** 返回课程 ID。 */
function getId(): string {
  return course.id
}

/** 返回课程标题。 */
function getTitle(): string {
  return course.title
}

/** 返回课程时长。 */
function getMinutes(): number {
  return course.minutes
}

const getters: CourseGetters = {
  getId,
  getTitle,
  getMinutes,
}

export { getters }
~~~~

## 配套编译 fixture

临时编译正例验证 `-readonly`、`-?` 和 as 键重映射；负例遗漏由 `-?` 变成必填的属性，固定 TS2741。验证资产只在 `/tmp` 使用并在结束后删除。

## 易错使用提示

:::pitfalls
### 复制属性列表代替派生

**触发条件：** 复制属性列表代替派生

**原因：** 手写第二个对象类型不会随源合同自动变化。

**后果：** 新增或修改源属性后，派生合同悄悄过期。

**错误示例：**

~~~~ts
type CourseView = { id: string; title: string }
~~~~

**正确写法：**

~~~~ts
type CourseView<Type> = {
  readonly [Property in keyof Type]: Type[Property]
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 忘记减号才是移除修饰符

**触发条件：** 忘记减号才是移除修饰符

**原因：** 直接写 readonly 或 ? 会添加修饰符，省略加号也不会改变这个方向。

**后果：** 结果比目标更只读或更宽松。

**错误示例：**

~~~~ts
type Required<Type> = { [Key in keyof Type]?: Type[Key] }
~~~~

**正确写法：**

~~~~ts
type Required<Type> = { [Key in keyof Type]-?: Type[Key] }
~~~~

**验证方式：** 对照正确写法验证结果。

### 给所有属性统一错误值类型

**触发条件：** 给所有属性统一错误值类型

**原因：** 映射键时仍需通过 Type[Property] 读取当前属性，而不是使用整个 Type。

**后果：** 每个属性都被扩大成完整对象，键和值关系丢失。

**错误示例：**

~~~~ts
type Copy<Type> = { [Key in keyof Type]: Type }
~~~~

**正确写法：**

~~~~ts
type Copy<Type> = { [Key in keyof Type]: Type[Key] }
~~~~

**验证方式：** 对照正确写法验证结果。

### 无边界地生成新键

**触发条件：** 无边界地生成新键

**原因：** 键重映射是类型层协议，不应为了展示技巧制造难读的组合名称。

**后果：** 错误信息和调用面膨胀，源对象与公开协议更难对应。

**错误示例：**

~~~~ts
// 为每个属性同时生成多组嵌套事件名
~~~~

**正确写法：**

~~~~ts
// 只为稳定的 getter 协议生成一次键名
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 原理与适用场景

:::steps
### 映射类型遍历键联合

官方事实：映射类型以 Property in keyof Type 遍历键。课程推导：从一个源合同生成一致派生合同。边界：它只变换静态类型，不创建运行对象。

### 修饰符可添加或移除

官方事实：readonly 与 ? 支持 + 和 -。课程推导：用显式减号表达从草稿到完整对象的阶段变化。边界：移除可选不会提供运行时默认值。

### as 改变输出键

官方事实：as 可重映射键，never 可过滤键。课程推导：只为稳定、有限的命名协议使用键重映射。边界：复杂模板组合留到后续课程。
:::

:::exercise
### 从草稿合同生成完整课程

**要求：** 声明含 readonly 可选属性的草稿类型，用映射类型生成可写必填版本，再用 as 生成 getter 合同；保留缺少属性的负例。

**验收：** 完整对象和 getter 严格编译通过，缺少必填属性产生 TS2741。
:::

## 总结与下一课

映射类型从一个源合同批量计算属性、修饰符与公开键名。下一课会加入类型层分支，让派生结果根据输入类型选择不同合同。
