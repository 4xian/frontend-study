---
id: engineering.typescript.learn.intermediate.unknown-never-and-errors
type: lesson
title: unknown、never 与错误处理
summary: 先收窄 catch unknown，再用 never 证明状态分支已经穷尽
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - unknown
  - never
  - 错误处理
  - catch unknown
  - useUnknownInCatchVariables
  - 穷尽检查
  - Result
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: More on Functions"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/More%20on%20Functions.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - unknown
  - title: "TypeScript Handbook: Narrowing"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Narrowing.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - never
      - 穷尽检查
  - title: "TSConfig: useUnknownInCatchVariables"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/tsconfig-reference/copy/en/options/useUnknownInCatchVariables.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - catch 变量默认 unknown
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.basics.narrowing
  - engineering.typescript.learn.intermediate.generics-and-constraints
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
objectives:
  - 用 unknown 承接不可信值，并在读取、调用或赋值前取得运行证据
  - 在 strict 模式的 catch 中用 instanceof Error 等真实检查收窄错误值
  - 用 never 为判别联合建立编译期穷尽检查
  - 用最小 Result 风格联合显式表达成功与失败合同
recap:
  - unknown 可承接任意值，但属性访问、调用和具体赋值前必须收窄。
  - strict catch 默认使用 unknown，JavaScript 仍允许抛出非 Error 值。
  - never 可在判别联合默认分支证明状态穷尽，并在新增成员时触发诊断。
---

# unknown、never 与错误处理

## 为什么需要

JavaScript 允许抛出任何值，外部解析结果也未必符合预期。unknown 保留这种不确定性，要求代码先取得证据；never 则位于另一端，表示控制流已经排除所有可能成员。

## 核心概念和最小模型

~~~~ts
/** 把任意抛出值转换为可显示消息。 */
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

try {
  throw new Error('模块加载失败')
} catch (error) {
  console.log(errorMessage(error))
}
~~~~

strict 会让 catch 变量按 unknown 处理。读取 message 前先用 instanceof Error 验证真实运行身份；非 Error 值仍需明确的回退策略，而不是用断言把它假装成 Error。

## 用 never 守住状态穷尽

:::steps
### 不可信边界先使用 unknown

unknown 可以接收任何值，但阻止未经检查的属性访问和调用。

### 用真实条件取得证据

instanceof、typeof、in 或验证函数应检查实际运行形状。

### 用判别字段组织结果

Result 联合把成功值与失败原因放进可收窄的不同分支。

### 把剩余状态交给 never

default 分支赋值给 never；新增成员未处理时，编译器会在此处报错。
:::

~~~~ts
type LoadResult<Value> =
  | { status: 'success'; value: Value }
  | { status: 'failure'; error: string }

/** 把加载结果转换为显示文本，并证明状态已穷尽。 */
function describeResult(result: LoadResult<string>): string {
  switch (result.status) {
    case 'success':
      return result.value
    case 'failure':
      return result.error
    default: {
      const exhaustive: never = result
      return exhaustive
    }
  }
}
~~~~

:::demo{id="engineering.typescript.learn.intermediate.unknown-never-and-errors.error-narrowing-demo"}
分别捕获 Error 与字符串抛出值，观察同一个 unknown 归一化边界。
:::

## 配套编译 fixture

临时编译正例覆盖 catch unknown 收窄与两状态穷尽；负例先直接读取 catch 的 message，再遗漏新增状态并赋给 never，固定 TS18046 与 TS2322。验证资产只在 `/tmp` 使用并在结束后删除。Demo 只展示运行消息，不替代这些诊断。

## 易错使用提示

:::pitfalls
### 把 unknown 断言成目标类型

**触发条件：** 把 unknown 断言成目标类型

**原因：** 断言不会验证运行值，只会关闭当前检查。

**后果：** 非 Error 抛出值仍可能在读取 message 时失败。

**错误示例：**

~~~~ts
(error as Error).message
~~~~

**正确写法：**

~~~~ts
error instanceof Error ? error.message : String(error)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 unknown 换成 any

**触发条件：** 把 unknown 换成 any

**原因：** any 允许任意读取和调用，丢失不可信边界。

**后果：** 错误从编译阶段推迟到运行时。

**错误示例：**

~~~~ts
function message(error: any) { return error.message }
~~~~

**正确写法：**

~~~~ts
function message(error: unknown) { return String(error) }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 never 当成空值

**触发条件：** 把 never 当成空值

**原因：** never 表示不应出现的控制流状态，不是 null 或 undefined 的别名。

**后果：** 数据缺失与逻辑不可能被混为一谈。

**错误示例：**

~~~~ts
const empty: never = undefined
~~~~

**正确写法：**

~~~~ts
const empty: undefined = undefined
~~~~

**验证方式：** 对照正确写法验证结果。

### default 分支静默兜底

**触发条件：** default 分支静默兜底

**原因：** 返回通用文本会让新增联合成员绕过显式处理。

**后果：** 状态模型扩展后，界面可能悄悄走错误分支。

**错误示例：**

~~~~ts
default: return '未知状态'
~~~~

**正确写法：**

~~~~ts
default: { const exhaustive: never = result; return exhaustive }
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 原理与适用场景

:::steps
### unknown 要求先收窄

官方事实：unknown 可接收任意值但不能直接操作。课程推导：所有不可信边界先验证。边界：静态 unknown 不会自动校验数据。

### strict catch 默认保留不确定性

官方事实：useUnknownInCatchVariables 随 strict 默认开启。课程推导：统一错误归一化入口。边界：JavaScript 仍可抛出非 Error 值。

### never 证明没有剩余成员

官方事实：没有普通类型可赋给 never。课程推导：在 default 分支检查判别联合穷尽。边界：它不替代运行时异常处理。
:::

:::exercise
### 建立可穷尽的加载结果

**要求：** 定义 success/failure 结果联合，用 unknown 归一化捕获值，并在 switch 默认分支赋给 never；再加入第三种状态观察负例。

**验收：** 两状态正例通过；未经收窄读取产生 TS18046，遗漏状态产生 TS2322。
:::

## 总结与下一课

unknown 强制不可信值先取得运行证据，never 让已知状态必须被完整处理。中级课程至此完成；下一批将用 infer 与分布控制进入高级类型提取。
