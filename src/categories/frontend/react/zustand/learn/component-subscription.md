---
id: react.zustand.learn.basics.component-subscription
type: lesson
title: 组件订阅
summary: 用 Store Hook 把 React 组件连到 Zustand，让选中的字段变化时触发渲染，并在卸载时结束订阅。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.basics.get-current-state
related:
  - react.zustand.learn.basics.get-current-state
  - react.zustand.learn.basics.set-state-updates
tags:
  - Zustand
  - 订阅
  - Hook
  - 重渲染
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能在函数组件中调用 Store Hook，把组件连接到同一份 React 绑定 Store。
  - 能解释 Hook 会在选中值变化时触发重渲染，getState 则只读取一次。
  - 能用最小选择函数读取组件真正需要的字段，而不是默认订阅整份 Store。
  - 能说明组件卸载后订阅会结束，Store 本身继续存在。
recap:
  - create 返回的 Store Hook 只能在函数组件或自定义 Hook 中调用，默认不需要 Provider。
  - Hook 会订阅 Store；选中值按 Object.is 变化后，该组件重渲染。
  - getState 只读取当前快照，不会让组件随 Store 更新。
  - 卸载组件会结束这次订阅；Store 仍保留模块作用域中的状态。
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
      - 组件可以在任意位置使用 Store Hook，不需要 Provider。
      - 选择状态后，消费该状态的组件会在状态变化时重渲染。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/reference/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - create 返回带有 Store API 的 React Hook，并通过选择函数读取当前状态。
  - title: Zustand 5.0.15 React binding source
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - Store Hook 内部调用 useStore，再用 React.useSyncExternalStore 订阅 api.subscribe。
      - 未传入选择函数时，默认选择整份 State。
  - title: Zustand 5.0.15 basic tests
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/tests/basic.test.tsx
    sourceType: official-test
    appliesTo: Zustand 5.0.15
    claims:
      - 官方测试证明只选择 count 的组件会在 count 变化时重渲染，只选择 Action 的组件不会。
      - 官方测试覆盖卸载后正确移除订阅者。
---

# 组件订阅

## 一、学习目标

- 在函数组件中调用 Store Hook，连接到模块作用域中的同一份 Store。
- 观察选中字段变化时，哪些组件会重渲染。
- 区分 Hook 订阅与 `getState()` 的一次性读取。
- 确认组件卸载后订阅结束，Store 状态仍然保留。

## 二、为什么需要组件订阅

前面几课已经能创建 Store、声明 Action，并用 `set` / `get` 读写当前状态。这些能力发生在 Store 内部。要把结果画到界面上，React 组件还必须知道“状态什么时候变了”。

如果只在渲染时调用 `getState()`，读到的是那一次快照。之后即使用户点了按钮、Action 写进了新值，组件也不会自动再画一遍。

组件订阅解决的就是这件事：组件挂载时连上 Store，选中的值变化时重渲染，卸载时断开。普通 React 绑定 Store 不需要在根组件包一层 Provider。

## 三、核心概念

### 1. Store Hook 就是组件连接点

`create` 返回的不是普通数据对象，而是可以在组件里调用的 Hook：

```tsx
const useBoardStore = create<BoardStore>()((set) => ({
  title: '看板',
  visits: 0,
  rename: (title: string) => set({ title }),
  visit: () => set((state) => ({ visits: state.visits + 1 })),
}))

function BoardTitle() {
  const title = useBoardStore((state) => state.title)
  return <h2>{title}</h2>
}
```

`useBoardStore` 必须写在函数组件或自定义 Hook 里，规则和 `useState` 相同。任意组件都可以调用它，读取同一份 Store，不需要 Context Provider。

### 2. 调用 Hook 才会订阅

Hook 负责两件事：取出当前选中值，以及在 Store 更新后决定要不要重渲染。

```tsx
const title = useBoardStore((state) => state.title)
```

这行代码让 `BoardTitle` 订阅 `title`。之后 `rename` 写入新标题，这个组件会再渲染一次。

下面这样不会订阅：

```tsx
const title = useBoardStore.getState().title
```

`getState()` 只返回调用当下的快照。它适合事件处理或 Store Action 之外的一次性读取，不能代替组件里的 Hook。

### 3. 选中值变了，组件才重渲染

给 Hook 传入一个最小选择函数，只取出这个组件要显示或调用的字段。官方测试用两个组件证明了这条边界：一个组件选择 `count`，另一个组件选择 `inc`；点击增加后，只有选择 `count` 的组件重渲染。

```tsx
function VisitCount() {
  const visits = useBoardStore((state) => state.visits)
  return <p>访问 {visits} 次</p>
}

function VisitButton() {
  const visit = useBoardStore((state) => state.visit)
  return (
    <button type="button" onClick={visit}>
      记录一次访问
    </button>
  )
}
```

`VisitCount` 关心数字，数字变了就要重画。`VisitButton` 只拿到 Action，Action 引用通常保持稳定，访问次数增加时它不必重渲染。

本课只需要这种“按字段读取”的最小选择函数。如何让对象结果保持稳定、如何使用浅比较，不属于这里的范围。

### 4. 不传选择函数等于订阅整份 Store

Hook 也可以不传函数：

```tsx
const board = useBoardStore()
```

这时默认选择整份 State。Store 里任何一个字段变化，这个组件都会重渲染。演示订阅时可以使用它来对比，日常组件应明确写出自己需要的字段。

### 5. 卸载结束订阅，Store 继续存在

订阅属于**这次挂载的组件实例**，不属于 Store 自己的寿命。

组件挂载时，Hook 向 Store 注册监听；组件卸载时，React 会取消这次注册。Store 仍然留在模块作用域，字段不会因为某个面板被关掉而重置。再次挂载同一组件，它会读到 Store 里已经更新过的值，并开始一轮新的订阅。

不要在组件函数体里调用 `create`。那样每次渲染都可能得到一份新 Store，订阅会对着错误的实例，卸载后状态也无法共享。

## 四、用法与示例

### 1. 在不同组件中订阅同一份 Store

标题和访问次数可以由两个组件分别订阅：

```tsx
function BoardTitle() {
  const title = useBoardStore((state) => state.title)
  return <p>{title}</p>
}

function BoardVisits() {
  const visits = useBoardStore((state) => state.visits)
  return <p>{visits}</p>
}

function BoardControls() {
  const rename = useBoardStore((state) => state.rename)
  const visit = useBoardStore((state) => state.visit)

  return (
    <>
      <button type="button" onClick={() => rename('发布看板')}>
        重命名
      </button>
      <button type="button" onClick={visit}>
        访问一次
      </button>
    </>
  )
}
```

三个组件都调用同一个 Hook，但各自只取自己需要的值。改标题时，访问次数面板不必跟着刷新；增加访问时，标题面板也不必跟着刷新。

### 2. 用渲染次数观察订阅范围

要确认“谁订阅了什么”，最直接的办法是给组件加一个渲染计数。选择 `title` 的面板只在标题变化时增加计数；选择 `visits` 的面板只在访问次数变化时增加计数。

不要把渲染计数存进 Zustand。它是这个组件实例的观察数据，用组件自己的变量记录即可。

### 3. 挂载与卸载

订阅随组件出现和消失：

```tsx
function BoardPage() {
  const [showVisits, setShowVisits] = useState(true)

  return (
    <>
      <button type="button" onClick={() => setShowVisits((value) => !value)}>
        {showVisits ? '隐藏访问次数' : '显示访问次数'}
      </button>
      {showVisits ? <BoardVisits /> : null}
    </>
  )
}
```

隐藏 `BoardVisits` 后，访问次数再增加也不会要求这个组件渲染，因为它已经不在树上。再次显示时，它会读到最新的 `visits`，并重新订阅。

### 4. 观察订阅、渲染和卸载

下面的 Demo 把标题面板、访问次数面板和控制按钮放在一起。每个订阅面板显示自己的渲染次数；还可以卸载访问次数面板，确认它离开后不再计数，重新挂载后读到的是 Store 里已经更新的值。

:::demo{id="react.zustand.learn.basics.component-subscription.component-subscription-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：在渲染中用 getState 代替 Hook

**触发条件：** 组件函数体里写 `useBoardStore.getState().title`，期望界面跟随 Store 更新。

**原因：** `getState()` 只读取一次，不向 React 注册订阅。

**后果：** Action 已经写入新标题，组件仍显示旧值。

**错误示例：**

```tsx
function BoardTitle() {
  const title = useBoardStore.getState().title
  return <p>{title}</p>
}
```

**正确写法：**

```tsx
function BoardTitle() {
  const title = useBoardStore((state) => state.title)
  return <p>{title}</p>
}
```

**验证方式：** 修改 Store 后观察组件是否重渲染；需要显示的字段必须经过 Store Hook。

### 错误：在组件外部调用 Store Hook

**触发条件：** 在模块顶层、事件工具函数或普通 class 方法里调用 `useBoardStore(...)`。

**原因：** Store Hook 遵守 React Hook 规则，只能放在函数组件或自定义 Hook 中。

**后果：** 运行时报 Invalid hook call，页面无法继续订阅。

**错误示例：**

```tsx
const title = useBoardStore((state) => state.title)
```

**正确写法：**

```tsx
function BoardTitle() {
  const title = useBoardStore((state) => state.title)
  return <p>{title}</p>
}
```

**验证方式：** 确认每个 `useBoardStore(` 都出现在函数组件或 `use` 开头的自定义 Hook 里。

### 错误：在组件渲染时创建 Store

**触发条件：** 把 `create(...)` 写进组件函数体，而不是模块作用域。

**原因：** 每次渲染都可能得到新的 Store 实例，订阅连到刚创建的空状态上。

**后果：** 其他组件看不到这次更新，卸载后状态丢失，页面像有多份互不相通的 Store。

**错误示例：**

```tsx
function BoardPage() {
  const useBoardStore = create<BoardStore>()((set) => ({
    title: '看板',
    visits: 0,
    rename: (title: string) => set({ title }),
    visit: () => set((state) => ({ visits: state.visits + 1 })),
  }))
  const title = useBoardStore((state) => state.title)
  return <p>{title}</p>
}
```

**正确写法：**

```tsx
const useBoardStore = create<BoardStore>()((set) => ({
  title: '看板',
  visits: 0,
  rename: (title: string) => set({ title }),
  visit: () => set((state) => ({ visits: state.visits + 1 })),
}))

function BoardPage() {
  const title = useBoardStore((state) => state.title)
  return <p>{title}</p>
}
```

**验证方式：** 搜索 `create(`，确认它在模块顶层；两个组件修改同一字段后应看到同一结果。

### 错误：不传选择函数却以为只关心一个字段

**触发条件：** 写成 `const board = useBoardStore()`，再从返回对象里取 `board.title`。

**原因：** 默认选择函数返回整份 State，任意字段变化都会让这个组件重渲染。

**后果：** 访问次数变化时，只显示标题的组件也反复刷新。

**错误示例：**

```tsx
function BoardTitle() {
  const board = useBoardStore()
  return <p>{board.title}</p>
}
```

**正确写法：**

```tsx
function BoardTitle() {
  const title = useBoardStore((state) => state.title)
  return <p>{title}</p>
}
```

**验证方式：** 给组件加渲染计数，只改另一个字段时计数不应增加。

### 错误：改了内存对象却期望订阅组件更新

**触发条件：** 拿到 Store 里的对象后直接赋值，不调用 Action 或 `set`。

**原因：** 订阅监听的是 Store 的更新通知，不是对象属性被偷偷改写。

**后果：** 内存值变了，已订阅组件不重渲染。

**错误示例：**

```tsx
function renameInPlace() {
  useBoardStore.getState().title = '发布看板'
}
```

**正确写法：**

```tsx
function BoardControls() {
  const rename = useBoardStore((state) => state.rename)
  return (
    <button type="button" onClick={() => rename('发布看板')}>
      重命名
    </button>
  )
}
```

**验证方式：** 修改后若订阅组件不更新，先检查是否走了 Action；再确认选择函数返回的是会变化的字段。
:::

## 六、原理与适用场景

### 1. 官方事实

Zustand 入门文档写明：可以在任意组件使用 Store Hook，不需要 Provider；选中状态后，消费该状态的组件会在变化时重渲染。`create` 的返回值是带 Store API 的 React Hook，并通过选择函数读取当前状态。

固定版本的 React 绑定把 Hook 实现为 `useStore(api, selector)`，内部使用 `React.useSyncExternalStore(api.subscribe, getSnapshot, getServerSnapshot)`。未传入选择函数时，默认选择整份 State。官方测试证明：只选择 `count` 的组件会在计数变化时重渲染，只选择 Action 的组件不会；卸载后会移除对应订阅者。

### 2. 课程推导

组件订阅的最小模型是：挂载时注册，选中值变化时重渲染，卸载时取消注册。选择函数决定“变化”的范围，因此同一份 Store 可以同时服务多个组件，而不要求每个组件都订阅全部字段。`get()` / `getState()` 仍然负责非渲染路径上的读取，不能混进 JSX 当数据源。

### 3. 适用边界

本课只处理 React 绑定 Store Hook 的挂载、重渲染和卸载。选择函数在这里只用于划定订阅范围。对象结果稳定性、浅比较、`useShallow`、外部 `subscribe` API、Vanilla Store 和 Context 多实例，都不在这里展开。

## 七、练习

:::exercise
### 拆出两个订阅组件

**要求：** 创建一个 `NoticeStore`，包含 `message: string`、`unread: number`、`setMessage(message)` 和 `addUnread()`。写出 `MessagePanel` 与 `UnreadPanel`：前者只选择 `message`，后者只选择 `unread`。再写出 `NoticeControls`，用两个按钮分别改文案和增加未读数。不要在组件渲染中调用 `getState`，也不要在组件内创建 Store。

**验收：** 修改 `message` 后，未读面板的渲染计数不增加；调用 `addUnread()` 后，文案面板的渲染计数不增加；卸载未读面板后再增加未读数，重新挂载时能读到最新数字。

**参考答案：**

```tsx
import { useRef, useState } from 'react'
import { create } from 'zustand'

type NoticeStore = {
  message: string
  unread: number
  setMessage: (message: string) => void
  addUnread: () => void
}

const useNoticeStore = create<NoticeStore>()((set) => ({
  message: '暂无通知',
  unread: 0,
  setMessage: (message: string) => set({ message }),
  addUnread: () => set((state) => ({ unread: state.unread + 1 })),
}))

/** 只订阅通知文案，并用渲染次数观察订阅范围。 */
function MessagePanel() {
  const message = useNoticeStore((state) => state.message)
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {message} · 渲染 {renderCount.current}
    </p>
  )
}

/** 只订阅未读数量，并用渲染次数观察订阅范围。 */
function UnreadPanel() {
  const unread = useNoticeStore((state) => state.unread)
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <p>
      {unread} · 渲染 {renderCount.current}
    </p>
  )
}

/** 通过 Action 分别更新文案和未读数。 */
function NoticeControls() {
  const setMessage = useNoticeStore((state) => state.setMessage)
  const addUnread = useNoticeStore((state) => state.addUnread)

  return (
    <>
      <button type="button" onClick={() => setMessage('新通知')}>
        更新文案
      </button>
      <button type="button" onClick={addUnread}>
        增加未读
      </button>
    </>
  )
}

/** 演示未读面板的挂载与卸载。 */
function NoticeBoard() {
  const [showUnread, setShowUnread] = useState(true)

  return (
    <section>
      <MessagePanel />
      {showUnread ? <UnreadPanel /> : null}
      <NoticeControls />
      <button type="button" onClick={() => setShowUnread((value) => !value)}>
        {showUnread ? '隐藏未读' : '显示未读'}
      </button>
    </section>
  )
}
```
:::

## 八、本节小结

- 在函数组件中调用 Store Hook 才会订阅；任意组件可连接同一份 Store，不需要 Provider。
- 选择函数划定订阅范围：选中值变化才重渲染。
- `getState()` 不订阅，不能代替组件里的 Hook。
- 卸载结束这次订阅，Store 仍保留在模块作用域。

## 九、参考资料

- [Zustand Introduction](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) - 组件使用 Store Hook、无需 Provider，以及选中状态变化时重渲染。
- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/reference/apis/create) - create 返回带选择函数的 React Hook。
- [Zustand 5.0.15 react.ts](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - `useSyncExternalStore` 与默认选择整份 State。
- [Zustand 5.0.15 basic.test.tsx](https://github.com/pmndrs/zustand/blob/v5.0.15/tests/basic.test.tsx) - 选中字段变化才重渲染，以及卸载后移除订阅。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
