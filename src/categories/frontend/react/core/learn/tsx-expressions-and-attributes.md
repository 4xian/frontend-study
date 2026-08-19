---
id: react.core.learn.basics.tsx-expressions-and-attributes
type: lesson
title: TSX 表达式与属性
summary: 理解 TSX 花括号如何传入动态值，并准确判断布尔 attribute 与常见 child 值的结果。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.core.learn.basics.tsx-markup-syntax
related:
  - react.core.learn.basics.dom-props
  - engineering.typescript.reference.tsconfig-language-jsx
tags:
  - React
  - JSX
  - TSX
  - expression
  - attribute
appliesTo: React 19.2（运行时 19.2.8）、TypeScript JSX
verifiedAt: 2026-08-15
objectives:
  - 能说明花括号在 TSX 中的两个位置，并区分 expression 与 statement。
  - 能区分引号字符串与花括号动态 attribute 的实际输入值。
  - 能正确写出布尔 attribute 的简写、显式值和动态值。
  - 能预测 string、number、Boolean、null 与 undefined 作为 child 的可见结果。
  - 能识别 function、Symbol 和普通对象作为 child 时的不同错误边界。
recap:
  - 花括号把 child 或 attribute 的当前位置切换为 JavaScript expression。
  - 引号传入静态字符串，花括号传入表达式结果。
  - 无值 attribute 的输入值是 Boolean true，字符串 false 不是 Boolean false。
  - string 与 number child 会显示，Boolean、null、undefined 是 empty node。
  - function 和 Symbol 会产生开发警告，普通对象 child 会抛错。
sources:
  - title: React JavaScript in JSX with Curly Braces
    url: https://react.dev/learn/javascript-in-jsx-with-curly-braces
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 花括号在 child 与 attribute 中的合法位置
      - 引号字符串、动态值与普通对象 child 错误
  - title: React Conditional Rendering
    url: https://react.dev/learn/conditional-rendering
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - false、null、undefined 与数值零的显示差异
  - title: React Children
    url: https://react.dev/reference/react/Children
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - string、number 与 empty node 的公共分类
  - title: React DOM Common Components
    url: https://react.dev/reference/react-dom/components/common
    sourceType: api-doc
    appliesTo: React DOM 19.2
    claims:
      - children 接受的常见 React node 类型
  - title: React JSX In Depth - Props Default to True
    url: https://legacy.reactjs.org/docs/jsx-in-depth.html#props-default-to-true
    sourceType: official-reference
    appliesTo: React JSX 兼容语法
    claims:
      - 无值 JSX attribute 的输入值为 true
  - title: React 19.2.8 Child Reconciler Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - bigint、function、Symbol 与普通对象 child 的固定版本行为边界
  - title: TypeScript JSX Handbook
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript JSX
    claims:
      - JSX attribute 与 children 的静态检查边界
---

# TSX 表达式与属性

## 一、学习目标

- 看到 `{...}` 时，能判断其中是不是一个会产生值的 JavaScript expression。
- 能区分 `title="courseTitle"`、`title="{courseTitle}"` 和 `title={courseTitle}`。
- 能根据需要选择布尔简写、显式布尔值或动态布尔值。
- 能预测常见 JavaScript 值放在 child 位置时是否显示、警告或报错。
- 能先判断 expression 的结果，再判断 child 或 attribute 是否接受该值。

## 二、为什么需要花括号

静态 TSX 只能写出固定内容：

~~~~tsx
const heading = <h1>React Core</h1>
~~~~

真实界面还需要读取数据，例如课程标题、完成数量和是否锁定：

~~~~tsx
const courseTitle = 'React Core'
const completedLessons = 2
const locked = false

const summary = (
  <section title={courseTitle}>
    <h1>{courseTitle}</h1>
    <p>已完成 {completedLessons} 课</p>
    <button disabled={locked}>继续学习</button>
  </section>
)
~~~~

这里没有新增模板语言。花括号只是告诉 TSX：“这个位置要读取一个 JavaScript expression 的结果。”

## 三、花括号打开 JavaScript expression

### 1. 两个常用位置

React 官方文档给出两个常用位置。

第一种是标签内容，也就是 child 位置：

~~~~tsx
const courseTitle = 'TSX 表达式与属性'
const heading = <h2>{courseTitle}</h2>
~~~~

第二种是 attribute 的 `=` 后：

~~~~tsx
const courseTitle = 'TSX 表达式与属性'
const heading = <h2 title={courseTitle}>课程</h2>
~~~~

两种写法都会先计算 `courseTitle`，但结果由不同位置接收：前者成为 child，后者成为 `title` 的输入值。

### 2. expression 必须产生一个值

变量读取、属性读取、算术和函数调用都能产生值：

| 写法 | 结果 |
| --- | --- |
| `{courseTitle}` | 变量当前值 |
| `{course.title}` | 对象字段值 |
| `{completed + 1}` | 算术结果 |
| `{formatTitle(course.title)}` | 函数调用结果 |
| `{ready ? '可开始' : '未就绪'}` | 条件表达式的一个分支 |

最后一行说明条件表达式也会产生一个值。

### 3. 常用字段读取与回退

expression 可以组合属性访问、可选链和空值合并：

~~~~tsx
const course = {
  title: '  React Core  ',
}

const normalizedTitle = course.title?.trim() ?? '未命名课程'
const heading = <h2>{normalizedTitle}</h2>
~~~~

这段代码依次完成三件事：

1. `course.title` 读取字段。
2. `?.trim()` 只在值不是 `null` 或 `undefined` 时调用方法。
3. `??` 只在左侧为空值时提供回退文字。

若 `0` 是合法值，`??` 通常比 `||` 更能表达“只处理空值”的意图：

~~~~tsx
const pendingCount = 0

const preserved = pendingCount ?? 10
const replaced = pendingCount || 10
~~~~

`preserved` 是 `0`，`replaced` 是 `10`。这种差异会直接影响最终 child 显示的数值。

### 4. 复杂计算先命名结果

花括号接受 expression，不代表所有计算都适合堆在标记中：

~~~~tsx
const completed = 8
const total = 10
const completionRate = Math.round((completed / total) * 100)

const progress = <p>完成度：{completionRate}%</p>
~~~~

把中间结果命名后，标记只负责显示最终值；计算规则也更容易单独核对。

### 5. statement 不能直接放进花括号

`if`、`for`、`switch`、变量声明和 `return` 都是 statement，不是可以直接嵌入的 expression：

~~~~tsx
const ready = true
const view = <p>{if (ready) '可开始'}</p>
~~~~

这段代码不能通过解析。先在花括号外得到一个值，再把结果放入 TSX：

~~~~tsx
const ready = true
const status = ready ? '可开始' : '未就绪'
const view = <p>{status}</p>
~~~~

不要为了把 statement 塞进标记而创建复杂的立即执行函数。简单值先计算、后展示，意图更清楚。

### 6. `${}` 不是 TSX 插值

`${value}` 只有在反引号模板字符串中才有插值语义：

~~~~tsx
const courseTitle = 'React Core'

const first = <p>{courseTitle}</p>
const second = <p>{`课程：${courseTitle}`}</p>
~~~~

第一行直接读取变量；第二行的外层花括号进入 JavaScript，内部才是模板字符串。

若页面需要显示花括号字符，可以让 expression 返回包含花括号的 string：

~~~~tsx
const literal = <code>{'{courseTitle}'}</code>
~~~~

最终显示 `{courseTitle}`，但源码中的外层花括号仍然执行了一次 JavaScript string expression。

## 四、静态与动态 attribute

### 1. 引号传入静态字符串

~~~~tsx
const courseTitle = 'React Core'

const literalName = <p title="courseTitle">课程</p>
const literalBraces = <p title="{courseTitle}">课程</p>
~~~~

第一个 `title` 是字符串 `courseTitle`；第二个是字符串 `{courseTitle}`。引号内部不会再次打开
expression container。

### 2. 动态值去掉引号

~~~~tsx
const courseTitle = 'React Core'
const dynamicTitle = <p title={courseTitle}>课程</p>
~~~~

这里 `title` 接收变量值 `React Core`。

固定字符串也可以写成 `title={'React Core'}`，但没有动态计算时，引号更直接：

~~~~tsx
const clear = <p title="React Core">课程</p>
const unnecessary = <p title={'React Core'}>课程</p>
~~~~

用引号表示固定值，用花括号表示需要求值的内容，可以直接看出数据来源。

把四种常见写法放在一起比较：

| TSX 写法 | 输入值 | 是否读取变量 |
| --- | --- | --- |
| `title="courseTitle"` | string `"courseTitle"` | 否 |
| `title="{courseTitle}"` | string `"{courseTitle}"` | 否 |
| `title={courseTitle}` | `courseTitle` 的求值结果 | 是 |
| `title={'React Core'}` | string `"React Core"` | expression 是固定字面量 |

### 3. expression 有值不等于当前位置接受它

花括号可以计算出 string、number、Boolean、对象或函数，但不同 attribute 有自己的输入类型，child 也有
自己的 React node 合同。

~~~~tsx
const locked = false

const button = <button disabled={locked}>开始</button>
~~~~

TypeScript 会根据当前 JSX 库的类型检查输入。一个 expression 能产生值，不代表目标 attribute 接受
该值的类型。

## 五、布尔 attribute 的输入值

### 1. 无值简写得到 `true`

~~~~tsx
const first = <button disabled>不可用</button>
const second = <button disabled={true}>不可用</button>
~~~~

在 JSX 输入值层面，`disabled` 与 `disabled={true}` 等价。前者是简写，不是“没有值”。

### 2. 动态布尔值使用 expression

~~~~tsx
const locked = false
const button = <button disabled={locked}>继续学习</button>
~~~~

当 `locked` 为 false 时，传入的是 Boolean `false`。这与字符串不同：

~~~~tsx
const wrong = <button disabled="false">继续学习</button>
~~~~

`"false"` 是包含五个字符的 string，不会变成 Boolean `false`。要表达布尔值，应传入 Boolean
expression。

常见写法的输入值如下：

| TSX 写法 | 输入值 |
| --- | --- |
| `disabled` | Boolean `true` |
| `disabled={true}` | Boolean `true` |
| `disabled={false}` | Boolean `false` |
| `disabled={locked}` | 变量 `locked` 的求值结果 |
| `disabled="false"` | string `"false"` |

### 3. Boolean attribute 与 Boolean child 是两个位置合同

~~~~tsx
const locked = true

const view = (
  <section>
    <button disabled={locked}>继续学习</button>
    <p>{locked}</p>
  </section>
)
~~~~

按钮得到 Boolean 输入；`p` 中的 Boolean 是 child，不会显示 `true` 文字。相同 JavaScript 值放在不同
位置，接收合同不同。

## 六、child expression 的值边界

React 不会对每个 child 都调用 `String(value)`。常见值可以分为三类。

| expression 结果 | React 19.2 可观察结果 | 判断 |
| --- | --- | --- |
| 非空 string | 显示字符串字符 | 可直接显示 |
| 空字符串 `''` | 没有可见字符 | 仍是 string，不是 empty node |
| number | 显示数字文字，`0` 也显示 | 可直接显示 |
| `true` / `false` | 不显示文字 | 官方 empty node |
| `null` | 不显示文字 | 官方 empty node |
| `undefined` | 不显示文字 | 官方 empty node |
| function | 开发环境 warning，随后无文字 | 无效 child |
| Symbol | 开发环境 warning，随后无文字 | 无效 child |
| unsupported 普通对象 | 抛出运行错误 | 无效 child |

### 1. string 与 number 会显示

~~~~tsx
const title = 'React Core'
const completed = 0
const view = <p>{title}：已完成 {completed} 课</p>
~~~~

string 作为可见文字显示，number 作为数字文字显示。`0` 也会显示为 `0`，不能因为它在 JavaScript 中是
falsy 就把它当作空 child。

空字符串 `''` 没有可见字符，但它仍然是 string 的边界值，不应与 `null` 这类 empty node 混为一谈。

### 2. Boolean、`null` 与 `undefined` 是 empty node

~~~~tsx
const view = (
  <p>
    开始[{true}][{false}][{null}][{undefined}]结束
  </p>
)
~~~~

四个值都不产生可见文字，最终显示四组空括号。它们是 React 公共合同中的 empty node。

这不表示四个值在 JavaScript 中相等，也不表示属性位置会同样处理它们。本课只描述 child 结果。

### 3. function 与 Symbol 是警告型无效 child

~~~~tsx
const formatTitle = (title: string) => title.toUpperCase()
const wrongFunction = <p>{formatTitle}</p>
const wrongSymbol = <p>{Symbol('course')}</p>
~~~~

在 React 19.2.8 开发环境中，这两种输入会产生不同 warning，随后不显示内容。它们不是官方 empty node，
不能被当作“隐藏内容”的写法。

通常应传入函数调用结果，或把 Symbol 转换成明确的文字：

~~~~tsx
const course = { title: 'React Core' }
const correctFunction = <p>{formatTitle(course.title)}</p>
const correctSymbol = <p>{String(Symbol('course'))}</p>
~~~~

### 4. 普通对象 child 会抛错

~~~~tsx
const course = { title: 'React Core' }
const wrong = <p>{course}</p>
~~~~

普通数据对象不是可显示文本 child。类型检查通常会拒绝它；绕过类型后，React 运行时仍会抛出
`Objects are not valid as a React child`。

选择要显示的字段：

~~~~tsx
const course = { title: 'React Core' }
const correct = <p>{course.title}</p>
~~~~

调试时可以明确写 `JSON.stringify(course)`，但这表示“显示序列化后的 string”，不是让 React 直接渲染
对象。

## 七、按错误发生层定位问题

同一对花括号可能在不同阶段失败。按发生层判断，能避免只盯着页面猜原因。

### 1. TSX 解析错误

花括号中直接出现 `if`、`for` 或变量声明时，parser 无法得到合法 expression。此时先修正语法，页面
还没有进入 React 运行阶段。

### 2. TypeScript 类型错误

expression 语法合法，但值不属于目标 attribute 或 `ReactNode` 时，类型检查会提前拒绝：

~~~~tsx
const course = { title: 'React Core' }
const invalidChild = <p>{course}</p>
~~~~

不要用宽泛断言掩盖错误。断言只改变静态检查结果，不会把普通对象变成可显示 child。

### 3. React 开发 warning

function 或 Symbol 可能来自动态数据，或被断言绕过类型。React 开发环境会报告 warning；应根据 warning
定位实际 expression，而不是把“页面没有文字”当作正确结果。

### 4. React 运行错误

unsupported 普通对象会让当前渲染失败。读取明确字段或先格式化数据，才能得到 React 接受的 child。

### 5. 结果正确但预测错误

`0` 显示、Boolean 不显示都不会必然产生诊断。此时要对照值类型和最终可见文字，而不是等待工具报错。

## 八、观察动态值、Boolean 与空 child

下面的同源 Demo 只运行安全值：

- 静态引号与动态 `title` 的输入差异。
- string、函数调用结果与 number `0` 的可见文字。
- `disabled`、`disabled={true}` 与 `disabled={false}` 的结果。
- `true`、`false`、`null` 与 `undefined` 留下的空位置。

本 Demo 只呈现不会污染页面的安全值；function、Symbol 与普通对象的 warning 或运行错误通过前文示例
分别理解，不作为正常可见结果。

:::demo{id="react.core.learn.basics.tsx-expressions-and-attributes.expression-attributes-demo"}
对照运行结果与同源 TSX，检查动态 title、Boolean 按钮、数值零和四类空 child
:::

## 九、易错使用提示

:::pitfalls
### 错误：给动态 attribute 保留引号

**触发条件：** 写 `title="{courseTitle}"`，以为引号中仍会求值。

**原因：** 引号已经声明一个静态字符串，内部花括号只是普通字符。

**后果：** `title` 得到字面量 `{courseTitle}`，不是变量值。

**错误示例：**

~~~~tsx
const view = <p title="{courseTitle}">课程</p>
~~~~

**正确写法：**

~~~~tsx
const view = <p title={courseTitle}>课程</p>
~~~~

**验证方式：** 在浏览器读取该元素的 `title`，确认它等于变量当前值。

### 错误：在花括号中直接写 statement

**触发条件：** 把 `if`、`for`、变量声明或 `return` 直接写进 child expression。

**原因：** expression container 需要一个产生值的 expression，statement 不能直接成为该值。

**后果：** TSX 解析失败，项目无法通过类型检查或构建。

**错误示例：**

~~~~tsx
const view = <p>{if (ready) '可开始'}</p>
~~~~

**正确写法：**

~~~~tsx
const status = ready ? '可开始' : '未就绪'
const view = <p>{status}</p>
~~~~

**验证方式：** 确认花括号内只剩一个可以独立求值的 expression。

### 错误：用字符串 `"false"` 表示 Boolean false

**触发条件：** 写 `<button disabled="false">`。

**原因：** 引号传入 string，不会把单词 `false` 转成 Boolean。

**后果：** 接收方拿到错误类型，最终行为与“关闭该布尔值”的意图不一致。

**错误示例：**

~~~~tsx
const button = <button disabled="false">开始</button>
~~~~

**正确写法：**

~~~~tsx
const button = <button disabled={false}>开始</button>
~~~~

**验证方式：** 使用类型检查确认值为 Boolean，并在浏览器验证当前元素的实际状态。

### 错误：把所有 falsy 值都当成空 child

**触发条件：** 认为 `false` 与数值 `0` 在 child 位置都会消失。

**原因：** React 把 Boolean 作为 empty node，但 number 是可显示节点。

**后果：** 页面出现意外的 `0`，或对条件结果作出错误预测。

**错误示例：**

~~~~tsx
const count = 0
const view = <p>{count && '有新消息'}</p>
~~~~

**正确写法：**

~~~~tsx
const count = 0
const hasMessages = count > 0
const view = <p>{hasMessages ? '有新消息' : null}</p>
~~~~

**验证方式：** 分别把 `0`、`false` 与 `null` 放入带分隔符的 child，比较实际文字。

### 错误：把函数引用当成调用结果

**触发条件：** 写 `{formatTitle}`，忘记调用函数。

**原因：** expression 返回的是 function 本身，不是准备显示的 string。

**后果：** React 开发环境产生 warning，页面没有期望文字。

**错误示例：**

~~~~tsx
const view = <p>{formatTitle}</p>
~~~~

**正确写法：**

~~~~tsx
const view = <p>{formatTitle(course.title)}</p>
~~~~

**验证方式：** 检查花括号中的 expression 结果类型，并确认 console 没有 invalid child warning。

### 错误：把普通对象直接作为 child

**触发条件：** 写 `{course}`，其中 `course` 是普通数据对象。

**原因：** React 不知道对象的哪个字段应该成为可见内容。

**后果：** TypeScript 报错；绕过类型后 React 运行时抛错并中断当前渲染。

**错误示例：**

~~~~tsx
const course = { title: 'React Core' }
const view = <p>{course}</p>
~~~~

**正确写法：**

~~~~tsx
const view = <p>{course.title}</p>
~~~~

**验证方式：** 选择明确字段或格式化结果，确认 child expression 最终得到 string 或 number。
:::

## 十、原理与适用场景

### 1. 官方事实

- React 官方文档把花括号位置限定在标签内容与 attribute 的 `=` 后，并区分引号字符串与动态值。
- string 和 number 是可显示 React node；Boolean、`null`、`undefined` 是 empty node，数值 `0` 会显示。
- 无值 JSX attribute 的输入值是 `true`。
- React 对 function、Symbol 与普通对象 child 的处理不同：前两者不是可见文字，普通对象不是合法 child，
  会产生运行错误。

### 2. 课程推导

- 固定字符串用引号、动态值用花括号，可以让数据来源在阅读和审查时更清楚。
- “expression 能求值”不等于“任意位置都接受该值”；先判断位置，再判断值类型。
- 需要显示函数或对象信息时，应选择调用结果或具体字段，而不是依赖 React 隐式转换。

### 3. 使用判断

- 固定字符串直接写在引号中，需要计算的值放在花括号中。
- 先确定 expression 得到什么类型，再确认 attribute 或 child 是否接受该类型。
- 需要显示对象或函数信息时，明确选择字段或调用结果。

## 十一、练习

下面代码混淆了静态字符串、Boolean、函数和对象 child：

~~~~tsx
const course = {
  locked: false,
  pendingCount: 0,
  title: 'TSX 表达式与属性',
}

const formatTitle = (title: string) => title.toUpperCase()

const view = (
  <section title="{course.title}">
    <h2>{formatTitle}</h2>
    <p>{course}</p>
    <p>待处理：{course.pendingCount}</p>
    <button disabled="false">继续学习</button>
  </section>
)
~~~~

:::exercise
### 修正课程摘要中的动态值

**要求：** 让 `section` 的 title 读取 `course.title`；调用 `formatTitle` 显示格式化标题；正文只读取对象
字段；保留并显示数值 `0`；按钮由 `course.locked` 控制。

**验收：** title 等于“TSX 表达式与属性”；标题显示大写结果；待处理数量显示 `0`；按钮未禁用；
TypeScript 和浏览器 console 均无错误或警告。

**参考答案：**

~~~~tsx
const view = (
  <section title={course.title}>
    <h2>{formatTitle(course.title)}</h2>
    <p>{course.title}</p>
    <p>待处理：{course.pendingCount}</p>
    <button disabled={course.locked}>继续学习</button>
  </section>
)
~~~~
:::

### 1. 预测不同 child 的可见结果

先不要运行下面代码，写出你认为页面会显示的完整文字：

~~~~tsx
const count = 0
const title = ''

const view = (
  <p>
    A[{title}] B[{count}] C[{false}] D[{null}] E[{undefined}]
  </p>
)
~~~~

:::exercise
### 对照值类型解释输出

**要求：** 逐个标注 `title`、`count`、`false`、`null` 与 `undefined` 的值类型，并解释它们是否产生可见
字符。然后运行代码，对照页面文字修正预测。

**验收：** 能说明空字符串没有字符但不是 empty node；数值 `0` 显示；Boolean、`null`、`undefined`
不显示。最终可见文字包含 `B[0]`，其余对应分隔符内部为空。
:::

## 十二、本节小结

- `{expression}` 在 child 或 attribute 中读取 JavaScript expression 的结果，不能直接容纳 statement。
- 引号传入静态字符串；动态值去掉引号并使用花括号。
- 无值 attribute 得到 Boolean `true`；`"false"` 仍是 string，不是 Boolean `false`。
- string 与 number child 会显示；Boolean、`null`、`undefined` 是不显示文字的 empty node。
- React 19.2.8 还会显示 bigint；空字符串没有字符，但不属于 empty node。
- function 与 Symbol 是开发警告型无效 child；普通对象 child 会抛错。
- 解析、类型检查、开发 warning、运行错误和可见结果是五种不同反馈。
- 先判断花括号所在位置，再判断 expression 的结果类型。

## 十三、参考资料

- [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) - 花括号位置、静态字符串、动态值和普通对象 child。
- [Conditional Rendering](https://react.dev/learn/conditional-rendering) - `false`、`null`、`undefined` 与数值 `0` 的结果。
- [`Children`](https://react.dev/reference/react/Children) - string、number 与 empty node 的公共分类。
- [Common components](https://react.dev/reference/react-dom/components/common) - `children` 的常见 React node 边界。
- [JSX In Depth: Props Default to “True”](https://legacy.reactjs.org/docs/jsx-in-depth.html#props-default-to-true) - 无值 JSX attribute 的 Boolean 输入。
- [React 19.2.8 `ReactChildFiber.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js) - function、Symbol 与普通对象 child 的固定版本边界。
- [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) - JSX attribute 与 children 的静态检查边界。
