---
id: react.redux.learn.basics.reducer-and-immer
type: lesson
title: Reducer 与 Immer
summary: 在 Redux Toolkit 的 case reducer 中安全地表达嵌套状态更新，并理解 Immer 的不可变结果。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 80
prerequisites:
  - react.redux.learn.basics.action-and-payload
related: []
tags:
  - Redux
  - Redux Toolkit
  - Reducer
  - Immer
  - Immutable Update
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
verifiedAt: 2026-08-27
objectives:
  - 能解释 reducer 为什么不能直接修改 Redux 当前状态。
  - 能在 createSlice 的 case reducer 中使用 Immer draft 表达对象和数组更新。
  - 能区分修改 draft、返回新状态和无变化三种结果。
  - 能处理嵌套对象、数组项和原始值状态的更新边界。
  - 能通过引用比较观察 Immer 的结构共享结果。
recap:
  - Redux reducer 的结果必须保持不可变，当前状态不能被原地修改。
  - createSlice 的 case reducer 被 Immer 包装，可以修改 draft 并得到不可变的新状态。
  - 一个 case reducer 中应在“修改 draft”和“返回新状态”之间二选一。
  - 替换整个状态要 return 新值，给局部变量重新赋值不会更新 draft。
  - 嵌套对象和数组会按需复制，未改变的分支可以保持原引用。
sources:
  - title: Redux Toolkit Writing Reducers with Immer
    url: https://redux-toolkit.js.org/usage/immer-reducers
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createReducer 和 createSlice 使用 Immer，case reducer 可以安全地修改 draft。
      - case reducer 必须修改 draft 或返回新状态，不能同时进行两者。
      - 原始值状态不能通过 draft 修改，必须返回新的原始值。
      - 替换整个状态必须 return 新值，给 state 参数重新赋值不会产生更新。
      - 嵌套 draft 会按需生成不可变副本并保留未变化分支的结构共享。
  - title: Redux Toolkit 2.12.0 createReducer Source
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/createReducer.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - case reducer 的 draft 状态通过 Immer produce 执行并返回不可变结果。
      - draft 状态、不可 draft 的原始值和普通状态分别有对应的返回处理规则。
      - 不可 draft 的状态在 case reducer 返回 undefined 时会报告错误。
  - title: Immer Using produce
    url: https://immerjs.github.io/immer/produce/
    sourceType: official-reference
    appliesTo: Immer 11
    claims:
      - produce 接收基础状态和 recipe，recipe 可以修改 draft，而基础状态保持不变。
      - 只有被修改的路径需要复制，未修改的数据可以结构共享。
      - recipe 可以通过返回值替换整个结果，但通常不要同时修改 draft 和返回新值。
  - title: Redux Immutable Update Patterns
    url: https://redux.js.org/usage/structuring-reducers/immutable-update-patterns
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - Redux reducer 不得修改原始状态，手写不可变更新需要复制每一层被修改的嵌套结构。
---

# Reducer 与 Immer

## 一、学习目标

- 说明 Redux reducer 为什么要返回不可变的下一份状态。
- 在 `createSlice` 的 case reducer 中使用 draft 更新对象、数组和嵌套字段。
- 判断什么时候应该修改 draft，什么时候应该 `return` 一份新状态。
- 识别 `state = newValue`、隐式返回和原始值状态等常见陷阱。
- 用引用比较验证 Immer 只复制发生变化的路径。

## 二、为什么需要不可变更新

Reducer 接收当前状态和 action，计算下一份状态。当前状态可能同时被视图、selector、日志或其他代码持有；如果
reducer 直接修改它，调用方在 dispatch 前保存的值也会悄悄改变，引用比较也无法可靠地判断哪里发生了更新。

手写不可变更新时，必须复制每一层需要改变的对象或数组：

```ts
const nextState = {
  ...state,
  profile: {
    ...state.profile,
    name: action.payload,
  },
}
```

嵌套层级一多，复制代码容易遗漏某一层，也容易误用会改变原数组的 `sort`、`splice` 等方法。Redux Toolkit 通过
Immer 把这类复制工作封装起来，让 case reducer 可以用接近可变代码的方式表达意图，同时仍返回不可变结果。

## 三、核心概念

### 1. draft 是可修改的工作副本

`createSlice` 内的 case reducer 会收到 Immer draft，而不是应该被直接保存到外部的真实状态：

```ts
const taskSlice = createSlice({
  name: 'tasks',
  initialState: [{ id: 'task-1', done: false }],
  reducers: {
    completed: (state, action: PayloadAction<string>) => {
      const task = state.find((item) => item.id === action.payload)
      if (task) task.done = true
    },
  },
})
```

`task.done = true` 修改的是 draft。Immer 在 case reducer 结束后根据修改记录生成下一份普通状态，原状态仍保持不变。
这套语法只在 `createSlice`、`createReducer` 或显式 `produce` 的范围内成立；普通 Redux reducer 不会自动替你包裹
Immer。

### 2. 对象和数组可以直接表达局部更新

Immer 会处理常见的对象字段赋值和数组方法：

```ts
const settingsSlice = createSlice({
  name: 'settings',
  initialState: { theme: 'light', labels: ['redux'] },
  reducers: {
    darkModeEnabled: (state) => {
      state.theme = 'dark'
    },
    labelAdded: (state, action: PayloadAction<string>) => {
      state.labels.push(action.payload)
    },
  },
})
```

对于嵌套对象和数组项，只要路径上的值属于 draft，就可以继续向下修改。Immer 会复制发生变化的路径，并尽量保留
未变化分支的原引用。

### 3. 修改 draft 或返回新状态二选一

一个 case reducer 可以采用两种结果表达方式：

```ts
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    reset: () => ({ value: 0 }),
  },
})
```

`increment` 修改 draft，由 Immer 生成结果；`reset` 直接返回整棵新状态。不要在同一个函数里先修改 draft 又返回新对象，
因为 Immer 无法判断应该采用哪一个结果。

### 4. 替换整个状态必须 return

给 `state` 参数重新赋值只改变了函数内部的局部变量，不会改变 Immer 正在追踪的 draft：

```ts
// 没有产生状态更新
reset: (state) => {
  state = { value: 0 }
}

// 正确替换整棵状态
reset: () => ({ value: 0 })
```

如果只是更新某个字段，直接修改 `state.field`；如果要把状态整体替换为另一个对象或数组，使用 `return`。

### 5. 原始值状态必须返回新值

数字、字符串和布尔值没有可以被 Immer 代理的内部字段。原始值 case reducer 不能通过“修改 draft”更新，只能返回新的值：

```ts
const countSlice = createSlice({
  name: 'count',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
  },
})
```

如果 case reducer 对不可 draft 的值返回 `undefined`，Redux Toolkit 会报告错误，因为它无法从“未返回值”推断出新的
原始状态。

## 四、用法与示例

### 1. 更新嵌套对象和数组项

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Task = {
  id: string
  title: string
  done: boolean
}

type WorkspaceState = {
  filter: 'all' | 'open'
  tasks: Task[]
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    filter: 'open',
    tasks: [{ id: 'task-1', title: '阅读文档', done: false }],
  } satisfies WorkspaceState,
  reducers: {
    taskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((item) => item.id === action.payload)
      if (task) task.done = true
    },
    filterChanged: (state, action: PayloadAction<WorkspaceState['filter']>) => {
      state.filter = action.payload
    },
  },
})
```

`taskCompleted` 只会改变匹配任务及其父数组的引用；`filterChanged` 只会改变工作区对象。调用方不需要手写多层 spread，
但仍应把每个 reducer 限制在清晰的状态职责内。

### 2. 使用 `Object.assign` 更新多个字段

Immer draft 支持 `Object.assign`，适合一次写入多个相关字段：

```ts
profileUpdated: (state, action: PayloadAction<{ name: string; email: string }>) => {
  Object.assign(state.profile, action.payload)
}
```

这仍然是对 draft 的修改，不需要再返回 `state`。如果使用对象展开创建新对象，也可以直接返回新对象，但不要同时再修改
原 draft。

### 3. 删除、排序和替换数组项

常见的数组方法可以直接作用于 draft：

```ts
tasksReordered: (state) => {
  state.tasks.sort((a, b) => a.title.localeCompare(b.title))
},
taskRemoved: (state, action: PayloadAction<string>) => {
  const index = state.tasks.findIndex((task) => task.id === action.payload)
  if (index >= 0) state.tasks.splice(index, 1)
},
```

这些方法会被 Immer 记录为不可变更新。若在 case reducer 外对真实状态调用 `sort` 或 `splice`，则仍会直接修改原数组。

### 4. 用 `current` 读取可打印的 draft 快照

开发时有时需要在 case reducer 内记录工作中的状态。draft 可能是 Proxy，直接打印在浏览器中不一定易读，可以使用
Redux Toolkit 重新导出的 `current`：

```ts
import { createSlice, current } from '@reduxjs/toolkit'

const debugSlice = createSlice({
  name: 'debug',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1
      console.log(current(state))
    },
  },
})
```

`current` 用于观察，不是更新状态的替代品。生产代码应避免在 reducer 中留下依赖日志的业务逻辑。

## 五、Demo：观察 Immer 更新与结构共享

Demo 使用真实 `createSlice`、`configureStore` 和 `dispatch`。按钮分别修改嵌套任务、向 draft 数组添加标签、替换整棵
状态，并显示 action、状态 JSON 以及前后状态引用是否变化。

:::demo{id="react.redux.learn.basics.reducer-and-immer.reducer-and-immer-demo"}
观察 case reducer 如何用 draft 表达嵌套更新，以及未改变分支如何保留引用。
:::

## 六、易错使用提示

:::pitfalls
### 错误：在普通 reducer 中使用 draft 修改语法

**触发条件：** 在 `createSlice` 或 `createReducer` 之外直接写 `state.items.push(...)`，并认为它会自动安全。

**原因：** 只有 Immer `produce` 包裹的函数才会把修改转换为不可变结果。

**后果：** 原状态被原地改变，引用比较、时间旅行和日志回放可能失效。

**错误示例：**

```ts
function reducer(state: string[], action: { type: 'added'; payload: string }) {
  if (action.type === 'added') state.push(action.payload)
  return state
}
```

**正确写法：**

```ts
const slice = createSlice({
  name: 'items',
  initialState: [] as string[],
  reducers: {
    added: (state, action: PayloadAction<string>) => {
      state.push(action.payload)
    },
  },
})
```

**验证方式：** dispatch 后比较旧状态与新状态，确认旧数组内容未变化且新数组是新引用。

### 错误：同时修改 draft 并返回新状态

**触发条件：** 先执行 `state.value += 1`，再从同一个 case reducer 返回对象。

**原因：** Immer 只能接受“记录 draft 修改”或“采用返回值”其中一种结果。

**后果：** 运行时抛出关于同时修改和返回的错误，状态更新不会按预期完成。

**错误示例：**

```ts
increment: (state) => {
  state.value += 1
  return { value: state.value + 1 }
},
```

**正确写法：**

```ts
increment: (state) => {
  state.value += 1
},
```

**验证方式：** 每个 case reducer 只保留一种结果方式，并检查 dispatch 后状态只按该方式变化。

### 错误：箭头函数把数组长度隐式作为返回值

**触发条件：** 将 `state.items.push(action.payload)` 直接写成没有花括号的箭头函数。

**原因：** `push` 的返回值是数组新长度。表达式箭头函数会把这个数字作为 case reducer 的返回值，同时又已经修改了
draft。

**后果：** Immer 检测到同时修改 draft 和返回值并抛出错误。

**错误示例：**

```ts
itemAdded: (state, action: PayloadAction<string>) => state.items.push(action.payload)
```

**正确写法：**

```ts
itemAdded: (state, action: PayloadAction<string>) => {
  state.items.push(action.payload)
},
```

**验证方式：** dispatch 后确认数组新增了一项，且 reducer 没有返回 `push` 的数字结果。

### 错误：给 state 参数重新赋值

**触发条件：** 写 `state = initialState`，但没有 return。

**原因：** 这只改变了函数参数的局部绑定，没有修改 draft 的字段，也没有返回新的根状态。

**后果：** reducer 结束后状态仍保持原值，重置按钮看起来没有效果。

**错误示例：**

```ts
reset: (state) => {
  state = { value: 0 }
},
```

**正确写法：**

```ts
reset: () => ({ value: 0 }),
```

**验证方式：** dispatch reset 后读取 store.getState()，确认整个状态已替换。

### 错误：把原始值当成可修改对象

**触发条件：** 在数字或字符串状态中写 `state.value += 1`，或修改参数后不返回。

**原因：** 原始值没有可被 Immer 代理的字段。

**后果：** TypeScript 报错，或 reducer 返回 `undefined` 导致运行时错误。

**错误示例：**

```ts
const bad = createSlice({
  name: 'count',
  initialState: 0,
  reducers: {
    increment: (state) => {
      state = state + 1
    },
  },
})
```

**正确写法：**

```ts
const good = createSlice({
  name: 'count',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
  },
})
```

**验证方式：** 对原始值 reducer 检查返回值，并确认连续 dispatch 能得到递增结果。

### 错误：在 draft 外误用会改变数组的方法

**触发条件：** 对从 store 读取的真实数组直接调用 `sort`、`splice` 或 `push`。

**原因：** 这些方法本身会修改调用对象，只有 draft 代理能让 Immer 记录这种修改。

**后果：** 组件或 selector 可能在 dispatch 之外改变共享状态，产生难以追踪的更新。

**错误示例：**

```ts
const tasks = store.getState().tasks
tasks.sort(compareTasks)
```

**正确写法：**

```ts
const tasks = [...store.getState().tasks].sort(compareTasks)
```

**验证方式：** 在 reducer 外操作前后比较原数组引用和内容，确认原状态没有被修改。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Toolkit 的 `createReducer` 源码把 case reducer 的执行分成三种情况：已有 draft 时直接传入，原始值状态时直接接收并
要求返回结果，可 draft 的对象或数组则交给 Immer 的 `produce`。`createSlice` 复用这套 reducer 执行机制，因此 slice 内的
case reducer 可以安全地使用 draft 修改语法。

Immer 的 `produce` 接收基础状态和 recipe。recipe 中对 draft 的修改不会改变基础状态，Immer 会生成下一份结果，并对未修改
分支保留结构共享。recipe 也可以返回整棵新值来替换结果，但不能既修改 draft 又返回新值。

### 2. 课程推导

可以把 case reducer 看成“状态意图”的表达层：局部字段赋值和数组操作表达要改变什么，Immer 负责把意图转换为不可变副本。
这让 reducer 更接近业务语言，同时保留 Redux 依赖引用变化进行更新判断的优势。

### 3. 适用边界

本课只覆盖同步 case reducer、Immer draft 和不可变更新。`extraReducers`、异步生命周期、middleware、实体适配器和复杂
性能优化不在本课展开；普通 Redux reducer 仍必须手写不可变返回值，除非显式使用 `produce`。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个 `settingsSlice`，状态为 `{ theme: 'light' | 'dark'; tags: string[] }`。提供 `darkModeEnabled`、
`tagAdded` 和 `reset` 三个 reducer：前两个使用 draft 修改字段或数组，`reset` 返回完整初始状态。连续 dispatch 三个
action，并记录每一步的状态；另外保存 dispatch 前的状态引用，验证原状态没有被修改。

**验收：** 最终状态为 `{ theme: 'light', tags: [] }`；中间状态依次为深色主题和新增标签；`darkModeEnabled` 与 `tagAdded`
没有返回新对象，`reset` 通过返回值替换根状态；旧状态快照仍保持 dispatch 前的内容。

**参考答案：**

```ts
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

type SettingsState = {
  theme: 'light' | 'dark'
  tags: string[]
}

const initialState: SettingsState = { theme: 'light', tags: [] }

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    darkModeEnabled: (state) => {
      state.theme = 'dark'
    },
    tagAdded: (state, action: PayloadAction<string>) => {
      state.tags.push(action.payload)
    },
    reset: () => initialState,
  },
})

const store = configureStore({ reducer: settingsSlice.reducer })
const before = store.getState()
const beforeSnapshot = { theme: before.theme, tags: [...before.tags] }

store.dispatch(settingsSlice.actions.darkModeEnabled())
const dark = store.getState()

store.dispatch(settingsSlice.actions.tagAdded('immer'))
const tagged = store.getState()

store.dispatch(settingsSlice.actions.reset())
const reset = store.getState()

console.log({
  before,
  dark,
  tagged,
  reset,
  beforeStateUntouched:
    before.theme === beforeSnapshot.theme && before.tags.join(',') === beforeSnapshot.tags.join(','),
  references: {
    darkIsNewState: before !== dark,
    taggedHasNewTags: dark.tags !== tagged.tags,
    resetMatchesInitialState: reset.theme === 'light' && reset.tags.length === 0,
  },
})
```
:::

## 九、本节小结

- Redux 状态不能被 reducer 原地修改；需要复制并返回不可变的下一份状态。
- `createSlice` 的 case reducer 在 Immer draft 上执行，局部赋值和数组方法会被转换为不可变更新。
- 一个 case reducer 要么修改 draft，要么返回新状态，不能同时使用两种方式。
- 给 `state` 参数重新赋值不会替换根状态；整棵替换必须 `return`。
- 原始值状态没有可修改字段，更新时必须返回新值；未变化分支可以保持原引用。

## 十、参考资料

- [Redux Toolkit Writing Reducers with Immer](https://redux-toolkit.js.org/usage/immer-reducers) - 支持 draft、不可变更新、返回新状态和常见陷阱。
- [Redux Toolkit createReducer Source](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/createReducer.ts) - 支持 case reducer 的 Immer 执行分支。
- [Immer Using produce](https://immerjs.github.io/immer/produce/) - 支持 recipe、draft、基础状态不变和结构共享。
- [Redux Immutable Update Patterns](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns) - 支持 Redux reducer 的不可变更新要求。
