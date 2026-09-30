---
id: react.zustand.learn.intermediate.use-shallow
type: lesson
title: useShallow
summary: 用 useShallow 包住会 new 出对象或数组的选择函数，让浅相等的结果复用上一次引用，避免多余重渲染。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.intermediate.selector-result-stability
related:
  - react.zustand.learn.intermediate.selector-result-stability
  - react.zustand.learn.intermediate.atomic-selector
tags:
  - Zustand
  - useShallow
  - 浅比较
  - Selector
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能从 zustand/react/shallow 导入 useShallow，并把它包在会返回新对象或新数组的选择函数外面。
  - 能说明 useShallow 用浅比较决定是复用上一次引用，还是接受这次新结果。
  - 能对照对象选取、数组选取在无关更新下不再重渲染，字段内容变了仍会重渲染。
  - 能识别浅比较只看顶层，嵌套对象引用不同时仍然不相等。
recap:
  - 默认比较是 Object.is；需要临时对象或数组时，用 useShallow 钉住浅相等的结果。
  - useShallow 是 React Hook，必须写在组件里，返回值再交给 Store Hook。
  - 浅比较只看顶层属性或数组元素是否 Object.is 相同。
  - 能一次取出一个已有字段时，优先原子选择，不必上 useShallow。
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
      - 把多个字段收成一个对象时，可用 useShallow，在输出按浅相等未变时跳过重渲染。
      - 官方示例从 zustand/react/shallow 导入 useShallow，分别演示对象选取和数组选取。
  - title: Zustand 5.0.15 useShallow reference
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/hooks/use-shallow.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - useShallow 接收选择函数，返回用浅比较记忆化后的选择函数。
      - Object.keys(state) 每次都是新数组；包上 useShallow 后，键未变时组件不重渲染。
      - v5 默认用 Object.is；选择函数每次返回新对象可能触发 Maximum update depth exceeded。
  - title: Zustand 5.0.15 useShallow source
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react/shallow.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - useShallow 用 ref 保存上一次结果；shallow 为 true 时返回上一次引用，否则写入新结果。
  - title: Zustand 5.0.15 shallow source
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla/shallow.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 先走 Object.is；对象则比较顶层条目，数组按顺序比较元素，都不深入嵌套。
  - title: Zustand 5.0.15 shallow tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/shallow.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 用 useShallow 包住 Object.keys 后，只改已有键的值不会重渲染，新增键才会重渲染。
      - 浅相等时返回的是上一次计算出来的那份实例。
---

# useShallow

## 一、学习目标

- 在必须返回临时对象或临时数组时，用 `useShallow` 包住选择函数。
- 解释浅比较如何让内容没变的新容器复用上一次引用。
- 对照对象选取和数组选取在无关更新下的渲染次数。
- 识别浅比较不深入嵌套对象。

## 二、为什么需要 useShallow

前两课已经能一次取出一个已有字段，也知道选择结果必须对 `Object.is` 稳定。有时仍想一次拿到两个字段，写成：

```tsx
const snapshot = usePantryStore((state) => ({
  nuts: state.nuts,
  honey: state.honey,
}))
```

字段内容没变，每次却仍是新对象。v5 默认比较是 `Object.is`。官方 `useShallow` 文档写明：这种包装对象每次都是新引用时，可能触发 `Maximum update depth exceeded`。

官方 README 把这条路径叫做：把多个字段收成一个对象，再用 `useShallow`，在输出按浅相等未变时跳过重渲染。它不是默认比较的替代品，而是给“不得不 new 容器”的选择函数补一层记忆。

能两次原子选择时，继续两次选择。`useShallow` 用在容器本身就是选择结果的场合。

## 三、核心概念

### 1. useShallow 包住选择函数

从 `zustand/react/shallow` 导入。它是 React Hook，必须写在组件里：

```tsx
import { useShallow } from 'zustand/react/shallow'

const { nuts, honey } = usePantryStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
)
```

`useShallow(selector)` 返回另一个选择函数。把返回值交给 Store Hook，不要把 `useShallow` 当成 Store Hook 的第二参数。默认 `create` 仍然只有选择函数这一个参数。

### 2. 浅相等则复用上一次引用

`src/react/shallow.ts` 里的实现是：

```ts
export function useShallow<S, U>(selector: (state: S) => U): (state: S) => U {
  const prev = React.useRef<U>(undefined)
  return (state) => {
    const next = selector(state)
    return shallow(prev.current, next)
      ? (prev.current as U)
      : (prev.current = next)
  }
}
```

每次 Store 快照到来，先跑原来的选择函数得到 `next`。`shallow(prev, next)` 为 true 时，返回 `prev` 那份旧引用；否则把 `prev` 换成 `next`。交给 `useSyncExternalStore` 的就是这份可能被钉住的结果，`Object.is` 才能跳过重渲染。

官方测试 `returns the previously computed instance when possible` 验证的就是：浅相等时拿到的是上一次那份实例。

### 3. shallow 只看顶层

`src/vanilla/shallow.ts` 先用 `Object.is`。都是对象时：

- 普通对象比较顶层键和对应值，值用 `Object.is`。
- 数组按顺序比较每个元素，元素用 `Object.is`。
- Map、Set 比较顶层条目。
- 原型不同直接不相等。
- 嵌套对象只比较引用，不走进下一层。

因此 `{ nuts: 2, honey: 1 }` 和另一份 `{ nuts: 2, honey: 1 }` 浅相等；`{ profile: { city: 'A' } }` 和另一份带新 `profile` 对象的结果不相等，即使 `city` 字符串相同。

### 4. 官方三种选取

README 给出三类用法：

```tsx
const { nuts, honey } = usePantryStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
)

const [nuts, honey] = usePantryStore(
  useShallow((state) => [state.nuts, state.honey]),
)

const keys = usePantryStore(useShallow((state) => Object.keys(state.labels)))
```

对象选取：顶层字段 `Object.is` 都相同就不重渲染。数组选取：长度和每个元素都相同就不重渲染。`Object.keys`：键集合没变就不重渲染，即使对应值已经改过。

官方测试里，`useShallow((state) => Object.keys(state).sort())` 在 `setState({ a: 4 })` 后不重渲染，在 `setState({ d: 10 })` 新增键后才重渲染。

## 四、用法与示例

### 1. 对象选取两个字段

库存里还有一个无关计数：

```tsx
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const usePantryStore = create<PantryStore>()((set) => ({
  nuts: 2,
  honey: 1,
  ticks: 0,
  addNut: () => set((state) => ({ nuts: state.nuts + 1 })),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

function PantrySummary() {
  const { nuts, honey } = usePantryStore(
    useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
  )
  return (
    <p>
      坚果 {nuts} · 蜂蜜 {honey}
    </p>
  )
}
```

`tick()` 只改 `ticks`。新对象的 `nuts`、`honey` 与上次浅相等，`useShallow` 交回旧引用，摘要不重渲染。`addNut()` 让 `nuts` 变成另一个数字，浅比较失败，摘要重渲染。

### 2. 数组选取同样只看元素

```tsx
const [nuts, honey] = usePantryStore(
  useShallow((state) => [state.nuts, state.honey]),
)
```

`[2, 1]` 和 `[2, 1]` 是两个数组，但元素都是 `Object.is` 相同的数字，浅比较为 true。顺序变了或长度变了才会更新。

### 3. 键集合与值变化分开

```tsx
const names = useMeals(useShallow((state) => Object.keys(state)))
```

官方指南里，只改 `papaBear` 的餐点内容时，键仍是原来那几个字符串，`BearNames` 不重渲染。这和“值变了就要更新摘要”不是同一类需求：对象选取看的是字段值，`Object.keys` 看的是键名。

### 4. 观察浅比较选取与整份订阅

下面的 Demo 用同一份库存 Store 对照四块面板：一块用 `useShallow` 选取 `{ nuts, honey }`，一块用 `useShallow` 选取 `[nuts, honey]`，一块只原子选择 `nuts`，一块不传选择函数。增加无关计数时，只有整份订阅面板的渲染次数上升。改坚果数量时，浅比较面板和原子坚果面板都会更新。没有 `useShallow` 的临时对象写法会让默认比较永远失败，只出现在正文示例里，不挂进持续运行的 Demo。

:::demo{id="react.zustand.learn.intermediate.use-shallow.use-shallow-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：返回新对象却不包 useShallow

**触发条件：** 写成 `usePantryStore((state) => ({ nuts: state.nuts, honey: state.honey }))`。

**原因：** v5 默认用 `Object.is` 比较选择结果。包装对象每次都是新引用。

**后果：** 无关更新也重渲染；官方文档指出可能触发 `Maximum update depth exceeded`。

**错误示例：**

```tsx
function PantrySummary() {
  const { nuts, honey } = usePantryStore((state) => ({
    nuts: state.nuts,
    honey: state.honey,
  }))
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
  const { nuts, honey } = usePantryStore(
    useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
  )
  return (
    <p>
      {nuts} / {honey}
    </p>
  )
}
```

**验证方式：** 只增加无关计数，包了 `useShallow` 的面板渲染次数不变。两个字段也能改成两次原子选择。

### 错误：把 useShallow 当成 create 的第二参数

**触发条件：** 写成 `usePantryStore((state) => ({ nuts: state.nuts }), useShallow)` 或 `create(initializer, shallow)`。

**原因：** v5 默认 `create` Hook 只有选择函数一个参数。`useShallow` 的返回值才是选择函数。

**后果：** 类型报错，或根本没有浅比较，临时对象问题还在。

**错误示例：**

```tsx
const snapshot = usePantryStore(
  (state) => ({ nuts: state.nuts, honey: state.honey }),
  useShallow,
)
```

**正确写法：**

```tsx
const snapshot = usePantryStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
)
```

**验证方式：** 确认调用形态是 `useStore(useShallow(selector))`，没有第二参数。

### 错误：在模块顶层调用 useShallow

**触发条件：** 把 `const selectPair = useShallow((state) => [state.nuts, state.honey])` 写在组件外面。

**原因：** `useShallow` 内部使用 `useRef`，必须遵守 Hook 规则，写在函数组件或自定义 Hook 里。

**后果：** 运行时报 Hook 调用位置错误，记忆化也无法按组件实例保存。

**错误示例：**

```tsx
const selectPair = useShallow((state: PantryStore) => [state.nuts, state.honey])

function PantryPair() {
  const [nuts, honey] = usePantryStore(selectPair)
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
  const [nuts, honey] = usePantryStore(
    useShallow((state) => [state.nuts, state.honey]),
  )
  return (
    <p>
      {nuts} / {honey}
    </p>
  )
}
```

**验证方式：** `useShallow` 与 `usePantryStore` 出现在同一个组件函数体内。

### 错误：以为浅比较会走进嵌套对象

**触发条件：** 选择函数返回 `{ profile: state.profile }`，并期望 `profile.city` 没变就不更新。

**原因：** `shallow` 对嵌套值只做 `Object.is`。`set` 换成新的 `profile` 对象后，顶层 `profile` 引用已变，浅比较为 false。

**后果：** 组件仍然重渲染；误以为 `useShallow` 是深比较。

**错误示例：**

```tsx
const snapshot = usePantryStore(
  useShallow((state) => ({ profile: state.profile })),
)
```

**正确写法：**

```tsx
const profile = usePantryStore((state) => state.profile)
const city = profile.city
```

**验证方式：** 选择已有的 `profile` 引用，或选择 `profile.city` 这个字符串；不要指望浅比较深入下一层。

### 错误：能原子选择时仍先打包再浅比较

**触发条件：** 组件只要 `nuts` 一个数字，却写成 `useShallow((state) => ({ nuts: state.nuts }))`。

**原因：** 原子选择已经对 `Object.is` 稳定。多包一层浅比较没有新的订阅合同，还让读者以为默认路径不够用。

**后果：** API 变重，真正该用 `useShallow` 的“多字段容器”场景反而被稀释。

**错误示例：**

```tsx
const { nuts } = usePantryStore(useShallow((state) => ({ nuts: state.nuts })))
```

**正确写法：**

```tsx
const nuts = usePantryStore((state) => state.nuts)
```

**验证方式：** 只需要一个已有字段或稳定 Action 时，不写 `useShallow`；Demo 里原子坚果面板在 `tick()` 后次数也不增加。
:::

## 六、原理与适用场景

### 1. 官方事实

README 写明：默认严格相等适合原子选择；若把多个字段收成一个对象，可用 `useShallow`，在输出按浅相等未变时跳过重渲染。导入路径是 `zustand/react/shallow`。

`useShallow` 文档给出签名 `useShallow(selectorFn)`，返回用浅比较记忆化后的选择函数。故障排除写明：v5 默认 `Object.is`，选择函数每次返回新对象可能无限更新；修复可以是 `useShallow`，也可以改回分别选择每个字段。

源码用 ref 保存上一次结果，`shallow` 为 true 时交回旧引用。`shallow` 只比较顶层。官方测试证明：`Object.keys` 在已有键的值变化时不重渲染，新增键时重渲染；浅相等时返回上一次实例。

### 2. 课程推导

`useShallow` 不改 Store，也不给默认 Hook 增加第二参数。它把“每次 new 出来的容器”在浅相等时钉成同一份引用，从而满足 `getSnapshot` 对 `Object.is` 的要求。适用面是容器型选择结果：对象选取、数组选取、`Object.keys` 这类计算型数组。嵌套结构、自定义 equality、以及给 `create` 换一套比较函数，都不在这个 Hook 的合同里。

### 3. 适用边界

本课只讲 `useShallow`：导入路径、包住选择函数、浅比较顶层、对象/数组选取，以及它与原子选择的分工。`createWithEqualityFn`、把 `shallow` 当作 Hook 第二参数、`zustand/traditional`、把派生结果写回 Store，以及外部 `subscribe` 的 equality 选项都不在这里展开。

## 七、练习

:::exercise
### 给对象选取补上 useShallow

**要求：** 已有一份 `PantryStore`，包含 `nuts`、`honey`、`ticks` 以及 `addNut`、`tick`。当前 `PackedShelf` 用一次选择函数返回 `{ nuts, honey }`，没有浅比较。改成 `useShallow` 包住这份对象选取；再写一个只选择 `tick` 的按钮。不要给默认 `create` 增加第二参数，也不要改成两次原子选择来完成本题。

**验收：** 调用 `tick()` 后，货架组件的渲染计数不增加；调用 `addNut()` 后，货架组件渲染计数增加，按钮组件渲染计数不增加。

**参考答案：**

```tsx
import { useRef } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

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

/** 用浅比较钉住对象选取，无关计数变化时复用上一次引用。 */
function PackedShelf() {
  const { nuts, honey } = usePantryStore(
    useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
  )
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

- `useShallow` 包住会 new 容器的选择函数，浅相等时交回上一次引用。
- 从 `zustand/react/shallow` 导入，必须写在组件里，返回值再交给 Store Hook。
- 浅比较只看顶层字段或数组元素，不走进嵌套对象。
- 一次一个已有字段时继续原子选择；本课不换 `create` 的比较函数。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Selecting multiple state slices](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 多字段收成对象时使用 `useShallow`。
- [Zustand 5.0.15 useShallow reference](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/reference/hooks/use-shallow.md) - 签名、Object.keys 示例，以及临时对象可能无限更新。
- [Zustand 5.0.15 useShallow source](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react/shallow.ts) - 浅相等时复用 ref 里的上一次结果。
- [Zustand 5.0.15 shallow source](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla/shallow.ts) - 顶层比较，不深入嵌套。
- [Zustand 5.0.15 shallow tests](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/shallow.test.tsx) - 键未变不重渲染；浅相等返回同一实例。
