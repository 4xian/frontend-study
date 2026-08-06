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
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
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

## 为什么需要

事件名、getter 和路由键常由已有字段按固定规则组成。手写第二份字符串联合容易漏项；模板字面量类型可以从源键直接派生有限协议，让字段变化在编译期暴露不一致。

## 核心概念和最小模型

~~~~ts
type CourseField = 'title' | 'minutes'
type CourseEvent = `${CourseField}Changed`

const titleEvent: CourseEvent = 'titleChanged'
const minutesEvent: CourseEvent = 'minutesChanged'

export { minutesEvent, titleEvent }
~~~~

插值接收联合时，编译器会展开每个成员并生成结果联合。多个联合同时插值会形成 cross product，因此这项能力适合数量明确、规模有限的命名协议。

## 把对象合同连接到事件协议

:::steps
### 从唯一源合同取得键

使用 string & keyof Type 排除不能进入字符串协议的 symbol 或 number 键。

### 用模板约束事件名

把 Changed 等稳定后缀写进类型，让调用方只能传入真实字段派生的名字。

### 从前缀恢复值类型

泛型捕获事件名前缀后，以 Type[Key] 为回调提供对应字段的准确类型。

### 只在边界统一大小写

Capitalize 等 intrinsic 服务公开命名规则，不替代运行时字符串标准化。
:::

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

## 配套编译 fixture

临时编译正例验证有限事件联合、模板推导、Capitalize 与 mapped as；负例传入未带 Changed 后缀的字段名，固定 TS2345。验证资产只在 `/tmp` 使用并在结束后删除。字符串协议是编译事实，因此不创建浏览器 Demo。

## 易错使用提示

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

## 原理与适用场景

:::steps
### 联合插值生成有限结果

官方事实：模板中的联合按所有组合展开。课程推导：只为有限、稳定的字符串协议派生名字。边界：大型集合应预先生成。

### 模板前缀可参与推导

官方事实：泛型可从匹配模板中捕获字段名。课程推导：由事件名恢复回调值类型。边界：运行输入仍需真实校验。

### intrinsic 是编译器内建映射

官方事实：四种大小写工具由编译器直接处理。课程推导：只在公开键边界统一名称。边界：它们不生成运行代码。
:::

:::exercise
### 从课程字段派生变更事件

**要求：** 为 Course 的 title 与 minutes 派生 Changed 事件，编写能把回调参数恢复为字段类型的 on 合同，并保留错误事件名负例。

**验收：** 两个合法事件严格编译通过，裸字段名产生 TS2345，并能解释联合展开边界。
:::

## 总结与下一课

模板字面量类型把有限字符串联合组合成协议，intrinsic 和 mapped as 可继续统一键名。下一课转向 class，区分静态结构兼容与真实运行时继承。
