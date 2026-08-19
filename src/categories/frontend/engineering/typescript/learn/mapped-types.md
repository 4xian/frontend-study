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
appliesTo: TypeScript 7.0.2
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

## 一、为什么需要

当同一对象需要草稿、只读视图或 getter 合同时，逐个复制属性会产生多个容易漂移的类型。映射类型遍历源对象的键，并为每个键统一计算修饰符、名称和值类型。

## 二、核心概念和最小模型

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

## 三、知识点详解

### 1. 映射类型基本语法

**它是什么：** 映射类型使用 `[Property in keyof Type]` 遍历对象的键，并为每个键生成一个新属性。

**它有什么用：** 可以从唯一源合同派生表单状态、读取器或更新对象，避免复制整份属性列表。

**怎么使用：** 先取得键联合，再在属性值位置使用 `Type[Property]` 保留每个键自己的类型。

~~~~ts
type Course = {
  id: string
  title: string
  minutes: number
}

type CourseFlags = {
  [Property in keyof Course]: boolean
}
~~~~

### 2. 属性值变换

**它是什么：** 映射类型右侧会针对当前键计算新值类型，可以包装、替换或组合原属性值。

**它有什么用：** 每个字段都能获得相同规则但保持原始类型，例如表单字段同时保存 `value` 和 `dirty`。

**怎么使用：** 通过 `Type[Property]` 读取当前属性类型，再放入需要的新结构中。

~~~~ts
type FormState<Type> = {
  [Property in keyof Type]: {
    value: Type[Property]
    dirty: boolean
  }
}

type CourseForm = FormState<Course>
~~~~

### 3. readonly 与 optional 修饰符

**它们是什么：** 映射属性前的 `readonly`、`?` 可以添加修饰符，`-readonly`、`-?` 可以移除修饰符。

**它们有什么用：** 可以从只读模型派生可编辑草稿，或把部分输入转换成内部完整合同。

**怎么使用：** 明确写出要添加还是移除的修饰符，不要依赖读者猜测默认行为。

~~~~ts
type MutableRequired<Type> = {
  -readonly [Property in keyof Type]-?: Type[Property]
}
~~~~

### 4. 键重映射

**它是什么：** 映射类型中的 `as` 子句可以生成新键；映射为 `never` 时会过滤该键。

**它有什么用：** 能从数据字段生成 `getTitle` 一类公开协议，或排除不应暴露的内部字段。

**怎么使用：** 在 `as` 后使用模板字面量生成有限新名称，并使用 `string & Property` 保证键可用于字符串模板。

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

## 四、动手实践：从一个模型派生编辑状态

用 mapped type 统一改变属性，而不是手写一份容易漂移的副本。

~~~~ts
interface Course {
  readonly id: string
  title?: string
  minutes?: number
}

type Editable<T> = {
  -readonly [Key in keyof T]-?: T[Key]
}

type ChangeHandlers<T> = {
  [Key in keyof T as `on${Capitalize<string & Key>}Change`]: (value: T[Key]) => void
}

type CourseForm = Editable<Course>
type CourseHandlers = ChangeHandlers<CourseForm>
~~~~

创建完整的 CourseForm，确认 id 可修改且所有属性必填；再遗漏一个字段观察错误。最后为 CourseHandlers 实现两个处理函数，核对键重映射后的参数类型。
## 五、易错使用提示

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

## 六、工作原理与适用边界

:::steps
### 映射类型遍历键联合

**工作原理：** 映射类型以 Property in keyof Type 遍历键。**实践建议：** 从一个源合同生成一致派生合同。**使用边界：** 它只变换静态类型，不创建运行对象。

### 修饰符可添加或移除

**工作原理：** readonly 与 ? 支持 + 和 -。**实践建议：** 用显式减号表达从草稿到完整对象的阶段变化。**使用边界：** 移除可选不会提供运行时默认值。

### as 改变输出键

**工作原理：** as 可重映射键，never 可过滤键。**实践建议：** 只为稳定、有限的命名协议使用键重映射。**使用边界：** 复杂模板组合留到后续课程。
:::

:::exercise
### 从草稿合同生成完整课程

**要求：** 声明含 readonly 可选属性的草稿类型，用映射类型生成可写必填版本，再用 as 生成 getter 合同；保留缺少属性的负例。

**完成标准：** 完整对象和 getter 严格编译通过，缺少必填属性产生 TS2741。
:::

## 七、本节小结

映射类型从一个源合同批量计算属性、修饰符与公开键名。下一课会加入类型层分支，让派生结果根据输入类型选择不同合同。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface CourseDraft {
  readonly id: string
  title?: string
  published?: boolean
}

type FieldState<Model> = {
  [Key in keyof Model]: { value: Model[Key]; touched: boolean }
}

type MutableRequired<Model> = {
  -readonly [Key in keyof Model]-?: Model[Key]
}

type CourseGetters<Model> = {
  [Key in keyof Model as `get${Capitalize<string & Key>}`]: () => Model[Key]
}

type DraftState = FieldState<CourseDraft>
type CompleteCourse = MutableRequired<CourseDraft>
type Getters = CourseGetters<CompleteCourse>

const course: CompleteCourse = { id: 'mapped', title: '映射类型', published: true }
const state: DraftState = {
  id: { value: course.id, touched: false },
  title: { value: course.title, touched: true },
  published: { value: course.published, touched: true },
}
const getters: Getters = {
  getId: () => course.id,
  getTitle: () => course.title,
  getPublished: () => course.published,
}
console.log(state, getters.getTitle())
~~~~
:::
