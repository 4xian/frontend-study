---
id: engineering.typescript.learn.advanced.type-performance
type: lesson
title: 类型性能
summary: 用固定指标和类型追踪定位复杂推导的检查成本，再以可读边界降低实例化压力
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.advanced.tsconfig-layering
  - engineering.typescript.learn.advanced.type-design
tags:
  - TypeScript
  - extendedDiagnostics
  - generateTrace
  - 类型实例化
  - 递归
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
sources:
  - title: "TSConfig extendedDiagnostics"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/tsconfig-reference/copy/en/options/extendedDiagnostics.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 编译统计
  - title: "TSConfig generateTrace"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/tsconfig-reference/copy/en/options/generateTrace.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - trace.json
      - types.json
  - title: "TypeScript Performance"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/Performance.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 类型性能建议
stage: advanced
level: advanced
estimatedMinutes: 55
prerequisites:
  - engineering.typescript.learn.advanced.tsconfig-layering
  - engineering.typescript.learn.advanced.type-design
objectives:
  - 读取 extendedDiagnostics 中与类型检查相关的指标
  - 使用 generateTrace 定位高成本类型关系
  - 通过缩小联合、命名中间类型和限制递归降低实例化
  - 设计可重复而不过拟合机器的性能反馈环
recap:
  - 指标用于同一示例的比较，不是跨环境绝对承诺。
  - trace 是定位工具，不是自动优化器。
  - 先保护公共合同和可读性，再处理已证明的类型成本。
---

# 类型性能

## 一、为什么需要

类型系统在大型联合、递归和多层条件类型上需要更多实例化。问题通常先表现为编辑器延迟、CI 检查变慢或
错误消息展开过长。高级工程实践不是删掉所有精确类型，而是建立可复算的测量和最小改动的诊断路径。

## 二、核心概念和最小模型

`--extendedDiagnostics` 会列出当前 program 的文件、符号、类型、实例化和时间统计。

~~~~text
Files: 64
Types: 201
Instantiations: 82
Check time: 0.01s
Total time: 0.11s
~~~~

这些数值只描述固定示例与采样条件。可以比较同一示例在相同条件下的修改前后，不能把 `Total time`
当成所有 CI runner 的门槛。

`--generateTrace trace` 额外写出 `trace.json` 和 `types.json`。前者记录编译事件，后者记录类型关系和
实例化上下文；阅读 trace 时先找重复或异常宽的关系，再回到源代码命名具体类型。

## 三、知识点详解

### 1. extendedDiagnostics

**它是什么：** `--extendedDiagnostics` 输出 TypeScript 程序的类型数量、实例化数量和各阶段耗时。

**它有什么用：** 它提供可比较的基线，能判断慢在哪里，而不是凭感觉改写类型。

**怎么使用：** 固定同一输入、配置和 TypeScript 版本，记录 `Types`、`Instantiations`、`Check time` 与
`Total time`。

~~~~text
npx tsc -p tsconfig.json --extendedDiagnostics
~~~~

### 2. trace 类型关系

**它是什么：** `--generateTrace` 为类型检查过程生成可供分析的 trace 数据，展示复杂实例化之间的关系。

**它有什么用：** 当诊断指标只告诉你“慢”而不能指出具体类型时，trace 可以帮助定位热点。

**怎么使用：** 只对固定的最小样本生成 trace，检查输出可解析，再围绕最常出现的类型关系调整设计。

~~~~text
npx tsc -p tsconfig.json --generateTrace trace/types
~~~~

### 3. 类型热点

**它是什么：** 无限递归、宽泛 `string` 触发的大量键组合、重复条件分支和深层交叉都可能产生类型热点。

**它有什么用：** 识别热点能把优化范围限制在真正影响检查器的类型边界，不会误改无关运行时代码。

**怎么使用：** 先根据诊断和 trace 排序，再逐个替换热点；每次只改变一个类型表达式。

~~~~ts
type EventName<Field extends string> = `${Field}Changed`
type StableEvent = EventName<'title' | 'minutes'>
~~~~

### 4. 简化与命名

**它是什么：** 把重复复杂表达式拆成具名中间类型，或把无限组合限制成有限联合，属于类型层面的简化。

**它有什么用：** 既能降低实例化工作，也能让错误消息指向业务名称而不是一长串匿名条件类型。

**怎么使用：** 先保留语义，再提取稳定别名；不要为了减少一次指标而牺牲公共 API 的可读性。

~~~~ts
type CourseKey = 'id' | 'title' | 'minutes'
type CourseEvent = `${CourseKey}Changed`
~~~~

### 5. 同一输入复跑

**它是什么：** 性能验证必须在修改前后使用同一输入和命令，才能把差异归因于这次类型改动。

**它有什么用：** 它能排除文件数量、缓存状态或随机样本变化造成的假收益。

**怎么使用：** 每次只改一个边界，重新运行诊断并同时检查错误可读性；收益不稳定时保留原设计并记录噪声。

~~~~sh
# 修改前和修改后都运行这一条命令，再比较 Types、Instantiations 与 Check time
npx tsc -p tsconfig.json --noEmit --extendedDiagnostics
~~~~

## 四、常见降本手段

~~~~ts
type Event =
  | { kind: 'opened'; id: string }
  | { kind: 'completed'; id: string; score: number }
  | { kind: 'failed'; id: string; reason: string }

type EventBranch<T> = T extends { kind: infer Kind } ? { kind: Kind; value: T } : never
type Branches = EventBranch<Event>
~~~~

把 `EventBranch` 命名后，多个位置可以复用已经实例化的关系；把输入收窄到有限 `Event`，也比让 `string`
触发任意键组合更容易诊断。递归数据要有真实停止条件：固定六层目录就不要暴露无限递归工具。

## 五、动手实践：先测量，再简化热点类型

在项目根执行扩展诊断，记录检查阶段的类型数量、实例化数量和耗时：

~~~~sh
npx tsc -p tsconfig.json --noEmit --extendedDiagnostics
~~~~

如果某个递归条件类型反复展开，先给中间结果命名并限制递归深度，再用完全相同的命令比较结果。需要定位具体实例化来源时生成 trace：

~~~~sh
npx tsc -p tsconfig.json --noEmit --generateTrace .type-trace
~~~~

优化前后必须保持公开类型行为一致。不要把不同机器或不同 TypeScript 版本的绝对耗时直接比较，也不要为了降低数字把安全类型改成 any。
## 六、易错使用提示

:::pitfalls
### 把一次耗时当作绝对门槛

**触发条件：** 用某台机器的 `0.1s` 失败构建作为所有环境的硬阈值。

**原因：** CPU、缓存、Node 和 TypeScript 版本都会影响耗时。

**后果：** CI 抖动被误判为类型回归，或真实回归被环境差异掩盖。

**错误示例：**

~~~~text
Total time: 0.1s
~~~~

**正确写法：**

~~~~text
TypeScript 7.0.2；固定源码与配置；记录 Types、Instantiations、Check time
~~~~

**验证方式：** 连续运行两次，确认结构化指标比单次耗时更稳定。

### 只看 Total time 不看实例化

**触发条件：** 看到总时间上升就直接删掉公共类型。

**原因：** I/O、解析和 emit 也会影响总时间。

**后果：** 改动没有解决类型检查热点，反而降低合同精度。

**错误示例：**

~~~~text
Total time 上升，所以删除公共类型
~~~~

**正确写法：**

~~~~text
先比较 Types、Instantiations、Check time，再生成 trace
~~~~

**验证方式：** 对同一示例比较检查阶段与实例化数的变化。

### 用无限递归表达固定数据

**触发条件：** 配置只允许三层，却公开无限 `Tree<T>`。

**原因：** 类型精度超过运行时业务边界。

**后果：** 实例化增加，错误位置远离业务字段。

**错误示例：**

~~~~ts
type Tree<T> = { value: T; children?: Tree<T>[] }
~~~~

**正确写法：**

~~~~ts
type Item<T> = { value: T }
type ThreeLevel<T> = Item<T> & { children?: (Item<T> & { children?: Item<T>[] })[] }
~~~~

**验证方式：** 为第四层写负例，确认合同和产品边界一致。

### 让宽泛 string 触发无限键组合

**触发条件：** 模板字面量类型的输入是任意 `string`。

**原因：** 编译器无法把组合收敛到有限集合。

**后果：** 提示和实例化规模不可控。

**错误示例：**

~~~~ts
type EventName = `${string}:${string}`
~~~~

**正确写法：**

~~~~ts
type Scope = 'course' | 'lesson'
type Action = 'open' | 'complete'
type EventName = `${Scope}:${Action}`
~~~~

**验证方式：** 比较有限联合和宽字符串示例的 trace 规模。

### 用 trace 代替设计决策

**触发条件：** 看到某个事件耗时就机械删除对应类型。

**原因：** trace 描述发生了什么，不说明业务合同是否正确。

**后果：** 精确状态退化成 any 或不安全断言。

**错误示例：**

~~~~ts
declare function parse(input: string): any
~~~~

**正确写法：**

~~~~ts
declare function parse(input: string): unknown
~~~~

**验证方式：** 同时检查诊断可读性和指标变化。
:::

## 七、工作原理与适用边界

:::steps
### 指标先于假设

**工作原理：** `extendedDiagnostics` 暴露 program 统计。**实践建议：** 先固定输入再谈回归。**使用边界：** 指标不等于
用户体感，也不能跨机器比较绝对值。

### trace 用于定位关系

**工作原理：** `generateTrace` 写出事件和类型 JSON。**实践建议：** 用它找到重复实例化的源头。**使用边界：** trace 不
会自动告诉你哪种公共合同最合适。

### 可读性是性能约束的一部分

官方性能建议鼓励简化复杂类型。**实践建议：** 命名中间类型和收窄输入通常同时改善诊断和检查成本。**使用边界：**
不能为微小指标收益牺牲关键不变量。
:::

:::exercise
### 为事件联合建立性能基线

**要求：** 固定至少三种事件和五层递归，分别运行 `--extendedDiagnostics` 与 `--generateTrace`。把一个
未命名条件类型改成具名中间类型，再复跑同一输入。

**完成标准：** 报告四个结构化指标、trace 两个文件可解析，并解释改动是否降低实例化而没有放宽公共合同。
:::

## 八、本节小结

类型性能工作从可复算输入开始，用 diagnostics 发现趋势，用 trace 定位关系，再用边界和命名降低复杂度。
下一课把这些边界落实到库的声明、exports 和版本兼容合同。

:::code-details{title="查看本节完整配置"}
~~~~text
// src/events.ts：先给中间结果命名，并把字符串集合限制为真实业务联合
type CourseField = 'title' | 'duration' | 'published'
type CourseAction = 'read' | 'update'
type CourseEventName = `${CourseAction}:${CourseField}`

type EventPayloads = {
  [Event in CourseEventName]: Event extends `update:${infer Field}`
    ? { field: Field; changed: true }
    : { field: Event extends `read:${infer Field}` ? Field : never }
}

export type CourseEvent = {
  [Event in keyof EventPayloads]: { type: Event; payload: EventPayloads[Event] }
}[keyof EventPayloads]

// tsconfig.performance.json：固定输入，避免每次测量包含不同文件
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "extendedDiagnostics": true
  },
  "files": ["src/events.ts"]
}

// 1. 在同一输入上重复记录 Types、Instantiations、Check time
npx tsc -p tsconfig.performance.json
npx tsc -p tsconfig.performance.json

// 2. 指标异常时才生成 trace，并定位重复实例化的类型关系
npx tsc -p tsconfig.performance.json --generateTrace trace

// 3. 简化或命名热点后，用完全相同的命令复跑并比较
npx tsc -p tsconfig.performance.json
~~~~
:::

## 九、参考资料

- [extendedDiagnostics](https://www.typescriptlang.org/tsconfig/extendedDiagnostics.html) - 编译统计。
- [generateTrace](https://www.typescriptlang.org/tsconfig/generateTrace.html) - 类型追踪输出。
- [Performance](https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/Performance.md) - 官方性能建议。
