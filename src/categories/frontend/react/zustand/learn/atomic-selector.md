---
id: react.zustand.learn.intermediate.atomic-selector
type: lesson
title: 原子 Selector
summary: 用一次选择一个已有字段的写法配合默认严格相等，让组件只在真正用到的值变化时重渲染。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.basics.selector
related:
  - react.zustand.learn.basics.selector
  - react.zustand.learn.basics.shopping-cart
tags:
  - Zustand
  - Selector
  - 原子选择
  - 严格相等
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能说明原子选择是一次取出 Store 里已经存在的一个值，而不是现场拼出一个对象或数组。
  - 能用两次 Hook 调用分别读取两个字段，并解释默认严格相等为何对这种写法高效。
  - 能识别把多个字段收成新对象或新数组后，任意无关更新也会触发重渲染。
  - 能把 Action 引用当作原子选择：引用不变时，按钮组件不必重渲染。
recap:
  - 默认比较是严格相等，适合一次选择一个已有字段或稳定 Action。
  - 需要两个字段时，写两次选择函数，不要 return 临时对象或临时数组。
  - 不传选择函数再解构多个字段，等于订阅整份 Store。
  - 原子选择不展开浅比较、自定义 equality 或结果稳定性工具。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README Selecting multiple state slices
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 默认用严格相等（old === new）检测变化，这种比较对原子状态选择高效。
      - 读取多个字段的基础写法是分别选择每一个字段。
      - 若把多个字段收成一个对象，需要另外的浅比较才能避免多余重渲染。
  - title: Zustand 5.0.15 React binding source
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - create 返回的 Hook 把选择函数应用到 getState 和 getInitialState，再交给 React.useSyncExternalStore。
      - 默认 Hook 签名只有 selector，没有第二参数 equality 函数。
  - title: Zustand 5.0.15 basic tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/basic.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 官方测试按字段选择 count 和 inc：点击后只有 count 组件重渲染，Action 组件不重渲染。
  - title: React useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - useSyncExternalStore 用 Object.is 比较快照，快照不同才重渲染。
---

# 原子 Selector

## 一、学习目标

- 用一次选择一个已有字段的方式读取 Store，而不是现场拼对象。
- 解释默认严格相等为什么适合这种原子选择。
- 对照“分别选择两个字段”和“一次 return 新对象”的渲染差异。
- 把稳定的 Action 也当成原子选择。

## 二、为什么需要原子选择

基础课已经能写 `(state) => state.keyword`，也知道不要在选择函数里 `return { keyword, status }`。当时的重点是划订阅范围。

组件经常要同时展示两个字段，例如库存里的坚果数量和蜂蜜数量。最容易想到的写法是一次取出两个值：

```tsx
const snapshot = usePantryStore((state) => ({
  nuts: state.nuts,
  honey: state.honey,
}))
```

字段内容没变，每次运行却仍是新对象。Store 里再多一个无关的 `ticks`，这块面板也会重渲染。官方 README 把真正高效的默认路径叫做 **atomic state picks**：一次取出一个已经存在的值，用 `old === new` 判断要不要更新。

原子选择不是新 API，而是把默认比较规则用到位。

## 三、核心概念

### 1. 原子选择取出一个已有值

一次 Hook 调用只返回 Store 快照里已经存在的一个值：

```tsx
const nuts = usePantryStore((state) => state.nuts)
const honey = usePantryStore((state) => state.honey)
```

`nuts` 是数字，`honey` 是数字。Store 更新后，选择函数再跑一遍。只要返回值和上次是同一个基本值或同一个引用，组件不重渲染。

Action 同样适用：

```tsx
const addNut = usePantryStore((state) => state.addNut)
```

`addNut` 通常是创建 Store 时放进去的同一个函数。`nuts` 变了，这个引用不变，只负责点按钮的组件不必重画。

### 2. 默认比较是严格相等

Zustand 5.0.15 的 README 写明：默认用严格相等（`old === new`）检测变化，这对原子状态选择是高效的。

React 绑定把选择结果交给 `useSyncExternalStore`。React 文档说明该 Hook 用 `Object.is` 比较快照。对普通数字、字符串、布尔值和稳定函数，`Object.is` 与 `===` 的结果一致。

因此：

- `state.nuts` 两次都是 `3`，不重渲染。
- `state.addNut` 两次都是同一个函数，不重渲染。
- `(state) => ({ nuts: state.nuts })` 每次都是新对象，一定重渲染。

默认 `create` 的 Hook 只有选择函数这一个参数，不能在这里传入自定义 equality。本课只使用这条默认规则。

### 3. 多个字段就选择多次

官方给出的多字段基础写法就是两次原子选择，而不是一次打包：

```tsx
function PantrySummary() {
  const nuts = usePantryStore((state) => state.nuts)
  const honey = usePantryStore((state) => state.honey)
  return (
    <p>
      坚果 {nuts} · 蜂蜜 {honey}
    </p>
  )
}
```

两次调用订阅两块数据。`ticks` 变化时，两次返回值都不变，摘要不重渲染。`nuts` 变化时，第一次调用的选中值变了，组件重渲染，此时第二次调用也会读到当前的 `honey`。

### 4. 原子指的是“一次一个值”，不是“只能选基本类型”

原子选择的对象是选择函数的**返回值**，不是值的类型：

- 基本值：`(state) => state.nuts`
- 稳定 Action：`(state) => state.addNut`
- Store 里已有的对象引用：`(state) => state.profile`

最后一种仍然是一次取出一个已有引用。`profile` 没被换成新对象时，即使别的字段变了，这个组件也不重渲染。它订阅的是整份 `profile`，不是 `profile.city` 这一个字符串。

真正打破原子选择的，是选择函数**自己 new** 出来的对象或数组。

## 四、用法与示例

### 1. 分别选择两个字段

库存面板同时显示坚果和蜂蜜，但旁边还有一个只用于制造噪音的计数：

```tsx
const usePantryStore = create<PantryStore>()((set) => ({
  nuts: 2,
  honey: 1,
  ticks: 0,
  addNut: () => set((state) => ({ nuts: state.nuts + 1 })),
  addHoney: () => set((state) => ({ honey: state.honey + 1 })),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

function NutsLabel() {
  const nuts = usePantryStore((state) => state.nuts)
  return <p>坚果 {nuts}</p>
}

function HoneyLabel() {
  const honey = usePantryStore((state) => state.honey)
  return <p>蜂蜜 {honey}</p>
}
```

`tick()` 只改 `ticks`。`NutsLabel` 和 `HoneyLabel` 的选中值不变，渲染次数不变。

### 2. 一次返回对象会失去默认效率

下面的摘要在 `ticks` 变化时也会重渲染，即使坚果和蜂蜜都没变：

```tsx
function PackedSummary() {
  const snapshot = usePantryStore((state) => ({
    nuts: state.nuts,
    honey: state.honey,
  }))
  return (
    <p>
      坚果 {snapshot.nuts} · 蜂蜜 {snapshot.honey}
    </p>
  )
}
```

选择函数每次都 `{}` 出新对象，`Object.is` 为 false。官方 README 把这种“多个字段收成一个对象”的路径留给浅比较；本课不使用浅比较，正确做法仍是分别选择。

数组同样不行：

```tsx
const pair = usePantryStore((state) => [state.nuts, state.honey])
```

`[2, 1]` 和 `[2, 1]` 是两个数组。

### 3. 不传选择函数再解构也不是原子选择

```tsx
const { nuts, honey } = usePantryStore()
```

缺省选择函数返回整份 State。任意顶层字段变化都会得到新的 Store 快照，组件重渲染。解构只发生在重渲染之后，不能缩小订阅范围。

### 4. 观察原子选择与整份订阅

下面的 Demo 用同一份库存 Store 对照四块面板：一块只选择坚果，一块只选择蜂蜜，一块在同一组件里分别选择这两个字段，一块不传选择函数。增加无关计数时，只有整份订阅面板的渲染次数上升。一次 `return` 新对象的写法会让默认比较永远失败，本课用代码示例说明，不把它挂进会持续运行的 Demo。

:::demo{id="react.zustand.learn.intermediate.atomic-selector.atomic-selector-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：把两个字段收成新对象却当成原子选择

**触发条件：** 写成 `usePantryStore((state) => ({ nuts: state.nuts, honey: state.honey }))`。

**原因：** 默认用 `Object.is` 比较返回值。每次运行都创建新对象，即使两个数字都没变也被当成变化。

**后果：** 无关字段更新也会重渲染，原子选择的效率消失。

**错误示例：**

```tsx
function PantrySummary() {
  const snapshot = usePantryStore((state) => ({
    nuts: state.nuts,
    honey: state.honey,
  }))
  return (
    <p>
      {snapshot.nuts} / {snapshot.honey}
    </p>
  )
}
```

**正确写法：**

```tsx
function PantrySummary() {
  const nuts = usePantryStore((state) => state.nuts)
  const honey = usePantryStore((state) => state.honey)
  return (
    <p>
      {nuts} / {honey}
    </p>
  )
}
```

**验证方式：** 只增加无关计数，分别选择的面板渲染次数不变，返回新对象的面板次数增加。

### 错误：用新数组一次取出多个字段

**触发条件：** 写成 `usePantryStore((state) => [state.nuts, state.honey])`。

**原因：** 数组字面量每次都是新引用，严格相等失败。

**后果：** 与返回新对象相同，任意 Store 更新都会重渲染。

**错误示例：**

```tsx
function PantryPair() {
  const [nuts, honey] = usePantryStore((state) => [state.nuts, state.honey])
  return (
    <p>
      {nuts} / {honey}
    </p>
  )
}
```

**正确写法：**

```tsx
function PantryPair() {
  const nuts = usePantryStore((state) => state.nuts)
  const honey = usePantryStore((state) => state.honey)
  return (
    <p>
      {nuts} / {honey}
    </p>
  )
}
```

**验证方式：** 只改第三个字段，数组写法的渲染次数增加，两次原子选择的次数不变。

### 错误：不传选择函数再解构多个字段

**触发条件：** 写成 `const { nuts, honey } = usePantryStore()`。

**原因：** 缺省选择函数返回整份 State。解构发生在组件内部，订阅范围仍是整份快照。

**后果：** `ticks` 变化时，只展示坚果和蜂蜜的组件也会重渲染。

**错误示例：**

```tsx
function PantrySummary() {
  const { nuts, honey } = usePantryStore()
  return (
    <p>
      {nuts} / {honey}
    </p>
  )
}
```

**正确写法：**

```tsx
function PantrySummary() {
  const nuts = usePantryStore((state) => state.nuts)
  const honey = usePantryStore((state) => state.honey)
  return (
    <p>
      {nuts} / {honey}
    </p>
  )
}
```

**验证方式：** 给组件加渲染计数，只调用 `tick()` 时计数不应增加。

### 错误：认为读两个字段就必须做浅比较

**触发条件：** 组件需要 `nuts` 和 `honey`，于是先打包成对象，再准备引入浅比较。

**原因：** 官方把浅比较留给“一个对象里装多个字段”的路径。默认路径是两次原子选择，不需要第二套比较。

**后果：** 在还没掌握默认规则前就换比较策略，问题从“选错返回值”变成“比较规则混用”。

**错误示例：**

```tsx
const snapshot = usePantryStore((state) => ({
  nuts: state.nuts,
  honey: state.honey,
}))
```

**正确写法：**

```tsx
const nuts = usePantryStore((state) => state.nuts)
const honey = usePantryStore((state) => state.honey)
```

**验证方式：** 两个字段都用 `(state) => state.field` 取出；Demo 里增加无关计数时，原子面板次数不变。

### 错误：在原子选择里现场计算并返回新引用

**触发条件：** 写成 `(state) => state.tags.filter((tag) => tag.active)`，期望“只有筛选结果变了才更新”。

**原因：** `filter` 每次返回新数组。这不是取出已有值，而是每次生产新值。

**后果：** 其他字段更新也会让组件重渲染。

**错误示例：**

```tsx
function ActiveTags() {
  const activeTags = usePantryStore((state) =>
    state.tags.filter((tag) => tag.active),
  )
  return <p>{activeTags.length}</p>
}
```

**正确写法：**

```tsx
function ActiveTags() {
  const tags = usePantryStore((state) => state.tags)
  const activeCount = tags.filter((tag) => tag.active).length
  return <p>{activeCount}</p>
}
```

**验证方式：** 选择函数只返回 Store 里已经存在的字段、基本值或稳定 Action；派生计算放在组件渲染里。
:::

## 六、原理与适用场景

### 1. 官方事实

README 的 “Selecting multiple state slices” 写明：默认用严格相等检测变化，这对原子状态选择高效；示例是分别选择 `state.nuts` 和 `state.honey`。同一节随后说明：若把多个字段收成一个对象，需要浅比较才能在输出按浅相等未变时跳过重渲染。

固定版本 `src/react.ts` 中，`useStore` 把 `selector(api.getState())` 和 `selector(api.getInitialState())` 交给 `React.useSyncExternalStore`。默认导出的 `create` Hook 没有 equality 第二参数。React 文档写明 `useSyncExternalStore` 用 `Object.is` 比较快照。

官方测试 `only re-renders if selected state has changed` 分别选择 `count` 和 `inc`：点击后 `count` 组件渲染两次，`inc` 组件仍是一次。

### 2. 课程推导

原子选择把“组件要哪一个已有值”写成最小合同。默认比较只问返回值是不是同一个值或同一个引用，所以合同必须足够小：一次一个字段，或一次一个稳定 Action。把多个字段临时打包，合同比较的就变成“这个新容器”，而不是字段内容。

### 3. 适用边界

本课只讲默认严格相等下的原子选择：一次取出一个已有值、多个字段多次选择、以及打包对象/数组为何破坏这条路径。浅比较、`useShallow`、选择结果稳定性、自定义 equality、`createWithEqualityFn` 和外部 `subscribe` 都不在这里展开。

## 七、练习

:::exercise
### 把打包选择改成原子选择

**要求：** 已有一份 `PantryStore`，包含 `nuts`、`honey`、`ticks` 以及 `addNut`、`tick`。当前 `PackedShelf` 用一次选择函数返回 `{ nuts, honey }`。改成原子选择：分别读取 `nuts` 和 `honey`，再写一个只选择 `tick` 的按钮。不要返回临时对象或临时数组，也不要引入浅比较。

**验收：** 调用 `tick()` 后，货架组件的渲染计数不增加；调用 `addNut()` 后，货架组件渲染计数增加，按钮组件渲染计数不增加。

**参考答案：**

```tsx
import { useRef } from 'react'
import { create } from 'zustand'

type PantryStore = {
  nuts: number
  honey: number
  ticks: number
  addNut: () => void
  tick: () => void
}

const usePantryStore = create<PantryStore>()((set) => ({
  nuts: 2,
  honey: 1,
  ticks: 0,
  addNut: () => set((state) => ({ nuts: state.nuts + 1 })),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

/** 分别选择坚果和蜂蜜，避免打包成新对象。 */
function PackedShelf() {
  const nuts = usePantryStore((state) => state.nuts)
  const honey = usePantryStore((state) => state.honey)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <p>
      坚果 {nuts} · 蜂蜜 {honey} · 渲染 {renderCount.current}
    </p>
  )
}

/** 只选择 tick Action，数量变化时不必重渲染。 */
function TickButton() {
  const tick = usePantryStore((state) => state.tick)
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

- 原子选择一次取出 Store 里已经存在的一个值，默认用严格相等判断要不要重渲染。
- 需要两个字段就写两次选择函数；不要 `return` 临时对象或临时数组。
- 不传选择函数再解构，订阅的仍是整份 Store。
- Action 引用通常稳定，适合单独选择。
- 本课不把多个字段收成对象后再换比较策略。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Selecting multiple state slices](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 默认严格相等适合原子选择；多字段应分别读取。
- [Zustand 5.0.15 React binding source](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - 选择函数交给 `useSyncExternalStore`，默认无 equality 参数。
- [Zustand 5.0.15 basic tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/basic.test.tsx) - 按字段选择后，只有选中值变化的组件会重渲染。
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) - 快照用 `Object.is` 比较。
