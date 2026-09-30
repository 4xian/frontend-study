---
id: react.redux.learn.intermediate.selector
type: lesson
title: Selector
summary: 用普通 Selector 封装 RootState 查询，组合派生值，并在不同读取入口复用同一套状态知识。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 85
prerequisites:
  - react.redux.learn.basics.shopping-cart-state-center
related:
  - react.redux.learn.basics.use-selector
  - react.redux.learn.basics.multiple-slices-root-state
tags:
  - Redux
  - Selector
  - RootState
  - 派生数据
  - 状态查询
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能区分读取原始字段、计算派生值和使用额外参数的普通 Selector。
  - 能让命名 Selector 封装 RootState 的具体结构。
  - 能通过调用已有 Selector 组合出新的查询。
  - 能在 React Hook、store.getState 结果和其他 Selector 中复用同一查询函数。
  - 能保持 Redux state 最小化，不把可计算结果重复存入 state。
recap:
  - Selector 是接收 Redux state 或其中一部分并返回查询结果的普通函数。
  - 原始字段 Selector 集中知道状态路径，其他调用方依赖查询名称而不是内部结构。
  - 派生 Selector 可以复用原始字段 Selector，避免重复访问路径和维护重复 state。
  - 普通 Selector 可以接收额外参数，用同一个函数按 ID 等条件查询。
  - Selector 可用于 useSelector、store.getState 返回的快照和其他 Selector，但它本身不建立订阅。
sources:
  - title: Redux Deriving Data with Selectors
    url: https://redux.js.org/usage/deriving-data-selectors
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - Selector 是接收 Redux store state 或其中一部分并返回基于该 state 数据的函数。
      - Selector 可读取字段、计算派生值、封装状态结构，并在能够取得 RootState 的位置复用。
      - Selector 可以调用其他 Selector，也可以接收 state 之外的额外参数。
  - title: Redux Style Guide
    url: https://redux.js.org/style-guide/#keep-state-minimal-and-derive-additional-values
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - Redux state 应保持最小化，可计算的附加值应在读取时派生。
      - Selector 可以封装从 store state 读取值和继续派生数据的逻辑。
  - title: Redux Store API
    url: https://redux.js.org/api/store/
    sourceType: api-doc
    appliesTo: Redux 5.0.1
    claims:
      - store.getState 返回当前状态树，即 reducer 最近一次返回的状态。
      - getState 只负责读取当前快照，订阅更新需要独立的 subscribe 或 React Redux 绑定。
  - title: Redux 5.0.1 createStore Source
    url: https://github.com/reduxjs/redux/blob/v5.0.1/src/createStore.ts
    sourceType: source-code
    appliesTo: Redux 5.0.1
    claims:
      - 固定版本源码中的 getState 直接返回 currentState，并阻止 reducer 执行期间读取 store。
      - store 将 getState 与 dispatch、subscribe、replaceReducer 一起作为公开方法返回。
  - title: Redux 5.0.1 createStore Tests
    url: https://github.com/reduxjs/redux/blob/v5.0.1/test/createStore.spec.ts
    sourceType: official-test
    appliesTo: Redux 5.0.1
    claims:
      - 官方测试验证 getState 是 store 公开方法，并在 dispatch 后返回 reducer 计算出的新状态。
      - 官方测试验证 reducer 执行期间不能调用 store.getState。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
  - title: Redux 5.0.1 npm Latest Metadata
    url: https://registry.npmjs.org/redux/latest
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - npm latest 在核验日指向 Redux 5.0.1。
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0。
  - title: React 19.2.8 npm Latest Metadata
    url: https://registry.npmjs.org/react/latest
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - npm latest 在核验日指向 React 19.2.8。
---

# Selector

## 一、学习目标

- 写出读取原始字段、计算派生值和接收额外参数的普通 Selector。
- 用命名 Selector 封装 RootState 的路径，让组件不依赖具体状态结构。
- 通过调用已有 Selector 组合新的查询，而不是重复展开相同路径。
- 在 `useSelector`、`store.getState()` 返回的快照和其他 Selector 中复用查询逻辑。
- 只在 Redux state 中保存源事实，在读取时计算总数、金额和状态标签。

## 二、为什么需要 Selector

组件当然可以直接写 `state.inventory.items`，但当多个组件、命令式流程和业务判断都需要库存数据时，这条路径会
散落在许多位置。以后把 `items` 移到 `inventory.records`，每个调用方都要跟着修改。

Selector 把“状态如何存放”转换成“调用方想查询什么”。调用方只需要 `selectInventoryItems`、
`selectTotalUnits` 或 `selectInventoryItemById` 这样的名称，具体路径和计算规则集中在库存 Feature 内。它像一层只读
查询接口：不改变 state，也不拥有另一份数据。

## 三、核心概念

### 1. Selector 是普通函数

Selector 不要求特殊基类或 API。只要函数接收 Redux state 或其中一部分，并返回基于该 state 的数据，它就是
Selector：

```ts
type RootState = {
  inventory: {
    items: InventoryItem[]
  }
}

/** 读取库存中的原始商品数组。 */
const selectInventoryItems = (state: RootState) => state.inventory.items
```

项目通常让根级 Selector 接收完整 `RootState`。这样同一个函数可以直接交给 React Redux，也可以处理
`store.getState()` 返回的完整状态快照。

### 2. 读取源事实与计算派生值

原始字段 Selector 只查找 state 已经保存的数据。派生 Selector 则基于源事实计算新值：

```ts
/** 派生所有库存商品的总件数。 */
const selectTotalUnits = (state: RootState) =>
  selectInventoryItems(state).reduce((total, item) => total + item.quantity, 0)
```

库存总件数可以从每项 `quantity` 得到，所以不需要再保存一个 `totalUnits` 字段。否则每次入库、出库都必须同时
更新商品数量和总数，两份数据容易失去同步。

### 3. Selector 可以组合

组合不是特殊语法，只是一个 Selector 调用另一个 Selector：

```ts
/** 派生库存总金额，单位为分。 */
const selectInventoryValueCents = (state: RootState) =>
  selectInventoryItems(state).reduce(
    (total, item) => total + item.quantity * item.priceCents,
    0,
  )
```

这里复用 `selectInventoryItems`，因此只有它知道 `state.inventory.items` 的具体路径。状态结构调整时，金额计算不需要
跟着理解新的嵌套层级。

### 4. Selector 可以接收额外参数

除了第一个 state 参数，普通 Selector 还可以接收查询条件：

```ts
/** 按商品 ID 查询一项库存。 */
function selectInventoryItemById(state: RootState, itemId: InventoryItemId) {
  return selectInventoryItems(state).find((item) => item.id === itemId)
}
```

这仍然是普通函数。调用方必须同时提供同一份 RootState 和商品 ID，返回值可能是商品，也可能是 `undefined`。

## 四、建立 Feature 查询层

### 1. 让 Selector 与状态逻辑放在一起

库存 Feature 可以把状态更新和查询按文件分开：

```text
features/inventory/
├── inventorySlice.ts
├── selectors.ts
└── InventoryPanel.tsx
```

`inventorySlice.ts` 定义状态结构和更新规则，`selectors.ts` 定义公开查询，组件只导入需要的 action 与 Selector。
状态结构不是秘密，但不应该由每个调用方分别维护路径知识。

### 2. 原始 Selector 作为组合入口

先定义最小的原始字段 Selector，再让派生查询复用它：

```ts
/** 读取库存商品。 */
export const selectInventoryItems = (state: RootState) => state.inventory.items

/** 统计低库存商品数量。 */
export const selectLowStockCount = (state: RootState) =>
  selectInventoryItems(state).filter((item) => item.quantity <= item.lowStockThreshold).length
```

Selector 的名称应说明返回什么，而不是说明页面在哪里使用它。`selectLowStockCount` 可以被顶部指标、库存面板或
命令式报告共同复用。

### 3. 继续组合参数化查询

其他 Selector 也可以调用带参数的 Selector：

```ts
/** 根据商品库存派生状态文本。 */
function selectInventoryStatus(state: RootState, itemId: InventoryItemId): string {
  const item = selectInventoryItemById(state, itemId)
  if (!item) return '未找到商品'
  if (item.quantity === 0) return '缺货'
  if (item.quantity <= item.lowStockThreshold) return '库存偏低'
  return '库存充足'
}
```

查找商品的规则只存在一份。状态文本关心查询结果，不重复访问数组和比较 ID。

## 五、在不同入口复用

### 1. 在 React Hook 中读取

无额外参数的 Selector 可以直接传给预类型 Hook：

```tsx
const totalUnits = useInventorySelector(selectTotalUnits)
```

带额外参数时，用一层函数提供当前组件持有的参数：

```tsx
const selectedItem = useInventorySelector((state) =>
  selectInventoryItemById(state, selectedItemId),
)
```

`useSelector` 负责订阅 store；`selectInventoryItemById` 只负责查询。二者职责不能互换。

### 2. 查询 store.getState 快照

React 之外只要能取得 RootState，也能调用同一个 Selector：

```ts
const state = store.getState()
const lowStockCount = selectLowStockCount(state)
```

`getState()` 返回当前快照，但这次函数调用不会自动订阅后续变化。下一次 dispatch 后若要取得新结果，调用方需要再次
读取 `store.getState()` 并再次执行 Selector。

### 3. 在其他 Selector 中复用

组合查询把路径和业务判断分层：

```ts
/** 判断指定商品是否需要补货。 */
const selectNeedsRestock = (state: RootState, itemId: InventoryItemId) => {
  const item = selectInventoryItemById(state, itemId)
  return item ? item.quantity <= item.lowStockThreshold : false
}
```

普通 Selector 每次被调用都会执行函数体。本课只建立正确的查询边界；当派生计算昂贵、返回新引用或需要缓存时，再
根据下一课的专门工具设计，而不是提前把所有查询复杂化。

## 六、Demo：库存查询工作台

:::demo{id="react.redux.learn.intermediate.selector.inventory-query-demo"}

Demo 的三个指标分别由普通 Selector 派生。选择商品后，参数化 Selector 按 ID 查询商品，另一个 Selector 复用该
查询得到库存状态。入库或出库会更新源事实，React Hook 重新读取结果；“读取当前快照”按钮则显式调用
`store.getState()`，展示命令式查询不会自动订阅。

源码面板展示实际运行的 store、预类型 Hooks、inventory slice、Selector 查询层、React 面板、宿主 TSX 与 CSS。
:::

## 七、易错使用提示

:::pitfalls
### 错误：把可计算总数重复存进 state

**触发条件：** state 同时保存商品数组和可以从数组计算出的总件数。

**原因：** 两个字段表达同一事实，所有更新路径都必须手动同步。

**后果：** 漏掉一次更新后，列表数量与总数显示不一致。

**错误示例：**

```ts
type InventoryState = {
  items: InventoryItem[]
  totalUnits: number
}
```

**正确写法：**

```ts
type InventoryState = {
  items: InventoryItem[]
}

/** 从源事实派生总件数。 */
const selectTotalUnits = (state: RootState) =>
  state.inventory.items.reduce((total, item) => total + item.quantity, 0)
```

**验证方式：** 检查每个 state 字段是否必须由 action 独立改变；可以完全计算出的值应移到 Selector。

### 错误：在每个调用方重复状态路径

**触发条件：** 多个组件都直接访问 `state.inventory.items`。

**原因：** 路径知识分散，调用方同时承担查询和渲染职责。

**后果：** 状态结构调整时必须修改多个组件，也容易出现新旧路径并存。

**错误示例：**

```tsx
const items = useInventorySelector((state) => state.inventory.items)
```

**正确写法：**

```tsx
const items = useInventorySelector(selectInventoryItems)
```

**验证方式：** 搜索 Feature 内部路径，确认公开调用方优先使用命名 Selector。

### 错误：在 Selector 中修改 state 或执行副作用

**触发条件：** Selector 对数组排序、写入外部变量、dispatch 或保存浏览器数据。

**原因：** Selector 是只读查询，相同输入应得到可预测结果。

**后果：** 一次读取可能改变后续状态或产生不可控副作用。

**错误示例：**

```ts
/** 错误：sort 会原地修改 state 中的数组。 */
const selectSortedItems = (state: RootState) => state.inventory.items.sort(compareItems)
```

**正确写法：**

```ts
/** 复制数组后再排序，不修改源状态。 */
const selectSortedItems = (state: RootState) => [...selectInventoryItems(state)].sort(compareItems)
```

**验证方式：** 冻结输入状态或在调用前后比较原始数组顺序，确认读取没有修改源数据。

### 错误：混淆 RootState Selector 与 Slice Selector

**触发条件：** 函数声明接收 `InventoryState`，却直接交给接收完整 RootState 的 Hook。

**原因：** 两个函数的输入合同不同。

**后果：** TypeScript 报类型错误，绕过类型后则会读取不存在的路径。

**错误示例：**

```ts
const selectItems = (inventory: InventoryState) => inventory.items
useInventorySelector(selectItems)
```

**正确写法：**

```ts
const selectItems = (state: RootState) => state.inventory.items
useInventorySelector(selectItems)
```

**验证方式：** 检查公开 Selector 的首个参数类型是否与实际调用入口提供的状态层级一致。

### 错误：以为 getState 查询会自动更新

**触发条件：** 只在初始化时调用一次 `selectTotalUnits(store.getState())`，随后期望变量跟随 dispatch 变化。

**原因：** `getState()` 返回当前状态快照，普通函数调用不会建立订阅。

**后果：** 页面或日志继续使用旧查询结果。

**错误示例：**

```ts
const totalUnits = selectTotalUnits(store.getState())
store.dispatch(stockReceived({ id: 'keyboard', amount: 1 }))
console.log(totalUnits)
```

**正确写法：**

```ts
store.dispatch(stockReceived({ id: 'keyboard', amount: 1 }))
const totalUnits = selectTotalUnits(store.getState())
console.log(totalUnits)
```

**验证方式：** dispatch 前后分别读取 `store.getState()`，确认每次查询使用需要的状态快照。
:::

## 八、源码推导与适用场景

### 1. getState 返回什么

Redux 5.0.1 的 `createStore` 固定源码中，`getState()` 在 reducer 未执行时直接返回内部 `currentState`。官方测试验证
dispatch 后 `getState()` 返回 reducer 计算出的新状态，也验证 reducer 执行期间不能调用它。

由此可以推导：普通 Selector 不需要知道 store 实例，只需要接收调用方取得的状态值。React Redux、命令式代码或
另一个 Selector 可以提供同样的 RootState，因此查询逻辑能够复用。

边界是：`getState()` 的实现事实不等于订阅。Selector 也不会自行追踪 dispatch；更新通知由 React Redux Hook、
`store.subscribe()` 或其他调用入口负责。

### 2. 适合普通 Selector 的场景

- 直接返回一个字段或稳定对象引用。
- 计算数量、布尔值、字符串等轻量原始值。
- 用 ID、状态或阈值做一次轻量查询。
- 封装 RootState 路径，供多个调用方复用。

当查询需要专门的缓存、复杂结果身份管理或为多个组件建立独立实例时，先确认真实需求，再进入对应课程。本课不把
这些问题混入普通函数的基本合同。

## 九、练习

:::exercise
### 为图书库存建立查询层

**要求：** 创建一个可运行的 Redux Toolkit store，保存三本图书的 `id`、`title`、`copies` 和 `priceCents`。实现读取
图书数组、派生总册数、派生库存总金额、按 ID 查询图书、复用按 ID 查询并返回库存标签的普通 Selector。最后通过
`store.getState()` 调用这些 Selector，并 dispatch 一次入库 action 后再次验证结果。

**验收：** 初始总册数为 9，库存总金额为 38400 分；`selectBookById(state, 'redux')` 返回《Redux Essentials》；
入库 2 册后总册数为 11；所有派生值都没有作为字段保存在 Redux state 中。

**参考答案：**

```ts
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

type BookId = 'redux' | 'react' | 'typescript'

type Book = {
  id: BookId
  title: string
  copies: number
  priceCents: number
}

type BooksState = {
  items: Book[]
}

const initialState: BooksState = {
  items: [
    { id: 'redux', title: 'Redux Essentials', copies: 3, priceCents: 4800 },
    { id: 'react', title: 'React Guide', copies: 2, priceCents: 6200 },
    { id: 'typescript', title: 'TypeScript Handbook', copies: 4, priceCents: 2900 },
  ],
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    /** 为指定图书增加库存。 */
    copiesReceived: (state, action: PayloadAction<{ id: BookId; amount: number }>) => {
      const book = state.items.find((item) => item.id === action.payload.id)
      if (book) book.copies += action.payload.amount
    },
  },
})

const store = configureStore({
  reducer: {
    books: booksSlice.reducer,
  },
})

type RootState = ReturnType<typeof store.getState>

/** 读取图书库存数组。 */
const selectBooks = (state: RootState) => state.books.items

/** 派生图书总册数。 */
const selectTotalCopies = (state: RootState) =>
  selectBooks(state).reduce((total, book) => total + book.copies, 0)

/** 派生库存总金额，单位为分。 */
const selectInventoryValueCents = (state: RootState) =>
  selectBooks(state).reduce((total, book) => total + book.copies * book.priceCents, 0)

/** 按 ID 查询单本图书。 */
function selectBookById(state: RootState, bookId: BookId) {
  return selectBooks(state).find((book) => book.id === bookId)
}

/** 复用图书查询，派生当前库存标签。 */
function selectBookStockLabel(state: RootState, bookId: BookId): string {
  const book = selectBookById(state, bookId)
  if (!book) return '未找到'
  return book.copies > 0 ? `现有 ${book.copies} 册` : '缺货'
}

const initialSnapshot = store.getState()
console.assert(selectTotalCopies(initialSnapshot) === 9)
console.assert(selectInventoryValueCents(initialSnapshot) === 38400)
console.assert(selectBookById(initialSnapshot, 'redux')?.title === 'Redux Essentials')
console.assert(selectBookStockLabel(initialSnapshot, 'redux') === '现有 3 册')

store.dispatch(booksSlice.actions.copiesReceived({ id: 'redux', amount: 2 }))

const nextSnapshot = store.getState()
console.assert(selectTotalCopies(nextSnapshot) === 11)
console.assert(selectBookStockLabel(nextSnapshot, 'redux') === '现有 5 册')
```
:::

## 十、本节小结

- Selector 是普通只读函数，首个参数合同决定它接收 RootState 还是局部 state。
- 用原始字段 Selector 集中封装路径，再通过函数调用组合派生查询。
- 可计算结果留在 Selector，不作为第二份源事实保存进 Redux state。
- 额外参数让同一个 Selector 能按 ID 等条件查询，调用方负责提供参数。
- `useSelector` 负责 React 订阅，`getState()` 提供当前快照，Selector 本身只负责查询。

## 十一、参考资料

- [Redux：Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - Selector 定义、组合、参数和状态结构封装。
- [Redux Style Guide](https://redux.js.org/style-guide/#keep-state-minimal-and-derive-additional-values) - 保持 state 最小并派生附加值。
- [Redux Store API](https://redux.js.org/api/store/) - `getState()`、`dispatch()` 和 `subscribe()` 的公开合同。
- [Redux 5.0.1 createStore 源码](https://github.com/reduxjs/redux/blob/v5.0.1/src/createStore.ts) - 固定版本 `getState()` 实现。
- [Redux 5.0.1 createStore 官方测试](https://github.com/reduxjs/redux/blob/v5.0.1/test/createStore.spec.ts) - `getState()` 公开行为与限制。
