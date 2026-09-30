---
id: react.zustand.learn.advanced.advanced-typescript
type: lesson
title: 高级 TypeScript
summary: 说明 create 的泛型为何不能从初始值推断、柯里化空括号解决什么，以及 combine、ExtractState 和中间件如何配合类型。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 55
prerequisites:
  - react.zustand.learn.advanced.store-factory
related:
  - react.zustand.learn.basics.typescript-store
  - react.zustand.learn.intermediate.slices-pattern
  - react.zustand.learn.advanced.vanilla-store
tags:
  - Zustand
  - TypeScript
  - combine
  - ExtractState
  - StateCreator
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能说明 state 泛型 T 是不变的，TypeScript 无法从初始值推断，所以要手写 create 的类型参数。
  - 能说明柯里化空括号是为了只标注 state，让其余类型参数继续推断。
  - 能用 combine 推断 state，并识别 replace 为 true 时可能删掉 Action。
  - 能用 ExtractState 从已有 store 取出 state 类型，并用 bounded useStore 包住 vanilla api。
recap:
  - T 既出现在 get 的参数里，也出现在返回值里，所以不能推断。
  - 标注 state 时用 create 的柯里化写法。
  - combine 和 redux 会创建 state，不必再写柯里化。
  - 中间件要直接写在 create 里，才能做上下文推断。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 Advanced TypeScript Guide
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - TypeScript 用法要把 create(...) 写成 create<T>()(...)。
      - state 泛型 T 是不变的，TypeScript 无法从初始值推断。
      - 柯里化空括号用来只标注 state，其余类型参数继续推断。
      - combine 会推断 state，使用它时不必再写柯里化。
      - combine 里 set 和 get 的类型只覆盖第一段数据，replace 为 true 时可能删掉 Action。
      - ExtractState 可以从已有 store 取出 state 类型。
      - 中间件要立刻写在 create 里，才能做上下文推断。
      - 自制包装函数会失去推断，需要更复杂的类型。
      - vanilla store 可以用重载写成 bounded useStore。
      - "devtools 的 mutator 是 [\"zustand/devtools\", never]；persist 是 [\"zustand/persist\", YourPersistedState]。"
  - title: Zustand 5.0.15 vanilla ExtractState type
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - ExtractState 从带 getState 的对象推断返回值类型。这是固定版本类型，不是另一套公共合同。
  - title: TypeScript issue 10571
    url: https://github.com/microsoft/TypeScript/issues/10571
    sourceType: official-reference
    appliesTo: TypeScript
    claims:
      - 不能只填一部分泛型参数，要么全写要么全推断。
---

# 高级 TypeScript

## 一、学习目标

- 说明为什么不能从初始值推断 `create` 的 state 类型。
- 说明柯里化空括号只标注 state，其余类型继续推断。
- 用 `combine` 推断 state，并避开 `replace: true` 删掉 Action。
- 用 `ExtractState` 取出类型，并用 bounded `useStore` 包住 vanilla api。

## 二、为什么基础写法还不够

基础课已经会写 `create<NoteStore>()((set) => ...)`。那对空括号当时只当作固定写法。

高级 TypeScript 指南把原因写清楚了。第一，state 泛型 `T` 既作为 `get` 的返回值出现，也作为初始化函数的返回值出现，TypeScript 无法从初始对象推断 `T`，会得到 `unknown`。第二，TypeScript 不能只填一部分泛型，所以要用柯里化先写下 `T`，让中间件那些类型参数继续推断。

`combine`、`ExtractState` 和 bounded `useStore` 都建立在这两条之上。自定义 middleware 的高阶 mutator 不作为本课主线。

## 三、核心概念

### 1. T 是不变的，所以要手写类型

指南把 `create` 收成最小模型：

```ts
declare const create: <T>(f: (get: () => T) => T) => T

const x = create((get) => ({
  foo: 0,
  bar: () => get(),
}))
```

`f` 通过返回值“给出” `T`，又通过 `get` “接收” `T`。同一个 `T` 既协变又逆变，TypeScript 放弃推断，把 `x` 收成 `unknown`。

所以日常写法仍然是先声明形状，再交给柯里化 `create`：

```ts
import { create } from 'zustand'

type EditorStore = {
  theme: string
  draft: number
  bumpDraft: () => void
}

const useEditorStore = create<EditorStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))
```

初始化阶段不要同步调用 `get`。类型承诺 `get` 返回 `T`，但 store 还没建完时它是 `undefined`。指南把这件事标成类型不健全，不是可以依赖的行为。

### 2. 柯里化空括号只标注 state

TypeScript 要么给齐全部泛型，要么全部推断，见 [microsoft/TypeScript#10571](https://github.com/microsoft/TypeScript/issues/10571)。Zustand 需要标注 state，同时让中间件 mutator 继续推断，所以把 `create` 做成 `create<T>()(initializer)`。

运行时这对空括号什么也不做。它只是让你写下 `EditorStore`，不必把 persist、devtools 的类型参数一并写死。

指南不推荐改回 `create<EditorStore, Mutators>(...)`。那种写法在部分情况下是断言而不是标注。

### 3. combine 推断 state，但 set 和 get 只看到第一段

`combine` 会创建 state，不必再写柯里化：

```ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useEditorStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: (by: number) => set((state) => ({ draft: state.draft + by })),
  })),
)
```

`redux` 同样会创建 state，也不必写柯里化。

指南写明：第二段里的 `set` / `get` 被标成只包含第一段数据。`get` 的类型是 `{ theme: string; draft: number }`，实际运行时还有 `bumpDraft`。`useEditorStore.getState` 的类型是完整对象。

因此 `set({ theme: '浅色', draft: 0 }, true)` 能通过检查，但会删掉 Action。`Object.keys(get())` 实际会包含 Action 名，类型却看不见它们。

需要在声明之外复用这份推断结果时，用 `ExtractState`：

```ts
import { create, type ExtractState } from 'zustand'
import { combine } from 'zustand/middleware'

const useEditorStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  })),
)

type EditorStore = ExtractState<typeof useEditorStore>
```

`ExtractState` 从带 `getState` 的对象推断返回值。固定版本类型如此，不是另一套公共合同。

### 4. 中间件要紧贴 create

TypeScript 使用中间件时没有额外步骤，但必须立刻写在 `create` 里，上下文推断才能工作：

```ts
const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      draft: 0,
      bumpDraft: () => set({ draft: get().draft + 1 }),
    }),
    { name: 'editor-storage' },
  ),
)
```

先收成 `const myMiddlewares = (f) => persist(f, { name: 'editor-storage' })` 再传入，就会失去推断，需要更复杂的类型。本课不写那种包装。

slice 若还要包中间件，把 mutator 写进 `StateCreator` 第二参数。常用取值：

- `devtools`：`["zustand/devtools", never]`
- `persist`：`["zustand/persist", YourPersistedState]`；`YourPersistedState` 是 `partialize` 的返回类型，没有 `partialize` 时是 `Partial<T>`。对不上时可以改用 `unknown`
- `combine`：不改 store 类型，没有 mutator

`immer`、`subscribeWithSelector` 和 `redux` 的 mutator 列在指南参考表里，本课不展开它们的运行时行为。

### 5. vanilla store 做成 bounded Hook

`createStore` 返回 api，不是 Hook。指南给一份重载，模仿 `create` 的用法：

```ts
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

const editorStore = createStore<EditorStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))

function useEditorStore(): EditorStore
function useEditorStore<T>(selector: (state: EditorStore) => T): T
function useEditorStore<T>(selector?: (state: EditorStore) => T) {
  return useStore(editorStore, selector!)
}
```

组件里写 `useEditorStore((state) => state.draft)`，不必每次把 api 当第一参数传进去。

### 6. 观察推断和 replace

下面的 Demo 左侧用 `combine` 推断。点「replace 重置」会按 `true` 整份替换，Action 变成「已丢失」，再点「增加草稿」没有函数可调用。中间用 `create<EditorStore>()`，浅合并重置只写数据字段，Action 仍在。右侧把 vanilla api 收成 bounded Hook，选择规则与模块级 `create` 相同。

:::demo{id="react.zustand.learn.advanced.advanced-typescript.advanced-typescript-demo"}
:::

## 四、用法与示例

### 1. 默认继续用柯里化标注

```ts
const useEditorStore = create<EditorStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))
```

要中间件时，把中间件写在这对括号里面，不要先存成另一个函数。

### 2. 用 combine 时不要再写空括号

```ts
const useEditorStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  })),
)
```

重置写成浅合并：

```ts
useEditorStore.setState({ theme: '浅色', draft: 0 })
```

不要写 `setState({ theme: '浅色', draft: 0 }, true)`，除非你确实要丢掉 Action。

### 3. 从 store 取出类型

```ts
type EditorStore = ExtractState<typeof useEditorStore>

function labelDraft(state: EditorStore) {
  return `${state.theme} / ${state.draft}`
}
```

这份类型给工具函数、测试参数或组件 props 用。它描述形状，不改变订阅范围。

## 五、易错使用提示

:::pitfalls
### 错误：指望 TypeScript 从初始对象推断 T

**触发条件：** 写成 `create((set, get) => ({ theme: '浅色', bumpDraft: () => set({ theme: get().theme }) }))`，不标注 `T`。

**原因：** 指南写明 `T` 既出现在 `get` 的返回值，也出现在初始化函数的返回值，是不变的。TypeScript 会把 `T` 收成 `unknown`。

**后果：** `state.theme` 没有补全；错误字段名拖到运行时。

**错误示例：**

```ts
const useEditorStore = create((set, get) => ({
  theme: '浅色',
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))
```

**正确写法：**

```ts
const useEditorStore = create<EditorStore>()((set, get) => ({
  theme: '浅色',
  draft: 0,
  bumpDraft: () => set({ draft: get().draft + 1 }),
}))
```

**验证方式：** 选择函数里输入 `state.`，应当出现 `theme`、`draft` 和 `bumpDraft`。

### 错误：combine 里 replace 为 true 只写数据字段

**触发条件：** `combine` 的第二段里调用 `set({ theme: '浅色', draft: 0 }, true)`，或对 Hook 调用 `setState(data, true)`。

**原因：** 指南写明第二段的 `set` / `get` 类型只覆盖第一段数据。`replace: true` 能通过检查，运行时却会删掉 Action。

**后果：** 重置后 `bumpDraft` 变成 `undefined`，点击按钮运行时崩溃。

**错误示例：**

```ts
const useEditorStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
    reset: () => set({ theme: '浅色', draft: 0 }, true),
  })),
)
```

**正确写法：**

```ts
const useEditorStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
    reset: () => set({ theme: '浅色', draft: 0 }),
  })),
)
```

**验证方式：** 重置后立刻调用 `bumpDraft`；函数仍在，草稿回到 `0` 后再加一。

### 错误：把中间件先收成包装函数再传入 create

**触发条件：** 写成 `const myMiddlewares = (f) => persist(f, { name: 'editor-storage' })`，再 `create<EditorStore>()(myMiddlewares(initializer))`。

**原因：** 指南写明中间件必须立刻写在 `create` 里，上下文推断才能工作。多包一层就需要高级 mutator 类型。

**后果：** `StateCreator` 对不上；`persist` 的 api 从 Hook 上消失，或编译失败。

**错误示例：**

```ts
const myMiddlewares = (f: never) => persist(f, { name: 'editor-storage' })

const useEditorStore = create<EditorStore>()(
  myMiddlewares((set, get) => ({
    theme: '浅色',
    draft: 0,
    bumpDraft: () => set({ draft: get().draft + 1 }),
  })),
)
```

**正确写法：**

```ts
const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      draft: 0,
      bumpDraft: () => set({ draft: get().draft + 1 }),
    }),
    { name: 'editor-storage' },
  ),
)
```

**验证方式：** 编译通过；Hook 上仍有 `getState`。不要为了通过检查把参数写成 `any`。

### 错误：对 combine 再写一层柯里化类型

**触发条件：** 写成 `create<EditorStore>()(combine({ theme: '浅色' }, (set) => ({ ... })))`。

**原因：** 指南写明 `combine` 会创建 state，此时不必柯里化。再标注一份 `EditorStore` 容易和推断结果打架。

**后果：** 多余的类型参数对不上，或把推断出来的 Action 覆盖成不完整形状。

**错误示例：**

```ts
const useEditorStore = create<EditorStore>()(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  })),
)
```

**正确写法：**

```ts
const useEditorStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  })),
)
```

**验证方式：** `useEditorStore.getState` 同时看到数据字段和 Action，不必再手写交叉类型。

### 错误：把 vanilla api 当 Hook 调用，却以为类型会帮忙

**触发条件：** `const editorStore = createStore<EditorStore>()(...)` 之后写成 `editorStore((state) => state.draft)`。

**原因：** `createStore` 返回对象。类型检查应当拦住把 api 当函数调用，但不能代替 `useStore`。指南的 bounded Hook 只是把 `useStore(api, selector)` 收起来。

**后果：** 编译失败；若被断言成函数，运行时不是 Hook。

**错误示例：**

```ts
const editorStore = createStore<EditorStore>()((set) => ({
  theme: '浅色',
  draft: 0,
  bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
}))

const draft = editorStore((state) => state.draft)
```

**正确写法：**

```ts
function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  return useStore(editorStore, selector)
}

const draft = useEditorStore((state) => state.draft)
```

**验证方式：** 组件订阅入口是 `useStore` 或 bounded Hook；非组件代码只使用 `getState`。
:::

## 六、原理与适用场景

### 1. 官方事实

高级 TypeScript 指南写明：要把 `create(...)` 写成 `create<T>()(...)`，因为 `T` 是不变的，无法从初始值推断。柯里化用来只标注 state。`combine` 会创建 state，不必柯里化；它的 `set` / `get` 类型只覆盖第一段，`replace: true` 可能删掉 Action。`ExtractState` 从已有 store 取出类型。中间件必须立刻写在 `create` 里。vanilla store 可以用重载做成 bounded `useStore`。

固定版本 `src/vanilla.ts` 里 `ExtractState` 从 `getState` 的返回值推断。这是类型定义，不是另一套运行时 API。

### 2. 课程推导

高级 TypeScript 不改 `set`、选择函数或多实例规则。它只决定类型从哪里来：手写 `T`、让 `combine` 推断，或从已有 api 取出。中间件包装函数一旦离开 `create` 的参数位置，推断就停。

### 3. 适用边界

本课不编写自定义 middleware，不展开高阶 mutator、`create` 非柯里化重载、`createWithEqualityFn`、自动生成 Selector。`immer` 和 `subscribeWithSelector` 只出现在 mutator 对照表，运行时行为留给对应课程。Slices 的 `StateCreator` 四参数已经在 Slices Pattern 里讲过，这里只说明中间件 mutator 往第二参数填。

## 七、练习

:::exercise
### 用 combine 推断，并用 ExtractState 取出类型

**要求：** 从 `zustand` 导入 `create` 和 `ExtractState`，从 `zustand/middleware` 导入 `combine`。用 `combine` 创建 store，第一段是 `{ theme: '浅色', draft: 0 }`，第二段提供 `bumpDraft`，内部用 `set((state) => ({ draft: state.draft + 1 }))`。不要写 `create<...>()`。用 `ExtractState<typeof useEditorStore>` 得到 `EditorStore`。再写 `DraftLabel`，用 `useEditorStore((state) => state.draft)` 显示草稿。重置必须浅合并，不要传 `true`。

**验收：** `EditorStore` 含 `theme`、`draft` 和 `bumpDraft`。调用 `bumpDraft` 后草稿加一。调用 `setState({ theme: '浅色', draft: 0 })` 后 `bumpDraft` 仍是函数。

**参考答案：**

```tsx
import { create, type ExtractState } from 'zustand'
import { combine } from 'zustand/middleware'

const useEditorStore = create(
  combine({ theme: '浅色', draft: 0 }, (set) => ({
    bumpDraft: () => set((state) => ({ draft: state.draft + 1 })),
  })),
)

type EditorStore = ExtractState<typeof useEditorStore>

function DraftLabel() {
  const draft = useEditorStore((state) => state.draft)
  return <p>{draft}</p>
}

function resetEditor() {
  useEditorStore.setState({ theme: '浅色', draft: 0 })
}

function bump(store: EditorStore) {
  store.bumpDraft()
}
```
:::

## 八、本节小结

- `T` 无法从初始值推断，要手写或改用 `combine`。
- 柯里化空括号只标注 state，让其余类型继续推断。
- `combine` 的 `replace: true` 可以删掉 Action。
- 中间件要紧贴 `create`；vanilla api 用 bounded `useStore` 再进组件。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 Advanced TypeScript Guide](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/advanced-typescript.md) - 不变泛型、柯里化、combine、ExtractState、中间件推断、bounded useStore、mutator 对照。
- [Zustand 5.0.15 vanilla ExtractState](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - ExtractState 从 getState 推断。
- [TypeScript issue 10571](https://github.com/microsoft/TypeScript/issues/10571) - 不能只填一部分泛型参数。
