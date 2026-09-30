---
id: react.zustand.learn.basics.selector
type: lesson
title: Selector
summary: 用选择函数从 Store 取出组件真正需要的字段，并用 Object.is 决定这次更新要不要重渲染。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.basics.component-subscription
related:
  - react.zustand.learn.basics.component-subscription
  - react.zustand.learn.basics.get-current-state
tags:
  - Zustand
  - Selector
  - 选择函数
  - 订阅范围
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能写出 (state) => state.field 形式的选择函数，从 Store 取出单个字段。
  - 能解释未传入选择函数时，Hook 默认返回整份 State。
  - 能说明选中值用 Object.is 比较，相同则不重渲染。
  - 能用多次 Hook 调用分别读取多个字段，而不是返回临时对象。
  - 能识别选择函数返回新对象或新数组时，组件会在每次 Store 更新后重渲染。
recap:
  - 选择函数决定组件订阅哪一块数据；只取出真正要用的字段。
  - 不传选择函数等于订阅整份 Store，任意字段变化都会重渲染。
  - 默认用 Object.is 比较前后两次选中值，引用或值相同就不重渲染。
  - 需要多个字段时，分别选择每个字段；不要在选择函数里每次都 new 一个对象。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand Introduction
    url: https://zustand.docs.pmnd.rs/learn/getting-started/introduction
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 选中状态后，消费该状态的组件会在状态变化时重渲染。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/reference/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - create 返回的 Hook 通过选择函数读取基于当前状态的数据，选择函数是它的唯一参数。
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 不传选择函数会在每次状态变化时更新组件。
      - 默认用严格相等比较选中值，适合按字段读取。
  - title: Zustand 5.0.15 React binding source
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 未传入选择函数时，默认选择函数返回入参本身，也就是整份 State。
      - 选择函数会应用到 getState 和 getInitialState 的当前快照上。
  - title: Zustand 5.0.15 basic tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/basic.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 官方测试覆盖按选择函数读取字段。
      - 官方测试证明只选择变化字段的组件才会重渲染。
---

# Selector

## 一、学习目标

- 给 Store Hook 传入选择函数，只取出当前组件需要的字段。
- 说明不传选择函数时，组件会订阅整份 Store。
- 用 `Object.is` 判断选中值有没有变，从而决定要不要重渲染。
- 需要多个字段时，分别选择每一个字段。

## 二、为什么需要 Selector

上一课已经能把组件连到 Store：挂载时订阅，选中值变化时重渲染，卸载时结束。那时选择函数只是“划范围”的最小写法。

Store 通常会同时保存多件事实，例如关键词、筛选状态和命中次数。如果组件每次都拿走整份 State，关键词面板也会在命中次数变化时刷新。界面能工作，但订阅范围比实际需要的大。

选择函数把“组件要哪一块数据”写成明确规则。Hook 只把规则的返回值交给组件，并用这份返回值决定要不要再画一遍。

## 三、核心概念

### 1. 选择函数从 State 取出一块数据

Store Hook 的参数是一个函数，入参是当前完整 State，返回值是这个组件要用的数据：

```tsx
const keyword = useFilterStore((state) => state.keyword)
```

`(state) => state.keyword` 就是选择函数。它只取出 `keyword`。之后无论 `hits` 怎么变，只要 `keyword` 用 `Object.is` 比较后仍是同一个值，这个组件不会因为这次更新重渲染。

`create` 的文档把选择函数说明为 Hook 的唯一参数：用它返回基于当前状态的数据。

### 2. 不传选择函数等于取出整份 State

也可以不传函数：

```tsx
const filter = useFilterStore()
```

固定版本的 React 绑定把缺省选择函数实现为 `identity`：传入什么就返回什么。对 Store Hook 来说，就是返回整份 State。官方 README 明确提醒：这样写可以，但组件会在**每次**状态变化时更新。

演示对比时可以用它；日常组件应写出自己真正需要的字段。

### 3. 选中值用 Object.is 比较

Store 更新后，Hook 会再次运行选择函数，得到新的选中值。React 的 `useSyncExternalStore` 用 `Object.is` 比较新旧选中值：

- 基本值相同，例如两次都是 `'全部'` 或两次都是 `3`，组件不重渲染。
- 同一个函数引用，例如稳定的 Action，组件不重渲染。
- 每次都 `return { keyword, status }`，即使字段内容没变，也是新对象，`Object.is` 为 false，组件会重渲染。

官方 README 把默认比较写成严格相等（`old === new`），并说明这种比较适合按字段读取。本课只使用这条默认规则。

### 4. 多个字段就选择多次

一个组件如果同时需要关键词和筛选状态，不要把它们包成临时对象，而是分别选择：

```tsx
const keyword = useFilterStore((state) => state.keyword)
const status = useFilterStore((state) => state.status)
```

这是官方 README 给出的基础写法。每次 Hook 调用只订阅一个字段；任一字段按 `Object.is` 变化时，这个组件重渲染。

把多个字段收成对象、再用浅比较处理，不属于本课范围。

### 5. 选择函数可以读取 Action

选择函数不必只读数据字段。只负责点按钮的组件可以只取 Action：

```tsx
const bumpHits = useFilterStore((state) => state.bumpHits)
```

Action 通常是创建 Store 时放进 State 的同一个函数引用。命中次数变化时，这个引用不变，按钮组件不必重渲染。官方测试正是用“选择 `count` 的组件会更新、选择 `inc` 的组件不更新”证明订阅范围。

## 四、用法与示例

### 1. 按字段读取

筛选栏里的关键词输入只关心 `keyword`：

```tsx
function KeywordField() {
  const keyword = useFilterStore((state) => state.keyword)
  const setKeyword = useFilterStore((state) => state.setKeyword)

  return (
    <label>
      关键词
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
    </label>
  )
}
```

命中次数面板只关心数字：

```tsx
function HitsBadge() {
  const hits = useFilterStore((state) => state.hits)
  return <p>命中 {hits} 条</p>
}
```

改关键词时，命中次数面板的选择结果不变，不会重渲染。增加命中次数时，输入框也不必重渲染。

### 2. 对比整份 Store 订阅

把不传选择函数的组件放在旁边，就能看见范围差异：

```tsx
function WholeFilter() {
  const filter = useFilterStore()
  return (
    <p>
      {filter.keyword} · {filter.status} · {filter.hits}
    </p>
  )
}
```

`hits` 加一时，`KeywordField` 的渲染次数不变，`WholeFilter` 会加一次。这不是 `hits` 写错了，而是 `WholeFilter` 选择了整份 State。

### 3. 不要返回临时对象

下面这样看起来一次取出两个字段，但每次 Store 更新都会得到新对象：

```tsx
const snapshot = useFilterStore((state) => ({
  keyword: state.keyword,
  status: state.status,
}))
```

即使这次只改了 `hits`，选择函数仍然 `return { ... }`，`Object.is` 认为选中值变了，组件会重渲染。基础写法是分别选择 `keyword` 和 `status`。

### 4. 观察选择范围

下面的 Demo 用三块面板对照同一份筛选 Store：一块只选择关键词，一块只选择状态，一块不传选择函数。改其中一项时，看各面板的渲染次数就能确认选择函数划定的范围。

:::demo{id="react.zustand.learn.basics.selector.selector-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：不传选择函数却以为只使用其中一个字段

**触发条件：** 写成 `const filter = useFilterStore()`，再从返回对象里读 `filter.keyword`。

**原因：** 缺省选择函数返回整份 State，任意顶层字段变化都会让选中值变成新的 Store 快照。

**后果：** 只展示关键词的组件，也会在命中次数变化时重渲染。

**错误示例：**

```tsx
function KeywordLabel() {
  const filter = useFilterStore()
  return <p>{filter.keyword}</p>
}
```

**正确写法：**

```tsx
function KeywordLabel() {
  const keyword = useFilterStore((state) => state.keyword)
  return <p>{keyword}</p>
}
```

**验证方式：** 给组件加渲染计数，只改另一个字段时计数不应增加。

### 错误：选择函数每次返回新对象

**触发条件：** 用 `(state) => ({ keyword: state.keyword, status: state.status })` 一次取出多个字段。

**原因：** 默认用 `Object.is` 比较选中值。每次运行都 `{}` 出新对象，即使字段内容相同也被当成变化。

**后果：** Store 里任何更新都会让这个组件重渲染，选择函数失去缩小范围的作用。

**错误示例：**

```tsx
function FilterSummary() {
  const snapshot = useFilterStore((state) => ({
    keyword: state.keyword,
    status: state.status,
  }))
  return (
    <p>
      {snapshot.keyword} · {snapshot.status}
    </p>
  )
}
```

**正确写法：**

```tsx
function FilterSummary() {
  const keyword = useFilterStore((state) => state.keyword)
  const status = useFilterStore((state) => state.status)
  return (
    <p>
      {keyword} · {status}
    </p>
  )
}
```

**验证方式：** 只增加命中次数，分别选择字段的组件渲染次数不变；返回新对象的组件次数会增加。

### 错误：在选择函数里创建新数组

**触发条件：** 写成 `(state) => state.items.filter((item) => item.open)`，期望只在筛选结果变化时更新。

**原因：** `filter` 每次都返回新数组，`Object.is` 无法识别“内容相同”。

**后果：** 即使 `items` 没变，其他字段更新也会让组件重渲染。

**错误示例：**

```tsx
function OpenCount() {
  const openItems = useFilterStore((state) =>
    state.items.filter((item) => item.open),
  )
  return <p>{openItems.length}</p>
}
```

**正确写法：**

```tsx
function OpenCount() {
  const items = useFilterStore((state) => state.items)
  const openCount = items.filter((item) => item.open).length
  return <p>{openCount}</p>
}
```

**验证方式：** 选择函数只返回 Store 里已有的字段或基本值；派生计算放在组件渲染里，不在选择函数中每次返回新对象或新数组。

### 错误：选择了不会变化的值却期望界面更新

**触发条件：** 组件显示 `hits`，却选择了 `setKeyword` 或某个不变的常量。

**原因：** Hook 只比较选择函数的返回值。Action 引用通常保持稳定，数字变了也不会通知这个组件。

**后果：** Store 已经写入新命中次数，界面仍显示旧数字。

**错误示例：**

```tsx
function HitsBadge() {
  const setKeyword = useFilterStore((state) => state.setKeyword)
  return <p>{String(setKeyword)}</p>
}
```

**正确写法：**

```tsx
function HitsBadge() {
  const hits = useFilterStore((state) => state.hits)
  return <p>{hits}</p>
}
```

**验证方式：** 确认选择函数返回的就是界面正在展示、并且会随 Action 改变的那一个字段。

### 错误：让选择函数在部分 State 上抛错

**触发条件：** 选择函数假定字段永远是字符串，例如 `state.keyword.toUpperCase()`，但更新后该字段变成了 `null` 或其他类型。

**原因：** Store 每次更新都会再次运行选择函数。官方测试覆盖了选择函数抛错的情况。

**后果：** 组件渲染中断，错误边界捕获后界面无法继续显示该字段。

**错误示例：**

```tsx
function KeywordLabel() {
  const keyword = useFilterStore((state) => state.keyword.toUpperCase())
  return <p>{keyword}</p>
}
```

**正确写法：**

```tsx
function KeywordLabel() {
  const keyword = useFilterStore((state) => state.keyword)
  return <p>{keyword.toUpperCase()}</p>
}
```

**验证方式：** 选择函数先取出字段；对值的变换放在组件里，并保证字段类型与 Store 声明一致。
:::

## 六、原理与适用场景

### 1. 官方事实

入门文档写明：选中状态后，消费该状态的组件会在变化时重渲染。`create` 返回带 Store API 的 React Hook，并通过选择函数读取基于当前状态的数据；选择函数是这个 Hook 的唯一参数。

README 给出两条基础规则：不传选择函数会在每次状态变化时更新组件；默认用严格相等比较选中值，适合 `state => state.nuts` 这种按字段读取。

固定版本 `src/react.ts` 把 Hook 实现为 `useStore(api, selector)`。未传入选择函数时使用 `identity`。选择函数分别应用到 `api.getState()` 和 `api.getInitialState()`，再交给 `React.useSyncExternalStore`。官方测试 `uses the store with selectors` 与 `only re-renders if selected state has changed` 证明：按字段选择后，只有选中值变化的组件会重渲染。

### 2. 课程推导

选择函数是组件和 Store 之间的合同：组件声明自己要哪一块数据，Hook 用 `Object.is` 判断这块数据变没变。分别选择多个字段，是当前默认比较规则下的基础写法。返回新对象或新数组会让合同失效，因为比较的是引用，不是字段内容。

### 3. 适用边界

本课只讲基础选择函数、按字段读取和订阅范围。把多个字段收成对象后再做浅比较、专门讨论结果稳定性，以及 `useShallow`，都不在这里展开。外部 `subscribe` API、自定义 equality 函数和 Vanilla Store 也不属于本课。

## 七、练习

:::exercise
### 按字段选择筛选条件

**要求：** 创建一个 `SearchStore`，包含 `keyword: string`、`status: 'all' | 'open'`、`hits: number`，以及 `setKeyword`、`setStatus`、`bumpHits`。写出 `KeywordPanel`、`StatusPanel` 和 `HitsPanel`，分别只选择对应字段，并用渲染次数观察范围。再写出 `WholePanel`，不传选择函数。不要在选择函数里返回临时对象。

**验收：** 调用 `bumpHits()` 后，关键词面板和状态面板的渲染计数不增加，整份 Store 面板的渲染计数增加；修改 `keyword` 后，状态面板计数不增加，关键词面板和整份 Store 面板计数增加。

**参考答案：**

```tsx
import { useRef } from 'react'
import { create } from 'zustand'

type SearchStatus = 'all' | 'open'

type SearchStore = {
  keyword: string
  status: SearchStatus
  hits: number
  setKeyword: (keyword: string) => void
  setStatus: (status: SearchStatus) => void
  bumpHits: () => void
}

const useSearchStore = create<SearchStore>()((set) => ({
  keyword: '',
  status: 'all',
  hits: 0,
  setKeyword: (keyword: string) => set({ keyword }),
  setStatus: (status: SearchStatus) => set({ status }),
  bumpHits: () => set((state) => ({ hits: state.hits + 1 })),
}))

/** 只选择关键词，并用渲染次数观察订阅范围。 */
function KeywordPanel() {
  const keyword = useSearchStore((state) => state.keyword)
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {keyword || '空'} · 渲染 {renderCount.current}
    </p>
  )
}

/** 只选择筛选状态，并用渲染次数观察订阅范围。 */
function StatusPanel() {
  const status = useSearchStore((state) => state.status)
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {status} · 渲染 {renderCount.current}
    </p>
  )
}

/** 只选择命中次数。 */
function HitsPanel() {
  const hits = useSearchStore((state) => state.hits)
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {hits} · 渲染 {renderCount.current}
    </p>
  )
}

/** 不传选择函数，订阅整份 Store。 */
function WholePanel() {
  const search = useSearchStore()
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {search.keyword || '空'} / {search.status} / {search.hits} · 渲染{' '}
      {renderCount.current}
    </p>
  )
}

/** 分别更新三个字段，用来对照各面板的选择范围。 */
function SearchControls() {
  const setKeyword = useSearchStore((state) => state.setKeyword)
  const setStatus = useSearchStore((state) => state.setStatus)
  const bumpHits = useSearchStore((state) => state.bumpHits)

  return (
    <>
      <button type="button" onClick={() => setKeyword('zustand')}>
        设置关键词
      </button>
      <button type="button" onClick={() => setStatus('open')}>
        设为 open
      </button>
      <button type="button" onClick={bumpHits}>
        增加命中
      </button>
    </>
  )
}
```
:::

## 八、本节小结

- 选择函数从完整 State 取出组件真正要用的数据。
- 不传选择函数等于订阅整份 Store。
- 默认用 `Object.is` 比较选中值，相同则不重渲染。
- 多个字段分别选择；不要在选择函数里每次返回新对象或新数组。

## 九、参考资料

- [Zustand Introduction](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) - 选中状态变化时，消费该状态的组件重渲染。
- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/reference/apis/create) - Hook 通过选择函数读取基于当前状态的数据。
- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 整份 Store 订阅与按字段严格相等比较。
- [Zustand 5.0.15 react.ts](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - 默认 `identity` 选择函数与 `useSyncExternalStore`。
- [Zustand 5.0.15 basic.test.tsx](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/basic.test.tsx) - 按选择函数读取，以及选中值变化才重渲染。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
