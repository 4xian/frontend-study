---
id: engineering.typescript.learn.intermediate.template-literal-types
type: lesson
title: 模板字面量类型
summary: 从有限字符串联合派生事件名，并用 intrinsic 统一公开键名
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 模板字面量类型
  - 字符串 intrinsic
  - Capitalize
  - 键重映射
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Template Literal Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Manipulation/Template%20Literal%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 字符串联合展开
      - 模板插值推导
      - intrinsic string types
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - engineering.typescript.learn.basics.unions-and-literals
  - engineering.typescript.learn.intermediate.keyof-typeof-indexed-access
  - engineering.typescript.learn.intermediate.mapped-types
objectives:
  - 用模板字面量类型把有限联合组合成字符串协议
  - 从对象键派生事件名，并把回调参数恢复为原属性类型
  - 使用 Uppercase、Lowercase、Capitalize 和 Uncapitalize 变换字符串键
  - 识别大型 cross product 应预先生成而非继续堆叠类型表达式
recap:
  - 模板字面量会展开插值联合，多个联合产生 cross product。
  - 泛型可从字符串模板捕获键，并用 Type[Key] 恢复值类型。
  - intrinsic 只变换静态字符串类型，大型联合应预先生成。
---

# 模板字面量类型

## 一、为什么需要

事件名、getter 和路由键常由已有字段按固定规则组成。手写第二份字符串联合容易漏项；模板字面量类型可以从源键直接派生有限协议，让字段变化在编译期暴露不一致。

## 二、核心概念和最小模型

~~~~ts
type CourseField = 'title' | 'minutes'
type CourseEvent = `${CourseField}Changed`

const titleEvent: CourseEvent = 'titleChanged'
const minutesEvent: CourseEvent = 'minutesChanged'

export { minutesEvent, titleEvent }
~~~~

插值接收联合时，编译器会展开每个成员并生成结果联合。多个联合同时插值会形成 cross product，因此这项能力适合数量明确、规模有限的命名协议。

## 三、知识点详解

### 1. 模板字面量类型

**它是什么：** 模板字面量类型使用反引号和 `${Type}` 在类型层组合字符串字面量。

**它有什么用：** 路由名、事件名和配置键可以遵守固定格式，不再接受任意字符串。

**怎么使用：** 把有限的字面量联合放入模板插值，编译器会生成所有合法组合。

~~~~ts
type Field = 'title' | 'minutes'
type EventName = `${Field}Changed`

const event: EventName = 'titleChanged'
~~~~

### 2. 联合类型的组合展开

**它是什么：** 当多个插值位置都是联合时，模板字面量会生成各联合成员的笛卡尔组合。

**它有什么用：** 可以从少量维度生成有限协议，例如语言与页面组合成受控路由键。

**怎么使用：** 只组合规模可控的联合；成员数量很大时应在构建阶段生成或改用普通字符串验证。

~~~~ts
type Locale = 'zh' | 'en'
type Page = 'home' | 'course'
type RouteKey = `${Locale}.${Page}`

const route: RouteKey = 'zh.course'
~~~~

### 3. 从对象键派生事件名

**它是什么：** `string & keyof Type` 取得可进入字符串模板的对象键，再与固定前后缀组合。

**它有什么用：** 数据模型成为唯一来源，新增字段后事件名合同会自动更新。

**怎么使用：** 先用 `keyof` 取得键，再把键与稳定后缀写入模板；泛型回调可继续通过键读取字段值类型。

~~~~ts
type Watcher<Type> = {
  on<Key extends string & keyof Type>(
    event: `${Key}Changed`,
    listener: (value: Type[Key]) => void,
  ): void
}

type Getters<Type> = {
  [Key in keyof Type as `get${Capitalize<string & Key>}`]: () => Type[Key]
}

type Course = { title: string; minutes: number }
declare const watcher: Watcher<Course>

watcher.on('minutesChanged', (minutes) => minutes.toFixed(0))
export type { Getters }
~~~~

### 4. intrinsic 字符串类型

**它是什么：** `Uppercase`、`Lowercase`、`Capitalize` 和 `Uncapitalize` 是编译器内建的字符串类型变换。

**它有什么用：** 它们可以让 getter、事件或常量命名遵守统一大小写规则。

**怎么使用：** 把字符串字面量或联合传给 intrinsic；它只计算静态类型，运行时仍需实际转换字符串。

~~~~ts
type GetterName = `get${Capitalize<'title' | 'minutes'>}`

const getterName: GetterName = 'getTitle'
~~~~

## 四、动手实践：让字段名决定事件名和负载

由模型字段派生事件协议，避免字符串事件和回调参数各自维护。

~~~~ts
interface CourseForm {
  title: string
  minutes: number
}

type ChangeEvents<T> = {
  [Key in keyof T & string as `${Key}Changed`]: (value: T[Key]) => void
}

const handlers: ChangeEvents<CourseForm> = {
  titleChanged: (value) => value.toUpperCase(),
  minutesChanged: (value) => value.toFixed(0),
}
~~~~

交换两个回调的参数操作并新增不存在的事件名，观察模板字面量和 mapped type 如何同时约束名称与负载。开放字符串场景不要生成巨大联合，应回到运行时校验。
## 五、易错使用提示

:::pitfalls
### 退回任意 string

**触发条件：** 退回任意 string

**原因：** 宽泛 string 不再表达字段与事件名的对应关系。

**后果：** 拼写错误只能到运行时才被发现。

**错误示例：**

~~~~ts
function on(event: string): void {}
~~~~

**正确写法：**

~~~~ts
function on(event: CourseEvent): void {}
~~~~

**验证方式：** 对照正确写法验证结果。

### 遗漏非字符串键约束

**触发条件：** 遗漏非字符串键约束

**原因：** keyof 可能包含 number 或 symbol，不能直接用于所有字符串 intrinsic。

**后果：** 映射类型自身产生键类型诊断。

**错误示例：**

~~~~ts
Capitalize<keyof Type>
~~~~

**正确写法：**

~~~~ts
Capitalize<string & keyof Type>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 intrinsic 当成运行转换

**触发条件：** 把 intrinsic 当成运行转换

**原因：** Capitalize 等只计算静态类型，不会修改实际字符串。

**后果：** 运行值仍保持原样，显示或协议可能不匹配。

**错误示例：**

~~~~ts
type Label = Capitalize<'course'> // 不会产生运行值
~~~~

**正确写法：**

~~~~ts
const label = 'course'.replace(/^./, 'C')
~~~~

**验证方式：** 对照正确写法验证结果。

### 让联合组合无限膨胀

**触发条件：** 让联合组合无限膨胀

**原因：** 每个插值联合都会与其他位置做笛卡尔积。

**后果：** 类型难读、诊断变长，检查成本也随组合数上升。

**错误示例：**

~~~~ts
// 在多层大联合上继续组合模板字面量
~~~~

**正确写法：**

~~~~ts
// 大型协议按官方建议预先生成字符串联合
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 联合插值生成有限结果

**工作原理：** 模板中的联合按所有组合展开。**实践建议：** 只为有限、稳定的字符串协议派生名字。**使用边界：** 大型集合应预先生成。

### 模板前缀可参与推导

**工作原理：** 泛型可从匹配模板中捕获字段名。**实践建议：** 由事件名恢复回调值类型。**使用边界：** 运行输入仍需真实校验。

### intrinsic 是编译器内建映射

**工作原理：** 四种大小写工具由编译器直接处理。**实践建议：** 只在公开键边界统一名称。**使用边界：** 它们不生成运行代码。
:::

:::exercise
### 从课程字段派生变更事件

**要求：** 为 Course 的 title 与 minutes 派生 Changed 事件，编写能把回调参数恢复为字段类型的 on 合同，并保留错误事件名负例。

**完成标准：** 两个合法事件严格编译通过，裸字段名产生 TS2345，并能解释联合展开边界。
:::

## 七、本节小结

模板字面量类型把有限字符串联合组合成协议，intrinsic 和 mapped as 可继续统一键名。下一课转向 class，区分静态结构兼容与真实运行时继承。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface CourseFields {
  title: string
  duration: number
}

type Locale = 'zh' | 'en'
type CoursePage = 'list' | 'detail'
type RouteName = `${Locale}:${CoursePage}`
type CourseEvent = `${string & keyof CourseFields}Changed`
type UpperRouteName = Uppercase<RouteName>
type LowerRouteName = Lowercase<UpperRouteName>
type CapitalizedField = Capitalize<'title'>
type UncapitalizedField = Uncapitalize<CapitalizedField>
type EventHandlers<Model> = {
  [Key in keyof Model as `on${Capitalize<string & Key>}Changed`]: (value: Model[Key]) => void
}

/** 监听字段名派生出的事件，并保持负载类型一致。 */
function watchField<Key extends string & keyof CourseFields>(
  event: `${Key}Changed`,
  listener: (value: CourseFields[Key]) => void,
): void {
  console.log(`已监听 ${event}`, listener)
}

const route: RouteName = 'zh:detail'
const upperRoute: UpperRouteName = 'ZH:DETAIL'
const lowerRoute: LowerRouteName = 'zh:detail'
const fieldName: UncapitalizedField = 'title'
const courseEvent: CourseEvent = 'durationChanged'
const handlers: EventHandlers<CourseFields> = {
  onTitleChanged: (value) => console.log(value.toUpperCase()),
  onDurationChanged: (value) => console.log(value.toFixed(0)),
}

watchField('titleChanged', handlers.onTitleChanged)
console.log(route, upperRoute, lowerRoute, fieldName, courseEvent)
~~~~
:::
