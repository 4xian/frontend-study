---
id: react.zustand.learn.intermediate.state-reset
type: lesson
title: 状态重置
summary: 把 Store 恢复到创建时的初始快照，并区分浅合并重置和整份替换重置。
domain: frontend
technology: react
module: zustand
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - react.zustand.learn.intermediate.async-action
related:
  - react.zustand.learn.intermediate.async-action
  - react.zustand.learn.basics.set-state-updates
tags:
  - Zustand
  - 状态重置
  - getInitialState
  - set
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-10
objectives:
  - 能抽出一份只含 State 的 initialState，并用 set(initialState) 把已有字段写回初始值。
  - 能在 Action 里调用 store.getInitialState()，拿到创建时的完整快照。
  - 能说明需要清掉后来多出来的字段时，应 set(store.getInitialState(), true)。
  - 能识别用只含 State 的对象配合 replace true 会把 Action 一并清掉。
recap:
  - 重置是一次有名称的写入，不是卸载组件，也不是新的 Store API。
  - set(initialState) 默认浅合并：已有初始字段写回，Action 保留，额外字段还在。
  - getInitialState 返回创建时的完整对象，包含 State 和 Action。
  - 要清掉额外字段时用替换写入；不要用只含 State 的对象做 replace。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand Beginner TypeScript Resetting the Store
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 重置适用于登出或清空会话。
      - "官方示例抽出 `initialState`，用 `reset: () => set(initialState)` 写回。"
  - title: Zustand 5.0.15 How to reset state
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - "单份 Store 的重置写法是 `set(store.getInitialState())`。"
      - "一次重置多份 Store 时，官方示例使用 `store.setState(store.getInitialState(), true)`。"
  - title: Zustand 5.0.15 README Overwriting state
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/README.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - set 的第二个参数默认为 false，传入 true 时改为替换整份状态模型。
      - "替换时不要清掉仍需使用的部分，例如 Action。"
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - getInitialState 返回创建时保存的 initialState。
      - setState 在 replace 为 true 时用下一份对象整体替换当前 state。
---

# 状态重置

## 一、学习目标

- 抽出一份只含 State 的 `initialState`，用 `set(initialState)` 写回已有字段。
- 在 Action 里调用 `store.getInitialState()`，拿到创建时的完整快照。
- 需要清掉后来多出来的字段时，使用 `set(store.getInitialState(), true)`。
- 识别“只含 State 的对象 + replace true”会把 Action 清掉。

## 二、为什么需要重置

登出、清空会话、放弃草稿时，界面要回到创建 Store 时的事实，而不是卸载整个应用。逐个字段手写回初始值容易漏。漏一个，`loading` 或临时备注就会留在下一轮会话里。

Zustand 没有单独的 `reset` API。重置仍是一次 `set`。官方 Beginner TypeScript 把它写成 Action：抽出 `initialState`，`reset: () => set(initialState)`。How to reset state 则用初始化函数的第三个参数 `store`，执行 `set(store.getInitialState())`。

两种写法都是把“回到起点”变成有名称的业务命令。组件调用 `reset()`，不必知道初始值写在哪。

## 三、核心概念

### 1. 重置是一次写入，不是卸载 Store

Store 模块导入后一直存在。重置不会重新执行 `create`，也不会自动取消进行中的异步 Action。它只是再写一次状态。

因此重置也要封装成 Action，并继续用选择函数订阅字段。上一课的异步 Action 若在重置后才返回，仍可能把过期结果写回来；过期判断继续用 `get()`，不在这里展开。

### 2. 抽出 initialState，浅合并写回

```tsx
const initialState = { name: '访客', theme: '浅色' }

type SessionStore = typeof initialState & {
  rename: (name: string) => void
  reset: () => void
}

const useSessionStore = create<SessionStore>()((set) => ({
  ...initialState,
  rename: (name) => set({ name }),
  reset: () => set(initialState),
}))
```

`set(initialState)` 默认浅合并。`name` 和 `theme` 写回初始值，`rename` 和 `reset` 这些未出现在 `initialState` 里的顶层字段继续保留。这是 Beginner TypeScript 的写法。

### 3. getInitialState 是创建时的完整快照

`create` 的初始化函数第三个参数是 `store`。`store.getInitialState()` 返回创建完成时保存的那份对象，里面既有 State，也有 Action。

```tsx
const useSessionStore = create<SessionStore>()((set, _get, store) => ({
  ...initialState,
  extra: '',
  rename: (name) => set({ name }),
  reset: () => set(store.getInitialState()),
}))
```

How to reset state 的单 Store 示例就是 `set(store.getInitialState())`。它同样默认浅合并：初始字段写回，当前对象上多出来、但不在这份快照里的键还在。

### 4. 替换才能清掉额外字段，且必须带上 Action

`set` 的第二个参数默认为 `false`。传入 `true` 时不再合并，整份状态模型被下一份对象替换。README 写明：替换时不要清掉仍需使用的部分，例如 Action。

```tsx
reset: () => set(store.getInitialState(), true)
```

`getInitialState()` 含 Action，替换后按钮仍可调用。How to reset state 在一次重置多份 Store 时，用的就是 `store.setState(store.getInitialState(), true)`。

只含 State 的对象不能这样替换：

```tsx
reset: () => set(initialState, true) // 错误：Action 被清掉
```

`set({}, true)` 同样会清空整份 Store。

## 四、用法与示例

### 1. 用 initialState 合并重置

```tsx
const initialState = {
  name: '访客',
  theme: '浅色',
  ticks: 0,
}

const useSessionStore = create<SessionStore>()((set) => ({
  ...initialState,
  extra: '',
  rename: (name) => set({ name }),
  resetSession: () => set(initialState),
}))
```

改过姓名和主题后调用 `resetSession()`，这两个字段回到「访客」和「浅色」。`extra` 若已经被写成「草稿」，合并重置后仍是「草稿」，因为 `initialState` 里没有这个键。

### 2. 用 getInitialState 替换重置

```tsx
const useSessionStore = create<SessionStore>()((set, _get, store) => ({
  ...initialState,
  extra: '',
  setExtra: (extra) => set({ extra }),
  resetAll: () => set(store.getInitialState(), true),
}))
```

`resetAll()` 用创建时的完整快照替换当前对象。`extra` 回到 `''`，Action 仍在。

### 3. 组件只调用重置 Action

```tsx
function ResetButton() {
  const resetAll = useSessionStore((state) => state.resetAll)
  return (
    <button type="button" onClick={resetAll}>
      重置会话
    </button>
  )
}
```

不要在组件里拼一份初始对象再 `setState`。初始值的所有权在 Store。

### 4. 观察合并重置与替换重置

下面的 Demo 用同一份会话 Store：姓名、主题、临时备注、无关计数。改名和切换主题后，合并重置只写回 `initialState` 里的字段，备注还在；替换重置用 `getInitialState()` 清掉备注。增加无关计数时，姓名和主题面板不增加渲染次数。用只含 State 的对象做 `replace` 的错误写法只出现在正文示例里。

:::demo{id="react.zustand.learn.intermediate.state-reset.state-reset-demo"}
:::

## 五、易错使用提示

:::pitfalls
### 错误：用只含 State 的对象替换整份 Store

**触发条件：** 写成 `reset: () => set(initialState, true)`，而 `initialState` 只有 `name`、`theme`。

**原因：** `replace` 为 true 时下一份对象就是整份 state。Action 不在这份对象里，会被清掉。

**后果：** 第一次重置后，再点「改名」会报 Action 不是函数。

**错误示例：**

```tsx
reset: () => set(initialState, true)
```

**正确写法：**

```tsx
reset: () => set(store.getInitialState(), true)
```

**验证方式：** 替换重置后，「改名」仍能把姓名写成「林间」。

### 错误：以为合并重置会清掉后来多出来的字段

**触发条件：** Store 另有 `extra`，重置写成 `set(initialState)`，`initialState` 不含 `extra`。

**原因：** 默认浅合并只覆盖出现过的键。未出现的顶层字段保持当前值。

**后果：** 清空会话后临时备注还在，下一轮用户会看到上一轮草稿。

**错误示例：**

```tsx
reset: () => set(initialState)
```

**正确写法：**

```tsx
reset: () => set(store.getInitialState(), true)
```

**验证方式：** 先写备注再合并重置，备注仍是「草稿」；再点替换重置，备注回到「无」。

### 错误：改掉共享的 initialState 再重置

**触发条件：** 某处执行 `initialState.name = '管理员'`，之后调用 `reset()`。

**原因：** `set(initialState)` 用的是同一份对象引用。改了这份对象，重置就会写回被改过的值。

**后果：** 「重置」不再回到创建时的访客，排查时会以为 `set` 失效。

**错误示例：**

```tsx
initialState.name = '管理员'
reset: () => set(initialState)
```

**正确写法：**

```tsx
reset: () => set({ ...initialState })
```

**验证方式：** `initialState` 保持字面量，不被运行时代码改写；重置后姓名仍是「访客」。

### 错误：只写回部分字段却称为重置

**触发条件：** 写成 `reset: () => set({ name: '访客' })`，主题和计数仍保持当前值。

**原因：** 这是一次普通的部分更新，不是回到初始快照。

**后果：** 主题仍是深色，使用者以为会话已经清空。

**错误示例：**

```tsx
reset: () => set({ name: '访客' })
```

**正确写法：**

```tsx
reset: () => set(initialState)
```

**验证方式：** 改名、切主题后再重置，姓名和主题都回到初始值。

### 错误：在初始化函数同步阶段调用 getInitialState

**触发条件：** 写成 `create((set, get, store) => { const snap = store.getInitialState(); return { ... } })`。

**原因：** 创建时的 `initialState` 要等初始化函数返回后才赋值。同步阶段读取还没有这份快照。

**后果：** 读到 `undefined`，或拿到未完成的对象。

**错误示例：**

```tsx
const useSessionStore = create<SessionStore>()((set, get, store) => {
  const snap = store.getInitialState()
  return {
    ...initialState,
    reset: () => set(snap),
  }
})
```

**正确写法：**

```tsx
const useSessionStore = create<SessionStore>()((set, _get, store) => ({
  ...initialState,
  reset: () => set(store.getInitialState()),
}))
```

**验证方式：** `getInitialState` 只出现在 Action 函数体里，不出现在初始化函数的同步语句中。
:::

## 六、原理与适用场景

### 1. 官方事实

Beginner TypeScript 的 “Resetting the Store” 写明：重置适用于登出或清空会话。示例抽出 `initialState`，`reset: () => set(initialState)`。

How to reset state 写明：单份 Store 使用 `set(store.getInitialState())`。一次重置多份 Store 时，把 `store.setState(store.getInitialState(), true)` 登记到集合里再逐个调用。

README 的 “Overwriting state” 写明：`set` 第二个参数默认为 `false`；传入 `true` 时替换整份状态模型，不要清掉 Action。

`src/vanilla.ts` 里 `getInitialState` 返回创建时保存的 `initialState`。`setState` 在 `replace` 为 true 时用下一份对象整体替换当前 `state`。

### 2. 课程推导

合并重置适合“字段集合固定、只需写回已知初始值”。替换重置适合“当前对象可能多出键，必须回到创建时的形状”。替换的那一份对象必须自己带上 Action，所以用 `getInitialState()`，不用只含 State 的字面量。

### 3. 适用边界

本课只讲同一份 React 绑定 Store 的重置：`initialState` 合并、`getInitialState` 读取，以及 `replace` 清掉额外字段。一次重置多份 Store 的自定义 `create` 包装、persist 恢复后再重置、SSR hydration，都不在这里展开。

## 七、练习

:::exercise
### 为会话 Store 补上两种重置

**要求：** 已有一份会话 Store，包含 `name`、`theme`、`extra`、`ticks`。当前没有重置 Action。抽出只含 `name`、`theme`、`ticks` 的 `initialState`。增加 `resetMerge`：`set(initialState)`。增加 `resetAll`：`set(store.getInitialState(), true)`。不要用只含 State 的对象做 `replace`，不要引入 persist。

**验收：** 改名、切主题、写备注后调用 `resetMerge()`，姓名和主题回到初始值，备注仍是「草稿」；再调用 `resetAll()`，备注回到空字符串，之后仍能调用 `rename`。

**参考答案：**

```tsx
import { create } from 'zustand'

const initialState = {
  name: '访客',
  theme: '浅色',
  ticks: 0,
}

type SessionStore = typeof initialState & {
  extra: string
  rename: (name: string) => void
  toggleTheme: () => void
  setExtra: (extra: string) => void
  resetMerge: () => void
  resetAll: () => void
}

const useSessionStore = create<SessionStore>()((set, _get, store) => ({
  ...initialState,
  extra: '',
  rename: (name) => set({ name }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === '浅色' ? '深色' : '浅色' })),
  setExtra: (extra) => set({ extra }),
  resetMerge: () => set(initialState),
  resetAll: () => set(store.getInitialState(), true),
}))
```
:::

## 八、本节小结

- 重置是 Action 里的一次 `set`，不是新的 Store API。
- `set(initialState)` 浅合并：写回已有初始字段，额外字段还在，Action 保留。
- `store.getInitialState()` 是创建时的完整快照，替换重置要用它，不要用只含 State 的对象。
- 不要改共享的 `initialState`，也不要在初始化同步阶段读取 `getInitialState`。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand Beginner TypeScript Resetting the Store](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/beginner-typescript.md) - 抽出 initialState 再 set。
- [Zustand 5.0.15 How to reset state](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md) - getInitialState 与替换重置。
- [Zustand 5.0.15 README Overwriting state](https://github.com/pmndrs/zustand/blob/v5.0.15/README.md) - set 的 replace 参数会替换整份模型。
- [Zustand 5.0.15 vanilla store implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - getInitialState 与 replace 的实现。
