---
id: react.zustand.learn.advanced.context-scope
type: lesson
title: Context 作用域
summary: 用 React Context 注入 vanilla StoreApi，子树再用 useContext 取出 api，交给 useStore 订阅。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.advanced.vanilla-store
related:
  - react.zustand.learn.advanced.vanilla-store
  - react.zustand.learn.basics.first-store
  - react.zustand.learn.basics.component-subscription
tags:
  - Zustand
  - Context
  - Provider
  - useContext
  - useStore
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能说明 create 创建的 Hook 不需要 Provider；Context 只在依赖注入或用组件 props 初始化 store 时才需要。
  - 能用 React.createContext 保存 StoreApi，Provider 的 value 是 api，不是当前 state。
  - 能在消费者里 useContext 取出 api，再调用 useStore(api, selector) 订阅字段。
  - 能识别把 create 返回的 Hook 放进 Context，或把 Context 值当成 state 直接渲染这两类错误。
recap:
  - create 不需要 Provider。
  - Context 传递的是 StoreApi。
  - 取出 api 后再 useStore(api, selector)。
  - 缺少 Provider 时不要调用 useStore。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README React context
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - "用 create 创建的 store 不需要 Context Provider。"
      - Context 用于依赖注入，或用组件 props 初始化 store。
      - "create 返回的是 Hook，把它当普通 Context 值传递可能违反 Hook 规则。"
      - "从 v4 起推荐把 vanilla store 放进 Context，消费者 useContext 取出后再 useStore(store, selector)。"
  - title: Zustand Initialize state with props
    url: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 用 createStore 做成 store 创建函数，再交给 React.createContext。
      - "Provider 用 useState(() => createStore(...)) 留下同一份 api。"
      - "消费者先 useContext；没有 Provider 时抛错，有 api 后再 useStore(store, selector)。"
      - 可以把 useContext 加 useStore 收成自定义 Hook，模仿 create 返回的用法。
  - title: Zustand 5.0.15 useStore types
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - useStore 第一参数是带 getState、getInitialState 和 subscribe 的 api。这是固定版本类型，不是另一套公共合同。
  - title: Zustand v3 createContext previous versions
    url: https://zustand.docs.pmnd.rs/reference/previous-versions/zustand-v3-create-context.html
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - "zustand/context 的 createContext 在 v4 废弃，将在 v5 移除。"
      - v4 起改用 React createContext 保存 vanilla store，再 useStore。
  - title: React useContext
    url: https://react.dev/reference/react/useContext
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - useContext 返回最近 Provider 的 value；没有 Provider 时返回 createContext 的默认值。
      - "value 按 Object.is 变化时，读取该 Context 的组件才会重渲染。"
---

# Context 作用域

## 一、学习目标

- 说明 `create` 返回的 Hook 不需要 Provider。
- 用 `React.createContext` 保存 vanilla `StoreApi`，`Provider` 的 `value` 是 api。
- 在消费者里 `useContext` 取出 api，再 `useStore(api, selector)`。
- 识别“把 Hook 放进 Context”和“把 Context 值当成 state 渲染”。

## 二、为什么需要 Context

模块级 `create` 或模块级 `createStore` 只有一份 api。组件直接导入就能用，官方 README 写明：用 `create` 创建的 store 不需要 Context Provider。

需要 Context 的是另外两件事。第一，按子树注入不同的 api，让左侧工作区和右侧工作区互不影响。第二，用组件 props 初始化 store。这两类都不能把 `create` 返回的 Hook 当普通 Context 值传递，因为那是 Hook，可能违反 Hook 规则。

从 v4 起，官方推荐把 vanilla store 放进 Context：`Provider` 提供 api，消费者 `useContext` 取出后再 `useStore(store, selector)`。

## 三、核心概念

### 1. Context 传递的是 StoreApi

`createStore` 得到的是对象，不是 Hook，所以可以放进 Context：

```tsx
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

const workspaceStore = createStore<WorkspaceStore>()((set, get) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
}))

const WorkspaceContext = createContext<typeof workspaceStore | null>(null)

function App() {
  return (
    <WorkspaceContext.Provider value={workspaceStore}>
      <ThemeLabel />
    </WorkspaceContext.Provider>
  )
}

function ThemeLabel() {
  const store = useContext(WorkspaceContext)
  if (!store) {
    throw new Error('缺少 WorkspaceContext.Provider')
  }
  const theme = useStore(store, (state) => state.theme)
  return <p>{theme}</p>
}
```

`Provider` 的 `value` 是整份 api。界面要更新，仍然走 `useStore`。React 的 `useContext` 在 `value` 按 `Object.is` 变化时才重渲染；api 引用不变时，只 `useContext` 不会因为 `theme` 变了而重渲染。

### 2. 用 props 初始化时，把创建过程放进 Provider

官方 Initialize state with props 把创建函数和 Context 分开。创建函数接收初始 props，返回 `createStore` 的结果。Provider 用 `useState` 只创建一次：

```tsx
function createWorkspaceStore(name: string) {
  return createStore<WorkspaceStore>()((set, get) => ({
    name,
    theme: '浅色',
    draft: 0,
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    bumpDraft: () => set({ draft: get().draft + 1 }),
  }))
}

type WorkspaceApi = ReturnType<typeof createWorkspaceStore>

const WorkspaceContext = createContext<WorkspaceApi | null>(null)

function WorkspaceProvider({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  const [store] = useState(() => createWorkspaceStore(name))
  return <WorkspaceContext.Provider value={store}>{children}</WorkspaceContext.Provider>
}
```

`useState(() => createWorkspaceStore(name))` 保证这份 Provider 对应一份 api。不要在渲染函数里直接调用 `createStore`，否则每次渲染都会换新实例。

创建函数在这里只为当前 Provider 准备 api。本课观察的是 Context 把哪一份 api 交给子树。

### 3. 消费者先取 api，再订阅字段

官方指南的消费者先检查 Context，再调用 `useStore`：

```tsx
function useWorkspaceStore<T>(selector: (state: WorkspaceStore) => T): T {
  const store = useContext(WorkspaceContext)
  if (!store) {
    throw new Error('缺少 WorkspaceContext.Provider')
  }
  return useStore(store, selector)
}

function ThemeLabel() {
  const theme = useWorkspaceStore((state) => state.theme)
  return <p>{theme}</p>
}
```

自定义 Hook 只是把 `useContext` 和 `useStore` 收在一起，模仿 `create` 返回的用法。它仍然指向 Context 里那份 vanilla store。

两棵子树各包一个 Provider 时，左侧的 `useWorkspaceStore` 读左侧 api，右侧读右侧 api。点左侧「切换主题」不会改右侧文案。

### 4. 观察两份作用域

下面的 Demo 并排两个 `WorkspaceProvider`，初始名称分别是「左侧工作区」和「右侧工作区」。每个子树用 Context 取出自己的 api，再用 `useStore` 只选主题或草稿。切换左侧主题时，右侧主题不变；增加左侧草稿时，右侧草稿不变。Provider 外面的探测只调用 `useContext`，显示「缺少 Provider」，不会去调用 `useStore`。

:::demo{id="react.zustand.learn.advanced.context-scope.context-scope-demo"}
:::

## 四、用法与示例

### 1. Context 只保存 api

```tsx
const WorkspaceContext = createContext<WorkspaceApi | null>(null)
```

默认值用 `null`。消费者必须处理「不在 Provider 里」这一支，不能假定永远有 api。

### 2. Provider 提供 api，不提供 state

```tsx
function WorkspaceProvider({ name, children }: WorkspaceProviderProps) {
  const [store] = useState(() => createWorkspaceStore(name))
  return <WorkspaceContext.Provider value={store}>{children}</WorkspaceContext.Provider>
}
```

按钮仍然调用 api 上的 Action：

```tsx
function ThemeButton() {
  const store = useContext(WorkspaceContext)
  if (!store) {
    return null
  }
  return (
    <button type="button" onClick={() => store.getState().toggleTheme()}>
      切换主题
    </button>
  )
}
```

这里没有 `useStore`，按钮不会因为主题变化而重渲染。

### 3. 选择规则与模块级 store 相同

```tsx
function ThemePanel() {
  const theme = useWorkspaceStore((state) => state.theme)
  return <p>{theme}</p>
}

function DraftPanel() {
  const draft = useWorkspaceStore((state) => state.draft)
  return <p>{draft}</p>
}
```

父组件不要订 `ticks` 或整份 state。Context 解决的是「读哪一份 api」，不是「订哪些字段」。选择规则与模块级 `useStore(api, selector)` 相同。

## 五、易错使用提示

:::pitfalls
### 错误：把 create 返回的 Hook 放进 Context

**触发条件：** 写成 `const useWorkspaceStore = create(...)`，再 `<StoreContext.Provider value={useWorkspaceStore}>`。

**原因：** README 写明 `create` 返回的是 Hook。把它当普通 Context 值传递，消费者一旦调用，就可能在错误的时机使用 Hook。

**后果：** 违反 Hook 规则；或者消费者拿到的是函数，却当成 `StoreApi` 去调 `getState`。

**错误示例：**

```tsx
const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: '深色' }),
}))

<StoreContext.Provider value={useWorkspaceStore}>
  <ThemeLabel />
</StoreContext.Provider>
```

**正确写法：**

```tsx
const workspaceStore = createStore<WorkspaceStore>()((set) => ({
  theme: '浅色',
  toggleTheme: () => set({ theme: '深色' }),
}))

<StoreContext.Provider value={workspaceStore}>
  <ThemeLabel />
</StoreContext.Provider>
```

**验证方式：** Context 的 `value` 是 `createStore` 的返回值；消费者调用的是 `useStore(store, selector)`，不是 `value()`。

### 错误：把 Context 值当成 state 渲染

**触发条件：** `const store = useContext(WorkspaceContext)` 之后直接写 `{store.theme}`，或 `const { theme } = store`。

**原因：** Context 保存的是 api。React 的 `useContext` 在 `value` 按 `Object.is` 变化时才重渲染。`theme` 变了，api 引用通常不变，所以只 `useContext` 或只 `getState()` 都不会让这段文字更新。

**后果：** 控制台里 `getState()` 已经是新主题，界面仍停在旧文案。

**错误示例：**

```tsx
function ThemeLabel() {
  const store = useContext(WorkspaceContext)
  return <p>{store.getState().theme}</p>
}
```

**正确写法：**

```tsx
function ThemeLabel() {
  const store = useContext(WorkspaceContext)
  if (!store) {
    throw new Error('缺少 WorkspaceContext.Provider')
  }
  const theme = useStore(store, (state) => state.theme)
  return <p>{theme}</p>
}
```

**验证方式：** 点击「切换主题」后，走 `useStore` 的面板立刻变文案；只读 `getState()` 或只 `useContext` 的文字不会自己变。

### 错误：缺少 Provider 仍调用 useStore

**触发条件：** 消费者没包在 `WorkspaceContext.Provider` 里，却执行 `useStore(store, selector)`，而 `store` 是 `null`。

**原因：** `useStore` 的第一参数必须是一份 store api。`null` 不是 api。官方指南在调用 `useStore` 前先检查 Context。

**后果：** 运行时读取 `subscribe` 失败；页面整棵子树炸掉。

**错误示例：**

```tsx
function ThemeLabel() {
  const store = useContext(WorkspaceContext)
  const theme = useStore(store, (state) => state.theme)
  return <p>{theme}</p>
}
```

**正确写法：**

```tsx
function ThemeLabel() {
  const store = useContext(WorkspaceContext)
  if (!store) {
    throw new Error('缺少 WorkspaceContext.Provider')
  }
  const theme = useStore(store, (state) => state.theme)
  return <p>{theme}</p>
}

function MissingProviderProbe() {
  const store = useContext(WorkspaceContext)
  return <p>{store ? '已注入' : '缺少 Provider'}</p>
}
```

**验证方式：** Provider 外面的探测只调用 `useContext`，显示「缺少 Provider」，不调用 `useStore`；包在 Provider 里的 `ThemeLabel` 正常显示主题。

### 错误：每次渲染都 createStore 再塞进 Provider

**触发条件：** 在 Provider 函数体里直接 `createStore(...)`，不经 `useState` 或 `useRef`。

**原因：** 官方指南用 `useState(() => createBearStore(props))` 留下同一份 api。每次渲染新建 api，子树订阅的是上一份，写入落在新的一份。

**后果：** 点一次切换，计数或主题被新实例丢掉；同一子树里的面板对不上。

**错误示例：**

```tsx
function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const store = createStore<WorkspaceStore>()((set) => ({
    theme: '浅色',
    toggleTheme: () => set({ theme: '深色' }),
  }))
  return <WorkspaceContext.Provider value={store}>{children}</WorkspaceContext.Provider>
}
```

**正确写法：**

```tsx
function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() =>
    createStore<WorkspaceStore>()((set) => ({
      theme: '浅色',
      toggleTheme: () => set({ theme: '深色' }),
    })),
  )
  return <WorkspaceContext.Provider value={store}>{children}</WorkspaceContext.Provider>
}
```

**验证方式：** 多次点击「切换主题」后，同一 Provider 内的 `useStore` 面板仍读到连续变化的主题，不会跳回初始值。

### 错误：从 zustand/context 导入 createContext

**触发条件：** 写成 `import createContext from 'zustand/context'`，沿用 v3 的 `Provider` / `useStore` 包装。

**原因：** 官方 Previous versions 写明：`zustand/context` 的 `createContext` 在 v4 废弃，将在 v5 移除。现行 README 和 Initialize state with props 都使用 React 自己的 `createContext`。

**后果：** 按旧文档导入 `zustand/context` 会找不到现行 API。

**错误示例：**

```tsx
import createContext from 'zustand/context'

const { Provider, useStore } = createContext()
```

**正确写法：**

```tsx
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
```

**验证方式：** 导入来自 `react` 和 `zustand`；源码里没有 `zustand/context`。
:::

## 六、原理与适用场景

### 1. 官方事实

README 写明：用 `create` 创建的 store 不需要 Context Provider。需要依赖注入或用组件 props 初始化时才用 Context。`create` 返回 Hook，不能当普通 Context 值。从 v4 起推荐 vanilla store：`createContext` 保存 api，消费者 `useContext` 取出后再 `useStore(store, selector)`。

Initialize state with props 写明：用 `createStore` 做成创建函数；`React.createContext` 保存 api；Provider 用 `useState(() => createStore(...))`；消费者没有 Provider 时抛错，有 api 后再 `useStore`。也可以把这两步收成自定义 Hook。

`useStore` 的第一参数仍是 store api。Context 不改变订阅规则。

### 2. 课程推导

Context 解决「这份子树用哪一份 api」。`useStore` 解决「这个组件订哪个字段」。两件事不要并成一步。模块级 store 继续直接导入；只有子树隔离或 props 初始化时才加 Provider。

### 3. 适用边界

本课只讲 React `createContext`、Provider 注入 `StoreApi`、`useContext` 加 `useStore`。不把 `create` 的 Hook 放进 Context。不讲 `zustand/context`、服务端渲染、中间件组合或一份创建函数如何在多页之间复用。

## 七、练习

:::exercise
### 用 Context 注入一份 Vanilla Store

**要求：** 从 `zustand` 导入 `createStore` 和 `useStore`，从 `react` 导入 `createContext`、`useContext` 和 `useState`。写 `createWorkspaceStore`，返回含 `theme: '浅色'` 和 `toggleTheme` 的 api。写 `WorkspaceContext`，默认值 `null`。写 `WorkspaceProvider`，用 `useState(() => createWorkspaceStore())` 留下 api 并提供给子树。写 `ThemeLabel`：先 `useContext`，没有 api 时抛错，有 api 时用 `useStore(store, (state) => state.theme)` 显示主题。另写 `MissingProviderProbe`：只 `useContext`，没有 api 时显示 `缺少 Provider`，不要调用 `useStore`。不要把 `create` 的返回值放进 Context，也不要从 `zustand/context` 导入。

**验收：** `ThemeLabel` 包在 `WorkspaceProvider` 内时显示 `浅色`；调用 `store.getState().toggleTheme()` 后显示 `深色`；`MissingProviderProbe` 放在 Provider 外时显示 `缺少 Provider`。

**参考答案：**

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { createStore, useStore } from 'zustand'

type WorkspaceStore = {
  theme: string
  toggleTheme: () => void
}

function createWorkspaceStore() {
  return createStore<WorkspaceStore>()((set, get) => ({
    theme: '浅色',
    toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
  }))
}

type WorkspaceApi = ReturnType<typeof createWorkspaceStore>

const WorkspaceContext = createContext<WorkspaceApi | null>(null)

function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createWorkspaceStore())
  return <WorkspaceContext.Provider value={store}>{children}</WorkspaceContext.Provider>
}

function ThemeLabel() {
  const store = useContext(WorkspaceContext)
  if (!store) {
    throw new Error('缺少 WorkspaceContext.Provider')
  }
  const theme = useStore(store, (state) => state.theme)
  return <p>{theme}</p>
}

function MissingProviderProbe() {
  const store = useContext(WorkspaceContext)
  return <p>{store ? '已注入' : '缺少 Provider'}</p>
}
```
:::

## 八、本节小结

- `create` 不需要 Provider。
- Context 的 `value` 是 `StoreApi`，不是当前 state。
- 消费者先 `useContext` 取出 api，再 `useStore(api, selector)`。
- 没有 Provider 时不要调用 `useStore`。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 README React context](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - create 不需要 Provider；v4 起用 vanilla store 加 Context。
- [Zustand Initialize state with props](https://zustand.docs.pmnd.rs/guides/initialize-state-with-props) - createStore、createContext、useState 留下 api、useStore 订阅。
- [Zustand 5.0.15 useStore 实现](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - useStore 第一参数仍是 api。
- [Zustand v3 createContext previous versions](https://zustand.docs.pmnd.rs/reference/previous-versions/zustand-v3-create-context.html) - zustand/context 在 v4 废弃、v5 移除。
- [React useContext](https://react.dev/reference/react/useContext) - useContext 按 Object.is 比较 value。
