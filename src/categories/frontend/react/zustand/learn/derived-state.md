---
id: react.zustand.learn.intermediate.derived-state
type: lesson
title: 派生状态
summary: 用选择函数从已有字段算出数字或布尔值，避免把可推导结果再存进 Store。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.intermediate.use-shallow
related:
  - react.zustand.learn.intermediate.use-shallow
  - react.zustand.learn.intermediate.selector-result-stability
tags:
  - Zustand
  - 派生状态
  - Selector
  - 计算值
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能说明派生状态是从已有字段算出来的值，不必在 Store 里再存一份。
  - 能用选择函数算出对 Object.is 稳定的数字或布尔值。
  - 能在组件或自定义 Hook 里，先取出源字段再计算会 new 出数组或对象的派生结构。
  - 能识别把派生结果存进 Store，或在选择函数里调用会返回新对象的 getter，都会让来源和展示分叉或触发无限更新。
recap:
  - 能从已有字段算出来的值，用选择函数派生，不要再写进 Store。
  - 派生结果必须对 Object.is 稳定：数字、布尔值和已有引用可以。
  - 会 new 出数组或对象的派生，先取出源字段，再在组件里计算。
  - 本课不把派生结果缓存进 Store，也不引入计算型中间件。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand Beginner TypeScript Derived State with Selectors
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 不是所有值都要直接存进 Store，部分值可以从已有状态计算。
      - 用选择函数派生可以避免重复，并保持 Store 最小。
      - 官方示例用 bears * foodPerBear 得到 totalFood，不在 Store 里再存一份。
  - title: Zustand 5.0.15 React binding source
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 选择函数作为 getSnapshot 对当前快照再跑一遍，比较的是返回值。
  - title: React useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 店铺未变时 getSnapshot 必须返回同一个值，比较用 Object.is。
  - title: Zustand discussion computed state custom hook
    url: https://github.com/pmndrs/zustand/discussions/2979
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 维护者说明 vanilla Zustand 的计算状态最佳实践是自定义 Hook：先取出源字段再计算。
      - 在选择函数里调用每次返回新对象的 getter，会触发 Maximum update depth exceeded。
---

# 派生状态

## 一、学习目标

- 把能算出来的值写成选择函数，而不是再往 Store 里存一份。
- 只在选择函数里派生对 `Object.is` 稳定的数字或布尔值。
- 会 new 出数组或对象的派生，先取出源字段，再在组件里计算。
- 识别“存一份派生字段”和“选择函数里调用会 new 的 getter”这两类错误。

## 二、为什么需要派生，而不是再存一份

购物车已经有 `items`。件数、合计、是否为空都能从 `items` 算出来。若再存 `total`，每次改数量都要同时改两处；漏一次，界面和源数据就会分叉。

官方 Beginner TypeScript 写明：不是所有值都要直接存进 Store，部分值可以从已有状态计算。用选择函数派生可以避免重复，并保持 Store 最小。示例是：

```tsx
const totalFood = useBearStore((s) => s.bears * s.foodPerBear)
```

Store 里没有 `{ totalFood: 6 }`。`bears` 和 `foodPerBear` 都没变时，乘积仍是同一个数字，`Object.is` 为 true。

派生状态不是新 API，而是选择函数的一种用法：返回值来自计算，但必须仍然满足结果稳定性。

## 三、核心概念

### 1. 派生值来自源字段

源字段是 Store 里真正被 `set` 更新的数据。派生值任何时刻都能由源字段算出来：

```tsx
const itemCount = useCartStore((state) => state.items.length)
const isEmpty = useCartStore((state) => state.items.length === 0)
const total = useCartStore((state) =>
  state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
)
```

`length`、`=== 0`、`reduce` 得到的都是数字或布尔值。源数组引用没变时，这些结果与上次 `Object.is` 相同，组件不重渲染。

### 2. 稳定派生可以写在选择函数里

选择函数作为 `getSnapshot` 运行。店铺通知后会再跑一遍。只要返回值是：

- 数字：`items.length`、`reduce` 合计
- 布尔值：`items.length === 0`
- 已有引用：`items[index]` 仍指向同一个对象

`Object.is` 就能跳过无关更新。`ticks` 变化时，上面三个选择结果都不变。

布尔值还有一层：从一件商品加到两件，`items.length > 0` 两次都是 `true`，`HasItems` 面板不应增加渲染次数。

### 3. 会 new 容器的派生不要放进选择函数

```tsx
const openTasks = useBoardStore((state) => state.tasks.filter((task) => task.open))
```

`filter` 每次都是新数组。即使打开的任务没变，默认比较也会失败。维护者在计算状态讨论里说明：在选择函数里调用每次返回新对象的 getter，会触发 `Maximum update depth exceeded`。

正确顺序是先取出源字段，再在组件或自定义 Hook 里计算：

```tsx
function useOpenTasks() {
  const tasks = useBoardStore((state) => state.tasks)
  return tasks.filter((task) => task.open)
}
```

`tasks` 引用不变时，组件不重渲染，`filter` 也不会在 `getSnapshot` 里跑出新数组去和 `Object.is` 比较。维护者把这种自定义 Hook 称为 vanilla Zustand 计算状态的常规做法。

### 4. 不要把 getter 当作派生字段订阅

```tsx
getTotal: () => {
  const { items } = get()
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}
```

`getTotal` 是稳定函数引用。选择 `(state) => state.getTotal` 只拿到函数，不会在 `items` 变化时重渲染。选择 `(state) => state.getTotal()` 则每次调用都算出新数字；数字相同仍然稳定，但若 getter 返回新对象，就会回到无限更新。

需要派生数字时，直接在选择函数里算，不必绕一层 Store 上的 getter。

## 四、用法与示例

### 1. 用选择函数派生数字和布尔值

```tsx
const useCartStore = create<CartStore>()((set) => ({
  items: [{ name: '笔记本', price: 10, qty: 1 }],
  ticks: 0,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clear: () => set({ items: [] }),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

function CartTotal() {
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  )
  return <p>合计 {total}</p>
}
```

`tick()` 只改 `ticks`。`items` 还是原来的数组，合计仍是 `10`，`CartTotal` 不重渲染。不必在 Store 里再存 `total`。

### 2. 自定义 Hook 包住派生

多个组件要同一份合计时，把选择函数抽成 Hook，而不是抽成 Store 字段：

```tsx
function useCartTotal() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  )
}
```

这仍是选择函数派生。组件订阅的是合计这个数字，不是整份 `items`。

### 3. 列表派生放在取出源字段之后

```tsx
function OpenTaskNames() {
  const tasks = useBoardStore((state) => state.tasks)
  const names = tasks.filter((task) => task.open).map((task) => task.title)
  return <p>{names.join('、')}</p>
}
```

`tasks` 没换成新数组时，组件不重渲染。需要临时数组时，计算发生在已经决定要渲染之后，不会进入 `getSnapshot` 的 `Object.is` 比较。

### 4. 观察数字派生与整份订阅

下面的 Demo 用同一份购物车 Store 对照四块面板：一块选择件数，一块选择合计，一块选择“是否有商品”这个布尔值，一块不传选择函数。增加无关计数时，只有整份订阅面板的渲染次数上升。再追加一件商品时，件数和合计增加，布尔值仍是 `true`，对应面板次数不变。会 `filter` 出新数组的写法只出现在正文示例里，不挂进持续运行的 Demo。

:::demo{id="react.zustand.learn.intermediate.derived-state.derived-state-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把能算出来的合计再存进 Store

**触发条件：** Store 同时保存 `items` 和 `total`，改数量时只更新了 `items`。

**原因：** 派生值有了第二份来源。两次 `set` 必须永远同步，漏一次就分叉。

**后果：** 列表和合计对不上；排查时会以为是选择函数错了。

**错误示例：**

```tsx
const useCartStore = create<CartStore>()((set) => ({
  items: [{ name: '笔记本', price: 10, qty: 1 }],
  total: 10,
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
}))
```

**正确写法：**

```tsx
const total = useCartStore((state) =>
  state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
)
```

**验证方式：** Store 类型里没有 `total` 字段；合计只出现在选择函数或自定义 Hook 的返回值里。改 `items` 后合计自动变化。

### 错误：在选择函数里 filter 出派生列表

**触发条件：** 写成 `useBoardStore((state) => state.tasks.filter((task) => task.open))`。

**原因：** `filter` 每次返回新数组。这是派生结构，不是稳定数字。

**后果：** 无关字段更新也会重渲染，开发环境可能报 getSnapshot 结果应被缓存。

**错误示例：**

```tsx
function OpenTasks() {
  const openTasks = useBoardStore((state) => state.tasks.filter((task) => task.open))
  return <p>{openTasks.length}</p>
}
```

**正确写法：**

```tsx
function OpenTasks() {
  const tasks = useBoardStore((state) => state.tasks)
  const openCount = tasks.filter((task) => task.open).length
  return <p>{openCount}</p>
}
```

**验证方式：** 选择函数只返回已有字段或稳定数字；`filter` 留在组件里。只增加无关计数时，面板渲染次数不变。

### 错误：选择 Store 上的 getter 调用结果

**触发条件：** 写成 `useCartStore((state) => state.getSnapshot())`，而 `getSnapshot` 每次 `return { total, count }`。

**原因：** getter 每次分配新对象。选择函数比较的是这次调用的返回值，不是 getter 函数本身。

**后果：** 官方计算状态讨论里的 `s.getReactFlowGraph()` 会触发 `Maximum update depth exceeded`。

**错误示例：**

```tsx
const snapshot = useCartStore((state) => state.getSnapshot())
```

**正确写法：**

```tsx
const count = useCartStore((state) => state.items.length)
const total = useCartStore((state) =>
  state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
)
```

**验证方式：** 选择函数里不要调用会 new 对象的 getter；需要两个数字就写两次派生选择。

### 错误：选择 getter 函数却以为订阅了计算结果

**触发条件：** 写成 `const getTotal = useCartStore((state) => state.getTotal)`，渲染时再 `getTotal()`。

**原因：** 选中的是稳定函数引用。`items` 变了，这个引用不变，组件不重渲染，界面仍显示旧合计。

**后果：** 点击后数据已经进 Store，派生数字却不更新。

**错误示例：**

```tsx
function CartTotal() {
  const getTotal = useCartStore((state) => state.getTotal)
  return <p>{getTotal()}</p>
}
```

**正确写法：**

```tsx
function CartTotal() {
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  )
  return <p>{total}</p>
}
```

**验证方式：** 追加商品后合计面板的数字和渲染次数都增加；不要选择 getter 再在 JSX 里调用。

### 错误：源字段无关变化时仍重算派生列表

**触发条件：** 父组件不传选择函数，再在渲染里 `items.filter(...)`。

**原因：** 整份 Store 任意字段变化都会重渲染，派生计算跟着跑，即使 `items` 没变。

**后果：** 无关计数也会带动列表计算；派生被放在了错误的订阅范围里。

**错误示例：**

```tsx
function OpenTasks() {
  const { items } = useBoardStore()
  const openTasks = items.filter((task) => task.open)
  return <p>{openTasks.length}</p>
}
```

**正确写法：**

```tsx
function OpenTasks() {
  const items = useBoardStore((state) => state.items)
  const openCount = items.filter((task) => task.open).length
  return <p>{openCount}</p>
}
```

**验证方式：** 只选择 `items`；Demo 里增加无关计数时，件数和合计面板次数不变。
:::

## 六、原理与适用场景

### 1. 官方事实

Beginner TypeScript 的 “Derived State with Selectors” 写明：不是所有值都要直接存储，部分值可以从已有状态计算；用选择函数派生可避免重复并保持 Store 最小。示例是 `bears * foodPerBear`，不在 Store 里再存 `totalFood`。

`useStore` 把选择函数当作 `getSnapshot`。React 用 `Object.is` 比较返回值。因此派生选择的返回值必须稳定。

维护者在讨论 2979 中说明：vanilla Zustand 计算状态的常规做法是自定义 Hook，先取出源字段再计算。在选择函数里调用每次返回新对象的 getter，会触发无限更新。

### 2. 课程推导

派生状态把“展示用的数字或布尔值”留在选择函数里，把“会 new 出来的列表”留在组件里。Store 只保存不能从别处算出来的源字段。合计和件数随 `items` 自动变化，是因为每次 `getSnapshot` 都重新计算，而不是因为 Store 里有一份会过期的副本。

### 3. 适用边界

本课只讲选择函数和自定义 Hook 上的派生：稳定数字/布尔值、源字段取出后再算列表，以及不要把派生结果存进 Store。计算很重时把结果一并写入同一份 `set`、第三方 computed 中间件、`useShallow` 包住派生数组，都不在这里展开。

## 七、练习

:::exercise
### 用选择函数派生合计

**要求：** 已有一份 `CartStore`，包含 `items`、`ticks` 以及 `addItem`、`tick`。当前组件从 Store 读取并不存在的 `total` 字段。改成用选择函数从 `items` 算出合计数字；件数用 `items.length` 派生。不要在 Store 里新增 `total` 或 `itemCount`，不要 `filter` 出新数组作为选择结果。

**验收：** 调用 `tick()` 后，合计组件的渲染计数不增加；调用 `addItem()` 后，合计数字增加，合计组件渲染计数增加，只选择 `tick` 的按钮渲染计数不增加。

**参考答案：**

```tsx
import { useRef } from 'react'
import { create } from 'zustand'

type CartItem = {
  name: string
  price: number
  qty: number
}

type CartStore = {
  items: CartItem[]
  ticks: number
  addItem: (item: CartItem) => void
  tick: () => void
}

const useCartStore = create<CartStore>()((set) => ({
  items: [{ name: '笔记本', price: 10, qty: 1 }],
  ticks: 0,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

/** 用选择函数从已有商品列表派生合计，不把合计存进 Store。 */
function CartTotal() {
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  )
  const itemCount = useCartStore((state) => state.items.length)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <p>
      {itemCount} 件 · 合计 {total} · 渲染 {renderCount.current}
    </p>
  )
}

/** 只选择 tick Action，商品变化时不必重渲染。 */
function TickButton() {
  const tick = useCartStore((state) => state.tick)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <button type="button" onClick={tick}>
      增加无关计数 · 渲染 {renderCount.current}
    </button>
  )
}
```
:::

## 八、本节小结

- 能从已有字段算出来的值用选择函数派生，不要再存进 Store。
- 数字和布尔值可以对 `Object.is` 稳定；布尔值没翻转时组件不必重渲染。
- 会 new 出数组或对象的派生，先取出源字段，再在组件或自定义 Hook 里计算。
- 不要选择会返回新对象的 getter，也不要把 getter 函数当成计算结果订阅。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand Beginner TypeScript Derived State with Selectors](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md) - 用选择函数派生，保持 Store 最小。
- [Zustand 5.0.15 React binding source](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - 选择函数作为 getSnapshot 运行。
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) - 返回值用 Object.is 比较。
- [Zustand discussion computed state custom hook](https://github.com/pmndrs/zustand/discussions/2979) - 计算状态用自定义 Hook；选择函数里调用会 new 的 getter 会无限更新。
