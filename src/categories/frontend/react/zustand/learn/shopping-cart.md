---
id: react.zustand.learn.basics.shopping-cart
type: lesson
title: 实战：购物车状态
summary: 用类型化 Store 保存购物车条目，用不可变更新调整数量，并在渲染时派生件数与金额。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.basics.task-filter
related:
  - react.zustand.learn.basics.task-filter
  - react.zustand.learn.basics.object-and-array-updates
  - react.zustand.learn.basics.state-ownership
tags:
  - Zustand
  - 购物车
  - 数组更新
  - 实战
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能把购物车条目放进类型化 Store，把商品目录留在 Store 外。
  - 能用 get 读取当前条目，用 set 做不可变的新增、改数量和移除。
  - 能用选择函数订阅条目数组，并在渲染时派生件数和合计。
  - 能在数量降到 0 时移除该行，而不是留下空数量。
recap:
  - 购物车源事实是商品 ID 和数量；名称与单价来自只读目录。
  - 件数和合计都能从条目算出来，不要再存进 Store。
  - 更新数组时创建新数组，再交给 set。
  - 选择函数订阅 items；汇总在组件里派生。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 组件通过 Hook 选择状态，被选中的值变化时重新渲染。
      - 普通 create 得到的 Store 不需要 Provider。
  - title: Zustand Beginner TypeScript Guide
    url: https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 用类型同时描述状态字段和 Action，并用柯里化 create 固定 Store 形状。
  - title: Zustand 5.0.15 React create types
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 绑定 Hook 可以接收选择函数，从 Store 取出切片。
  - title: React Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 避免保存可以从现有数据计算出来的重复状态。
---

# 实战：购物车状态

## 一、学习目标

- 用类型化 Store 保存购物车条目，商品目录留在外面。
- 用 `get` 读取当前条目，用 `set` 不可变地新增、改数量和移除。
- 用选择函数订阅条目，在渲染时派生件数和合计。
- 数量降到 0 时移除该行。

## 二、为什么要做购物车

筛选器练的是“条件进 Store、列表在渲染时过滤”。购物车换成另一组基础能力：条目是数组，数量变化要复制数组，合计不能再存一份。

如果把小计写进 Store，改数量时漏更新金额，界面就会和条目打架。如果 `push` 就地加商品，没有新数组引用，订阅组件可能不刷新。这个实战把对象与数组更新、`get`、选择函数和所有权收进同一份购物车。

## 三、核心概念

### 1. 目录与购物车不是同一份状态

商品名称和单价属于只读目录，购物车只保存 `id` 和 `quantity`。多个区域要读同一份条目时，条目进 Zustand；目录仍是常量。件数、合计从条目和目录算出来。

### 2. 类型化 Store 只描述源事实和 Action

```ts
type CartItem = {
  id: string
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartActions = {
  addItem: (id: string) => void
  increase: (id: string) => void
  decrease: (id: string) => void
  removeItem: (id: string) => void
  reset: () => void
}

type CartStore = CartState & CartActions

const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  addItem: (id) => {
    const current = get().items.find((item) => item.id === id)
    if (current) {
      set({
        items: get().items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      })
      return
    }
    set({ items: [...get().items, { id, quantity: 1 }] })
  },
  increase: (id) =>
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    }),
  decrease: (id) =>
    set({
      items: get()
        .items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    }),
  removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
  reset: () => set({ items: [] }),
}))
```

`set` 只浅合并顶层。`items` 必须是新数组，被改的那一行必须是新对象。

### 3. 选择条目，派生汇总

```tsx
function CartSummary() {
  const items = useCartStore((state) => state.items)
  const count = items.reduce((total, item) => total + item.quantity, 0)
  return <p>{count} 件</p>
}
```

不要把 `count` 或 `total` 再写入 Store。需要 Action 时另一次 Hook 选择函数，不要为了图省事调用不带参数的 `useCartStore()`。

### 4. 数量规则写在 Action 里

减到 0 就过滤掉该行，而不是留下 `quantity: 0`。组件只派发 `decrease(id)`，不在点击处理里直接改数组。

## 四、用法与示例

### 1. 只读目录

```ts
const catalogProducts = [
  { id: 'note', title: '课堂笔记夹', price: 12 },
  { id: 'pen', title: '标记笔', price: 6 },
  { id: 'sticker', title: '知识点贴纸', price: 4 },
] as const
```

目录给展示层查名称和单价。购物车 Action 只接收 `id`。

### 2. 拆开订阅者

- 目录按钮选择 `addItem`。
- 行项目选择 `items` 以及 `increase` / `decrease` / `removeItem`。
- 汇总选择 `items`，再计算件数和金额。
- 父组件只选择 `reset`。

改某一行数量时，目录区如果只订阅 `addItem`，不会因为 `items` 变化而重渲染。

### 3. 观察购物车行为

下面的 Demo 可以加入商品、加减数量、移除一行，并查看件数与合计。数量减到 0 时该行消失；重置清空条目，不改目录。

:::demo{id="react.zustand.learn.basics.shopping-cart.shopping-cart-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把目录价格复制进每一行后再当源事实改

**触发条件：** `addItem` 把当时的 `price` 写进 `items`，之后只改这一份副本。

**原因：** 名称和单价的所有者是目录。复制进购物车后，目录更新时行项目仍显示旧价。

**后果：** 同一商品在目录和购物车里价格不一致。

**错误示例：**

```ts
set({ items: [...get().items, { id, quantity: 1, price: 12 }] })
```

**正确写法：**

```ts
set({ items: [...get().items, { id, quantity: 1 }] })
```

**验证方式：** Store 类型的条目只有 `id` 和 `quantity`；展示时用目录查单价。

### 错误：就地 push 或改 quantity

**触发条件：** `get().items.push(...)` 或 `item.quantity += 1`，然后不调用 `set`，或 `set` 仍传入同一数组引用。

**原因：** 没有新数组或新对象，`set` 的浅合并看不出变化，选择函数也得不到新引用。

**后果：** 内存里数量变了，列表和合计不刷新。

**错误示例：**

```ts
get().items.push({ id, quantity: 1 })
```

**正确写法：**

```ts
set({ items: [...get().items, { id, quantity: 1 }] })
```

**验证方式：** 加入商品后列表立刻多一行；若只有 `getState()` 能看到新值而界面不变，就是绕过了不可变更新。

### 错误：把件数和合计存进 Store

**触发条件：** 每次改数量都 `set({ items, count, total })`。

**原因：** 件数和合计都能从 `items` 和目录计算，再存就是重复状态。

**后果：** 改数量时漏写合计，汇总区显示旧金额。

**错误示例：**

```ts
increase: (id) =>
  set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    ),
    count: state.count + 1,
  })),
```

**正确写法：**

```tsx
const items = useCartStore((state) => state.items)
const count = items.reduce((total, item) => total + item.quantity, 0)
```

**验证方式：** Store 类型没有 `count` 或 `total`；改数量后汇总区用当前 `items` 当场计算。

### 错误：选择函数返回新的汇总对象

**触发条件：** `useCartStore((state) => ({ count: state.items.length }))`。

**原因：** 每次调用都 new 一个对象，默认 `Object.is` 认为选中值已变。

**后果：** 购物车任何更新都让这个组件重渲染，包括本不需要读合计的区域。

**错误示例：**

```tsx
const summary = useCartStore((state) => ({
  count: state.items.reduce((total, item) => total + item.quantity, 0),
}))
```

**正确写法：**

```tsx
const items = useCartStore((state) => state.items)
const count = items.reduce((total, item) => total + item.quantity, 0)
```

**验证方式：** 选择 `items` 后在组件里计算；不要从选择函数返回字面量对象。

### 错误：数量减到 0 仍留在数组里

**触发条件：** `decrease` 只把 `quantity` 减一，不过滤。

**原因：** 购物车行的有效条件是数量大于 0。留下 0 会让列表出现空行，合计却按 0 计算。

**后果：** 界面出现“0 件商品”，移除路径变得不清晰。

**错误示例：**

```ts
decrease: (id) =>
  set({
    items: get().items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
    ),
  }),
```

**正确写法：**

```ts
decrease: (id) =>
  set({
    items: get()
      .items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0),
  }),
```

**验证方式：** 把数量减到 0 后，该行从列表消失，件数不再包含它。
:::

## 六、原理与适用场景

### 1. 官方事实

README 说明组件用 Hook 选择状态，选中值变化时重渲染，普通 Store 不需要 Provider。入门 TypeScript 指南用类型同时描述字段和 Action，并使用柯里化 `create`。绑定 Hook 可以接收选择函数。React 的状态结构指南要求不要保存能算出来的重复数据。

### 2. 课程推导

购物车的最小模型是：Store 只保存条目数组；Action 用 `get` 读当前数组，用新数组交给 `set`；组件选择 `items` 后派生件数和金额；目录保持只读。数量规则属于 Action，不属于点击处理。

### 3. 适用边界

本课只整合已经学过的 React 绑定 Store、`get` / `set`、数组更新、选择函数、TypeScript 和所有权。不引入 `persist`、异步结算、优惠码中间件、DevTools、Vanilla Store 或 SSR，也不把目录当成服务端缓存。

## 七、练习

:::exercise
### 补全最小购物车

**要求：** 声明 `items: { id: string; quantity: number }[]`，以及 `addItem`、`decrease`、`reset`。目录是组件外的常量。`addItem` 若已存在则数量加一，否则追加。`decrease` 减到 0 时移除。写出 `CartCount`，只选择 `items` 并显示总件数。

**验收：** 同一商品加两次后件数为 2；再 `decrease` 一次件数为 1；再 `decrease` 一次件数为 0 且数组为空。

**参考答案：**

```tsx
import { create } from 'zustand'

type CartItem = {
  id: string
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartActions = {
  addItem: (id: string) => void
  decrease: (id: string) => void
  reset: () => void
}

type CartStore = CartState & CartActions

const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  addItem: (id) => {
    const current = get().items.find((item) => item.id === id)
    if (current) {
      set({
        items: get().items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      })
      return
    }
    set({ items: [...get().items, { id, quantity: 1 }] })
  },
  decrease: (id) =>
    set({
      items: get()
        .items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    }),
  reset: () => set({ items: [] }),
}))

/** 只选择条目并派生总件数。 */
function CartCount() {
  const items = useCartStore((state) => state.items)
  const count = items.reduce((total, item) => total + item.quantity, 0)
  return <p>{count}</p>
}
```
:::

## 八、本节小结

- 购物车 Store 保存 `id` 和 `quantity`，目录留在外面。
- 用 `get` 读当前数组，用新数组和新对象调用 `set`。
- 件数和合计在渲染时派生，不要写回 Store。
- 数量降到 0 就移除该行；重置只清空条目。

## 九、参考资料

- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - Hook 选择状态并在选中值变化时重渲染。
- [Zustand Beginner TypeScript Guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript) - 类型化 State、Action 与柯里化 `create`。
- [Zustand 5.0.15 react.ts](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - 绑定 Hook 的选择函数重载。
- [React Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 不要保存可计算的重复状态。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
