---
id: react.zustand.learn.basics.get-current-state
type: lesson
title: get 当前状态
summary: 在 Store Action 中使用 get 读取当前 State，并据此决定下一步写入。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.zustand.learn.basics.set-state-updates
related:
  - react.zustand.learn.basics.set-state-updates
  - react.zustand.learn.basics.state-and-actions
tags:
  - Zustand
  - get
  - Action
  - 当前状态
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-09
objectives:
  - 能说明 create 初始化函数的 get 参数用于读取当前 Store 快照。
  - 能在 Action 内部调用 get()，而不是在初始化函数同步阶段读取状态。
  - 能区分 get() 的一次性读取与 set 函数式更新中的 state 参数。
  - 能用 get() 读取多个字段，或调用同一份 Store 中的其他 Action。
  - 能避免把 get() 当成组件订阅，或把读到的对象直接改掉。
recap:
  - get 是 create 初始化函数的第二个参数，调用后返回当前完整 Store 快照。
  - 只在 Store 创建完成后的 Action 中调用 get；初始化阶段同步调用不安全。
  - 函数式 set 适合在同一次写入里基于前一个 State 计算新值；get 适合在写入之外先读取，再决定调用哪个 Action 或写哪些字段。
  - get() 不会订阅组件，读到的对象也不能直接修改；改变状态仍然要走 set 或已有 Action。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 create API
    url: https://zustand.docs.pmnd.rs/reference/apis/create
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - create 的初始化函数接收 set、get 和 store。
      - set、get 和 store 不得在初始化阶段同步调用，只应在 Store 创建完成后的 Action 中使用。
  - title: Zustand 5.0.15 README
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 官方把 get 说明为在 Action 中读取当前状态的入口。
      - set 的函数式更新可以基于前一个 State 计算新值，Action 仍可通过 get 在更新函数之外读取状态。
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - 初始化函数的第二个参数就是 getState，实现为返回当前 state 变量。
      - 当前 state 是在 createState(setState, getState, api) 执行后才完成赋值，因此初始化同步阶段不应读取。
---

# get 当前状态

## 一、学习目标

- 识别 `create` 初始化函数中的 `get` 参数。
- 在 Action 内部调用 `get()`，读取调用当下的 Store 快照。
- 判断何时使用 `get()`，何时使用 `set((state) => ...)`。
- 用 `get()` 读取多个字段，或转调同一份 Store 里的其他 Action。

## 二、为什么需要 get

上一课已经能用 `set` 写入部分 State。很多 Action 在写入之前还要先看一眼当前事实：标题是什么、是否已经保存过、该调用哪一个已有 Action。

函数式 `set((state) => ...)` 能在**同一次写入**里拿到前一个 State。如果读取发生在写入之外，例如先读标题再决定状态文案，或先调用 `save()` 再更新发布信息，就需要一个不绑在这次 `set` 上的读取入口。

`get` 就是这个入口。它返回调用当下的完整 Store 快照，让 Action 基于当前事实做判断，而不是闭包住创建 Store 时的初始值，也不依赖组件某次渲染读到的字段。

## 三、核心概念

### 1. get 是初始化函数的第二个参数

`create` 的初始化函数会收到 `set`、`get` 和 `store`：

```tsx
const useDraftStore = create<DraftStore>()((set, get) => ({
  title: '未命名草稿',
  saveCount: 0,
  captureTitle: () => {
    const title = get().title
    set({ statusMessage: `当前标题：${title}` })
  },
}))
```

`get` 是一个无参函数。调用 `get()` 得到当前 Store 对象，其中既包含 State 字段，也包含已经声明的 Action。

### 2. 只在 Action 中调用 get

官方要求：`set`、`get` 和 `store` 不得在初始化阶段同步调用，只应在 Store 创建完成后使用，例如写在 Action 方法里。

下面这种写法不安全：

```tsx
const useDraftStore = create<DraftStore>()((set, get) => {
  const title = get().title
  return {
    title: '未命名草稿',
    logTitle: () => console.log(title),
  }
})
```

初始化函数还在返回初始对象，当前 `state` 尚未完成赋值。正确做法是把 `get()` 放进 Action 函数体，等组件或其他 Action 真正调用时再读取。

### 3. get() 返回调用当下的快照

每次调用 `get()` 都会读取 Store 此刻保存的值：

```tsx
rename: (title: string) => set({ title }),
snapshot: () => {
  const current = get()
  set({ lastSnapshot: current.title })
},
```

如果先 `rename('发布稿')` 再 `snapshot()`，`get().title` 是 `'发布稿'`，不是初始标题。`get()` 不会记住上一次读取，也不会让 React 组件自动刷新。

### 4. get 与函数式 set 解决不同问题

| 需求 | 选择 |
| --- | --- |
| 同一次写入要根据前一个值计算新值 | `set((state) => ({ count: state.count + 1 }))` |
| 在写入之外读取当前字段 | `const title = get().title` |
| 先读取，再调用另一个 Action | `get().save()` |
| 一次性读取多个字段再组合写入 | `const { title, notes } = get()` |

函数式 `set` 把“读旧值”和“写新值”放在同一次更新里。`get()` 把读取从这次 `set` 中拿出来，适合判断、转调 Action，或组合多个字段后的另一次写入。

只做 `count + 1` 时，优先用函数式 `set`。需要先看当前标题、再决定调用 `save` 还是更新文案时，使用 `get()`。

### 5. get() 不是组件订阅

组件要观察字段变化，仍然通过 Store Hook 选择字段。`get()` 只在被调用的那一瞬间读取，不会建立订阅：

```tsx
const title = useDraftStore((state) => state.title)
const captureTitle = useDraftStore((state) => state.captureTitle)
```

不要在组件渲染中调用 `useDraftStore.getState()` 来代替 Hook，也不要把 `get` 从初始化函数里拿出去给组件当数据源。本课只处理 Action 内部的 `get`。

## 四、用法与示例

### 1. 在 Action 中读取单个字段

草稿标题已经由 `rename` 写入 Store。摘要 Action 不接收新标题，而是读取当前标题：

```tsx
type DraftStore = {
  title: string
  summary: string
  rename: (title: string) => void
  summarize: () => void
}

const useDraftStore = create<DraftStore>()((set, get) => ({
  title: '未命名草稿',
  summary: '尚未生成',
  rename: (title: string) => set({ title }),
  summarize: () => {
    const title = get().title
    set({ summary: `摘要：${title}` })
  },
}))
```

`summarize` 的意图是“根据当前标题生成摘要”。当前标题以 Store 为准，不从组件闭包里再传一遍。

### 2. 一次读取多个字段

保存 Action 需要同时看到标题和备注：

```tsx
type DraftStore = {
  title: string
  notes: string
  saveCount: number
  statusMessage: string
  save: () => void
}

const useDraftStore = create<DraftStore>()((set, get) => ({
  title: '未命名草稿',
  notes: '',
  saveCount: 0,
  statusMessage: '等待保存',
  save: () => {
    const { title, notes, saveCount } = get()
    set({
      saveCount: saveCount + 1,
      statusMessage: `已保存《${title}》，备注长度 ${notes.length}`,
    })
  },
}))
```

这里用 `get()` 取出多个字段，再一次性写入相关结果。如果只是给 `saveCount` 加一，写成 `set((state) => ({ saveCount: state.saveCount + 1 }))` 更直接；组合文案时，`get()` 更清楚。

### 3. 通过 get 调用其他 Action

发布前先保存，再改状态文案：

```tsx
type DraftStore = {
  title: string
  saveCount: number
  statusMessage: string
  save: () => void
  publish: () => void
}

const useDraftStore = create<DraftStore>()((set, get) => ({
  title: '未命名草稿',
  saveCount: 0,
  statusMessage: '未发布',
  save: () => set((state) => ({ saveCount: state.saveCount + 1 })),
  publish: () => {
    get().save()
    set({ statusMessage: `已发布《${get().title}》` })
  },
}))
```

`publish` 复用 `save`，而不是把保存规则再写一遍。`get().save()` 调用的是当前 Store 里的 Action；`save` 内部的函数式 `set` 仍负责累计次数。

转调完成后如果还要读最新字段，应再次调用 `get()`。不要在调用其他 Action 之前把快照存进局部变量，再拿这份旧快照当最新事实。

### 4. 观察 Action 如何读取当前 State

下面的 Demo 用同一份草稿 Store 演示三件事：`get()` 捕获当前标题和备注；保存 Action 读取多个字段后累计次数；发布 Action 先转调 `save`，再根据最新快照更新文案。

:::demo{id="react.zustand.learn.basics.get-current-state.get-current-state-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：在初始化函数里同步调用 get

**触发条件：** 在 `create((set, get) => { ... })` 的函数体中直接写 `get()`，而不是写在返回对象的 Action 里。

**原因：** 初始化函数执行时，Store 还在用这次返回值给当前 `state` 赋值，同步读取不安全。

**后果：** 读到 `undefined` 或不完整状态，后续 Action 也会闭包住错误值。

**错误示例：**

```tsx
const useDraftStore = create<DraftStore>()((set, get) => {
  const title = get().title
  return {
    title: '未命名草稿',
    logTitle: () => console.log(title),
  }
})
```

**正确写法：**

```tsx
const useDraftStore = create<DraftStore>()((set, get) => ({
  title: '未命名草稿',
  logTitle: () => {
    console.log(get().title)
  },
}))
```

**验证方式：** 搜索初始化函数，确认 `get()` 只出现在 Action 函数体内。

### 错误：创建 Store 时保存一次 get() 结果

**触发条件：** 在模块顶层或初始化阶段把 `get()` 存进变量，Action 一直使用这份引用。

**原因：** `get()` 返回的是调用当下的快照；只调用一次，就永远停在那一次。

**后果：** 标题已经改过，Action 仍按旧标题生成摘要或状态文案。

**错误示例：**

```tsx
const useDraftStore = create<DraftStore>()((set, get) => {
  const snapshot = get()
  return {
    title: '未命名草稿',
    summarize: () => set({ summary: snapshot.title }),
  }
})
```

**正确写法：**

```tsx
summarize: () => {
  const title = get().title
  set({ summary: `摘要：${title}` })
},
```

**验证方式：** 先修改标题，再调用读取类 Action，确认文案使用的是修改后的值。

### 错误：把 get() 当成组件订阅

**触发条件：** 在组件渲染中调用 `get()` 或 `useDraftStore.getState()`，期望界面随 Store 更新。

**原因：** `get()` 只读取一次，不注册 React 订阅。

**后果：** Store 已经变化，组件仍显示旧值，或根本不会重渲染。

**错误示例：**

```tsx
function DraftTitle() {
  const title = useDraftStore.getState().title
  return <p>{title}</p>
}
```

**正确写法：**

```tsx
function DraftTitle() {
  const title = useDraftStore((state) => state.title)
  return <p>{title}</p>
}
```

**验证方式：** 修改 Store 后观察组件是否更新；组件读取必须走 Hook 选择，Action 读取才使用 `get()`。

### 错误：修改 get() 返回的对象，却不调用 set

**触发条件：** 把 `get()` 的结果当成可变草稿，直接给字段赋值。

**原因：** 绕过 `set` 和 Action，Store 不会按更新路径通知订阅者。

**后果：** 内存里的对象被改了，界面和其他 Action 看不到一次规范的状态更新。

**错误示例：**

```tsx
publish: () => {
  const draft = get()
  draft.statusMessage = '已发布'
}
```

**正确写法：**

```tsx
publish: () => {
  set({ statusMessage: '已发布' })
}
```

**验证方式：** 搜索 Action 中是否存在 `get().field =`；共享字段的改变必须经过 `set` 或调用其他 Action。

### 错误：转调其他 Action 后继续使用旧快照

**触发条件：** 先 `const current = get()`，再 `current.save()`，随后仍用 `current.saveCount` 生成文案。

**原因：** `save` 已经写入新的 `saveCount`，但局部变量还是转调之前的对象。

**后果：** 状态文案显示过期次数，看起来像保存没有生效。

**错误示例：**

```tsx
publish: () => {
  const current = get()
  current.save()
  set({ statusMessage: `保存 ${current.saveCount} 次后发布` })
}
```

**正确写法：**

```tsx
publish: () => {
  get().save()
  set({ statusMessage: `保存 ${get().saveCount} 次后发布` })
}
```

**验证方式：** 让一个 Action 转调会改字段的另一个 Action，然后确认后续读取再次调用了 `get()`。
:::

## 六、原理与适用场景

### 1. 官方事实

Zustand 5.0.15 的 `create` 文档写明：初始化函数接收 `set`、`get` 和 `store`；这三项不得在初始化阶段同步调用，只应在 Store 创建完成后的 Action 中使用。README 把 `get` 解释为 Action 在函数式 `set` 之外读取当前状态的方式。

固定版本源码里，初始化函数的第二个参数就是 `getState`，实现为 `() => state`。当前 `state` 在 `createState(setState, getState, api)` 返回后才完成赋值，因此初始化同步阶段没有一份稳定快照可读。

### 2. 课程推导

`get()` 适合表达“现在 Store 里是什么”。把它留在 Action 内部，读取规则就和写入规则待在同一所有权边界：组件继续调用有名称的 Action，Action 自己决定读哪些字段、转调哪个命令、再交给 `set` 写入。

函数式 `set` 仍然是“基于前一个值计算下一个值”的首选。`get()` 补上另一类需求：读取与这次 `set` 分离，或读取后调用另一个 Action。

### 3. 适用边界

本课只处理 React 绑定 Store 初始化函数中的 `get`，以及 Action 内的同步读取。组件如何订阅字段、选择函数如何缩小渲染范围、Vanilla Store、外部 `getState` / `subscribe`、持久化和异步 Action，都不在这里展开。Action 如果中途等待外部结果，等待结束后必须重新 `get()`，不能继续使用等待前的快照。

## 七、练习

:::exercise
### 用 get 读取当前检查单

**要求：** 创建一个 `ChecklistStore`，包含 `title: string`、`doneCount: number`、`statusMessage: string`。实现三个 Action：`rename(title)` 使用对象形式的 `set` 更新标题；`markDone()` 使用函数式 `set` 把 `doneCount` 加一；`report()` 在 Action 内使用 `get()` 读取当前 `title` 和 `doneCount`，再写入 `statusMessage`，格式为 `《标题》已完成 n 项`。再写出一个组件：读取三个字段，提供改标题的输入框、`完成一项` 按钮和 `生成报告` 按钮。组件不得使用 `getState` 渲染，也不得把 `doneCount` 的计算放在组件闭包里。

**验收：** 修改标题后立刻 `report()`，文案使用新标题；连续 `markDone()` 两次再 `report()`，文案中的数字为 `2`；`report()` 不接收任何参数；组件事件只调用 Store Action。

**参考答案：**

```tsx
import { create } from 'zustand'

type ChecklistStore = {
  title: string
  doneCount: number
  statusMessage: string
  rename: (title: string) => void
  markDone: () => void
  report: () => void
}

const useChecklistStore = create<ChecklistStore>()((set, get) => ({
  title: '发布检查单',
  doneCount: 0,
  statusMessage: '尚未生成报告',
  rename: (title: string) => set({ title }),
  markDone: () => set((state) => ({ doneCount: state.doneCount + 1 })),
  report: () => {
    const { title, doneCount } = get()
    set({ statusMessage: `《${title}》已完成 ${doneCount} 项` })
  },
}))

/** 展示检查单如何用 get 读取当前标题和完成数。 */
function ChecklistPanel() {
  const title = useChecklistStore((state) => state.title)
  const doneCount = useChecklistStore((state) => state.doneCount)
  const statusMessage = useChecklistStore((state) => state.statusMessage)
  const rename = useChecklistStore((state) => state.rename)
  const markDone = useChecklistStore((state) => state.markDone)
  const report = useChecklistStore((state) => state.report)

  return (
    <section>
      <input
        value={title}
        aria-label="检查单标题"
        onChange={(event) => rename(event.target.value)}
      />
      <p>{doneCount} 项已完成</p>
      <p>{statusMessage}</p>
      <button type="button" onClick={markDone}>
        完成一项
      </button>
      <button type="button" onClick={report}>
        生成报告
      </button>
    </section>
  )
}
```
:::

## 八、本节小结

- `get` 是初始化函数的第二个参数，`get()` 返回调用当下的完整 Store 快照。
- 只在 Action 中调用 `get()`；初始化阶段同步读取不安全。
- 同一次写入里基于旧值计算新值，用函数式 `set`；写入之外的读取、判断和转调，用 `get()`。
- `get()` 不是组件订阅，返回对象也不可直接修改；改变状态仍然经过 `set` 或已有 Action。

## 九、参考资料

- [Zustand 5.0.15 create API](https://zustand.docs.pmnd.rs/reference/apis/create) - 初始化函数的 `set`、`get`、`store` 参数，以及不得同步初始化调用的限制。
- [Zustand 5.0.15 README](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - Action 中通过 `get` 读取当前状态。
- [Zustand 5.0.15 vanilla.ts](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - `getState` 返回当前 `state`，并在初始化函数返回后完成赋值。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
