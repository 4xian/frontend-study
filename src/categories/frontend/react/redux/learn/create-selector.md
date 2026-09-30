---
id: react.redux.learn.intermediate.create-selector
type: lesson
title: createSelector
summary: 用输入 Selector 和结果函数建立可组合的记忆化查询，并通过公开诊断 API 验证缓存是否生效。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 90
prerequisites:
  - react.redux.learn.intermediate.selector
related:
  - react.redux.learn.basics.use-selector
  - react.redux.learn.basics.multiple-slices-root-state
tags:
  - Redux Toolkit
  - createSelector
  - Reselect
  - Memoization
  - 派生数据
appliesTo: Redux Toolkit 2.12.0、Reselect 5.3.0、Redux 5.0.1、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能用输入 Selector 和结果函数建立一个 createSelector 查询。
  - 能把取值留在输入 Selector，把派生计算集中到结果函数。
  - 能验证输入结果不变时缓存结果及其引用会被复用。
  - 能让多个输入 Selector 共同决定重新计算条件。
  - 能组合已有的记忆化 Selector，避免重复派生相同中间结果。
  - 能用 recomputations 等公开诊断能力解释缓存命中与依赖检查。
recap:
  - createSelector 接收输入 Selector 列表和结果函数，并返回一个输出 Selector。
  - 调用输出 Selector 时先运行输入 Selector；只有输入结果变化时才重新运行结果函数。
  - 缓存命中会复用上一次结果，包括对象或数组的引用。
  - TypeScript 项目优先用单个数组传入输入 Selector，以获得稳定的参数类型推断。
  - recomputations 统计结果函数执行次数，dependencyRecomputations 统计依赖检查次数。
sources:
  - title: Reselect createSelector API
    url: https://reselect.js.org/api/createselector/
    sourceType: api-doc
    appliesTo: Reselect 5.3.0
    claims:
      - createSelector 接收输入 Selector 数组和结果函数，并生成记忆化输出 Selector。
      - 输出 Selector 暴露 recomputations、dependencyRecomputations、lastResult 和 dependencies 等诊断字段。
      - TypeScript 对单个数组形式的输入 Selector 提供结果函数参数推断。
  - title: Reselect Best Practices
    url: https://reselect.js.org/usage/best-practices/
    sourceType: official-reference
    appliesTo: Reselect 5.3.0
    claims:
      - 输入 Selector 应保持简单并只提取字段，派生计算应放在结果函数中。
      - 传给 Selector 的参数引用应尽量保持稳定，以提高参数层缓存命中率。
  - title: Reselect Common Mistakes
    url: https://reselect.js.org/usage/common-mistakes/
    sourceType: official-reference
    appliesTo: Reselect 5.3.0
    claims:
      - 把派生计算放进输入 Selector 会破坏记忆化收益。
      - 只原样返回输入的结果函数不会完成有意义的派生计算。
  - title: Redux Deriving Data with Selectors
    url: https://redux.js.org/usage/deriving-data-selectors
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - createSelector 生成的记忆化 Selector 只在输入变化时重新计算并返回缓存结果。
      - 记忆化 Selector 可以作为另一个记忆化 Selector 的输入，实现查询组合。
      - Redux Toolkit 重新导出 createSelector，应用代码通常从 @reduxjs/toolkit 导入。
  - title: Reselect 5.3.0 Selector Construction Source
    url: https://github.com/reduxjs/reselect/blob/v5.3.0/src/createSelectorCreator.ts
    sourceType: source-code
    appliesTo: Reselect 5.3.0
    claims:
      - 输出 Selector 组装输入依赖、记忆化结果函数和公开重计算计数。
  - title: Reselect 5.3.0 Official Tests
    url: https://github.com/reduxjs/reselect/blob/v5.3.0/test/reselect.spec.ts
    sourceType: official-test
    appliesTo: Reselect 5.3.0
    claims:
      - 官方测试验证相同输入重复调用时结果函数只执行一次。
      - 官方测试验证输入结果变化后重新计算计数增加。
  - title: Redux Toolkit 2.12.0 Public Exports
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/index.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - Redux Toolkit 固定版本入口从 Reselect 重新导出 createSelector 等公开 API。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
  - title: Reselect 5.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/reselect/latest
    sourceType: official-reference
    appliesTo: Reselect 5.3.0
    claims:
      - npm latest 在核验日指向 Reselect 5.3.0。
---

# createSelector

## 一、学习目标

- 用输入 Selector 数组和结果函数创建记忆化 Selector。
- 判断一次调用是在复用缓存，还是因为相关输入变化而重新计算。
- 保持输入 Selector 简单，把筛选、排序和汇总计算放进结果函数。
- 组合已有 Selector，让后续查询复用相同的派生结果。
- 用公开诊断计数定位“参数发生变化”和“结果函数重新执行”的区别。

## 二、为什么需要 createSelector

普通 Selector 可以封装路径并计算派生数据，但每次调用都会重新执行函数体。下面的查询即使收到的商品数组和筛选条件
都没变，也会再次运行 `filter`，并返回一个新的数组引用：

```ts
/** 每次调用都创建新的可见商品数组。 */
const selectVisibleItems = (state: RootState) =>
  state.inventory.items.filter((item) =>
    state.inventory.filter === 'all' ? true : item.stock <= item.lowStockThreshold,
  )
```

当计算开销明显，或者调用方需要在输入未变时拿到同一个对象/数组引用，可以为派生查询加入记忆化。`createSelector`
不是把结果写进 Redux state，而是让查询函数记住与输入对应的派生结果。

## 三、核心概念

### 1. 输入 Selector、结果函数与输出 Selector

`createSelector` 的常用形式由两部分组成：

```ts
import { createSelector } from '@reduxjs/toolkit'

/** 读取商品原始数组。 */
const selectItems = (state: RootState) => state.inventory.items

/** 读取当前筛选条件。 */
const selectFilter = (state: RootState) => state.inventory.filter

/** 只在商品数组或筛选条件变化时重新计算可见商品。 */
const selectVisibleItems = createSelector(
  [selectItems, selectFilter],
  (items, filter) =>
    filter === 'all'
      ? items
      : items.filter((item) => item.stock <= item.lowStockThreshold),
)
```

调用 `selectVisibleItems(state)` 时，生成的输出 Selector 会：

1. 运行 `selectItems` 和 `selectFilter`，得到两个输入结果。
2. 比较这些输入结果与缓存中的输入结果。
3. 输入结果未变时返回缓存结果，不运行结果函数。
4. 任一输入结果变化时运行结果函数，并缓存新的返回值。

结果函数收到的参数顺序与输入 Selector 数组一致。它不接收完整 RootState，而是接收输入 Selector 已经提取出的值。

### 2. 记忆化比较的是输入结果

Redux dispatch 后，根状态对象通常会变化，但这不代表每个 Feature 的数据都变化。假设只更新 `activity` slice：

```ts
const before = selectVisibleItems(store.getState())
store.dispatch(activitySlice.actions.refreshRecorded())
const after = selectVisibleItems(store.getState())

console.assert(before === after)
```

第二次调用拿到新的 RootState，但 `selectItems` 返回同一个商品数组引用，`selectFilter` 也返回同一个字符串。结果函数无需
重新执行，输出 Selector 直接复用 `before` 的引用。

如果 dispatch 改变商品数组或筛选条件，至少一个输入结果会变化，结果函数才会重新计算：

```ts
store.dispatch(inventorySlice.actions.filterChanged('low-stock'))
const lowStockItems = selectVisibleItems(store.getState())

console.assert(lowStockItems !== after)
```

因此，“RootState 是否变化”和“结果函数是否重新执行”是两个不同问题。`createSelector` 的依赖边界由输入 Selector
返回什么决定。

### 3. 缓存也复用结果引用

当结果函数返回数组或对象时，缓存命中会返回上一次的同一引用：

```ts
const first = selectVisibleItems(state)
const second = selectVisibleItems(state)

console.assert(first === second)
```

引用复用是记忆化的直接结果，不表示 Redux state 中多保存了一份列表。缓存结果仍然是只读派生数据，调用方不能修改它。

### 4. TypeScript 优先使用数组形式

TypeScript 项目推荐把输入 Selector 放在单个数组中：

```ts
/** 由两个输入结果推断结果函数参数类型。 */
const selectVisibleItems = createSelector(
  [selectItems, selectFilter],
  (items, filter) => filterItems(items, filter),
)
```

在这种形式下，TypeScript 可以从数组中的 Selector 推断结果函数各参数。多个独立参数的调用形式仍可使用，但官方类型
文档明确说明数组形式的推断最稳定，因此课程和新代码统一优先采用数组形式。

## 四、设计输入和结果函数

### 1. 输入 Selector 只提取值

输入 Selector 应尽量是字段读取或参数转交：

```ts
/** 只提取商品数组。 */
const selectItems = (state: RootState) => state.inventory.items

/** 只提取筛选条件。 */
const selectFilter = (state: RootState) => state.inventory.filter
```

不要在输入 Selector 中执行 `filter`、`map` 或创建对象。输入 Selector 每次都返回新引用时，即使源数据没变，结果函数
也会看到“新输入”，缓存就无法稳定命中。

### 2. 结果函数负责派生计算

筛选、排序、聚合和对象组装属于结果函数：

```ts
type InventorySummary = {
  itemCount: number
  totalUnits: number
}

/** 汇总当前可见商品。 */
const selectVisibleSummary = createSelector([selectVisibleItems], (items): InventorySummary => ({
  itemCount: items.length,
  totalUnits: items.reduce((total, item) => total + item.stock, 0),
}))
```

这个 Selector 把 `selectVisibleItems` 作为输入。只要可见商品结果引用被复用，汇总结果也会复用；可见商品变化时，汇总才
重新计算。这就是 Selector 组合。

### 3. 多个输入共同定义依赖边界

一个结果可以依赖多个彼此独立的字段：

```ts
/** 读取展示货币。 */
const selectCurrency = (state: RootState) => state.preferences.currency

/** 同时依赖可见商品和货币设置。 */
const selectPricedItems = createSelector(
  [selectVisibleItems, selectCurrency],
  (items, currency) => items.map((item) => ({ ...item, currency })),
)
```

商品结果或货币任一变化都会重新计算。其他 state 字段变化不应进入依赖边界，也不会单独要求结果函数执行。

### 4. 在模块作用域创建并复用

无额外参数的共享 Selector 通常在 Feature 模块作用域创建一次并导出：

```ts
/** 公开库存 Feature 的低库存查询。 */
export const selectLowStockItems = createSelector([selectItems], (items) =>
  items.filter((item) => item.stock <= item.lowStockThreshold),
)
```

如果调用处每次都重新执行 `createSelector(...)`，每次得到的都是新的 Selector 实例和空缓存，之前的结果无法复用。本课
只处理共享、无额外参数的 Selector；需要为不同参数或组件建立独立实例时，应使用专门的 Selector Factory 设计。

## 五、公开诊断能力

### 1. recomputations

输出 Selector 的 `recomputations()` 返回结果函数已经执行的次数：

```ts
selectVisibleItems(state)
selectVisibleItems(state)

console.assert(selectVisibleItems.recomputations() === 1)
```

重复传入相同输入时，第二次调用命中缓存，计数不会增加。可以用 `resetRecomputations()` 把这个计数归零，方便从新的
观察点开始测量。

### 2. dependencyRecomputations

`dependencyRecomputations()` 统计输入依赖被检查的次数。新的 RootState 参数可能让依赖检查次数增加，但如果输入
Selector 最终仍返回相同结果，结果函数计数可以保持不变：

```ts
const resultRuns = selectVisibleItems.recomputations()
const dependencyRuns = selectVisibleItems.dependencyRecomputations()
```

这两个计数一起看，才能区分“调用参数变化后检查了依赖”和“派生结果真的重新计算”。对应的
`resetDependencyRecomputations()` 可以重置依赖检查计数。

### 3. 其他可检查字段

输出 Selector 还公开了以下能力：

- `lastResult()`：读取最近一次结果函数产生的结果。
- `dependencies`：读取创建时登记的输入 Selector 数组。
- `resultFunc`：读取原始结果函数。
- `memoizedResultFunc`：读取被记忆化包装后的结果函数。

这些字段适合测试、调试和教学观察，不应成为业务流程的第二套状态来源。业务代码仍应通过调用 Selector 取得当前输入
对应的结果。

## 六、Demo：createSelector 缓存观察台

:::demo{id="react.redux.learn.intermediate.create-selector.memoization-observer-demo"}

初始查询会各执行一次可见商品结果函数和组合汇总结果函数。“更新无关状态”只改变 `activity` slice：RootState 改变，
依赖检查计数增加，但库存输入结果不变，所以结果函数计数保持不变，缓存 Selector 复用同一数组引用。

“只看低库存”和“无线鼠标入库”会改变筛选条件或商品数组，属于相关输入更新，结果函数计数会增加并产生新的结果引用。
普通 Selector 对照组每次都复制数组，因此无关更新后也返回新引用。“重置演示”会恢复确定状态并重置诊断计数。

源码面板展示实际运行的 Redux store、输入 Selector、组合 Selector、普通 Selector 对照、交互组件和样式。
:::

## 七、易错使用提示

:::pitfalls
### 错误：在输入 Selector 中创建新数组

**触发条件：** 输入 Selector 直接调用 `filter`、`map` 或展开数组。

**原因：** 每次调用都会得到新引用，输入比较会认为依赖发生了变化。

**后果：** 结果函数频繁执行，记忆化失去主要作用。

**错误示例：**

```ts
/** 错误：输入 Selector 每次返回新数组。 */
const selectLowStockInput = (state: RootState) =>
  state.inventory.items.filter((item) => item.stock <= item.lowStockThreshold)

const selectNames = createSelector([selectLowStockInput], (items) =>
  items.map((item) => item.name),
)
```

**正确写法：**

```ts
/** 只读取稳定的源数组引用。 */
const selectItems = (state: RootState) => state.inventory.items

/** 在结果函数中完成筛选和映射。 */
const selectLowStockNames = createSelector([selectItems], (items) =>
  items.filter((item) => item.stock <= item.lowStockThreshold).map((item) => item.name),
)
```

**验证方式：** 构造两个根引用不同、但 `inventory.items` 保持同一引用的 RootState 快照并分别调用。错误写法的
`recomputations()` 会增加到 2，正确写法仍为 1。

### 错误：结果函数只原样返回输入

**触发条件：** `createSelector([selectItems], (items) => items)` 没有任何派生计算。

**原因：** 输入 Selector 已经提供同一引用，结果函数没有产生需要缓存的新结果。

**后果：** 增加了 API 和调试成本，却没有提供记忆化收益。

**错误示例：**

```ts
/** 错误：结果函数没有派生任何数据。 */
const selectItemsAgain = createSelector([selectItems], (items) => items)
```

**正确写法：**

```ts
/** 原始字段直接使用普通 Selector。 */
const selectItems = (state: RootState) => state.inventory.items
```

**验证方式：** 检查结果函数是否实际执行筛选、映射、汇总或对象组装；没有派生就删除 `createSelector` 包装。

### 错误：认为任意 dispatch 都会重新计算

**触发条件：** 看到 RootState 引用变化，就断定所有记忆化 Selector 的结果函数都会执行。

**原因：** `createSelector` 根据输入 Selector 的结果决定是否运行结果函数，不根据整个状态树是否为新对象直接判断。

**后果：** 对缓存命中作出错误解释，可能为了无关更新提前引入不必要优化。

**错误示例：**

```ts
store.dispatch(activitySlice.actions.refreshRecorded())
// 错误判断：RootState 变了，所以库存结果一定重新计算。
```

**正确写法：**

```ts
const beforeRuns = selectVisibleItems.recomputations()
store.dispatch(activitySlice.actions.refreshRecorded())
selectVisibleItems(store.getState())
const afterRuns = selectVisibleItems.recomputations()

console.assert(beforeRuns === afterRuns)
```

**验证方式：** 同时观察输入结果引用、`recomputations()` 和 `dependencyRecomputations()`，不要只比较 RootState。

### 错误：在结果函数中修改输入数据

**触发条件：** 对来自 Redux state 的数组直接调用 `sort`、`reverse` 或赋值修改对象字段。

**原因：** 输入仍属于 Redux state，记忆化不会把它变成可写副本。

**后果：** 查询操作破坏 state，并让后续缓存结果不可预测。

**错误示例：**

```ts
/** 错误：sort 会原地修改商品数组。 */
const selectSortedItems = createSelector([selectItems], (items) => items.sort(compareItems))
```

**正确写法：**

```ts
/** 复制数组后再排序。 */
const selectSortedItems = createSelector([selectItems], (items) =>
  [...items].sort(compareItems),
)
```

**验证方式：** 调用前后比较源数组的顺序和引用，确认结果函数没有修改输入。

### 错误：在每次查询前重新创建 Selector

**触发条件：** 函数体或渲染流程每次调用 `createSelector`，随后立刻调用新实例。

**原因：** 缓存属于 Selector 实例，新实例没有上一轮输入和结果。

**后果：** 重复调用无法命中之前的缓存，诊断计数也被拆散到多个实例。

**错误示例：**

```ts
/** 错误：每次调用都创建新的缓存。 */
function readVisibleItems(state: RootState) {
  const selector = createSelector([selectItems], (items) => items.filter(isVisible))
  return selector(state)
}
```

**正确写法：**

```ts
/** 在模块作用域创建并复用共享 Selector。 */
const selectVisibleItems = createSelector([selectItems], (items) => items.filter(isVisible))
```

**验证方式：** 搜索 `createSelector` 的创建位置，确认共享无参数查询只创建一次；确需多实例时使用明确的 Factory 设计。
:::

## 八、源码推导与适用场景

### 1. Redux Toolkit 的导出边界

Redux Toolkit 2.12.0 的固定入口源码从 Reselect 重新导出 `createSelector`。因此 Redux Toolkit 应用可以统一从
`@reduxjs/toolkit` 导入，不必为了这个 API 单独建立另一个导入入口。

这是固定版本的包导出事实。Selector 的记忆化语义和诊断 API 由 Reselect 提供，React Redux 不负责创建这类查询。

### 2. 重计算计数的源码证据

Reselect 5.3.0 固定源码在真正调用结果函数时增加重计算计数，并把依赖列表、最近结果与计数方法附加到输出 Selector。
官方测试验证相同输入重复调用只执行一次结果函数，输入结果变化后计数增加。

由此可以推导：用公开计数和引用比较能建立可靠的缓存反馈环。内部缓存结构不属于本课公共合同，业务代码只依赖官方
公开的创建、调用和诊断能力；升级版本时仍需重新核对官方文档。

### 3. 适用边界

`createSelector` 适合以下场景：

- 派生计算包含筛选、排序、聚合或对象组装。
- 相同输入会被重复查询，跳过计算有明确价值。
- 结果是数组或对象，输入不变时需要稳定引用。
- 多个查询需要复用同一份中间派生结果。

直接读取字段、返回稳定引用或计算简单原始值时，普通 Selector 通常已经足够。是否使用记忆化应由查询行为决定，不需要
把所有 Selector 机械地改成 `createSelector`。

## 九、练习

:::exercise
### 为商品目录建立记忆化查询

**要求：** 创建一个可运行的 Redux Toolkit store，包含 `catalog` 和无关的 `ui` slice。用数组形式的输入 Selector
建立 `selectVisibleProducts`，根据商品数组和 `inStockOnly` 筛选条件返回可见商品；再组合出
`selectVisibleSummary`。同时保留一个每次返回新数组的普通 Selector 作为对照。依次执行初始查询、无关 `ui` 更新和
筛选条件更新，并用公开计数和引用比较验证缓存行为。

**验收：** 初始可见 3 件商品；无关更新后 memoized 结果保持同一引用且 `recomputations()` 仍为 1，普通 Selector
返回新引用；启用仅看有货后可见 2 件商品，memoized 结果变为新引用且 `recomputations()` 增至 2；组合汇总返回 2 项、
总库存 7 件。所有派生结果都没有写入 Redux state。

**参考答案：**

```ts
import { configureStore, createSelector, createSlice } from '@reduxjs/toolkit'

type Product = {
  id: string
  name: string
  stock: number
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    products: [
      { id: 'keyboard', name: '机械键盘', stock: 5 },
      { id: 'mouse', name: '无线鼠标', stock: 2 },
      { id: 'headset', name: '监听耳机', stock: 0 },
    ] as Product[],
    inStockOnly: false,
  },
  reducers: {
    /** 切换是否只显示有货商品。 */
    inStockOnlyToggled: (state) => {
      state.inStockOnly = !state.inStockOnly
    },
  },
})

const uiSlice = createSlice({
  name: 'ui',
  initialState: { refreshCount: 0 },
  reducers: {
    /** 记录一次与商品目录无关的界面刷新。 */
    refreshRecorded: (state) => {
      state.refreshCount += 1
    },
  },
})

const store = configureStore({
  reducer: {
    catalog: catalogSlice.reducer,
    ui: uiSlice.reducer,
  },
})

type RootState = ReturnType<typeof store.getState>

/** 读取商品原始数组。 */
const selectProducts = (state: RootState) => state.catalog.products

/** 读取库存筛选条件。 */
const selectInStockOnly = (state: RootState) => state.catalog.inStockOnly

/** 根据两个输入结果派生可见商品。 */
const selectVisibleProducts = createSelector(
  [selectProducts, selectInStockOnly],
  (products, inStockOnly) =>
    inStockOnly ? products.filter((product) => product.stock > 0) : products,
)

/** 组合可见商品 Selector，派生数量和库存总数。 */
const selectVisibleSummary = createSelector([selectVisibleProducts], (products) => ({
  itemCount: products.length,
  totalStock: products.reduce((total, product) => total + product.stock, 0),
}))

/** 每次查询都返回新数组，作为无缓存对照。 */
function selectVisibleProductsWithoutMemoization(state: RootState): Product[] {
  const products = selectProducts(state)
  return selectInStockOnly(state)
    ? products.filter((product) => product.stock > 0)
    : products.slice()
}

const initialState = store.getState()
const firstMemoized = selectVisibleProducts(initialState)
const firstPlain = selectVisibleProductsWithoutMemoization(initialState)

console.assert(firstMemoized.length === 3)
console.assert(selectVisibleProducts.recomputations() === 1)

store.dispatch(uiSlice.actions.refreshRecorded())

const unrelatedState = store.getState()
const secondMemoized = selectVisibleProducts(unrelatedState)
const secondPlain = selectVisibleProductsWithoutMemoization(unrelatedState)

console.assert(firstMemoized === secondMemoized)
console.assert(firstPlain !== secondPlain)
console.assert(selectVisibleProducts.recomputations() === 1)

store.dispatch(catalogSlice.actions.inStockOnlyToggled())

const filteredState = store.getState()
const filteredMemoized = selectVisibleProducts(filteredState)
const summary = selectVisibleSummary(filteredState)

console.assert(filteredMemoized !== secondMemoized)
console.assert(filteredMemoized.length === 2)
console.assert(selectVisibleProducts.recomputations() === 2)
console.assert(summary.itemCount === 2)
console.assert(summary.totalStock === 7)
```
:::

## 十、本节小结

- `createSelector` 用输入 Selector 定义依赖，用结果函数集中执行派生计算。
- 输入结果未变时跳过结果函数并复用缓存结果引用；相关输入变化时才重新计算。
- 输入 Selector 保持简单，数组形式让 TypeScript 更稳定地推断结果函数参数。
- 记忆化 Selector 可以继续作为输入，形成可复用的派生查询链。
- `recomputations()` 观察结果计算，`dependencyRecomputations()` 观察依赖检查，两者应结合解释。
- 直接字段读取和轻量原始值计算继续使用普通 Selector，不必机械地加入缓存。

## 十一、参考资料

- [Reselect：createSelector API](https://reselect.js.org/api/createselector/) - 参数形式、TypeScript 推断和输出 Selector 诊断字段。
- [Reselect：Best Practices](https://reselect.js.org/usage/best-practices/) - 输入稳定性与输入/结果函数职责。
- [Reselect：Common Mistakes](https://reselect.js.org/usage/common-mistakes/) - 输入中计算和无意义结果函数等常见错误。
- [Redux：Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - 记忆化、组合以及 Redux Toolkit 导出边界。
- [Reselect 5.3.0 Selector 构造源码](https://github.com/reduxjs/reselect/blob/v5.3.0/src/createSelectorCreator.ts) - 输出 Selector 与公开诊断计数的组装。
- [Reselect 5.3.0 官方测试](https://github.com/reduxjs/reselect/blob/v5.3.0/test/reselect.spec.ts) - 缓存命中、输入变化与重计算计数。
- [Redux Toolkit 2.12.0 入口源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/index.ts) - `createSelector` 的公开重新导出。
