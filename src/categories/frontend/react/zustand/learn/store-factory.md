---
id: react.zustand.learn.advanced.store-factory
type: lesson
title: Store Factory 与多实例
summary: 把 createStore 收成创建函数，每次调用得到一份独立 StoreApi，再用 props 初始化各自的起始状态。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 50
prerequisites:
  - react.zustand.learn.advanced.context-scope
related:
  - react.zustand.learn.advanced.vanilla-store
  - react.zustand.learn.advanced.context-scope
  - react.zustand.learn.intermediate.slices-pattern
tags:
  - Zustand
  - Store Factory
  - createStore
  - 多实例
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能把 createStore 收成创建函数，用初始 props 覆盖默认字段，每次调用返回一份新的 StoreApi。
  - 能说明模块级 create 只有一份 api；多份编辑器或工作区必须各调一次创建函数。
  - 能用 useState 初始化器留下当前组件对应的那一份 api，再交给 Context Provider。
  - 能识别「共用模块级 store」「每次渲染都新建」和「期望后续 props 自动改已有 store」这三类错误。
recap:
  - 创建函数每调用一次，得到一份独立 StoreApi。
  - 初始 props 只在创建时写入。
  - Provider 用 useState 初始化器留下同一份 api。
  - Slices Pattern 拆的是一份 store，不是多份实例。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand Initialize state with props
    url: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 需要依赖注入、用组件 props 初始化 store 时，推荐 vanilla store 加 React Context。
      - "创建函数接收可选 initProps，先铺 DEFAULT_PROPS，再覆盖 initProps，最后 return createStore。"
      - "Provider 用 useState(() => createBearStore(props)) 留下当前这份 api。"
      - 完整示例把 bears={2} 传给一份 Provider，作为这次创建的初始 props。
  - title: Zustand 5.0.15 README React context
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - "用 create 创建的 store 不需要 Context Provider。"
      - Context 用于依赖注入，或用组件 props 初始化 store。
      - "从 v4 起推荐把 vanilla store 放进 Context。"
  - title: Zustand 5.0.15 createStore API
    url: https://zustand.docs.pmnd.rs/reference/apis/create-store
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - createStore 每次调用都创建一份暴露 setState、getState、getInitialState 和 subscribe 的 vanilla store。
  - title: React useState initializer
    url: https://react.dev/reference/react/useState
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - React 只保存一次初始 state，后续渲染忽略传入的初始值。
      - 把函数传给 useState 时，React 只在初始化阶段调用它。
      - 换 key 会让组件从零重建，state 也会重置。
---

# Store Factory 与多实例

## 一、学习目标

- 把 `createStore` 收成创建函数，用初始 props 覆盖默认字段。
- 说明每次调用创建函数都得到一份独立 `StoreApi`。
- 用 `useState` 初始化器留下当前组件对应的那一份 api，再交给 Provider。
- 识别「共用模块级 store」「每次渲染都新建」和「后续 props 自动改已有 store」。

## 二、为什么需要创建函数

模块级 `create` 或模块级 `createStore` 在模块加载时只跑一次，整个应用共用一份 api。左右两份编辑器如果都 `import` 同一份 Hook，点左侧增加草稿，右侧也会变。

官方 Initialize state with props 把这件事收成创建函数：调用一次 `createBearStore(props)`，得到一份用这些 props 初始化的 vanilla store。两份编辑器就调两次，得到两份 api。

创建函数解决「造出几份独立 store」。Context 只负责把已经造好的那一份交给当前子树。

## 三、核心概念

### 1. 创建函数返回新的 StoreApi

官方写法先铺默认值，再用 `initProps` 覆盖，最后 `return createStore(...)`：

```tsx
import { createStore } from 'zustand'

type EditorProps = {
  name: string
  draft: number
}

type EditorStore = EditorProps & {
  bumpDraft: () => void
}

function createEditorStore(initProps?: Partial<EditorProps>) {
  const DEFAULT_PROPS: EditorProps = {
    name: '未命名',
    draft: 0,
  }
  return createStore<EditorStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    bumpDraft: () => set({ draft: get().draft + 1 }),
  }))
}
```

`createEditorStore({ name: '文稿甲' })` 和 `createEditorStore({ name: '文稿乙', draft: 2 })` 是两份对象。各自有自己的 `getState`、`setState` 和 `subscribe`。左侧 `bumpDraft` 只改左侧的 `draft`。

`ReturnType<typeof createEditorStore>` 就是这份 api 的类型。Context 的值类型用它。

### 2. 初始 props 只在创建时写入

`...DEFAULT_PROPS, ...initProps` 发生在 `createStore` 的初始化函数里。这份 api 一旦造好，`name` 就是当时传入的值。

父组件后来改了自己的 `name` prop，已经存在的 store 不会跟着改。React 的 `useState` 也只保存一次初始值；把函数传给 `useState` 时，只在初始化阶段调用。

需要按新 props 重新开始时，给 Provider 换 `key`。React 会拆掉旧组件，再跑一次初始化器，创建函数会再被调用。

### 3. 每个 Provider 留下自己的那一份

官方 Provider 把创建函数的结果放进 `useState` 初始化器：

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useStore } from 'zustand'

type EditorApi = ReturnType<typeof createEditorStore>

const EditorContext = createContext<EditorApi | null>(null)

function EditorProvider({
  name,
  draft = 0,
  children,
}: EditorProps & { children: ReactNode }) {
  const [store] = useState(() => createEditorStore({ name, draft }))
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}

function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  const store = useContext(EditorContext)
  if (!store) {
    throw new Error('缺少 EditorContext.Provider')
  }
  return useStore(store, selector)
}
```

并排两个 Provider 时，创建函数被调用两次：

```tsx
<EditorProvider name="文稿甲">
  <EditorPane />
</EditorProvider>
<EditorProvider name="文稿乙" draft={2}>
  <EditorPane />
</EditorProvider>
```

左侧订左侧 api，右侧订右侧 api。这不是又一份模块级 store，而是同一套创建规则造出的两份实例。

### 4. 观察两份实例

下面的 Demo 用同一个 `createEditorStore` 造出左右两份编辑器。左侧初始名称是「文稿甲」、草稿 `0`；右侧是「文稿乙」、草稿 `2`。增加左侧草稿时，右侧草稿不变。上方的模板名称改了，不会改已经造好的实例；点「按模板重建左侧」会换 `key`，左侧才会用新名称重新创建。

:::demo{id="react.zustand.learn.advanced.store-factory.store-factory-demo"}
:::

## 四、用法与示例

### 1. 创建函数放在模块里，调用放在组件里

```tsx
export function createEditorStore(initProps?: Partial<EditorProps>) {
  const DEFAULT_PROPS: EditorProps = {
    name: '未命名',
    draft: 0,
  }
  return createStore<EditorStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    bumpDraft: () => set({ draft: get().draft + 1 }),
  }))
}
```

模块导出的是函数，不是已经造好的 api。谁需要一份实例，谁调用一次。

### 2. 不要把模块级 create 当成多实例

```tsx
const useEditorStore = create<EditorStore>()((set) => ({
  name: '未命名',
  draft: 0,
  bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
}))
```

这份 Hook 只有一份 api。两个面板都调用它，读到的是同一份 `draft`。多实例必须换成创建函数加各自分开的 api。

### 3. 选择规则仍按字段

```tsx
function DraftLabel() {
  const draft = useEditorStore((state) => state.draft)
  return <p>{draft}</p>
}

function NameLabel() {
  const name = useEditorStore((state) => state.name)
  return <h3>{name}</h3>
}
```

创建函数决定「这是哪一份 api」。`useStore` 仍然只订字段。不要为了多实例去订整份 state。

### 4. 和 Slices Pattern 的差别

Slices Pattern 把一份 store 的初始化函数拆成多个 slice，再展开合并。运行时仍是一份 api、一份 state。

创建函数每次调用都 `createStore`，运行时是多份 api。一份编辑器内部仍可以再拆 slice；那是同一份实例里的模块组织，不是第二份实例。

## 五、易错使用提示

:::pitfalls
### 错误：两个面板共用模块级 create

**触发条件：** 写成 `const useEditorStore = create(...)`，左右面板都导入同一份 Hook。

**原因：** `create` 在模块加载时只创建一份 api。官方把多实例收成创建函数，每次调用才 `return createStore(...)`。

**后果：** 点左侧增加草稿，右侧数字一起变。

**错误示例：**

```tsx
const useEditorStore = create<EditorStore>()((set) => ({
  name: '未命名',
  draft: 0,
  bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
}))

function Pane() {
  const draft = useEditorStore((state) => state.draft)
  const bumpDraft = useEditorStore((state) => state.bumpDraft)
  return (
    <button type="button" onClick={bumpDraft}>
      {draft}
    </button>
  )
}

function App() {
  return (
    <>
      <Pane />
      <Pane />
    </>
  )
}
```

**正确写法：**

```tsx
function createEditorStore(initProps?: Partial<EditorProps>) {
  return createStore<EditorStore>()((set, get) => ({
    name: '未命名',
    draft: 0,
    ...initProps,
    bumpDraft: () => set({ draft: get().draft + 1 }),
  }))
}

function EditorProvider({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  const [store] = useState(() => createEditorStore({ name }))
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}

function App() {
  return (
    <>
      <EditorProvider name="文稿甲">
        <Pane />
      </EditorProvider>
      <EditorProvider name="文稿乙">
        <Pane />
      </EditorProvider>
    </>
  )
}
```

**验证方式：** 点左侧增加草稿后，只有左侧数字加一，右侧保持原值。

### 错误：每次渲染都调用创建函数

**触发条件：** 在 Provider 函数体里直接 `createEditorStore(props)`，不经 `useState` 或 `useRef`。

**原因：** 官方指南用 `useState(() => createBearStore(props))`。React 把函数传给 `useState` 时只在初始化阶段调用。每次渲染新建 api，子树订的是上一份，写入落在新的一份。

**后果：** 点一次增加草稿，数字跳回初始值，或左右面板对不上同一份实例。

**错误示例：**

```tsx
function EditorProvider({ name, children }: { name: string; children: React.ReactNode }) {
  const store = createEditorStore({ name })
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}
```

**正确写法：**

```tsx
function EditorProvider({ name, children }: { name: string; children: React.ReactNode }) {
  const [store] = useState(() => createEditorStore({ name }))
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}
```

**验证方式：** 连续点击「增加草稿」后，同一 Provider 内的数字连续加一，不会跳回 `0`。

### 错误：改父组件 props 却期望已有 store 跟着变

**触发条件：** `EditorProvider` 已经挂载，父组件把 `name` 从「文稿甲」改成「文稿丙」，期望面板标题马上变成「文稿丙」。

**原因：** 创建函数只在 `useState` 初始化器里跑一次。React 后续渲染忽略新的初始值。`name` 已经写进那份 api 的 state，不会因为父组件 prop 变了而自动 `setState`。

**后果：** 输入框里是新名称，面板标题仍是创建时的旧名称。

**错误示例：**

```tsx
function App() {
  const [name, setName] = useState('文稿甲')
  return (
    <>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <EditorProvider name={name}>
        <NameLabel />
      </EditorProvider>
    </>
  )
}
```

**正确写法：**

```tsx
function App() {
  const [name, setName] = useState('文稿甲')
  const [editorKey, setEditorKey] = useState(0)
  return (
    <>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button type="button" onClick={() => setEditorKey((value) => value + 1)}>
        按模板重建
      </button>
      <EditorProvider key={editorKey} name={name}>
        <NameLabel />
      </EditorProvider>
    </>
  )
}
```

**验证方式：** 只改输入框时，面板标题不变；点「按模板重建」后，标题换成当前输入，草稿回到初始值。

### 错误：把 create 返回的 Hook 当成创建函数

**触发条件：** 写成 `function createEditorStore() { return create(...) }`，再把返回值塞进 Context。

**原因：** README 写明 `create` 返回 Hook。创建函数要返回的是 vanilla `StoreApi`，消费者才能 `useStore(api, selector)`。

**后果：** Context 里拿到函数；调用时可能违反 Hook 规则，或把 Hook 当成 `getState` 使用。

**错误示例：**

```tsx
function createEditorStore() {
  return create<EditorStore>()((set) => ({
    name: '未命名',
    draft: 0,
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  }))
}

const [store] = useState(() => createEditorStore())
```

**正确写法：**

```tsx
function createEditorStore() {
  return createStore<EditorStore>()((set) => ({
    name: '未命名',
    draft: 0,
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  }))
}

const [store] = useState(() => createEditorStore())
```

**验证方式：** 创建函数的返回值有 `getState`、`setState` 和 `subscribe`；消费者调用的是 `useStore(store, selector)`。

### 错误：用 Slices Pattern 冒充多实例

**触发条件：** 把「文稿甲」和「文稿乙」写成两个 slice 合并进同一份 `create`。

**原因：** Slices Pattern 的运行时仍是一份 state。两个 slice 共享一次浅合并和一套 listener，不是两份独立 api。

**后果：** 重置或中间件作用在整份 store 上；无法按编辑器分别销毁或分别初始化。

**错误示例：**

```tsx
const useEditors = create<EditorsStore>()((...args) => ({
  ...createDocASlice(...args),
  ...createDocBSlice(...args),
}))
```

**正确写法：**

```tsx
<EditorProvider name="文稿甲">
  <Pane />
</EditorProvider>
<EditorProvider name="文稿乙">
  <Pane />
</EditorProvider>
```

**验证方式：** 两份 Provider 各有自己的 `getState().draft`；重置左侧不会清掉右侧。
:::

## 六、原理与适用场景

### 1. 官方事实

Initialize state with props 写明：需要依赖注入、用组件 props 初始化时，用 vanilla store 加 React Context。创建函数接收可选 `initProps`，先铺 `DEFAULT_PROPS`，再覆盖，然后 `return createStore`。Provider 用 `useState(() => createBearStore(props))`。完整示例把 `bears={2}` 传给一份 Provider。两份独立实例来自对创建函数的两次调用。

README 写明：`create` 不需要 Provider；需要依赖注入或 props 初始化时才用 Context，并且从 v4 起推荐 vanilla store。

`createStore` 每次调用都返回一份带 `setState`、`getState`、`getInitialState` 和 `subscribe` 的 api。

React `useState` 只保存一次初始值；传入函数时只在初始化阶段调用。换 `key` 会从零重建组件和它的 state。

### 2. 课程推导

创建函数是「同一套规则，多份实例」。Context 是「把已经造好的那一份交给子树」。两者常一起出现，但职责不同。模块级 `create` 继续服务全应用共用的那一份状态；只有每份子树要自己的起始值和自己的生命周期时，才改用创建函数。

### 3. 适用边界

本课只讲创建函数、初始 props、多份 `StoreApi`，以及用 `useState` 初始化器留下实例。不把后续 props 自动同步进已有 store。不讲 persist 的 `name` 冲突、服务端渲染、中间件组合，也不把 Slices Pattern 展开成第二套多实例方案。

## 七、练习

:::exercise
### 用创建函数造出两份编辑器

**要求：** 从 `zustand` 导入 `createStore` 和 `useStore`，从 `react` 导入 `createContext`、`useContext` 和 `useState`。写 `createEditorStore(initProps?: Partial<{ name: string; draft: number }>)`：默认 `name` 为 `未命名`、`draft` 为 `0`，并用 `initProps` 覆盖，再返回含 `bumpDraft` 的 api。写 `EditorContext` 默认值 `null`。写 `EditorProvider`，用 `useState(() => createEditorStore({ name, draft }))` 留下 api。写 `DraftLabel`：没有 Provider 时抛错，有 api 时用 `useStore` 显示 `name` 和 `draft`。在页面上并排两个 Provider，名称分别是 `文稿甲`、`文稿乙`，右侧初始 `draft` 为 `2`。不要用模块级 `create`，也不要从 `zustand/context` 导入。

**验收：** 左侧显示 `文稿甲` 和 `0`；右侧显示 `文稿乙` 和 `2`。调用左侧 `bumpDraft` 后，左侧为 `1`，右侧仍为 `2`。

**参考答案：**

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { createStore, useStore } from 'zustand'

type EditorProps = {
  name: string
  draft: number
}

type EditorStore = EditorProps & {
  bumpDraft: () => void
}

function createEditorStore(initProps?: Partial<EditorProps>) {
  const DEFAULT_PROPS: EditorProps = {
    name: '未命名',
    draft: 0,
  }
  return createStore<EditorStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    bumpDraft: () => set({ draft: get().draft + 1 }),
  }))
}

type EditorApi = ReturnType<typeof createEditorStore>

const EditorContext = createContext<EditorApi | null>(null)

function EditorProvider({
  name,
  draft = 0,
  children,
}: Partial<EditorProps> & { name: string; children: ReactNode }) {
  const [store] = useState(() => createEditorStore({ name, draft }))
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}

function DraftLabel() {
  const store = useContext(EditorContext)
  if (!store) {
    throw new Error('缺少 EditorContext.Provider')
  }
  const name = useStore(store, (state) => state.name)
  const draft = useStore(store, (state) => state.draft)
  return (
    <p>
      {name} {draft}
    </p>
  )
}

function App() {
  return (
    <>
      <EditorProvider name="文稿甲">
        <DraftLabel />
      </EditorProvider>
      <EditorProvider name="文稿乙" draft={2}>
        <DraftLabel />
      </EditorProvider>
    </>
  )
}
```
:::

## 八、本节小结

- 创建函数每调用一次，得到一份独立 `StoreApi`。
- 初始 props 只在创建时写入，后续 prop 变化不会改已有实例。
- Provider 用 `useState` 初始化器留下当前这份 api。
- Slices Pattern 拆的是一份 store，不能代替多实例。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand Initialize state with props](https://zustand.docs.pmnd.rs/guides/initialize-state-with-props) - 创建函数、DEFAULT_PROPS、useState 留下 api、不同 Provider 传入不同 props。
- [Zustand 5.0.15 README React context](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - create 不需要 Provider；props 初始化用 vanilla store。
- [Zustand 5.0.15 createStore API](https://zustand.docs.pmnd.rs/reference/apis/create-store) - 每次 createStore 得到一份独立 api。
- [React useState](https://react.dev/reference/react/useState) - 初始化器只跑一次；换 key 会重建 state。
