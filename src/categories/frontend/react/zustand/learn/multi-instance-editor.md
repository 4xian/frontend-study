---
id: react.zustand.learn.advanced.multi-instance-editor
type: lesson
title: 实战：多实例编辑器
summary: 用创建函数为每份文稿造独立 StoreApi，切片只合并进当前实例，重置和派生都留在这一份里。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 55
prerequisites:
  - react.zustand.learn.advanced.store-factory
  - react.zustand.learn.advanced.context-scope
  - react.zustand.learn.intermediate.slices-pattern
  - react.zustand.learn.intermediate.state-reset
  - react.zustand.learn.intermediate.derived-state
related:
  - react.zustand.learn.advanced.store-factory
  - react.zustand.learn.advanced.context-scope
  - react.zustand.learn.intermediate.slices-pattern
  - react.zustand.learn.intermediate.state-reset
  - react.zustand.learn.intermediate.derived-state
tags:
  - Zustand
  - 多实例
  - Store Factory
  - Slices Pattern
  - 实战
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-11
objectives:
  - 能按文稿调用创建函数，得到互不影响的 StoreApi，再用 Context 交给当前编辑器。
  - 能把正文和命令拆成 slice，展开后仍是这一份实例，不是第二份全局 Store。
  - 能按字段订阅标题和正文，字数与是否改过在渲染时从 getInitialState 算出来。
  - 能只重置当前实例，说明开关留在组件里。
recap:
  - 多份编辑器就多次调用创建函数，不要共用模块级 create。
  - 切片合并的是当前这份 api，不能代替多实例。
  - 字数和是否改过从已有正文算，不另存一份。
  - 重置只动当前实例；私有说明继续用组件 state。
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
      - 需要用组件 props 初始化 store 时，推荐 vanilla store 加 React Context。
      - 创建函数先铺默认值，再用 initProps 覆盖，最后返回 createStore。
      - Provider 用 useState 初始化器留下当前这份 api。
      - 消费者先取出 Context 里的 api，再 useStore(store, selector)。
  - title: Zustand 5.0.15 README React context
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 用 create 创建的 store 不需要 Context Provider。
      - Context 用于依赖注入，或用组件 props 初始化 store。
      - 从 v4 起推荐把 vanilla store 放进 Context。
  - title: Zustand 5.0.15 createStore API
    url: https://zustand.docs.pmnd.rs/reference/apis/create-store
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - createStore 每次调用都创建一份暴露 setState、getState、getInitialState 和 subscribe 的 vanilla store。
  - title: Zustand 5.0.15 Slices Pattern
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 可以把主 Store 拆成更小的独立片段，再合并成一份 bounded store。
      - 合并写法是把多个 slice 函数的返回值展开进同一次创建。
  - title: Zustand 5.0.15 How to reset state
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 官方示例使用 store.setState(store.getInitialState(), true) 整份写回创建时的快照。
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - getInitialState 返回创建时保存的快照。
      - setState 在 replace 为 true 时整份替换当前 state。
      - 这是固定版本实现，不是另一套公共合同。
  - title: React useState initializer
    url: https://react.dev/reference/react/useState
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 把函数传给 useState 时，React 只在初始化阶段调用它。
  - title: React Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - 避免保存可以从现有数据计算出来的重复状态。
---

# 实战：多实例编辑器

## 一、学习目标

- 按文稿调用创建函数，得到互不影响的 `StoreApi`，再用 Context 交给当前编辑器。
- 把正文和命令拆成 slice，展开后仍是这一份实例，不是第二份全局 Store。
- 按字段订阅标题和正文，字数与是否改过在渲染时从 `getInitialState` 算出来。
- 只重置当前实例，说明开关留在组件里。

## 二、为什么左右两份文稿不能共用一份 Store

并排编辑「文稿甲」和「文稿乙」时，左侧追加一句，右侧标题、正文和字数都不能动。模块级 `create` 只有一份 api，两份编辑器会读到同一份 `body`。

前面已经分开学过创建函数、Context、切片、重置和派生。这个实战把它们收进同一份编辑器：创建函数决定有几份实例，切片只拆当前这份的初始化函数，选择函数决定订哪些字段，字数当场算，重置只写回这一份快照。

切片不能代替多实例。`...createDocumentSlice(...a)` 仍然写进同一次 `createStore`。两份文稿要调两次创建函数。

## 三、核心概念

### 1. 每份文稿调用一次创建函数

官方 Initialize state with props 的写法是：先铺默认值，再用 `initProps` 覆盖，最后 `return createStore(...)`。Provider 用 `useState(() => createEditorStore(props))` 留下这一份 api。

```ts
import { createStore, type StateCreator } from 'zustand'

type EditorProps = {
  title: string
  body: string
}

type DocumentSlice = EditorProps & {
  appendLine: () => void
}

type CommandSlice = {
  resetEditor: () => void
}

type EditorStore = DocumentSlice & CommandSlice

function createEditorStore(initProps?: Partial<EditorProps>) {
  const DEFAULT_PROPS: EditorProps = {
    title: '未命名',
    body: '',
  }
  const initial = { ...DEFAULT_PROPS, ...initProps }
  return createStore<EditorStore>()((...a) => ({
    ...createDocumentSlice(initial)(...a),
    ...createCommandSlice(...a),
  }))
}
```

`createEditorStore({ title: '文稿甲' })` 和 `createEditorStore({ title: '文稿乙', body: '已有一句。' })` 是两份对象。左侧 `appendLine` 只改左侧的 `body`。

### 2. 切片合并进当前实例

官方 Slices Pattern 把主 Store 拆成片段再合并成一份 bounded store。这里的「一份」指当前这次 `createStore`，不是整个页面只有一份。

正文切片管 `title`、`body` 和 `appendLine`。命令切片管 `resetEditor`。`set` / `get` 仍然针对这份 `EditorStore`。不要再 `create` 一份模块级 Hook 给两个编辑器共用。

### 3. 字数和是否改过当场算

正文长度等于 `body.length`。是否改过等于当前 `body` 是否等于 `getInitialState().body`。这两项都能从已有字段得到，不要再存 `length` 或 `dirty`。

组件一次只订一个已有字段。需要字数时，在已经拿到 `body` 的那次渲染里计算。改左侧正文时，只订右侧 `title` 的面板不应更新。

说明是否展开只有当前按钮使用，继续 `useState`。重置当前文稿不应顺便关掉说明。

### 4. 重置只写回当前这份快照

官方 How to reset state 使用 `store.setState(store.getInitialState(), true)`。`replace` 为 `true` 时整份写回创建时的快照，Action 还在。

调用的是当前 Context 里的那份 api。左侧重置不会动右侧。不要对模块级单例重置，也不要用 `set({ title, body }, true)` 丢掉 Action。

## 四、用法与示例

### 1. 切片写在创建函数里

```ts
const createDocumentSlice =
  (initial: EditorProps): StateCreator<EditorStore, [], [], DocumentSlice> =>
  (set, get) => ({
    ...initial,
    appendLine: () => set({ body: `${get().body}新增一行。` }),
  })

const createCommandSlice: StateCreator<EditorStore, [], [], CommandSlice> = (
  set,
  get,
  store,
) => ({
  resetEditor: () => store.setState(store.getInitialState(), true),
})
```

`initial` 是这次创建时的 props，不是后来父组件又传来的值。

### 2. Provider 留下当前这份 api

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useStore } from 'zustand'

type EditorApi = ReturnType<typeof createEditorStore>

const EditorContext = createContext<EditorApi | null>(null)

function EditorProvider({
  title,
  body = '',
  children,
}: EditorProps & { children: ReactNode }) {
  const [store] = useState(() => createEditorStore({ title, body }))
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

并排两份编辑器就写两个 Provider。创建函数被调用两次。

### 3. 渲染时派生，重置当前实例

```tsx
function EditorPane() {
  const title = useEditorStore((state) => state.title)
  const body = useEditorStore((state) => state.body)
  const appendLine = useEditorStore((state) => state.appendLine)
  const resetEditor = useEditorStore((state) => state.resetEditor)
  const store = useContext(EditorContext)
  const [helpOpen, setHelpOpen] = useState(false)
  const length = body.length
  const dirty = Boolean(store && body !== store.getInitialState().body)

  return (
    <section>
      <h3>{title}</h3>
      <p>{body || '空'}</p>
      <p>{length}</p>
      <p>{dirty ? '是' : '否'}</p>
      <button type="button" onClick={appendLine}>
        追加一行
      </button>
      <button type="button" onClick={resetEditor}>
        重置本文稿
      </button>
      <button type="button" onClick={() => setHelpOpen((open) => !open)}>
        {helpOpen ? '收起说明' : '打开说明'}
      </button>
    </section>
  )
}
```

下面的 Demo 左右各调一次创建函数。左侧标题是「文稿甲」、正文为空；右侧是「文稿乙」、正文是「已有一句。」。左侧追加一行后，右侧字数不变。重置左侧只清空左侧正文。打开说明后再重置，说明仍打开。

:::demo{id="react.zustand.learn.advanced.multi-instance-editor.multi-instance-editor-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：两份编辑器共用模块级 create

**触发条件：** `export const useEditorStore = create(...)`，左右面板都导入同一份 Hook。

**原因：** 模块加载时只创建一次 api。两份文稿读写同一份 `body`。

**后果：** 左侧追加一行，右侧字数一起变。

**错误示例：**

```ts
export const useEditorStore = create<EditorStore>()((set, get) => ({
  title: '未命名',
  body: '',
  appendLine: () => set({ body: `${get().body}新增一行。` }),
  resetEditor: () => set({ body: '' }),
}))
```

**正确写法：**

```ts
const leftStore = createEditorStore({ title: '文稿甲' })
const rightStore = createEditorStore({ title: '文稿乙', body: '已有一句。' })
```

**验证方式：** 调用左侧 `appendLine` 后，右侧 `getState().body` 仍是 `已有一句。`。

### 错误：把切片合并当成多份实例

**触发条件：** 页面只调用一次 `createStore`，把两份文稿的字段都展开进这一份 state。

**原因：** Slices Pattern 拆的是初始化函数，运行时仍是一份 state。

**后果：** 共享重置或浅合并会碰到另一份文稿的字段。

**错误示例：**

```ts
createStore()((...a) => ({
  ...createLeftSlice(...a),
  ...createRightSlice(...a),
}))
```

**正确写法：**

```ts
<EditorProvider title="文稿甲">
  <EditorPane />
</EditorProvider>
<EditorProvider title="文稿乙" body="已有一句。">
  <EditorPane />
</EditorProvider>
```

**验证方式：** 左侧重置后，右侧正文仍是 `已有一句。`。

### 错误：每次渲染都新建 StoreApi

**触发条件：** Provider 写成 `const store = createEditorStore(props)`，没有放进 `useState` 初始化器。

**原因：** 父组件一更新就再调用创建函数。官方写法把结果留给 `useState(() => ...)`。

**后果：** 已经追加的正文消失，订阅落到新的 api 上。

**错误示例：**

```tsx
function EditorProvider({ title, body = '', children }: EditorProps & { children: ReactNode }) {
  const store = createEditorStore({ title, body })
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}
```

**正确写法：**

```tsx
const [store] = useState(() => createEditorStore({ title, body }))
```

**验证方式：** 追加一行后父组件重渲染，正文还在。

### 错误：把字数和脏标记写进 Store

**触发条件：** state 增加 `length` 和 `dirty`，`appendLine` 时一起改。

**原因：** 这两项都能从 `body` 和 `getInitialState().body` 算出来。React 状态结构指南要求不要保存能算出来的重复数据。

**后果：** 漏写其中一个字段时，界面和正文分叉。

**错误示例：**

```ts
appendLine: () =>
  set({
    body: `${get().body}新增一行。`,
    length: get().body.length + 5,
    dirty: true,
  })
```

**正确写法：**

```ts
const length = body.length
const dirty = body !== store.getInitialState().body
```

**验证方式：** Store 类型没有 `length` 或 `dirty`；追加后字数等于 `body.length`。

### 错误：重置当前文稿时关掉说明或清掉另一份

**触发条件：** 说明放进 Store，或对模块级单例调用 `setState(getInitialState(), true)`。

**原因：** 说明只服务当前按钮。重置 API 作用在被调用的那份 api 上。

**后果：** 私有交互被误伤，或右侧文稿一起回到初始值。

**错误示例：**

```ts
resetEditor: () => set({ body: '', helpOpen: false })
```

**正确写法：**

```ts
const [helpOpen, setHelpOpen] = useState(false)
resetEditor: () => store.setState(store.getInitialState(), true)
```

**验证方式：** 打开说明后重置，说明仍打开；另一份正文不变。
:::

## 六、原理与适用场景

### 1. 官方事实

Initialize state with props 用创建函数加 Context 注入按 props 初始化的 vanilla store；Provider 把 `createBearStore(props)` 放进 `useState` 初始化器。README 写明 `create` 不需要 Provider，Context 用于依赖注入或按 props 初始化。`createStore` 每次调用得到一份带 `setState`、`getState`、`getInitialState` 和 `subscribe` 的 api。Slices Pattern 把片段展开进同一次创建。How to reset state 使用 `setState(getInitialState(), true)`。React 要求派生数据不要另存一份，`useState` 初始化器只跑一次。

### 2. 课程推导

多实例编辑器的最小模型是：创建函数决定实例份数，切片决定当前这份怎么拆，选择函数决定订哪些字段，派生留在渲染，重置只写回当前快照。私有说明不属于这份 Store。

### 3. 适用边界

本课只整合已经学过的创建函数、Context、切片、重置和派生状态。不引入 `persist`、SSR 水合、Immer、测试包装或中间件组合，也不把远程文稿当成服务端缓存。

## 七、练习

:::exercise
### 造出两份互不影响的编辑器 Store

**要求：** 编写 `createEditorStore`，用默认 `title: '未命名'`、`body: ''`，再覆盖 `initProps`。`DocumentSlice` 含 `title`、`body` 与 `appendLine`，`CommandSlice` 含 `resetEditor`，用 `StateCreator<EditorStore, [], [], 本段>` 标注后在同一次 `createStore` 里展开。`appendLine` 在当前 `body` 后追加 `新增一行。`。`resetEditor` 使用 `setState(getInitialState(), true)`。创建 `left` 为 `{ title: '文稿甲' }`，`right` 为 `{ title: '文稿乙', body: '已有一句。' }`。先调用左侧 `appendLine`，断言左侧正文含 `新增一行。`，右侧仍是 `已有一句。`；再调用左侧 `resetEditor`，断言左侧正文回到 `''`，右侧仍不变，且左侧 `appendLine` 仍是函数。不要用模块级 `create`，不要把 `length` 写入 state，也不要把两份文稿合并进一次 `createStore`。

**验收：** 左侧追加不影响右侧；左侧重置后正文为空、Action 仍在；右侧正文始终是 `已有一句。`。

**参考答案：**

```ts
import { createStore, type StateCreator } from 'zustand'

type EditorProps = {
  title: string
  body: string
}

type DocumentSlice = EditorProps & {
  appendLine: () => void
}

type CommandSlice = {
  resetEditor: () => void
}

type EditorStore = DocumentSlice & CommandSlice

const createDocumentSlice =
  (initial: EditorProps): StateCreator<EditorStore, [], [], DocumentSlice> =>
  (set, get) => ({
    ...initial,
    appendLine: () => set({ body: `${get().body}新增一行。` }),
  })

const createCommandSlice: StateCreator<EditorStore, [], [], CommandSlice> = (
  _set,
  _get,
  store,
) => ({
  resetEditor: () => store.setState(store.getInitialState(), true),
})

function createEditorStore(initProps?: Partial<EditorProps>) {
  const DEFAULT_PROPS: EditorProps = {
    title: '未命名',
    body: '',
  }
  const initial = { ...DEFAULT_PROPS, ...initProps }
  return createStore<EditorStore>()((...args) => ({
    ...createDocumentSlice(initial)(...args),
    ...createCommandSlice(...args),
  }))
}

const left = createEditorStore({ title: '文稿甲' })
const right = createEditorStore({ title: '文稿乙', body: '已有一句。' })

left.getState().appendLine()
if (!left.getState().body.includes('新增一行。')) {
  throw new Error('左侧追加后应含新增一行。')
}
if (right.getState().body !== '已有一句。') {
  throw new Error('右侧不应被左侧追加改掉')
}

left.getState().resetEditor()
if (left.getState().body !== '') {
  throw new Error('左侧重置后正文应为空')
}
if (typeof left.getState().appendLine !== 'function') {
  throw new Error('重置后 appendLine 仍应是函数')
}
if (right.getState().body !== '已有一句。') {
  throw new Error('右侧在左侧重置后仍应是已有一句。')
}
```
:::

## 八、本节小结

- 多份编辑器就多次调用创建函数。
- 切片合并进当前这份 api，不能代替多实例。
- 字数和是否改过从正文和初始快照算。
- 重置和说明分属当前实例与组件私有状态。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand Initialize state with props](https://zustand.docs.pmnd.rs/guides/initialize-state-with-props) - 创建函数与 Provider。
- [Zustand 5.0.15 README React context](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - Context 用于按 props 初始化。
- [Zustand 5.0.15 createStore API](https://zustand.docs.pmnd.rs/reference/apis/create-store) - 每次调用得到一份 api。
- [Zustand 5.0.15 Slices Pattern](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/slices-pattern.md) - 切片合并进一次创建。
- [Zustand 5.0.15 How to reset state](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md) - `setState(getInitialState(), true)`。
- [Zustand 5.0.15 vanilla store implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - `getInitialState` 与 replace。
- [React useState initializer](https://react.dev/reference/react/useState) - 初始化器只跑一次。
- [React Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - 不保存能算出来的数据。
