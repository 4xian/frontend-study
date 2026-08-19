---
id: engineering.typescript.learn.intermediate.keyof-typeof-indexed-access
type: lesson
title: keyof、typeof 与索引访问
summary: 从现有值和对象合同派生键联合与属性值类型
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - keyof
  - typeof
  - 索引访问
  - 类型操作符
  - 属性键
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Keyof Type Operator"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Keyof%20Type%20Operator.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 对象键联合
      - 索引签名键
  - title: "TypeScript Handbook: Typeof Type Operator"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Typeof%20Type%20Operator.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 类型位置 typeof
      - typeof 表达式限制
  - title: "TypeScript Handbook: Indexed Access Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Indexed%20Access%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 属性类型查询
      - 联合键查询
      - 数组元素类型
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.intermediate.generics-and-constraints
objectives:
  - 用 keyof 从对象类型得到合法属性键联合
  - 用类型位置的 typeof 复用现有值声明的类型
  - 用 Type[Key] 查询单个属性、联合键和数组元素类型
  - 组合泛型约束实现键和值保持对应的安全读取函数
recap:
  - keyof 从对象类型产生合法键联合，索引签名会影响键的宽度。
  - 类型位置的 typeof 复用标识符或属性类型，但不会执行表达式。
  - Type[Key] 查询属性结果，与泛型键组合可保持键和值对应。
---

# keyof、typeof 与索引访问

## 一、为什么需要

对象合同变化时，手写第二份键联合或属性类型容易失去同步。keyof、typeof 与索引访问让类型直接从已有合同派生，使合法键和返回值随源类型一起变化。

## 二、核心概念和最小模型

~~~~ts
const course = {
  id: 'keyof',
  title: '类型操作符',
  minutes: 60,
}

type Course = typeof course
type CourseKey = keyof Course
type CourseTitle = Course['title']
type CourseValue = Course[CourseKey]
~~~~

typeof 在类型位置读取变量 course 的静态类型；keyof 再从该对象类型得到键联合；索引访问用键查询对应的值类型。三者都只在类型检查阶段工作，不会在运行时枚举对象。

## 三、知识点详解

### 1. 类型位置中的 typeof

**它是什么：** 类型位置中的 `typeof value` 读取一个运行值的静态类型，不会在运行时再次执行该值。

**它有什么用：** 配置对象、常量表和数组可以成为唯一数据来源，类型不必手写第二份。

**怎么使用：** 先声明稳定值，再在类型别名或其他类型表达式中写 `typeof 变量名`。

~~~~ts
const course = {
  id: 'operators',
  title: '类型操作符',
  minutes: 50,
}

type Course = typeof course
~~~~

### 2. keyof

**它是什么：** `keyof Type` 生成对象类型所有已知属性键组成的联合。

**它有什么用：** 字段选择器、排序键和安全读取函数只能接收真实存在的键，拼写错误会被拒绝。

**怎么使用：** 把对象类型传给 `keyof`，再让参数或泛型约束使用得到的键联合。

~~~~ts
type CourseKey = keyof Course

const selectedKey: CourseKey = 'title'
~~~~

### 3. 索引访问类型

**它是什么：** `Type[Key]` 在类型层读取指定属性的值类型，`Key` 可以是单个键或键联合。

**它有什么用：** 键与返回值能够保持对应，例如读取 `title` 返回 `string`，读取 `minutes` 返回 `number`。

**怎么使用：** 让 `Key extends keyof Type`，并把函数返回类型写成 `Type[Key]`。

~~~~ts
/** 读取对象中真实存在的属性，并保留该属性的准确类型。 */
function get<Type, Key extends keyof Type>(value: Type, key: Key): Type[Key] {
  return value[key]
}

const title = get(course, 'title')
~~~~

### 4. 数组元素类型

**它是什么：** 对数组或元组类型使用 `[number]`，可以取得所有数字索引位置对应的元素类型。

**它有什么用：** 从实际数组派生元素合同，不需要再次手写相同对象类型。

**怎么使用：** 先用 `typeof` 取得数组类型，再写 `(typeof items)[number]`；常量元组还可以派生字面量联合。

~~~~ts
const lessons = [course, { id: 'mapped', title: '映射类型', minutes: 55 }]
type Lesson = (typeof lessons)[number]

export type { Lesson }
export { selectedKey, title }
~~~~

## 四、动手实践：从真实配置派生键和值

先写运行时配置，再从这份值派生类型，避免维护两套重复字段。

~~~~ts
const courseDefaults = {
  pageSize: 20,
  theme: 'light',
  showProgress: true,
} as const

type CourseDefaults = typeof courseDefaults
type SettingKey = keyof CourseDefaults

function readSetting<Key extends SettingKey>(key: Key): CourseDefaults[Key] {
  return courseDefaults[key]
}

const pageSize = readSetting('pageSize')
~~~~

依次读取三个合法键，确认返回类型随键变化；再输入一个不存在的键。最后移除 `as const`，观察字面量值如何变宽，并判断业务是否真的需要保留字面量。
## 五、易错使用提示

:::pitfalls
### 用任意 string 访问已知对象

**触发条件：** 用任意 string 访问已知对象

**原因：** string 比真实键集合更宽，不能保证运行时一定对应对象属性。

**后果：** 索引访问失去安全性，或在严格模式下直接产生诊断。

**错误示例：**

~~~~ts
/** key 可能不是 Course 的属性。 */
function read(course: Course, key: string) {
  return course[key]
}
~~~~

**正确写法：**

~~~~ts
/** key 只能取 Course 的真实属性。 */
function read<Key extends keyof Course>(course: Course, key: Key): Course[Key] {
  return course[key]
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把值名称直接当成类型

**触发条件：** 把值名称直接当成类型

**原因：** 变量和函数位于值空间，类型工具需要先通过 typeof 取得其类型。

**后果：** ReturnType 等类型工具无法接受值名称本身。

**错误示例：**

~~~~ts
type Result = ReturnType<createCourse>
~~~~

**正确写法：**

~~~~ts
type Result = ReturnType<typeof createCourse>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 typeof 中执行表达式

**触发条件：** 在 typeof 中执行表达式

**原因：** 类型位置的 typeof 只接受标识符或属性访问，不会执行任意函数调用。

**后果：** 把运行时求值误写进类型位置会产生语法或类型诊断。

**错误示例：**

~~~~ts
type Result = typeof createCourse()
~~~~

**正确写法：**

~~~~ts
const result = createCourse()
type Result = typeof result
~~~~

**验证方式：** 对照正确写法验证结果。

### 忽略字符串索引的数字键

**触发条件：** 忽略字符串索引的数字键

**原因：** JavaScript 会把数字属性键转成字符串，因此 string 索引签名的 keyof 是 string | number。

**后果：** 手写 string 键联合会错误排除合法数字访问。

**错误示例：**

~~~~ts
type DictionaryKey = string
~~~~

**正确写法：**

~~~~ts
type Dictionary = { [key: string]: boolean }
type DictionaryKey = keyof Dictionary
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### keyof 描述可用键

**工作原理：** keyof 产生对象类型的键联合。**实践建议：** 公共读取工具应由源对象约束键。**使用边界：** 索引签名会让结果包含更宽的 string 或 number。

### typeof 连接值与类型

**工作原理：** 类型位置的 typeof 取得标识符或属性的类型。**实践建议：** 常量先作为单一事实来源，再派生类型。**使用边界：** 它不会调用函数或检查运行数据。

### 索引访问计算属性结果

**工作原理：** Type[Key] 查询属性或联合键对应的类型。**实践建议：** 与泛型键组合可保留精确返回值。**使用边界：** 不存在的属性会产生诊断。
:::

:::exercise
### 实现安全课程字段读取器

**要求：** 从课程对象值派生 Course 和 CourseKey，编写泛型 get 并分别读取 title 与 minutes；保留查询 email 的负例。

**完成标准：** 合法键得到准确属性类型，不存在的属性产生 TS2339，并能解释 typeof 的类型位置限制。
:::

## 七、本节小结

keyof 限定对象键，typeof 复用已有值类型，索引访问计算属性结果。下一课会以这些键和值关系为输入，用映射类型批量变换整个对象合同。

:::code-details{title="查看本节完整示例"}
~~~~ts
const courseConfig = {
  title: '类型运算符',
  level: 'advanced' as const,
  tags: ['keyof', 'typeof'],
}

type CourseConfig = typeof courseConfig
type CourseKey = keyof CourseConfig
type CourseTitle = CourseConfig['title']
type CourseValue = CourseConfig[CourseKey]
type CourseTag = CourseConfig['tags'][number]

/** 使用受约束的键读取对象属性，并保留对应值类型。 */
function readField<ObjectType, Key extends keyof ObjectType>(
  object: ObjectType,
  key: Key,
): ObjectType[Key] {
  return object[key]
}

const title: CourseTitle = readField(courseConfig, 'title')
const level: CourseValue = readField(courseConfig, 'level')
const tag: CourseTag = readField(courseConfig, 'tags')[0]!
console.log(title, level, tag)
~~~~
:::
