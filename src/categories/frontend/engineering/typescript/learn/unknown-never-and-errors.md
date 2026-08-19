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
appliesTo: TypeScript 7.0.2
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

## 一、为什么需要

JavaScript 允许抛出任何值，外部解析结果也未必符合预期。unknown 保留这种不确定性，要求代码先取得证据；never 则位于另一端，表示控制流已经排除所有可能成员。

## 二、核心概念和最小模型

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

## 三、知识点详解

### 1. unknown 异常边界

**它是什么：** `unknown` 表示当前还不能确定类型的值。严格 catch 配置下，`catch (error)` 也应按
`unknown` 处理。

**它有什么用：** JavaScript 可以抛出字符串、对象或 `Error`，使用 `unknown` 能阻止代码直接假设
`error.message` 一定存在。

**怎么使用：** 捕获后先通过 `instanceof Error` 或其他真实检查归一化，再把安全结果交给业务代码。

~~~~ts
/** 把任意抛出值转换为可显示消息。 */
function normalizeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

try {
  throw new Error('加载失败')
} catch (error) {
  console.log(normalizeError(error))
}
~~~~

### 2. 从 unknown 获得类型证据

**它是什么：** 收窄条件会在控制流中建立证据，使 `unknown` 在特定分支变成更具体的类型。

**它有什么用：** 外部响应和解析结果只有通过运行时检查后，才能安全访问属性和方法。

**怎么使用：** 按从外到内的顺序检查对象非空、属性存在和属性值类型，不要用断言跳过其中步骤。

~~~~ts
/** 判断未知值是否包含字符串形式的课程 ID。 */
function hasCourseId(value: unknown): value is { id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  )
}
~~~~

### 3. 判别结果联合

**它是什么：** 结果联合用共同字面量字段区分成功和失败，每个分支只携带自己需要的数据。

**它有什么用：** 调用方必须先检查状态，成功分支读取值，失败分支读取错误，避免两个字段都被写成可选。

**怎么使用：** 为每个分支定义 `status` 或 `ok` 判别字段，并在 `if` 或 `switch` 中处理。

~~~~ts
type LoadResult<Value> =
  | { status: 'success'; value: Value }
  | { status: 'failure'; error: string }

/** 读取加载结果中的课程标题。 */
function readResult(result: LoadResult<string>): string {
  return result.status === 'success' ? result.value : result.error
}
~~~~

### 4. never 穷尽检查

**它是什么：** 当联合成员已经全部处理，剩余值会被收窄为 `never`。

**它有什么用：** 新增状态后，未更新的分支会在编译期报错，不会被静默的默认逻辑吞掉。

**怎么使用：** 在 `switch` 的剩余分支把值赋给 `never`，并保留明确的不可达返回。

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

## 四、动手实践：安全处理异常并保持穷尽

catch 中先把错误当作 unknown，再通过可证明的检查提取消息。

~~~~ts
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '未知错误'
}

type SaveResult = { kind: 'saved'; id: string } | { kind: 'failed'; error: unknown }

function renderResult(result: SaveResult): string {
  switch (result.kind) {
    case 'saved': return `已保存 ${result.id}`
    case 'failed': return errorMessage(result.error)
    default: {
      const unreachable: never = result
      return unreachable
    }
  }
}
~~~~

先直接读取 catch 变量的 message，理解为什么 strict 模式会拒绝；再给 SaveResult 新增 queued 分支，观察 never 如何提醒你补齐处理逻辑。
## 五、易错使用提示

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

## 六、工作原理与适用边界

:::steps
### unknown 要求先收窄

**工作原理：** unknown 可接收任意值但不能直接操作。**实践建议：** 所有不可信边界先验证。**使用边界：** 静态 unknown 不会自动校验数据。

### strict catch 默认保留不确定性

**工作原理：** useUnknownInCatchVariables 随 strict 默认开启。**实践建议：** 统一错误归一化入口。**使用边界：** JavaScript 仍可抛出非 Error 值。

### never 证明没有剩余成员

**工作原理：** 没有普通类型可赋给 never。**实践建议：** 在 default 分支检查判别联合穷尽。**使用边界：** 它不替代运行时异常处理。
:::

:::exercise
### 建立可穷尽的加载结果

**要求：** 定义 success/failure 结果联合，用 unknown 归一化捕获值，并在 switch 默认分支赋给 never；再加入第三种状态观察负例。

**完成标准：** 两状态正例通过；未经收窄读取产生 TS18046，遗漏状态产生 TS2322。
:::

## 七、本节小结

unknown 强制不可信值先取得运行证据，never 让已知状态必须被完整处理。中级课程至此完成；下一课将用 infer 与分布控制进入高级类型提取。

:::code-details{title="查看本节完整示例"}
~~~~ts
type LoadResult =
  | { kind: 'success'; title: string }
  | { kind: 'not-found'; courseId: string }
  | { kind: 'failure'; message: string }

/** 从 unknown 异常中提取安全消息。 */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** 在穷尽分支后拒绝剩余成员。 */
function assertNever(value: never): never {
  throw new Error(`未处理结果：${JSON.stringify(value)}`)
}

/** 把不可信输入转换为可穷尽的结果联合。 */
function parseResult(value: unknown): LoadResult {
  try {
    if (typeof value !== 'object' || value === null || !('title' in value)) {
      return { kind: 'not-found', courseId: 'unknown' }
    }
    if (typeof value.title !== 'string') throw new TypeError('title 必须是字符串')
    return { kind: 'success', title: value.title }
  } catch (error: unknown) {
    return { kind: 'failure', message: errorMessage(error) }
  }
}

/** 显示每一种结果。 */
function render(result: LoadResult): string {
  if (result.kind === 'success') return result.title
  if (result.kind === 'not-found') return `未找到：${result.courseId}`
  if (result.kind === 'failure') return `失败：${result.message}`
  return assertNever(result)
}

console.log(render(parseResult({ title: '错误边界' })))
~~~~
:::
