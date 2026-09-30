---
id: react.zustand.learn.advanced.vanilla-store
type: lesson
title: Vanilla Store
summary: 用 createStore 得到不带 Hook 的 StoreApi，在 React 外读写，需要渲染时再交给 useStore。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.intermediate.content-workspace
related:
  - react.zustand.learn.basics.first-store
  - react.zustand.learn.intermediate.subscribe
  - react.zustand.learn.basics.component-subscription
tags:
  - Zustand
  - Vanilla Store
  - createStore
  - useStore
  - StoreApi
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能从 zustand/vanilla 导入 createStore，得到带 setState、getState、getInitialState 和 subscribe 的 StoreApi。
  - 能说明 createStore 不返回 React Hook，create 才是 createStore 加上绑定后的 useStore。
  - 能在 React 外用 getState、setState 和 subscribe 读写，需要重渲染时再调用 useStore(api, selector)。
  - 能识别把 vanilla store 当 Hook 调用，或只 getState 却期望界面自动更新这两类错误。
recap:
  - createStore 返回 StoreApi 对象，不是 Hook。
  - 不经过 React 时用 getState、setState 和 subscribe。
  - 组件要随字段更新，必须 useStore(api, selector)。
  - create 只是把同一份 api 绑成 Hook。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README Using zustand without React
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - Zustand 核心可以不依赖 React 导入和使用。
      - "createStore 不返回 Hook，只返回 getState、setState、subscribe 和 getInitialState。"
      - "从 v4 起可用 useStore(vanillaStore, selector) 把 vanilla store 接到组件。"
      - "改 set 或 get 的中间件不会作用到 getState 和 setState。"
  - title: Zustand 5.0.15 createStore API
    url: https://zustand.docs.pmnd.rs/reference/apis/create-store
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - createStore 用来创建暴露 API 工具的 vanilla store。
      - 返回值带 setState、getState、getInitialState 和 subscribe。
      - 初始化函数同样接收 set、get 和 store；不得在初始化阶段同步调用它们。
      - "排查项写过：更新了 state，屏幕也可以不更新。"
  - title: Zustand 5.0.15 useStore types
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - useStore 第一参数是带 getState、getInitialState 和 subscribe 的 api。
      - 第二参数是选择函数；省略时使用 identity，等于订阅整份 state。
      - "create 的实现是先 createStore，再把 useStore(api, selector) 赋成 Hook，并用 Object.assign 挂上同一份 api。这是固定版本源码，不是公共合同。"
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - "StoreApi 含 setState、getState、getInitialState 和 subscribe。"
      - "subscribe 的公共类型是 (listener: (state, prevState) => void) => () => void。"
---

# Vanilla Store

## 一、学习目标

- 从 `zustand/vanilla` 导入 `createStore`，得到一份不带 Hook 的 `StoreApi`。
- 说明 `createStore` 与 `create` 的差别：前者返回对象，后者把同一份 api 绑成 Hook。
- 在 React 外用 `getState`、`setState` 和 `subscribe`；组件要重渲染时再调用 `useStore`。
- 识别“把 store 当 Hook 调用”和“只读快照却期望界面更新”。

## 二、为什么需要 Vanilla Store

基础和中级一直用 `create`。它返回的值既可以当 Hook 调用，也挂着 `getState` 和 `subscribe`。多数 React 页面到这里就够了。

有一类工作 Hook 不适合当入口：状态要在 React 树之外读写，例如定时器、原生事件、非 React 模块。这时需要一份不带 Hook 的 `StoreApi`。

README 把这件事说成：Zustand 核心可以不依赖 React；`createStore` 不返回 Hook，只返回 API。需要渲染时，再用从 v4 起提供的 `useStore(vanillaStore, selector)` 接回组件。

## 三、核心概念

### 1. createStore 返回 StoreApi

从 `zustand/vanilla` 导入 `createStore`：

```tsx
import { createStore } from 'zustand/vanilla'

type WorkspaceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
}

const workspaceStore = createStore<WorkspaceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
}))
```

返回值不是 `useWorkspaceStore`。它是对象，公开四件事：

```ts
workspaceStore.getState()
workspaceStore.setState({ draft: 1 })
workspaceStore.getInitialState()
workspaceStore.subscribe((state, prevState) => {
  console.log(prevState.theme, '→', state.theme)
})
```

官方 createStore 文档写明：返回 vanilla store，暴露 `setState`、`getState`、`getInitialState` 和 `subscribe`。初始化函数仍然接收 `set`、`get` 和 `store`，同样不得在初始化阶段同步调用它们。

`zustand` 主入口也会再导出 `createStore`。本课按官方 README 使用 `zustand/vanilla`，用来强调这份对象不依赖 React。

### 2. create 只是绑上了 useStore

固定版本 `src/react.ts` 里，`create` 的实现可以收成三步。这是该版本源码，不是公共合同：

```ts
const api = createStore(createState)
const useBoundStore = (selector) => useStore(api, selector)
Object.assign(useBoundStore, api)
```

所以中级课在 Hook 上调用的 `getState`、`setState` 和 `subscribe`，本来就属于这份 api。`create` 并没有另做一套状态机，只是让同一份 api 能当 Hook 用。

Vanilla Store 把这两层拆开：状态机留在 `createStore`；React 订阅留给 `useStore`。

### 3. React 外读写，渲染时再用 useStore

不经过组件时，直接用对象 API：

```tsx
workspaceStore.getState().toggleTheme()
const snapshot = workspaceStore.getState()
```

`getState` 返回调用当下的快照，不会订阅任何人。界面要跟着字段走，必须把 api 交给 `useStore`：

```tsx
import { useStore } from 'zustand'

function ThemeLabel() {
  const theme = useStore(workspaceStore, (state) => state.theme)
  return <p>{theme}</p>
}
```

`useStore` 的第一参数是带 `getState`、`getInitialState` 和 `subscribe` 的 api，第二参数是选择函数。省略选择函数时，固定版本类型使用 `identity`，等于订阅整份 state。

官方 README 的绑定写法是：

```tsx
const useBoundStore = (selector) => useStore(vanillaStore, selector)
```

这只是给当前这份 api 包一层 Hook。它仍然指向同一份 vanilla store，不是第二份 Store。

外部日志继续用 api 上的 `subscribe`，和中级课在 Hook 上订阅是同一套 listener。需要取消时调用返回值。

### 4. 观察一份不带 Hook 的 Store

下面的 Demo 用 `createStore` 创建工作区。主题面板和草稿面板通过 `useStore` 只选自己的字段。快照面板只在点击「读取快照」时调用 `getState`，不会自动跟上后续写入。右侧日志挂在 `workspaceStore.subscribe` 上，不经过 Hook。切换主题走 `workspaceStore.getState().toggleTheme()`，不经过组件里的 Hook 调用。增加无关计数时，主题和草稿面板不重渲染，快照数字也不变，日志仍会多一条。

:::demo{id="react.zustand.learn.advanced.vanilla-store.vanilla-store-demo"}
:::

## 四、用法与示例

### 1. 在模块里留下一份 api

```tsx
import { createStore } from 'zustand/vanilla'

const workspaceStore = createStore<WorkspaceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  ticks: 0,
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  bumpDraft: () => set({ draft: get().draft + 1 }),
  tick: () => set({ ticks: get().ticks + 1 }),
}))

export { workspaceStore }
```

命名不要以 `use` 开头。它不是 Hook，放进组件当函数调用会违反 Hook 规则，TypeScript 也不会把它当成可调用的订阅入口。

### 2. 非 React 代码只碰 StoreApi

```tsx
function applyThemeFromMenu() {
  workspaceStore.getState().toggleTheme()
}

const current = workspaceStore.getState()
workspaceStore.setState({ draft: current.draft + 1 })
```

Action 仍由初始化函数里的 `set` / `get` 定义。React 外既可以调用这些 Action，也可以直接 `setState`。两种写法改的是同一份 state。

读取初始值用 `getInitialState()`。它返回创建时那份快照，不会因为后来的 `setState` 改变。

### 3. 组件按字段接到同一份 api

```tsx
function ThemePanel() {
  const theme = useStore(workspaceStore, (state) => state.theme)
  return <p>{theme}</p>
}

function DraftButton() {
  const bumpDraft = useStore(workspaceStore, (state) => state.bumpDraft)
  return (
    <button type="button" onClick={bumpDraft}>
      增加草稿
    </button>
  )
}
```

选择规则与 `create` 返回的 Hook 相同：选中值按 `Object.is` 变化才重渲染。父组件不要订 `ticks` 或整份 state。

活动日志仍用默认 `subscribe`：

```tsx
useEffect(() => {
  return workspaceStore.subscribe((state, prevState) => {
    console.log(prevState.theme, '→', state.theme)
  })
}, [])
```

不要把 `subscribe` 的 listener 当成选择函数。字段过滤留在回调内部，和中级课相同。

## 五、易错使用提示

:::pitfalls
### 错误：把 vanilla store 当 Hook 调用

**触发条件：** 写成 `const theme = workspaceStore((state) => state.theme)`，或直接 `workspaceStore()`。

**原因：** `createStore` 返回的是 `StoreApi` 对象。可调用的是 `create` 绑好的 Hook，或显式的 `useStore(api, selector)`。

**后果：** 运行时报不是函数；就算勉强包一层，也容易在组件外调用 Hook。

**错误示例：**

```tsx
const theme = workspaceStore((state) => state.theme)
```

**正确写法：**

```tsx
const theme = useStore(workspaceStore, (state) => state.theme)
```

**验证方式：** 组件里出现的订阅入口是 `useStore`；`workspaceStore` 只出现 `getState`、`setState`、`subscribe` 或作为 `useStore` 的第一参数。

### 错误：只调用 getState，却期望组件自动更新

**触发条件：** 渲染时写一次 `workspaceStore.getState().theme`，之后用 Action 改主题，认为这段文字会自己变。

**原因：** `getState` 只返回当下快照。createStore 文档的排查项写过：更新了 state，屏幕也可以不更新。没有 `useStore` 或手动 `subscribe`，React 不知道要画第二遍。

**后果：** 控制台里的 store 已经是新主题，界面仍停在旧文案。

**错误示例：**

```tsx
function ThemeLabel() {
  const theme = workspaceStore.getState().theme
  return <p>{theme}</p>
}
```

**正确写法：**

```tsx
function ThemeLabel() {
  const theme = useStore(workspaceStore, (state) => state.theme)
  return <p>{theme}</p>
}
```

**验证方式：** 点击「切换主题」后，使用 `useStore` 的面板立刻变文案；只保存 `getState()` 的快照面板保持原值，直到再次读取。

### 错误：在组件渲染里调用 createStore

**触发条件：** 把 `createStore` 写进函数组件，每次渲染都执行。

**原因：** 和基础课在渲染里调用 `create` 是同一类错误。每次得到新的 api，订阅对不上上一份 state。

**后果：** 点一次切换，计数或主题被新实例丢掉；多个子组件连的不是同一份 store。

**错误示例：**

```tsx
function WorkspacePage() {
  const store = createStore<WorkspaceStore>()((set) => ({
    theme: '浅色',
    draft: 0,
    toggleTheme: () => set({ theme: '深色' }),
  }))
  const theme = useStore(store, (state) => state.theme)
  return <p>{theme}</p>
}
```

**正确写法：**

```tsx
const workspaceStore = createStore<WorkspaceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
}))

function WorkspacePage() {
  const theme = useStore(workspaceStore, (state) => state.theme)
  return <p>{theme}</p>
}
```

**验证方式：** `createStore` 出现在模块作用域；多次渲染后 `useStore` 仍读到同一份主题。

### 错误：用 create 却当成没有 Hook 的对象

**触发条件：** 写成 `import { create } from 'zustand'`，再把返回值传给非 React 模块当 `StoreApi` 用，却在模块顶层直接 `create(...)()`。

**原因：** `create` 的返回值可以调用，因为它是 Hook。非 React 代码一旦调用它，就是在 React 外使用 Hook。对象 API 已经挂在这个返回值上，但入口仍然是 Hook。

**后果：** 非组件文件里出现 Hook 调用。

**错误示例：**

```tsx
const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: '深色' }),
}))

useWorkspaceStore()
```

**正确写法：**

```tsx
const workspaceStore = createStore<WorkspaceStore>()((set) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: '深色' }),
}))

workspaceStore.getState()
```

**验证方式：** 非组件代码只导入 `createStore` 的返回值，并用 `getState` / `setState` / `subscribe`；组件文件才导入 `useStore`。
:::

## 六、原理与适用场景

### 1. 官方事实

README 写明：Zustand 核心可以不依赖 React；`createStore` 不返回 Hook，只返回 `getState`、`setState`、`subscribe` 和 `getInitialState`；从 v4 起用 `useStore(vanillaStore, selector)` 接到组件。

createStore 文档写明：它创建暴露 API 工具的 vanilla store；初始化函数接收 `set`、`get` 和 `store`，不得在初始化阶段同步调用。

固定版本源码（不是公共合同）：`src/vanilla.ts` 把 `StoreApi` 定为这四个方法；`src/react.ts` 里 `create` 先 `createStore`，再把 `useStore(api, selector)` 赋成 Hook，并用 `Object.assign` 挂上同一份 api。

### 2. 课程推导

Vanilla Store 不是另一套状态规则。浅合并、`get`、Action、`subscribe` 的引用判断都还在同一份 api 上。拆开的是入口：对象 API 给 React 外，`useStore` 给需要重渲染的组件。`create` 只是把两层粘在一起，方便日常页面。

### 3. 适用边界

本课只讲模块级 `createStore`、`StoreApi` 四个方法和 `useStore(api, selector)`。改 `set` / `get` 的中间件不会自动作用到 `getState` / `setState`，官方 README 有这条警告，细节不在本课展开。

## 七、练习

:::exercise
### 创建并绑定一份 Vanilla Store

**要求：** 从 `zustand/vanilla` 导入 `createStore`，从 `zustand` 导入 `useStore`。创建 `workspaceStore`，包含 `theme: '浅色'`、`draft: 0`、`toggleTheme` 和 `bumpDraft`。不要用 `create`。写一个非组件函数 `flipTheme`，内部只调用 `workspaceStore.getState().toggleTheme()`。再写 `ThemeLabel` 组件，用 `useStore(workspaceStore, (state) => state.theme)` 显示主题。不要把 `createStore` 放进组件，也不要把 `workspaceStore` 当 Hook 调用。

**验收：** 调用 `flipTheme` 后，`ThemeLabel` 显示的主题切换；`workspaceStore.getState().draft` 仍是 `0`；组件文件里的订阅入口是 `useStore`，非组件文件只使用 `getState`。

**参考答案：**

```tsx
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

type WorkspaceStore = {
  theme: string
  draft: number
  toggleTheme: () => void
  bumpDraft: () => void
}

const workspaceStore = createStore<WorkspaceStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))

function flipTheme() {
  workspaceStore.getState().toggleTheme()
}

function ThemeLabel() {
  const theme = useStore(workspaceStore, (state) => state.theme)
  return <p>{theme}</p>
}
```
:::

## 八、本节小结

- `createStore` 返回 `StoreApi`，不是 Hook。
- React 外用 `getState`、`setState` 和 `subscribe`；组件用 `useStore(api, selector)`。
- `create` 等于 `createStore` 加上绑定后的 `useStore`。
- 模块级 vanilla store 用 `useStore(api, selector)` 接到组件。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README Using zustand without React](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - createStore 不返回 Hook，useStore 从 v4 起绑定 vanilla store。
- [Zustand 5.0.15 createStore API](https://zustand.docs.pmnd.rs/reference/apis/create-store) - StoreApi 四个方法与初始化函数参数。
- [Zustand 5.0.15 useStore 实现](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - useStore 订阅 api，create 绑定同一份 api。
- [Zustand 5.0.15 vanilla store implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - StoreApi 与 subscribe 签名。
