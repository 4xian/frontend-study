---
id: react.redux.learn.basics.shopping-cart-state-center
type: lesson
title: 实战：购物车状态中心
summary: 综合状态所有权、slice、Selector 与 React Redux Hooks，完成可增减商品和派生金额的购物车。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - react.redux.learn.basics.task-filter-panel
related:
  - react.redux.learn.basics.state-ownership
  - react.redux.learn.basics.feature-folder-organization
tags:
  - Redux Toolkit
  - React Redux
  - 实战
  - 购物车
  - 状态建模
  - 派生数据
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能分清商品目录、购物车源事实和订单派生金额的所有权。
  - 能用 createSlice 表达加入、增减、移除、优惠、清空和重置事件。
  - 能用纯 Selector 从商品 ID 与数量派生件数、小计、优惠和应付金额。
  - 能通过预类型 Hooks 让目录、明细和汇总共享同一个 Redux 状态。
  - 能验证数量降到零时移除条目、空购物车和恢复初始状态。
recap:
  - 购物车 state 保存商品 ID、数量和优惠码，商品名称与价格由稳定目录提供。
  - 件数、小计、优惠和应付金额都能从源事实计算，不在 state 中保存重复副本。
  - action 以业务事件命名，reducer 负责数量下限、条目移除和优惠重置等状态规则。
  - 组件通过预类型 Hooks 读取 Selector、派发 action，不直接修改条目或导入 store 实例。
  - 整数分避免把货币源值直接保存成小数，格式化只发生在展示层。
sources:
  - title: Redux Style Guide
    url: https://redux.js.org/style-guide
    sourceType: official-reference
    appliesTo: Redux 5.0.1、Redux Toolkit 2.12.0
    claims:
      - Redux state 应尽量保持最小，额外值应从源事实派生。
      - slice 应按保存的数据命名，并由 reducer 控制 state 的形状。
      - 推荐按 Feature 组织相关 Redux 逻辑，并优先使用 Redux Toolkit createSlice。
  - title: Redux Deriving Data with Selectors
    url: https://redux.js.org/usage/deriving-data-selectors
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - Selector 可以封装状态查找和派生计算，求和等结果不需要重复写入 store。
      - 可复用 Selector 能减少组件对 RootState 内部结构的直接依赖。
  - title: Redux Toolkit 2.12.0 createSlice API
    url: https://redux-toolkit.js.org/api/createSlice
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createSlice 根据 name、initialState 和 reducers 生成 reducer 与 action creators。
      - PayloadAction 可以为 reducer 的 payload 声明具体类型。
  - title: Redux Toolkit TypeScript Quick Start
    url: https://redux-toolkit.js.org/tutorials/typescript
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0、React Redux 9.3.0
    claims:
      - RootState 与 dispatch 类型可以从 store 推导。
      - useDispatch.withTypes 和 useSelector.withTypes 可用于创建应用预类型 Hooks。
  - title: React Redux 9.3.0 Provider API
    url: https://react-redux.js.org/api/provider
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - Provider 通过 React Context 向后代组件提供同一个 Redux store。
  - title: Redux Toolkit 2.12.0 createSlice Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createSlice.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定版本源码为每个 reducer 名称建立 action type、case reducer 与 action creator 的对应关系。
  - title: Redux Toolkit 2.12.0 createSlice Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/createSlice.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试验证生成 action 的 type 和 payload，并验证 reducer 响应该 action 后得到新状态。
---

# 实战：购物车状态中心

## 一、学习目标

- 判断商品目录、购物车条目、优惠码和汇总金额分别由谁拥有。
- 用一个 `cart` slice 表达加入、增减、移除、优惠、清空和重置事件。
- 用普通纯 Selector 派生总件数、小计、优惠和应付金额。
- 用 `Provider` 与预类型 Hooks 连接商品目录、购物车明细和订单汇总。
- 验证数量降到零、空购物车、优惠切换与恢复初始状态。

## 二、为什么需要状态中心

购物车同时被多个区域使用：商品目录要显示“加入”按钮，明细区要控制数量，页面标题要显示总件数，汇总区
还要显示小计、优惠和应付金额。如果每个组件各自保存一份数量或总价，同一次操作就可能只更新其中一部分。

状态中心不是把页面上能看到的一切都放进 Redux，而是确定一份最小源事实。这个示例把商品 ID、数量和当前
优惠码放进 `cart` slice；商品名称和单价来自稳定商品目录；总件数和金额在读取时计算。这样每个区域都从同一
状态快照得到结果，又不会维护重复数据。

## 三、购物车状态模型

### 1. 商品目录与购物车条目

商品目录保存商品自身的信息：

```ts
type Product = {
  id: ProductId
  name: string
  priceCents: number
}
```

购物车只保存购买关系：

```ts
type CartLine = {
  productId: ProductId
  quantity: number
}

type CartState = {
  lines: CartLine[]
  couponCode: 'none' | 'SAVE10'
}
```

同一个 `productId` 在购物车中最多出现一次。再次加入商品时增加已有条目的 `quantity`，不会复制商品名称和
价格。商品信息改变时，购物车也不会残留另一份旧名称。

### 2. 源事实与派生金额

`lines` 和 `couponCode` 会被 action 更新，因此属于源事实。以下值都可以计算：

```text
总件数 = 每条 quantity 之和
小计 = 每条 priceCents × quantity 之和
优惠 = couponCode 对应的优惠规则
应付金额 = 小计 − 优惠
```

这些结果只通过 Selector 读取，不定义 `totalChanged` 或 `subtotalChanged`。一次数量更新后，所有金额都从新的
RootState 重新派生，不存在“数量已变但总价未同步”的中间状态。

### 3. 业务事件

```text
productAdded(productId)             加入商品或增加已有数量
quantityIncremented(productId)      增加一个购物车条目的数量
quantityDecremented(productId)      减少数量，降到零时移除条目
productRemoved(productId)           直接移除条目
couponChanged(couponCode)           设置优惠码
cartCleared()                       清空条目并移除优惠码
cartReset()                         恢复示例的初始快照
```

payload 只携带描述事件所需的数据。组件不计算新数组，也不把整个 `CartState` 作为 payload 交给 reducer 替换。

## 四、实现购物车 Feature

### 1. 用稳定 ID 建立商品目录

```ts
export type ProductId = 'keyboard' | 'notebook' | 'lamp'

export const products: Product[] = [
  { id: 'keyboard', name: '机械键盘', priceCents: 39900 },
  { id: 'notebook', name: '方格笔记本', priceCents: 3900 },
  { id: 'lamp', name: '桌面阅读灯', priceCents: 24900 },
]
```

本地示例的目录是只读模块数据。`ProductId` 联合类型让 action、购物车条目和目录查找使用同一组合法值。真实
应用的目录若来自服务端，应由对应服务端状态方案拥有；本课不把远程缓存复制进购物车 slice。

### 2. 在 reducer 中维护数量规则

```ts
productAdded: (state, action: PayloadAction<ProductId>) => {
  const line = state.lines.find((item) => item.productId === action.payload)
  if (line) {
    line.quantity += 1
    return
  }
  state.lines.push({ productId: action.payload, quantity: 1 })
}
```

“已有则增加、没有则创建”属于购物车状态规则，应由 reducer 统一处理。目录按钮和明细按钮只派发事件，不各自
实现一套查找与更新逻辑。

数量减少时还要处理零值：

```ts
quantityDecremented: (state, action: PayloadAction<ProductId>) => {
  const line = state.lines.find((item) => item.productId === action.payload)
  if (!line) return
  if (line.quantity === 1) {
    state.lines = state.lines.filter((item) => item.productId !== action.payload)
    return
  }
  line.quantity -= 1
}
```

购物车不保留数量为零的条目。无论哪个组件派发减少事件，都会经过同一条规则。

### 3. 用纯 Selector 计算汇总

```ts
export const selectCartSubtotal = (state: RootState) =>
  state.cart.lines.reduce(
    (total, line) => total + getProductById(line.productId).priceCents * line.quantity,
    0,
  )

export const selectCartDiscount = (state: RootState) =>
  state.cart.couponCode === 'SAVE10' ? Math.round(selectCartSubtotal(state) * 0.1) : 0

export const selectCartPayable = (state: RootState) =>
  selectCartSubtotal(state) - selectCartDiscount(state)
```

金额以整数分参与状态和计算，最后才格式化为人民币文本。这个示例的 Selector 返回数字等稳定原始值，不需要
提前引入记忆化。返回新对象或新数组的复杂 Selector 需要在后续专门处理结果身份和缓存。

### 4. 通过预类型 Hooks 连接 UI

```tsx
const lines = useShoppingCartSelector(selectCartLines)
const quantity = useShoppingCartSelector(selectCartQuantity)
const payable = useShoppingCartSelector(selectCartPayable)
const dispatch = useShoppingCartDispatch()
```

目录、明细和汇总可以拆成多个组件，也可以像本课 Demo 一样放在一个面板里。它们的共同点是只依赖公开
Selector 和 action，不直接读取或修改 store 实例。

### 5. 清空与恢复初始状态

`cartCleared` 表示用户清空当前购物车，因此同时清除条目和优惠码。`cartReset` 只用于本课 Demo 恢复可观察的
初始快照。两者语义不同，不能只因为最后都可能得到空数组就合并成一个含糊 action。

## 五、Demo：观察购物车数据流

:::demo{id="react.redux.learn.basics.shopping-cart-state-center.shopping-cart-state-center-demo"}

Demo 初始有两个条目、三件商品，小计为 ¥477.00。加入商品、增减数量或移除条目时，件数和金额会从同一份
RootState 重新派生；`SAVE10` 只改变优惠和应付金额；数量从一减到零时条目消失；清空后显示空状态，恢复按钮
回到初始快照。

源码面板展示实际运行的 `app/store.ts`、`app/hooks.ts`、`features/cart/products.ts`、
`features/cart/cartSlice.ts`、`features/cart/CartPanel.tsx`、宿主 TSX 与 CSS。
:::

## 六、易错使用提示

:::pitfalls
### 错误：在每个条目中复制完整商品数据

**触发条件：** 加入购物车时把商品名称、描述和价格对象整体复制到 `lines`。

**原因：** 商品目录和购物关系的所有权没有分开。

**后果：** 商品信息更新后，目录和购物车可能显示不同名称或价格。

**错误示例：**

```ts
state.lines.push({ product: action.payload, quantity: 1 })
```

**正确写法：**

```ts
state.lines.push({ productId: action.payload, quantity: 1 })
```

**验证方式：** 检查 `CartLine` 只保存商品 ID 与数量，并通过目录查找获得展示信息。

### 错误：把件数和金额存成可写副本

**触发条件：** `CartState` 同时保存 `lines`、`totalQuantity`、`subtotal` 和 `payable`。

**原因：** 把能够由条目和优惠码计算的结果当成独立源事实。

**后果：** 某个 reducer 漏改一个字段后，徽标、明细和汇总互相矛盾。

**错误示例：**

```ts
state.lines.push(nextLine)
state.totalQuantity += 1
// 忘记更新 subtotal 和 payable
```

**正确写法：**

```ts
const selectCartQuantity = (state: RootState) =>
  state.cart.lines.reduce((total, line) => total + line.quantity, 0)
```

**验证方式：** 连续执行加入、减少、优惠和移除操作，确认 state 只含源事实且汇总始终能重新计算。

### 错误：用小数保存货币源值

**触发条件：** 把 `39.9` 直接作为价格参与多次乘法、折扣和累计。

**原因：** JavaScript 的二进制浮点不能精确表示所有十进制小数。

**后果：** 中间结果可能出现多余小数位，舍入位置也难以统一。

**错误示例：**

```ts
const subtotal = 39.9 * quantity
```

**正确写法：**

```ts
const subtotalCents = 3990 * quantity
const label = formatCurrency(subtotalCents)
```

**验证方式：** 检查目录价格和所有 Selector 都使用整数分，只有展示层除以 100 并格式化。

### 错误：减少数量后保留零或负数条目

**触发条件：** reducer 无条件执行 `line.quantity -= 1`。

**原因：** 没有把购物车数量下限写进统一状态规则。

**后果：** 明细显示零件或负数，汇总金额也可能被错误抵扣。

**错误示例：**

```ts
line.quantity -= 1
```

**正确写法：**

```ts
if (line.quantity === 1) {
  state.lines = state.lines.filter((item) => item.productId !== productId)
} else {
  line.quantity -= 1
}
```

**验证方式：** 对数量为一的条目点击减少，确认条目被移除且总件数和金额都变为新的派生结果。

### 错误：让组件构造下一份购物车 state

**触发条件：** 组件先读取 `lines`，再计算新数组并把整个 state 作为 payload 派发。

**原因：** 组件承担了 reducer 应拥有的状态转换规则。

**后果：** 不同按钮可能实现不同的数量、去重或优惠清理规则。

**错误示例：**

```tsx
dispatch(cartReplaced({ lines: [...lines, nextLine], couponCode }))
```

**正确写法：**

```tsx
dispatch(productAdded(productId))
```

**验证方式：** 检查组件事件只派发业务 action，所有数组查找、数量更新和移除逻辑都在 slice reducer 中。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Style Guide 推荐让 state 保持最小，并从源事实派生求和等附加值；同时推荐按 Feature 集中组织相关 Redux
逻辑，并让 reducer 控制 slice 的状态形状。Redux 的 Selector 指南进一步说明，Selector 可以封装 RootState
查找和派生计算，减少组件对状态结构的直接依赖。

Redux Toolkit 2.12.0 的 `createSlice` 固定版本源码为 reducer 名称建立 action type、case reducer 和 action
creator 的对应关系。官方测试验证生成 action 的 `type` 与 `payload`，并验证 reducer 接收该 action 后得到预期
状态。React Redux 9.3.0 的 Provider 公共 API 通过 Context 向后代提供 store，TypeScript 指南则推荐从 store
推导类型并创建 `.withTypes()` Hooks。

### 2. 课程推导

因此，本课把 `productId + quantity + couponCode` 作为最小购物车事实，让 reducer 统一拥有更新规则，让
Selector 负责件数与金额。组件只负责把用户操作翻译成 action，并把选择结果渲染出来。这个结构能让目录、购物
车徽标、明细和结算摘要共享同一快照。

### 3. 适用边界

本课处理固定本地目录和同步购物车状态。真实电商中的库存校验、服务端价格、优惠资格、税费、运费和最终订单
金额必须以服务端确认为准；本课的客户端金额只用于学习状态建模和即时界面反馈。异步请求、记忆化 Selector、
标准化实体、持久化、乐观更新和并发结算不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个可运行的购物车组件。商品目录包含键盘、笔记本和台灯；Redux state 只保存 `productId`、
`quantity` 与 `couponCode`。使用 `createSlice` 实现加入、增加、减少至移除、直接移除、切换 `SAVE10`、清空和
重置；使用普通纯 Selector 派生总件数、小计、优惠和应付金额；再通过 `Provider` 与预类型 Hooks 完成 UI。
金额使用整数分，组件不能直接导入 store 实例，也不能把汇总结果存入 state。

**验收：** 初始有键盘 1 件和笔记本 2 件，共 3 件，小计与应付金额均为 ¥477.00；加入台灯后共 4 件且小计
为 ¥726.00；使用 `SAVE10` 后优惠为 ¥72.60、应付为 ¥653.40；数量为 1 的条目继续减少会被移除；清空后显示
空状态且优惠归零；重置后恢复初始条目、数量与金额。

**参考答案：**

```tsx
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Provider, useDispatch, useSelector } from 'react-redux'
import type { ReactElement } from 'react'

type ProductId = 'keyboard' | 'notebook' | 'lamp'
type CouponCode = 'none' | 'SAVE10'
type Product = { id: ProductId; name: string; priceCents: number }
type CartLine = { productId: ProductId; quantity: number }
type CartState = { lines: CartLine[]; couponCode: CouponCode }

const products: Product[] = [
  { id: 'keyboard', name: '机械键盘', priceCents: 39900 },
  { id: 'notebook', name: '方格笔记本', priceCents: 3900 },
  { id: 'lamp', name: '桌面阅读灯', priceCents: 24900 },
]

const productsById: Record<ProductId, Product> = {
  keyboard: products[0]!,
  notebook: products[1]!,
  lamp: products[2]!,
}

const initialState: CartState = {
  lines: [
    { productId: 'keyboard', quantity: 1 },
    { productId: 'notebook', quantity: 2 },
  ],
  couponCode: 'none',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** 加入商品，已有条目只增加数量。 */
    productAdded: (state, action: PayloadAction<ProductId>) => {
      const line = state.lines.find((item) => item.productId === action.payload)
      if (line) line.quantity += 1
      else state.lines.push({ productId: action.payload, quantity: 1 })
    },
    /** 增加指定条目的数量。 */
    quantityIncremented: (state, action: PayloadAction<ProductId>) => {
      const line = state.lines.find((item) => item.productId === action.payload)
      if (line) line.quantity += 1
    },
    /** 减少数量，并在数量降到零时移除条目。 */
    quantityDecremented: (state, action: PayloadAction<ProductId>) => {
      const line = state.lines.find((item) => item.productId === action.payload)
      if (!line) return
      if (line.quantity === 1) {
        state.lines = state.lines.filter((item) => item.productId !== action.payload)
      } else {
        line.quantity -= 1
      }
    },
    /** 直接移除指定条目。 */
    productRemoved: (state, action: PayloadAction<ProductId>) => {
      state.lines = state.lines.filter((item) => item.productId !== action.payload)
    },
    /** 设置优惠码。 */
    couponChanged: (state, action: PayloadAction<CouponCode>) => {
      state.couponCode = action.payload
    },
    /** 清空条目与优惠码。 */
    cartCleared: (state) => {
      state.lines = []
      state.couponCode = 'none'
    },
    /** 恢复初始购物车。 */
    cartReset: () => initialState,
  },
})

const store = configureStore({ reducer: { cart: cartSlice.reducer } })
type RootState = ReturnType<typeof store.getState>
const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 按 ID 读取商品。 */
function getProductById(productId: ProductId): Product {
  return productsById[productId]
}

/** 读取原始购物车条目。 */
const selectCartLines = (state: RootState) => state.cart.lines

/** 读取优惠码。 */
const selectCouponCode = (state: RootState) => state.cart.couponCode

/** 派生总件数。 */
const selectCartQuantity = (state: RootState) =>
  state.cart.lines.reduce((total, line) => total + line.quantity, 0)

/** 派生小计，单位为分。 */
const selectCartSubtotal = (state: RootState) =>
  state.cart.lines.reduce(
    (total, line) => total + getProductById(line.productId).priceCents * line.quantity,
    0,
  )

/** 派生优惠，单位为分。 */
const selectCartDiscount = (state: RootState) =>
  state.cart.couponCode === 'SAVE10' ? Math.round(selectCartSubtotal(state) * 0.1) : 0

/** 派生应付金额，单位为分。 */
const selectCartPayable = (state: RootState) =>
  selectCartSubtotal(state) - selectCartDiscount(state)

/** 格式化整数分金额。 */
function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amountInCents / 100)
}

/** 显示商品目录、购物车和汇总。 */
function CartPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const lines = useAppSelector(selectCartLines)
  const couponCode = useAppSelector(selectCouponCode)
  const quantity = useAppSelector(selectCartQuantity)
  const subtotal = useAppSelector(selectCartSubtotal)
  const discount = useAppSelector(selectCartDiscount)
  const payable = useAppSelector(selectCartPayable)

  return (
    <main>
      <h1>购物车状态中心</h1>
      <p>{quantity} 件商品</p>
      <section aria-labelledby="products-title">
        <h2 id="products-title">商品目录</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} · {formatCurrency(product.priceCents)}
              <button type="button" onClick={() => dispatch(cartSlice.actions.productAdded(product.id))}>
                加入
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="cart-title">
        <h2 id="cart-title">购物车明细</h2>
        {lines.length === 0 ? (
          <p>购物车为空</p>
        ) : (
          <ul>
            {lines.map((line) => {
              const product = getProductById(line.productId)
              return (
                <li key={line.productId}>
                  {product.name} × {line.quantity}
                  <button
                    type="button"
                    aria-label={`减少${product.name}数量`}
                    onClick={() =>
                      dispatch(cartSlice.actions.quantityDecremented(line.productId))
                    }
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`增加${product.name}数量`}
                    onClick={() =>
                      dispatch(cartSlice.actions.quantityIncremented(line.productId))
                    }
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(cartSlice.actions.productRemoved(line.productId))}
                  >
                    移除
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <section aria-label="订单汇总">
        <p>小计：{formatCurrency(subtotal)}</p>
        <p>优惠：−{formatCurrency(discount)}</p>
        <strong>应付：{formatCurrency(payable)}</strong>
        <button
          type="button"
          aria-pressed={couponCode === 'SAVE10'}
          onClick={() =>
            dispatch(cartSlice.actions.couponChanged(couponCode === 'SAVE10' ? 'none' : 'SAVE10'))
          }
        >
          {couponCode === 'SAVE10' ? '移除 SAVE10' : '使用 SAVE10'}
        </button>
        <button type="button" onClick={() => dispatch(cartSlice.actions.cartCleared())}>
          清空购物车
        </button>
        <button type="button" onClick={() => dispatch(cartSlice.actions.cartReset())}>
          恢复初始状态
        </button>
      </section>
    </main>
  )
}

/** 在 Provider 中挂载购物车。 */
export function App(): ReactElement {
  return (
    <Provider store={store}>
      <CartPanel />
    </Provider>
  )
}
```
:::

## 九、本节小结

- 购物车 state 只保存购买关系和优惠选择，商品目录由自己的数据源拥有。
- 总件数、小计、优惠和应付金额属于派生值，不保存为需要同步的第二份 state。
- reducer 统一处理加入去重、数量下限、条目移除、清空与重置规则。
- 组件通过预类型 Hooks 读取 Selector 和派发 action，不构造下一份购物车 state。
- 金额源值使用整数分，展示时再格式化；客户端汇总不能替代服务端结算结果。

## 十、参考资料

- [Redux Style Guide](https://redux.js.org/style-guide) - 支持最小 state、派生数据、Feature 组织和 reducer 状态所有权。
- [Redux Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors) - 支持用 Selector 封装求和与状态查找。
- [Redux Toolkit createSlice API](https://redux-toolkit.js.org/api/createSlice) - 支持 slice、case reducer、action creator 与 PayloadAction。
- [Redux Toolkit TypeScript Quick Start](https://redux-toolkit.js.org/tutorials/typescript) - 支持 RootState、dispatch 推导和预类型 Hooks。
- [React Redux Provider API](https://react-redux.js.org/api/provider) - 支持通过 Context 向后代提供 store。
- [Redux Toolkit 2.12.0 createSlice Source](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/createSlice.ts) - 支持固定版本的 reducer、action type 与 action creator 对应关系。
- [Redux Toolkit 2.12.0 createSlice Tests](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/createSlice.test.ts) - 支持生成 action 和 reducer 更新行为。
