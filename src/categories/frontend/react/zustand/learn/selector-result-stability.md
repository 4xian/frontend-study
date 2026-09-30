---
id: react.zustand.learn.intermediate.selector-result-stability
type: lesson
title: Selector 结果稳定性
summary: 让选择函数在 Store 未变时返回 Object.is 相同的值，避免多余重渲染和 getSnapshot 无限循环。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.intermediate.atomic-selector
related:
  - react.zustand.learn.intermediate.atomic-selector
  - react.zustand.learn.basics.selector
tags:
  - Zustand
  - Selector
  - 结果稳定性
  - Object.is
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能说明默认比较看的是选择结果，不是选择函数这份源码写在哪里。
  - 能判断哪些返回值对 Object.is 稳定：已有字段、基本值、稳定 Action。
  - 能识别选择函数每次 new 出对象或数组时，无关更新也会重渲染，并可能触发 getSnapshot 缓存错误。
  - 能把派生结构放到组件里计算，选择函数只取出已经存在的值。
recap:
  - 选择结果必须在 Store 未变时保持 Object.is 相同。
  - 内联选择函数在 v5 可以写；不稳定的是每次 new 出来的返回值。
  - filter、map、Object.keys 和对象字面量都会破坏结果稳定性。
  - 先取出已有字段，再在组件里做派生；本课不换比较策略。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 React binding source
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 选择函数包在 getSnapshot 里，每次调用都会对 api.getState() 再跑一遍。
      - 默认 Hook 只有 selector 一个参数，没有 equality 函数。
  - title: React useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 店铺未变时，反复调用 getSnapshot 必须返回同一个值。
      - 用 Object.is 比较快照，不同才重渲染。
      - getSnapshot 每次返回新对象会进入无限循环，并报结果应被缓存。
  - title: Zustand 5.0.15 README Selecting multiple state slices
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 默认用严格相等检测变化，适合一次取出一个已有值。
      - 把多个字段收成新对象后，默认比较不再看字段内容。
  - title: Zustand prevent rerenders with useShallow
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/prevent-rerenders-with-use-shallow.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 计算型选择的输出按 Object.is 判断是否变化。
      - Object.keys(state) 每次都是新数组，即使键没变也会重渲染。
---

# Selector 结果稳定性

## 一、学习目标

- 分清“选择函数写在组件里”和“选择结果每次都是新引用”不是同一件事。
- 判断返回值何时对 `Object.is` 稳定。
- 识别对象字面量、`filter`、`map`、`Object.keys` 如何破坏稳定性。
- 把派生结构留在组件渲染里，选择函数只取出已有值。

## 二、为什么需要结果稳定

上一节已经能一次取出一个已有字段。下一步常会在选择函数里“顺手算一下”：

```tsx
const names = useBoardStore((state) => Object.keys(state.labels))
const active = useBoardStore((state) => state.tasks.filter((task) => task.open))
```

`labels` 的键没变，`Object.keys` 仍是新数组。`tasks` 引用没变，`filter` 仍是新数组。默认比较看的是这次返回值和上次是不是同一个值。

Zustand 5.0.15 的 React 绑定把选择函数放进 `useSyncExternalStore` 的 `getSnapshot`。React 文档要求：店铺未变时，反复调用 `getSnapshot` 必须返回同一个值。返回值每次都是新对象，轻则无关更新也重渲染，重则开发环境报 `The result of getSnapshot should be cached to avoid an infinite loop`。

结果稳定性讨论的是**返回值**，不是把选择函数包进 `useCallback`。

## 三、核心概念

### 1. 比较的是选择结果

`src/react.ts` 里，默认 Hook 实际是：

```ts
React.useSyncExternalStore(
  api.subscribe,
  React.useCallback(() => selector(api.getState()), [api, selector]),
  React.useCallback(() => selector(api.getInitialState()), [api, selector]),
)
```

Store 通知订阅者之后，React 再调用这份 `getSnapshot`。`getSnapshot` 做的事只有一件：对当前快照跑选择函数，把返回值交给 `Object.is`。

因此合同是：

- Store 里被用到的数据没变，选择结果必须 `Object.is` 相等。
- 结果变了，组件重渲染。
- 结果每次都是新引用，即使内容一样，也会被当成变了。

### 2. 函数引用稳定不是本课合同

选择函数写成内联箭头函数时，每次组件渲染都会得到一个新的函数引用。`useCallback` 的依赖里有 `selector`，所以 `getSnapshot` 函数也会换新。

维护者在 Zustand 讨论里说明：进入 `useSyncExternalStore` 之后，不再要求选择函数本身保持引用稳定；内联选择函数可以直接写。需要稳定的是选择**结果**。把不稳定的对象返回值包进 `useCallback`，比较仍然失败。

本课不把 `useCallback` 当成修复手段。

### 3. 哪些返回值天然稳定

对 `Object.is` 稳定的常见返回值：

- 基本值：`(state) => state.title`
- 数字派生：`(state) => state.tags.length`，两次都是同一个数字就相等
- 稳定 Action：`(state) => state.rename`
- Store 里已经存在的引用：`(state) => state.tags`

最后一种订阅的是整份 `tags` 数组。数组被换成新数组时组件会更新；只改 `title` 时，只要 `set` 仍复用原来的 `tags` 引用，这个组件不重渲染。

### 4. 哪些返回值每次都是新的

下面每次运行都会 `Object.is` 失败，即使内容没变：

```tsx
;(state) => ({ title: state.title, tags: state.tags })
;(state) => [state.title, state.tags]
;(state) => state.tags.filter((tag) => tag.length > 0)
;(state) => state.tags.map((tag) => tag.toUpperCase())
;(state) => Object.keys(state.labels)
```

官方浅比较指南用 `Object.keys(state)` 作为例子：键集合没变，数组仍是新的，组件仍会重渲染。那份指南随后改用浅比较；本课不换比较策略，正确做法是不要在选择函数里生产新结构。

不要把这种选择函数挂进会持续运行的组件。`getSnapshot` 在店铺未变时也会被调用，每次新引用会让 React 认为快照一直在变。

## 四、用法与示例

### 1. 取出已有字段，派生放在组件里

看板同时有标题、标签列表和无关计数：

```tsx
const useBoardStore = create<BoardStore>()((set) => ({
  title: '迭代看板',
  tags: ['设计', '开发'],
  ticks: 0,
  rename: (title: string) => set({ title }),
  addTag: (tag: string) => set((state) => ({ tags: [...state.tags, tag] })),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

function TagList() {
  const tags = useBoardStore((state) => state.tags)
  const names = tags.join('、')
  return <p>{names}</p>
}
```

`tick()` 只改 `ticks`。`tags` 仍是原来的数组，`TagList` 不重渲染。需要展示字符串时，在已经拿到的数组上计算，不要让选择函数 `join` 出新需求之外的结构；`join` 返回字符串，字符串相同也稳定，但筛选、映射仍应留在组件里。

### 2. 基本值派生可以留在选择函数里

标签数量是数字：

```tsx
const tagCount = useBoardStore((state) => state.tags.length)
```

`tags` 没换成新数组时，长度仍是同一个数字。`tick()` 不会让这个选择结果变化。这和 `filter` 出新数组不是同一类写法。

### 3. 不要在选择函数里拼对象或数组

```tsx
function UnstableSummary() {
  const snapshot = useBoardStore((state) => ({
    title: state.title,
    tags: state.tags,
  }))
  return (
    <p>
      {snapshot.title} · {snapshot.tags.length}
    </p>
  )
}
```

即使 `title` 和 `tags` 都没变，每次仍是新对象。`ticks` 一变，这块摘要也会重渲染。更糟的是，首次挂载时 React 就会多次调用 `getSnapshot`，两次新对象会触发缓存错误。

需要两个字段时，沿用原子选择：写两次 Hook。

### 4. 观察稳定结果与整份订阅

下面的 Demo 用同一份看板 Store 对照四块面板：一块选择标题，一块选择已有的标签数组，一块选择标签数量这个数字，一块不传选择函数。增加无关计数时，只有整份订阅面板的渲染次数上升。会每次 `return` 新对象或新数组的选择函数只出现在正文示例里，不挂进持续运行的 Demo。

:::demo{id="react.zustand.learn.intermediate.selector-result-stability.selector-result-stability-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：选择函数每次返回新对象

**触发条件：** 写成 `useBoardStore((state) => ({ title: state.title, tags: state.tags }))`。

**原因：** `getSnapshot` 每次都得到新对象，`Object.is` 为 false。

**后果：** 无关字段更新也会重渲染；开发环境可能报 getSnapshot 结果应被缓存。

**错误示例：**

```tsx
function BoardSummary() {
  const snapshot = useBoardStore((state) => ({
    title: state.title,
    tags: state.tags,
  }))
  return (
    <p>
      {snapshot.title} · {snapshot.tags.length}
    </p>
  )
}
```

**正确写法：**

```tsx
function BoardSummary() {
  const title = useBoardStore((state) => state.title)
  const tags = useBoardStore((state) => state.tags)
  return (
    <p>
      {title} · {tags.length}
    </p>
  )
}
```

**验证方式：** 只增加无关计数，分别选择的面板渲染次数不变。

### 错误：用 filter 或 Object.keys 生产新数组

**触发条件：** 写成 `(state) => state.tags.filter((tag) => tag.length > 0)` 或 `(state) => Object.keys(state.labels)`。

**原因：** `filter`、`map`、`Object.keys` 每次都分配新数组，即使元素没变。

**后果：** 官方浅比较指南里的 `Object.keys(state)` 会在键未变时仍重渲染；默认路径同样失败。

**错误示例：**

```tsx
function TagNames() {
  const names = useBoardStore((state) => Object.keys(state.labels))
  return <p>{names.join('、')}</p>
}
```

**正确写法：**

```tsx
function TagNames() {
  const labels = useBoardStore((state) => state.labels)
  const names = Object.keys(labels)
  return <p>{names.join('、')}</p>
}
```

**验证方式：** 选择函数只返回 Store 里已有的对象；`Object.keys` 放在组件渲染里。只改无关字段时，面板渲染次数不变。

### 错误：用 useCallback 包住仍返回新对象的选择函数

**触发条件：** 认为“选择函数引用变了才会出问题”，于是写成 `useCallback((state) => ({ title: state.title }), [])`。

**原因：** v5 比较的是选择结果。`useCallback` 只固定函数引用，每次调用仍 `{}` 出新对象。

**后果：** 渲染次数和无限循环风险都还在，还误以为已经处理了稳定性。

**错误示例：**

```tsx
const selectSummary = useCallback(
  (state: BoardStore) => ({ title: state.title, tags: state.tags }),
  [],
)
const snapshot = useBoardStore(selectSummary)
```

**正确写法：**

```tsx
const title = useBoardStore((state) => state.title)
const tags = useBoardStore((state) => state.tags)
```

**验证方式：** 去掉 `useCallback`，改成两次原子选择；无关更新后渲染次数不再增加。

### 错误：把内联选择函数当成无限循环原因

**触发条件：** 看到 `getSnapshot` 依赖了 `selector`，就把内联箭头函数改成模块顶层常量，却仍 `return state.tags.map(...)`。

**原因：** 内联选择函数在 v5 可以写。无限循环来自返回值每次都是新引用，不是来自函数写在组件内部。

**后果：** 顶层常量并不能让 `map` 的新数组变成同一个数组。

**错误示例：**

```tsx
const selectUpper = (state: BoardStore) => state.tags.map((tag) => tag.toUpperCase())

function TagList() {
  const tags = useBoardStore(selectUpper)
  return <p>{tags.join('、')}</p>
}
```

**正确写法：**

```tsx
function TagList() {
  const tags = useBoardStore((state) => state.tags)
  const upper = tags.map((tag) => tag.toUpperCase())
  return <p>{upper.join('、')}</p>
}
```

**验证方式：** 选择函数返回 `state.tags`；映射发生在组件里。`tick()` 后渲染次数不变。

### 错误：返回临时结构却准备靠浅比较救命

**触发条件：** 已经写出 `Object.keys` 或对象字面量，准备立刻引入浅比较。

**原因：** 默认路径要求结果对 `Object.is` 稳定。浅比较是另一套合同，本课不切换比较策略。

**后果：** 问题从“返回值不稳定”变成“比较规则混用”，默认 Hook 也没有 equality 第二参数。

**错误示例：**

```tsx
const names = useBoardStore((state) => Object.keys(state.labels))
```

**正确写法：**

```tsx
const labels = useBoardStore((state) => state.labels)
const names = Object.keys(labels)
```

**验证方式：** Demo 里增加无关计数时，选择已有字段或数字的面板次数不变；正文示例中的新对象写法不要挂进运行中的组件。
:::

## 六、原理与适用场景

### 1. 官方事实

React 文档写明：`getSnapshot` 在店铺未变时必须返回同一个值；比较用 `Object.is`；每次返回新对象会无限循环，并提示结果应被缓存。

Zustand 5.0.15 的 `useStore` 把 `selector(api.getState())` 当作 `getSnapshot`。默认 `create` Hook 没有 equality 第二参数。README 写明默认严格相等适合原子选择；打包成对象后默认比较不再看字段内容。浅比较指南用 `Object.keys(state)` 证明：计算型选择的输出按 `Object.is` 变化，键未变也会重渲染。

### 2. 课程推导

结果稳定性是默认比较能工作的前提。选择函数可以内联，也可以抽成变量；只要返回值是已有字段、基本值或稳定 Action，`Object.is` 就能跳过无关更新。选择函数一旦自己分配新对象或新数组，合同比较的就变成“这个新容器”，不再是字段内容。修复方式是缩小返回值，而不是给默认 Hook 补第二参数。

### 3. 适用边界

本课只讲默认严格相等下的结果稳定性：哪些返回值稳定、哪些每次都是新引用、以及派生结构应放在组件里。浅比较、`useShallow`、`createWithEqualityFn`、自定义 equality、把派生结果写回 Store，以及外部 `subscribe` 都不在这里展开。

## 七、练习

:::exercise
### 把不稳定选择改成稳定结果

**要求：** 已有一份 `BoardStore`，包含 `title`、`tags`、`ticks` 以及 `addTag`、`tick`。当前 `TagBoard` 用 `(state) => state.tags.filter((tag) => tag.length > 0)` 取标签。改成先选择已有的 `tags` 数组，再在组件里过滤；另写一个只选择 `tick` 的按钮。不要返回临时对象或临时数组，也不要引入浅比较或 `useCallback`。

**验收：** 调用 `tick()` 后，看板组件的渲染计数不增加；调用 `addTag()` 后，看板组件渲染计数增加，按钮组件渲染计数不增加。

**参考答案：**

```tsx
import { useRef } from 'react'
import { create } from 'zustand'

type BoardStore = {
  title: string
  tags: string[]
  ticks: number
  addTag: (tag: string) => void
  tick: () => void
}

const useBoardStore = create<BoardStore>()((set) => ({
  title: '迭代看板',
  tags: ['设计', '开发'],
  ticks: 0,
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
}))

/** 先取出已有标签数组，过滤放在组件里，保持选择结果稳定。 */
function TagBoard() {
  const tags = useBoardStore((state) => state.tags)
  const visible = tags.filter((tag) => tag.length > 0)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <p>
      {visible.join('、')} · 渲染 {renderCount.current}
    </p>
  )
}

/** 只选择 tick Action，标签变化时不必重渲染。 */
function TickButton() {
  const tick = useBoardStore((state) => state.tick)
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

- 默认比较看选择结果是否 `Object.is` 相同，不看选择函数写在组件里还是文件顶部。
- 已有字段、基本值和稳定 Action 是稳定结果；对象字面量、`filter`、`map`、`Object.keys` 不是。
- 不稳定结果会让无关更新也重渲染，并可能触发 getSnapshot 缓存错误。
- 派生结构放在组件里计算；本课不换浅比较或自定义 equality。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 React binding source](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - 选择函数作为 getSnapshot 运行，默认无 equality 参数。
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) - 店铺未变时 getSnapshot 必须返回同一值；新对象会无限循环。
- [Zustand 5.0.15 README Selecting multiple state slices](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 默认严格相等适合已有值；打包对象会失去这条路径。
- [Zustand prevent rerenders with useShallow](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/prevent-rerenders-with-use-shallow.md) - `Object.keys` 每次都是新数组，即使键没变也会重渲染。
