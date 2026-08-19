---
id: react.core.learn.basics.state-ownership-and-thinking-in-react
type: lesson
title: State 所有权
summary: 根据数据依赖确定最小 State、唯一所有者和可追踪的单向数据流。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 95
prerequisites:
  - react.core.learn.basics.props
  - react.core.learn.basics.event-handling
  - react.core.learn.basics.use-state
  - react.core.learn.basics.react-forms
related:
  - react.core.learn.basics.render-commit-and-state-snapshot
  - react.core.learn.basics.list-rendering-and-key
  - react.core.learn.basics.lab-task-editor
tags:
  - React
  - State
  - ownership
  - data flow
  - Thinking in React
appliesTo: React 19.2.8
verifiedAt: 2026-08-16
objectives:
  - 能解释 State 所有者、消费者和更新意图来源的区别，以及每份 State 的单一事实来源。
  - 能用三个排除问题找出最小但完整的 State。
  - 能列出依赖某份 State 的组件，并找到它们最近的共同父组件。
  - 能判断 State 应留在局部、放入共同父组件，还是位于更高层的合理组件中。
  - 能建立值与事件处理函数经 Props 向下传递、子组件显式请求更新的数据流。
  - 能用 Thinking in React 的五步方法分析数据模型、组件树和交互路径。
recap:
  - State 所有者是声明并负责改变某份 State 的组件，不一定是直接显示或编辑它的组件。
  - 固定数据、父组件传入的数据和 render 期间可计算的结果不是新的 State。
  - 确定所有者前，应列出全部 render 消费者，再寻找它们最近的共同父组件。
  - 每份独立 State 有一个明确所有者，不同 State 可以位于组件树的不同位置。
  - 值和事件处理函数都由父组件通过 Props 向下提供，子组件显式调用函数报告更新意图。
  - inverse data flow 是显式函数调用，不是隐式双向绑定。
sources:
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Thinking in React 的五步方法
      - 最小但完整的 State 判断
      - State 所有者、最近共同父组件与单向数据流
      - 通过回调 Props 报告更新意图
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 最近共同父组件与共享 State
      - 每份 State 的单一事实来源
      - 值与事件处理函数通过 Props 向下传递
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 避免冗余和重复 State
      - 可由 Props 或现有 State 计算的结果不应重复保存
  - title: TypeScript Object Types
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - 使用对象类型描述 Props 形状
  - title: TypeScript Function Type Expressions
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - 使用函数类型表达式描述回调 Props
---

# State 所有权

## 一、学习目标

- 区分“谁拥有 State”“谁读取 State”和“用户在哪里触发更新”。
- 从数据模型中排除固定数据、Props 和可计算结果，只保留必须记住的变化。
- 根据全部消费者找到最近共同父组件，并解释它为什么是常见候选而非唯一合法位置。
- 画出值 Props、事件处理函数 Props、显式回调调用和下一次 render 的完整路径。
- 识别重复 State、所有者位置错误、过度集中和双向绑定误解。
- 用一套固定步骤分析新的组件树，而不是凭组件名称或交互位置猜测所有权。

## 二、为什么需要确定 State 所有者

假设搜索框和商品列表都需要当前关键词。若两个组件分别保存一份 `query`，它们就有两个独立的可写
值：搜索框可能已经显示“苹果”，商品列表仍按空字符串筛选。React 不会自动选择哪一份才是真实值。

```text
ProductFilters: query = "苹果"
ProductTable:   query = ""
```

问题不在于变量名称重复，而在于同一项业务事实出现了两个所有者。两份 State 可以分别更新，也就可能
分别表示不同结果。

更清晰的结构只保留一份 `query`：

```text
FilterableProductTable: query = "苹果"  <- 唯一所有者
        |                         |
        v                         v
ProductFilters               ProductTable
显示当前关键词               根据关键词筛选
```

确定所有者的目的，是让每项变化数据都有明确的保存位置和更新入口。读取者可以有多个，可写事实来源只
保留一个。

## 三、Thinking in React 的分析起点

Thinking in React 把从数据模型得到可交互界面的过程分为五步：

1. 把 UI 拆成组件层级。
2. 先用数据和 Props 构建静态版本。
3. 找出 UI State 的最小但完整表示。
4. 确定每份 State 应放在哪里。
5. 添加显式的 inverse data flow，让交互能够请求所有者更新 State。

这五步是一套分析顺序，不是 React runtime 的五个执行阶段。State 所有权主要对应第三至第五步，
但判断所有者前必须先知道数据模型和组件层级。

### 1. 数据模型与组件层级

以商品筛选界面为例，数据模型包含商品名称、分类和库存状态。与所有权判断直接相关的组件树可以写成：

```text
FilterableProductTable
├── ProductFilters
└── ProductTable
```

- `FilterableProductTable` 组合整个筛选区域。
- `ProductFilters` 显示搜索框和库存开关。
- `ProductTable` 显示符合条件的商品和匹配数量。

组件边界可以参考 UI 区域、数据职责和交互关系，不存在只靠语法得到的唯一切法。这里保留三个组件，
是为了能明确列出 State 消费者和它们的共同父组件。

### 2. 静态版本先只使用数据与 Props

静态版本先验证数据能否从上层沿组件树向下传递，不添加交互 State：

```tsx
interface Product {
  id: string
  name: string
  inStock: boolean
}

interface ProductTableProps {
  products: Product[]
}

/** 只根据传入的数据渲染静态商品列表。 */
function ProductTable({ products }: ProductTableProps) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  )
}
```

`products` 在这个组件中是 Props，不是 `ProductTable` 的 State。先建立这条父到子的静态数据流，
可以避免把“页面上出现的数据”全部误判为 State。

## 四、找出最小但完整的 State

State 表示组件为了响应交互而必须记住的信息。“最小”表示不保存可以重新得到的副本；“完整”表示
保留下来的值足以确定当前 UI。

### 1. 三个排除问题

对每个数据候选依次提问：

1. 这个值是否保持不变？若是，它不是 State。
2. 它是否由父组件通过 Props 传入？若是，它不是当前组件拥有的新 State。
3. 它是否能在 render 期间由现有 Props 或 State 计算出来？若是，它不是独立 State。

只有会随交互变化、不能由现有输入计算、并且界面必须记住的值，才需要 State。

### 2. 商品筛选数据逐项判断

| 数据候选 | 是否为筛选区域的新 State | 判断依据 |
| --- | --- | --- |
| 完整商品列表 `products` | 否 | 作为固定数据或由更上层通过 Props 提供。 |
| 搜索关键词 `query` | 是 | 随用户输入变化，不能从其他当前输入计算。 |
| 只看有货 `onlyInStock` | 是 | 随用户选择变化，不能从商品列表反推。 |
| 筛选结果 `visibleProducts` | 否 | 可由 `products`、`query` 和 `onlyInStock` 计算。 |
| 匹配数量 `matchCount` | 否 | 可由 `visibleProducts.length` 计算。 |

“值会变化”不是 State 的充分条件。筛选结果会变化，但它始终是当前输入的计算结果：

```tsx
const visibleProducts = products.filter(
  (product) =>
    product.name.includes(query) && (!onlyInStock || product.inStock),
)
const matchCount = visibleProducts.length
```

若再为 `visibleProducts` 或 `matchCount` 创建 setter，就增加了需要手动同步的副本。直接计算可以保证
每次 render 使用同一组当前输入。

### 3. 最小 State 仍必须完整

只保留一个 `hasFilter` 布尔值并不完整，因为它无法还原具体关键词和库存开关。最小表示应保留足以
确定界面的原始交互值：

```tsx
const [query, setQuery] = useState('')
const [onlyInStock, setOnlyInStock] = useState(false)
```

这两项 State 加上 `products`，可以唯一确定输入框、复选框、商品列表和匹配数量。

## 五、确定每份 State 的所有者

State 所有者是声明并负责改变该 State 的组件。直接显示值的组件、发生点击或输入的组件，不一定是
所有者。

### 1. 先列出全部 render 消费者

只要组件的 render 结果依赖某份 State，它就是消费者。对 `query` 和 `onlyInStock`：

- `ProductFilters` 需要它们显示搜索框当前值和复选框当前状态。
- `ProductTable` 需要它们选择要显示的商品并计算匹配数量。

不能只看到输入发生在 `ProductFilters`，就立即把 State 放进去。消费者列表必须覆盖完整 UI 依赖。

### 2. 找到最近的共同父组件

沿组件树向上寻找第一个同时覆盖全部消费者的组件：

```text
FilterableProductTable       <- 最近共同父组件
├── ProductFilters           <- 消费 query、onlyInStock
└── ProductTable             <- 消费 query、onlyInStock
```

若 `query` 位于 `ProductFilters` 内，兄弟组件 `ProductTable` 无法通过正常的父到子 Props 获得它。
`FilterableProductTable` 同时位于两个消费者上方，因此是直接的所有者候选。

### 3. 选择有意义的所有者位置

官方给出三种位置：

1. 把 State 放在最近共同父组件中。
2. 放在共同父组件之上的某个合理组件中。
3. 现有组件都不适合时，在共同父组件上方新增专门的所有者组件。

最近共同父组件是常见起点，不是 React 强制的唯一语法位置。选择更高层时仍应有清楚的数据职责，
不能只因为“以后可能需要”就扩大所有权范围。

### 4. 所有权按每份 State 分别判断

一个组件可以拥有 `query`，同时读取上层传入的 `products`。另一张只在内部展开的帮助卡片，也可以
拥有自己的 `isOpen`。所有权不是给组件贴上“有状态”或“无状态”标签，而是回答具体哪份 State 由谁
保存。

## 六、每份 State 的单一事实来源

single source of truth 表示每份独立 State 有一个明确所有者。它不表示整个应用只能调用一次
`useState`，也不要求所有 State 都进入根组件或全局 Store。

### 1. 单一限制的是可写来源

同一份 State 可以有多个读取者：

```text
                         -> ProductFilters
query owner State        -> ProductTable
                         -> MatchSummary
```

这些组件都从同一所有者获得值，所以读取位置增加不会产生第二份事实。风险来自多个组件分别创建可写
副本。

### 2. 不同 State 可以位于不同层级

筛选条件可以由商品区域持有，只影响单张卡片的展开状态可以留在卡片内部。判断标准是每份 State 的
真实消费者集合，不是组件在页面上的视觉大小。

### 3. 可计算结果不建立第二个来源

`visibleProducts` 和 `matchCount` 没有自己的 setter。它们只描述当前 `products`、`query` 和
`onlyInStock` 的结果，因此不需要另一个所有者。

## 七、单向数据流与显式更新请求

React 的基础数据流由父到子。所有者把当前值和事件处理函数都作为 Props 向下传递。

### 1. 值与函数都通过 Props 向下

```tsx
interface ProductFiltersProps {
  query: string
  onlyInStock: boolean
  onQueryChange: (nextQuery: string) => void
  onStockFilterChange: (nextValue: boolean) => void
}

/** 显示所有者传入的值，并在交互时调用对应回调。 */
function ProductFilters({
  query,
  onlyInStock,
  onQueryChange,
  onStockFilterChange,
}: ProductFiltersProps) {
  return (
    <>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
      />
      <input
        type="checkbox"
        checked={onlyInStock}
        onChange={(event) => onStockFilterChange(event.currentTarget.checked)}
      />
    </>
  )
}
```

`ProductFilters` 能调用回调，但它没有声明第二份 `query` 或 `onlyInStock`，因此不会成为这两份 State
的所有者。

### 2. inverse data flow 是显式函数调用

完整方向是：

```text
owner -- 当前值 + handler Props --> child
child -- 显式调用 handler -------> 请求 owner 更新
owner -- 下一次 render 的新值 ---> child
```

handler 函数本身仍由父组件向下传递。向所有者报告的是调用携带的新值或交互意图。这个过程不是回调
自动向上查找，也不是 React 隐式修改父组件 State 的双向绑定。

### 3. 直接传 setter 不改变所有权

若子组件回调合同与 setter 参数一致，可以直接传递 setter：

```tsx
<ProductFilters
  query={query}
  onlyInStock={onlyInStock}
  onQueryChange={setQuery}
  onStockFilterChange={setOnlyInStock}
/>
```

子组件可以调用收到的函数。State 仍然声明并存放在父组件中，所以下传 setter 不会创建新的所有者。

### 4. TypeScript 类型只描述调用合同

`ProductFiltersProps` 可以检查值和函数的形状，例如 `onQueryChange` 必须接收字符串。类型无法证明
运行时只有一份 `query` State；真正的所有权仍由 `useState` 的声明位置和组件依赖关系决定。

## 八、完整判断过程

将商品筛选场景按五步串联：

1. 数据模型提供固定 `products`，组件树包含所有者候选、筛选字段和商品表。
2. 静态版本通过 Props 向下传递商品数据。
3. 三个排除问题留下 `query`、`onlyInStock` 两项 State。
4. 两项 State 的消费者都是 `ProductFilters` 与 `ProductTable`，最近共同父组件是
   `FilterableProductTable`。
5. 所有者把当前值和 handler 传给 `ProductFilters`，把数据与筛选值传给 `ProductTable`；交互发生时，
   子组件显式调用 handler。

```tsx
/** 持有两项筛选 State，并向两个消费者提供当前输入。 */
function FilterableProductTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)

  return (
    <>
      <ProductFilters
        query={query}
        onlyInStock={onlyInStock}
        onQueryChange={setQuery}
        onStockFilterChange={setOnlyInStock}
      />
      <ProductTable
        products={products}
        query={query}
        onlyInStock={onlyInStock}
      />
    </>
  )
}
```

这段结构可以从任意消费者追踪到同一个所有者，也可以从任意交互追踪到明确的 handler 和下一次
render。

## 九、筛选商品的 State 所有权

下面的 Demo 只保留所有权分析需要的观察点：

1. `ProductTableDemo` 声明 `query` 和 `onlyInStock`。
2. `ProductFilters` 读取两项当前值，并调用所有者提供的回调。
3. `ProductTable` 读取同样的筛选值，在 render 中计算 `visibleProducts` 和匹配数量。
4. 搜索词或库存开关变化后，字段、列表和数量读取同一所有者的新值。

:::demo{id="react.core.learn.basics.product-table-demo"}
:::

展开源码可以看到只有两个 `useState`。`visibleProducts` 和匹配数量没有 setter，也没有第二份筛选
State。

## 十、易错使用提示

:::pitfalls
### 错误一：把可计算结果保存为 State

**触发条件：** 已经保存筛选条件，又为筛选后的列表和匹配数量分别创建 State。

**原因：** 这些结果可以由当前 Props 和 State 在 render 中计算，不需要独立记忆。

**后果：** 更新任一输入时都必须同步多个 setter，遗漏一次就会显示过期结果。

**错误示例：**

```tsx
const [query, setQuery] = useState('')
const [visibleProducts, setVisibleProducts] = useState(products)
const [matchCount, setMatchCount] = useState(products.length)
```

**正确写法：**

```tsx
const [query, setQuery] = useState('')
const visibleProducts = products.filter((product) => product.name.includes(query))
const matchCount = visibleProducts.length
```

**验证方式：** 列出计算结果所需输入；若当前 render 已经拥有全部输入，结果就不应有独立 setter。

### 错误二：在兄弟组件中复制共享 State

**触发条件：** 搜索组件和结果组件分别调用 `useState` 保存同一个关键词。

**原因：** 两份 State 可以独立更新，没有自动同步关系。

**后果：** 输入框与筛选结果可能显示不同事实，系统无法确定哪一份是当前关键词。

**错误示例：**

```tsx
/** 错误地持有自己的关键词副本。 */
function SearchInput() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
}
```

**正确写法：**

```tsx
/** 由兄弟组件的共同父组件统一持有关键词。 */
function Products() {
  const [query, setQuery] = useState('')
  return (
    <>
      <SearchInput query={query} onQueryChange={setQuery} />
      <ProductTable query={query} />
    </>
  )
}
```

**验证方式：** 在相关组件树中搜索这项业务值，应只存在一个 State 声明，所有读取者都能追踪到它。

### 错误三：只按交互位置选择所有者

**触发条件：** 因为用户在 `ProductFilters` 输入关键词，就把 `query` 放在该组件内部。

**原因：** 所有权由全部 render 消费者决定，不由鼠标或键盘事件发生的位置决定。

**后果：** 兄弟组件无法通过父到子的 Props 读取当前值，开发者只能增加副本或绕过组件数据流。

**错误示例：**

```tsx
/** 错误：query 位于 ProductTable 的兄弟组件内部。 */
function ProductFilters() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
}
```

**正确写法：**

```tsx
/** 共同父组件覆盖筛选字段和商品表两个消费者。 */
function FilterableProductTable() {
  const [query, setQuery] = useState('')
  return (
    <>
      <ProductFilters query={query} onQueryChange={setQuery} />
      <ProductTable query={query} />
    </>
  )
}
```

**验证方式：** 先列出所有 render 消费者，再沿组件树向上寻找共同父组件，不能只检查事件处理组件。

### 错误四：把所有 State 都集中到应用顶层

**触发条件：** 把“单一事实来源”理解成整个应用只能有一个状态位置。

**原因：** 单一事实来源按每份独立 State 判断，不要求不同 State 共享同一个所有者。

**后果：** 顶层组件承担无关职责，Props 路径变长，局部数据的真实依赖范围被隐藏。

**错误示例：**

```tsx
/** 错误：根组件持有只服务单张帮助卡片的展开状态。 */
function App() {
  const [isProductHelpOpen, setIsProductHelpOpen] = useState(false)
  return <ProductPage isHelpOpen={isProductHelpOpen} onHelpChange={setIsProductHelpOpen} />
}
```

**正确写法：**

```tsx
/** 让局部展开状态留在唯一消费它的组件中。 */
function ProductHelp() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <button type="button" onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? '收起' : '展开'}
    </button>
  )
}
```

**验证方式：** 分别列出每份 State 的消费者；若某份 State 只服务一个局部组件，就不应仅为集中而上移。

### 错误五：把 inverse data flow 说成双向绑定

**触发条件：** 看到子组件能触发父组件更新，就声称回调会自动向上流动或子组件直接修改父 State。

**原因：** handler 由父组件通过 Props 向下提供，子组件只在交互时显式调用收到的函数。

**后果：** 数据来源和更新入口变得模糊，无法准确判断谁声明并拥有 State。

**错误示例：**

```text
child 自动找到并修改 parent State
```

**正确写法：**

```text
parent 传 value 和 handler -> child
child 显式调用 handler      -> parent 决定更新
parent 再 render            -> 新 value 向下传递
```

**验证方式：** 删除父组件传下来的 handler 后，子组件不应仍能改变那份父组件 State。
:::

## 十一、原理与适用场景

### 1. 官方事实

1. Thinking in React 先建立组件层级和静态 Props 数据流，再识别最小 State、选择所有者并接入交互。
2. 不变、来自父 Props、或可由现有 Props/State 计算的候选不是新的 State。
3. 对每份 State，应列出全部 render 消费者并找到它们最近的共同父组件。
4. State 可以放在共同父组件、更高层的合理组件，或新增的所有者组件中。
5. 每份独立 State 有一个明确所有者，不同 State 可以位于组件树的不同位置。
6. 值和 handler 都通过 Props 向下传递；子组件显式调用 handler 请求更新。

### 2. 判断推导

1. 所有者必须足够高，才能覆盖全部真实消费者；同时不应无理由扩大到无关组件范围。
2. 读取者数量不影响单一事实来源，独立可写副本的数量才会造成冲突。
3. 可计算结果保持为 render 计算，可以删除额外所有者和同步路径。
4. TypeScript interface 能明确值与回调的调用合同，但不能代替组件依赖和 State 声明分析。

### 3. 适用边界

- 这里处理组件树内基础 `useState` 的存在理由、所有者和更新路径。
- 组件拆分只用于识别消费者与共同父级，不扩展为文件架构或通用容器设计。
- 派生值只判断“能否由当前输入计算”，不讨论缓存、性能或复杂状态结构。
- 不使用 Context、Reducer、Effect、外部 Store 或路由替代基础所有权分析。
- 最近共同父组件是默认分析起点，不是禁止 State 位于更高层的运行时限制。

## 十二、练习

:::exercise
### 1. 判断最小 State

**要求：** 给定 `products`、`query`、`onlyInStock`、`visibleProducts` 和 `matchCount`，逐项回答“不变、来自 Props、可计算”三个问题，只为必须记住的值保留 State，并写出另外两个结果的 render 计算。

**验收：** 只有 `query` 与 `onlyInStock` 使用 `useState`；`visibleProducts` 和 `matchCount` 没有 setter；每项判断都能指出依据。
:::

:::exercise
### 2. 标注所有者与消费者

**要求：** 画出 `CoursePage -> CourseFilters + CourseList + ResultCount` 组件树。`CourseFilters` 显示 `keyword`，`CourseList` 和 `ResultCount` 根据它 render。列出全部消费者、最近共同父组件和建议所有者，并说明为什么不能只按输入发生位置判断。

**验收：** `keyword` 只有一个 State 声明；三个消费者都能沿组件树追踪到同一所有者；答案没有把全部页面 State 机械地集中到应用根组件。
:::

:::exercise
### 3. 追踪一次更新

**要求：** 从搜索框的 `onChange` 开始，依次写出事件读取的新值、回调 Prop、所有者 setter、下一次 render、派生筛选和结果 Props，标明每条数据或函数的传递方向。

**验收：** handler 的定义来源和调用位置清楚；没有“回调自动向上流动”或“双向绑定”表述；新列表和数量来自当前 Props/State 的计算。
:::

## 十三、本节小结

- State 所有者是声明并负责改变某份 State 的组件，展示者和交互位置不一定是所有者。
- 先排除固定数据、父 Props 和可计算结果，只保留最小但完整的 State。
- 对每份 State 列出全部 render 消费者，再寻找最近共同父组件。
- 最近共同父组件是常见候选，也可以选择更高层或新增合理所有者组件。
- 单一事实来源按每份 State 判断，不要求全应用集中状态。
- 值与 handler 都通过 Props 向下传；子组件显式调用 handler 请求所有者更新。
- inverse data flow 仍是可追踪的单向数据流，不是隐式双向绑定。

## 十四、参考资料

- [Thinking in React](https://react.dev/learn/thinking-in-react) - 五步法、最小 State、所有者算法、单向数据流与 inverse data flow。
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 最近共同父组件、handler Props 与每份 State 的单一事实来源。
- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 避免冗余和重复 State 的基础判断。
- [TypeScript Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) - Props 对象形状的类型写法。
- [TypeScript Function Type Expressions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) - 回调 Props 的函数类型表达式。
