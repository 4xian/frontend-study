---
id: react.zustand.learn.basics.typescript-store
type: lesson
title: TypeScript Store
summary: 为 State 和 Action 声明类型，并用 create 的柯里化写法得到一份类型完整的 React 绑定 Store。
domain: frontend
technology: react
module: zustand
stage: basics
level: beginner
estimatedMinutes: 40
prerequisites:
  - react.zustand.learn.basics.object-and-array-updates
related:
  - react.zustand.learn.basics.object-and-array-updates
  - react.zustand.learn.basics.selector
tags:
  - Zustand
  - TypeScript
  - create
  - Store 类型
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能用 type 或 interface 描述 State 字段和 Action 签名。
  - 能使用 create<Store>()((set, get) => ...) 的柯里化写法创建类型完整的 Store。
  - 能让选择函数和 Action 参数从 Store 类型推断出来。
  - 能识别缺少柯里化空括号、漏写 Action 类型，以及用 any 放弃检查的问题。
recap:
  - 先声明 Store 类型，再把这份类型传给 create。
  - 基础 TypeScript 用法是 create<Store>()(initializer)，中间多一对空括号。
  - 选择函数的 state 参数和 Action 的参数都会从 Store 类型得到补全和检查。
  - 中间件、高级泛型和自定义 mutator 不属于这份基础写法。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 README TypeScript Usage
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 基础 TypeScript 用法只需把 create(...) 写成 create<State>()(...)。
  - title: Zustand Beginner TypeScript Guide
    url: https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript
    sourceType: api-doc
    appliesTo: Zustand 5.0.15
    claims:
      - 用 interface 同时描述状态字段和 Action，泛型会强制 Store 匹配该形状。
      - create 使用柯里化形式，得到 UseBoundStore 绑定的类型化 Hook。
  - title: Zustand 5.0.15 React create types
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - create 具有 create<T>()(initializer) 这一重载，用来先固定 State 类型再接收初始化函数。
---

# TypeScript Store

## 一、学习目标

- 为 State 字段和 Action 签名写出明确类型。
- 使用 `create<Store>()((set) => ...)` 创建类型完整的 Store。
- 在组件里用选择函数读取字段，并得到参数与返回值的类型检查。
- 区分这份基础写法和中间件、高级泛型。

## 二、为什么需要类型化 Store

前面几课的示例已经在用 TypeScript，但重点在 `set`、`get` 和选择函数。如果 Store 形状只靠初始化对象“看起来像”，漏写一个 Action、把 `count` 写成字符串，往往要等到组件运行才发现。

官方 README 把基础 TypeScript 用法说得很短：没有额外概念，只要把 `create(...)` 写成 `create<State>()(...)`。这一对空括号让 TypeScript 先固定 Store 类型，再检查初始化函数有没有交齐字段。

类型化之后，选择 `state.title` 会有补全，`rename(title)` 也只能传入字符串。这不是新的运行时 API，而是给已经会用的 Store 补上一份合同。

## 三、核心概念

### 1. 用类型同时描述 State 和 Action

官方入门把数据和 Action 写在同一个 interface 里：

```ts
interface NoteStore {
  title: string
  pinned: boolean
  rename: (title: string) => void
  togglePinned: () => void
}
```

也可以拆成两段再交叉，方便复用初始值类型：

```ts
type NoteState = {
  title: string
  pinned: boolean
}

type NoteActions = {
  rename: (title: string) => void
  togglePinned: () => void
}

type NoteStore = NoteState & NoteActions
```

两种写法都成立。关键是 Action 必须出现在 Store 类型里，不能只给数据字段写类型。

### 2. 使用柯里化的 create

基础写法是先传入类型参数，再调用一次得到初始化函数槽位：

```ts
const useNoteStore = create<NoteStore>()((set) => ({
  title: '课堂笔记',
  pinned: false,
  rename: (title) => set({ title }),
  togglePinned: () => set((state) => ({ pinned: !state.pinned })),
}))
```

`create<NoteStore>()` 这一步固定 `T = NoteStore`。后面的 `(set) => ({ ... })` 必须返回这份类型：少字段、字段类型不对，TypeScript 会在 Store 文件里报错，而不是拖到组件。

官方 README 强调：基础 TypeScript 用法不需要别的技巧，就是这组柯里化括号。

### 3. set 和 get 从 Store 类型推断

初始化函数里的 `set`、`get` 会按 `NoteStore` 工作：

```ts
const useNoteStore = create<NoteStore>()((set, get) => ({
  title: '课堂笔记',
  pinned: false,
  rename: (title) => set({ title }),
  publish: () => {
    const { title, pinned } = get()
    set({ title: pinned ? `${title}（置顶）` : title })
  },
  togglePinned: () => set((state) => ({ pinned: !state.pinned })),
}))
```

`set({ title })` 只能写入 `NoteStore` 里已有的数据字段。`get().title` 的类型是 `string`。不必再给 `set` 手工写泛型。

### 4. 组件里的选择函数也是类型化的

Hook 的选择函数参数就是 Store 类型：

```tsx
function NoteTitle() {
  const title = useNoteStore((state) => state.title)
  const rename = useNoteStore((state) => state.rename)
  return <input value={title} onChange={(event) => rename(event.target.value)} />
}
```

`state.title` 有补全。写成 `state.titel` 会在编译期失败。`rename` 的参数必须是 `string`。这些检查发生在组件文件，和运行时订阅规则是同一套 Hook。

### 5. 类型不会改变 Store 的运行方式

类型化 Store 仍然是模块作用域里的一份 React 绑定 Store。不需要 Provider，选择函数仍然用 `Object.is` 比较选中值，`set` 仍然浅合并顶层字段。TypeScript 只检查形状，不替换上一课的不可变更新规则。

## 四、用法与示例

### 1. 从类型到 Store

先写类型，再写初始值和 Action：

```ts
type TimerState = {
  seconds: number
  running: boolean
}

type TimerActions = {
  tick: () => void
  toggle: () => void
  reset: () => void
}

type TimerStore = TimerState & TimerActions

const initialTimerState: TimerState = {
  seconds: 0,
  running: false,
}

const useTimerStore = create<TimerStore>()((set) => ({
  ...initialTimerState,
  tick: () => set((state) => ({ seconds: state.seconds + 1 })),
  toggle: () => set((state) => ({ running: !state.running })),
  reset: () => set(initialTimerState),
}))
```

`initialTimerState` 只包含数据字段，避免把 Action 放进重置快照。Store 类型则同时包含数据和 Action。

### 2. 在组件中使用类型化选择

```tsx
function TimerPanel() {
  const seconds = useTimerStore((state) => state.seconds)
  const running = useTimerStore((state) => state.running)
  const toggle = useTimerStore((state) => state.toggle)
  const reset = useTimerStore((state) => state.reset)

  return (
    <section>
      <p>{seconds} 秒</p>
      <p>{running ? '进行中' : '已暂停'}</p>
      <button type="button" onClick={toggle}>
        切换
      </button>
      <button type="button" onClick={reset}>
        重置
      </button>
    </section>
  )
}
```

每个选择函数只取一个字段或一个 Action，类型从 `TimerStore` 推断。不要为了“一次拿到全部类型”而改回 `useTimerStore()`，那会重新订阅整份 Store。

### 3. 观察类型化 Store 的运行结果

下面的 Demo 用 `NoteStore` 类型创建一份笔记 Store。运行时行为和普通 Store 相同：改标题、切换置顶、重置。打开源码可以看到 `create<NoteStore>()(...)` 和字段类型如何写在一起。

:::demo{id="react.zustand.learn.basics.typescript-store.typescript-store-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：写成 create&lt;Store&gt;(initializer) 而漏掉空括号

**触发条件：** 写成 `create<NoteStore>((set) => ({ ... }))`，没有 `create<NoteStore>()(...)`。

**原因：** 官方基础用法依赖柯里化重载：先 `create<T>()` 固定类型，再接收初始化函数。少一对括号会走到另一条重载，中间件和推断更容易出错。

**后果：** 简单 Store 有时仍能编译，但 `set` / `get` 推断不稳定，后续加上类型约束时会突然报错。

**错误示例：**

```ts
const useNoteStore = create<NoteStore>((set) => ({
  title: '课堂笔记',
  pinned: false,
  rename: (title) => set({ title }),
  togglePinned: () => set((state) => ({ pinned: !state.pinned })),
}))
```

**正确写法：**

```ts
const useNoteStore = create<NoteStore>()((set) => ({
  title: '课堂笔记',
  pinned: false,
  rename: (title) => set({ title }),
  togglePinned: () => set((state) => ({ pinned: !state.pinned })),
}))
```

**验证方式：** 搜索 `create<`，确认类型参数后面紧跟 `()`，再写初始化函数。

### 错误：类型只写数据字段，漏掉 Action

**触发条件：** `type NoteStore = { title: string; pinned: boolean }`，初始化函数却返回 `rename`。

**原因：** 泛型要求返回值匹配 `NoteStore`。多出来的 Action 要么被当成多余属性报错，要么组件侧看不到这些方法的类型。

**后果：** 组件调用 `rename` 时没有补全，或 Store 文件编译失败。

**错误示例：**

```ts
type NoteStore = {
  title: string
  pinned: boolean
}

const useNoteStore = create<NoteStore>()((set) => ({
  title: '课堂笔记',
  pinned: false,
  rename: (title: string) => set({ title }),
}))
```

**正确写法：**

```ts
type NoteStore = {
  title: string
  pinned: boolean
  rename: (title: string) => void
}
```

**验证方式：** 在组件里输入 `useNoteStore((state) => state.`，确认 Action 出现在补全列表中。

### 错误：用 any 关掉 Store 类型

**触发条件：** 写成 `create<any>()`，或把选择结果断言成 `any`。

**原因：** `any` 会关闭字段名和 Action 参数检查，等于回到无类型对象。

**后果：** 拼错字段、传错参数都拖到运行时才暴露。

**错误示例：**

```ts
const useNoteStore = create<any>()((set) => ({
  title: '课堂笔记',
  rename: (title) => set({ title }),
}))
```

**正确写法：**

```ts
const useNoteStore = create<NoteStore>()((set) => ({
  title: '课堂笔记',
  pinned: false,
  rename: (title) => set({ title }),
  togglePinned: () => set((state) => ({ pinned: !state.pinned })),
}))
```

**验证方式：** 故意写错字段名，确认 TypeScript 报错；如果没报错，就是类型被放宽了。

### 错误：重置时把 Action 一起覆盖成 undefined

**触发条件：** 类型是 `NoteStore`，却 `set({ title: '课堂笔记', pinned: false })` 时使用了 `replace: true`，或重置对象的类型被写成整个 Store。

**原因：** 数据快照不应包含 Action。用整份 Store 类型去描述初始值，容易在重置时漏掉函数字段。

**后果：** 重置后 `rename` 变成 `undefined`，点击按钮运行时崩溃。

**错误示例：**

```ts
const initialNote: NoteStore = {
  title: '课堂笔记',
  pinned: false,
  rename: () => undefined,
  togglePinned: () => undefined,
}
```

**正确写法：**

```ts
const initialNoteState: NoteState = {
  title: '课堂笔记',
  pinned: false,
}

reset: () => set(initialNoteState),
```

**验证方式：** 重置后立刻调用一个 Action，确认函数仍然存在。

### 错误：以为写了类型就可以跳过选择函数

**触发条件：** 写成 `const note: NoteStore = useNoteStore()`，认为类型已经限制了订阅范围。

**原因：** 类型只描述形状，不改变默认选择整份 State 的运行时行为。

**后果：** 任意字段变化都会让这个组件重渲染。

**错误示例：**

```tsx
function NoteTitle() {
  const note: NoteStore = useNoteStore()
  return <p>{note.title}</p>
}
```

**正确写法：**

```tsx
function NoteTitle() {
  const title = useNoteStore((state) => state.title)
  return <p>{title}</p>
}
```

**验证方式：** 只改 `pinned` 时，标题组件的渲染次数不应增加。
:::

## 六、原理与适用场景

### 1. 官方事实

README 的 TypeScript Usage 写明：基础 TypeScript 没有额外步骤，只要把 `create(...)` 写成 `create<State>()(...)`。入门 TypeScript 指南用 interface 同时描述状态和 Action，并说明 `<BearState>` 会强制 Store 匹配该形状；`create` 使用柯里化形式，得到 `UseBoundStore<StoreApi<BearState>>`。

固定版本 `src/react.ts` 里 `Create` 有两条重载：一条直接接收初始化函数，一条是 `create<T>()` 再返回接收初始化函数的函数。基础课程使用第二条，以便先固定 `T`。

### 2. 课程推导

类型化 Store 的最小模型是：先写形状，再用柯里化 `create` 把形状交给初始化函数，最后在选择函数里复用同一份形状。运行时规则不变，TypeScript 只是把“漏字段、写错参数”提前到编译期。

### 3. 适用边界

本课只覆盖 State、Action 类型和 `create<Store>()(...)`。`persist`、`devtools`、`combine`、自定义 Middleware、高级泛型以及 `createWithEqualityFn` 都不在这里展开。

## 七、练习

:::exercise
### 为计数 Store 补上类型

**要求：** 声明 `CounterState`（`count: number`）、`CounterActions`（`inc()`、`reset()`）和 `CounterStore`。用 `create<CounterStore>()(...)` 创建 Store。写出 `CountPanel`，只选择 `count`；写出 `CounterControls`，分别选择两个 Action。不要使用 `any`，不要漏掉柯里化空括号。

**验收：** `inc` 不接受参数；选择函数中的 `state.count` 类型为 `number`；组件能显示当前计数并重置回 `0`。

**参考答案：**

```tsx
import { create } from 'zustand'

type CounterState = {
  count: number
}

type CounterActions = {
  inc: () => void
  reset: () => void
}

type CounterStore = CounterState & CounterActions

const initialCounterState: CounterState = {
  count: 0,
}

const useCounterStore = create<CounterStore>()((set) => ({
  ...initialCounterState,
  inc: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set(initialCounterState),
}))

/** 只选择当前计数。 */
function CountPanel() {
  const count = useCounterStore((state) => state.count)
  return <p>{count}</p>
}

/** 分别选择增加和重置 Action。 */
function CounterControls() {
  const inc = useCounterStore((state) => state.inc)
  const reset = useCounterStore((state) => state.reset)

  return (
    <>
      <button type="button" onClick={inc}>
        加一
      </button>
      <button type="button" onClick={reset}>
        重置
      </button>
    </>
  )
}
```
:::

## 八、本节小结

- 用类型同时描述数据字段和 Action 签名。
- 基础写法是 `create<Store>()(initializer)`，不要漏掉中间的 `()`。
- 选择函数和 Action 参数从同一份 Store 类型推断。
- 类型不改变订阅范围，也不替代不可变更新。

## 九、参考资料

- [Zustand 5.0.15 README TypeScript Usage](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - 基础用法是 `create<State>()(...)`。
- [Zustand Beginner TypeScript Guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript) - 用 interface 约束 Store 形状，并使用柯里化 `create`。
- [Zustand 5.0.15 react.ts](https://github.com/pmndrs/zustand/blob/v5.0.15/src/react.ts) - `create<T>()` 重载。
- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版本。
