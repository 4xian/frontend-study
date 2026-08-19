---
id: engineering.typescript.reference.language-reference
type: reference
title: TypeScript General Reference
summary: 查阅声明合并、枚举、迭代器、JSX、命名空间、symbol、兼容性、推导与变量声明等稳定主题
domain: frontend
technology: engineering
module: typescript
group: general-reference
signature: |-
  declare namespace Shared { interface Config { enabled: boolean } }
  enum Direction { Up, Down }
  type Component = (props: { title: string }) => JSX.Element
related:
  - engineering.typescript.learn.basics.aliases-and-interfaces
  - engineering.typescript.learn.basics.modules
  - engineering.typescript.learn.intermediate.classes-and-compatibility
tags:
  - TypeScript
  - General Reference
  - 声明
  - 模块
  - JSX
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: TypeScript General Reference
    url: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: TypeScript JSX Handbook
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: TypeScript fixed Website snapshot
    url: https://github.com/microsoft/TypeScript-Website/tree/c8170c35bda4811c9516cbb69c39241ae4beb6d9
    sourceType: source-code
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - declaration-merging
  - enums
  - iterators-and-generators
  - jsx
  - mixins
  - namespaces-and-modules
  - namespaces
  - symbols
  - triple-slash-directives
  - type-compatibility
  - type-inference
  - variable-declarations
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript General Reference

## 一、概述

本页合并 General Reference 的 12 个稳定官方主题。每个主题有独立 heading 和 index target；合并页只共享版本、
示例和易错提示，不把不同语义折叠成一个键。

## 二、签名与语法

General Reference 同时覆盖类型系统能力（声明合并、兼容性、推导）和语言/平台边界（枚举、迭代器、JSX、命名空间、
symbol、三斜线指令与变量声明）。它们都属于 TypeScript 7.0.2 Handbook/Reference，不等同于 Compiler API 或
React API。

```ts
interface PanelProps { title: string }
type Panel = (props: PanelProps) => unknown

const panel: Panel = (props) => ({ title: props.title })
```

## 三、Declaration Merging

同名的 interface、namespace、class/namespace 等声明可以按官方规则合并；模块增强必须在模块文件中进行。合并只
扩展类型空间，不能凭空创建运行时属性。

```ts
interface User { name: string }
interface User { id: number }
const user: User = { id: 1, name: 'Ada' }
```

## 四、Enums

`enum` 会生成运行时对象（除非使用 `const enum` 并由编译策略内联），成员可为数字、字符串或计算值。跨包发布时
应明确 emit、反向映射和 `isolatedModules` 等配置边界；不要把 enum 当作普通字符串联合的无成本替代。

```ts
enum Direction {
  Up = 'up',
  Down = 'down',
}

function move(direction: Direction) {
  return direction === Direction.Up ? 1 : -1
}

const step = move(Direction.Up)
```

## 五、Iterators and Generators

实现 `next()` 的对象满足 `Iterator` 形状，generator 函数同时提供可迭代协议。`IteratorResult` 的 `done` 与 `value`
共同表达结束状态；这类类型事实不能由浏览器页面输出替代。

```ts
// 生成两个稳定的数字标识。
function* ids() {
  yield 1
  yield 2
}

const iterator = ids()
```

## 六、JSX

JSX 是 TypeScript 对 XML-like 语法的类型检查规则：元素类型、属性、`JSX` namespace 和 `jsx`/`jsxImportSource`
配置共同决定检查方式。本页只讲 TypeScript JSX 合同，不实现 React 教程或 React API。

```tsx
interface Props { title: string }
const Card = (props: Props) => <section>{props.title}</section>
```

## 七、Mixins

Mixins 使用函数返回类和交叉类型组合实现复用。构造函数约束、原型成员和初始化顺序必须显式表达；它不会绕过
私有成员兼容性，也不是多继承。

```ts
class Named {
  name = 'Ada'
}

const Timestamped = <Base extends new () => object>(BaseClass: Base) =>
  class extends BaseClass {
    createdAt = Date.now()
  }

const user = new (Timestamped(Named))()
```

## 八、Namespaces and Modules

namespace 把相关声明放入命名空间，ES module 则以文件边界组织依赖。新代码优先使用 module；namespace 主题在这里
保留兼容性与迁移边界。Modules Reference 仍是独立范围。

```ts
// legacy.ts：namespace 生成可访问的运行时对象。
export namespace LegacyMetrics {
  export const unit = 'ms'
}

// modern.ts：新代码用 ES module 文件边界组织依赖。
export const formatMetric = (value: number) => `${value}${LegacyMetrics.unit}`
```

## 九、Namespaces

namespace 会生成运行时对象并支持内部导出；未导出的成员只在 namespace 内可见。与 ESM 混用时必须确认 emit 和
导入方式，不要把 namespace 语法当作模块解析配置。

```ts
namespace Metrics {
  export const unit = 'ms'
}

const unit = Metrics.unit
```

## 十、Symbols

`symbol` 提供唯一值；`unique symbol` 还能在类型层表达特定 symbol 身份。symbol-keyed 属性不会出现在普通
`Object.keys()` 结果里，类型可见性和运行时枚举行为需要分别验证。

```ts
const id: unique symbol = Symbol('id')
type Entity = { [id]: string }
```

## 十一、Triple-Slash Directives

三斜线指令是文件头的编译器元信息，例如 `/// <reference types="node" />`。它们影响声明依赖或构建关系，不能
替代现代 `import`；必须遵守官方要求的文件首部位置和作用范围。

```ts
/// <reference types="node" />
```

## 十二、Type Compatibility

TypeScript 主要采用结构类型兼容：目标所需成员都存在且类型兼容即可赋值。函数参数、返回值、类私有成员和新鲜对象
字面量会产生额外边界；兼容不代表运行时对象具有所有业务不变量。

```ts
interface Point {
  x: number
}

const value = { x: 1, y: 2 }
const point: Point = value
```

## 十三、Type Inference

推导从初始化表达式、参数、返回值和上下文取得类型。最佳公共类型和上下文类型会影响联合结果；显式注解应放在
公共边界或推导无法表达关系的位置，而不是机械覆盖所有局部变量。

```ts
const coordinates = [0, 1]
const axis = Math.random() > 0.5 ? 'x' : 'y'
```

## 十四、Variable Declarations

`let`、`const`、`var` 和解构声明共享 JavaScript 运行时规则，但 TypeScript 会结合初始化值、控制流和上下文推导
类型。`const` 的不可重新赋值不等于深层对象只读；需要字面量保留时可使用 `as const`，仍不能替代运行时冻结。

```ts
const defaults = { mode: 'strict', retries: 2 } as const
let retries = defaults.retries
const [mode] = [defaults.mode]
var legacyFlag = false

retries += 1
console.log(mode, retries, legacyFlag)
```

## 十五、行为边界

- General Reference 的 12 个键均为 stable，适用 TypeScript 7.0.2。
- `Decorators` legacy 页、`Advanced Types` deprecated 页不计入稳定分母。
- JSX 只覆盖 TypeScript 语法和类型 namespace；React runtime、组件教程和 React API 尚未开始。
- Declaration Files、Modules Reference、Project Config 和 TSConfig 由各自已上线的 Reference 承接，不在本页重复展开或计数。

## 十六、最小正确示例

```ts
interface Plugin { run(input: string): string }
namespace Plugin {
  export const version = '1'
}

// 调用结构兼容的插件并附加版本。
function usePlugin(plugin: Plugin, value: string) {
  return `${Plugin.version}:${plugin.run(value)}`
}
```

## 十七、综合示例：把语言能力放回模块边界

下面用 symbol、迭代器、类型兼容和声明合并组织一个可遍历课程集合；enum、namespace 或 mixin 只有在项目确实需要相应运行时形态时才引入。

~~~~ts
const courseKind = Symbol('course')

interface Course {
  id: string
  title: string
}

interface Course {
  readonly kind: typeof courseKind
}

class CourseCollection implements Iterable<Course> {
  constructor(private readonly courses: readonly Course[]) {}

  *[Symbol.iterator](): Iterator<Course> {
    yield* this.courses
  }
}

const courses = new CourseCollection([
  { id: 'ts', title: 'TypeScript', kind: courseKind },
])

for (const course of courses) console.log(course.title)
~~~~

该例中 interface 合并是静态合同，Symbol 和 generator 则有真实运行时行为。阅读每个小节时都应先区分类型层和 JavaScript 层。

## 十八、易错使用提示

:::pitfalls
### 把结构兼容当作运行时验证

**触发条件：** 看到对象满足接口字段就假设外部输入已经安全。

**原因：** TypeScript 的兼容性只在编译期比较可见成员，不检查 JSON、网络或用户输入。

**后果：** 缺失或错误类型的字段会在运行时触发异常。

**错误示例：**

```ts
const payload = JSON.parse(text) as any
payload.id.toFixed()
```

**正确写法：**

```ts
const payload: unknown = JSON.parse(text)
if (typeof payload === 'object' && payload !== null && 'id' in payload) {
  console.log(payload)
}
```

**验证方式：** 对外部输入先做运行时解析，再用 `tsc` 检查内部合同。
:::

## 十九、工作原理与适用边界

1. **工作原理：** 每个 heading 的 URL 来自 TypeScript 官方 General Reference；固定 Website commit 用于核验文档快照。
2. **实践建议：** 声明合并、兼容性和推导可作为库合同的查阅入口，平台/模块边界仍需对应配置和解析文档。
3. 适用场景：声明增强、类型兼容审查、JSX 类型配置和 generator 合同；不把页面作为 React 或浏览器运行时教程。

## 二十、版本与官方来源

本页所有语言行为与代码示例均适用于 TypeScript `7.0.2`。

- [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)
- [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [固定 TypeScript Website commit](https://github.com/microsoft/TypeScript-Website/commit/c8170c35bda4811c9516cbb69c39241ae4beb6d9)
