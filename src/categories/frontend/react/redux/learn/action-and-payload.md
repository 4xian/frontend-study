---
id: react.redux.learn.basics.action-and-payload
type: lesson
title: Action 与 Payload
summary: 读懂 Redux action 对象、action creator 与 payload 的职责，并用清晰的数据形状描述状态事件。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.redux.learn.basics.create-slice
related: []
tags:
  - Redux
  - Redux Toolkit
  - Action
  - Payload
  - Action Creator
appliesTo: Redux 5.0.1、Redux Toolkit 2.12.0
verifiedAt: 2026-08-27
objectives:
  - 能识别一个合法 Redux action 的 type 字段，并解释 payload、meta 与 error 的约定用途。
  - 能区分 action 对象与 action creator，并使用 creator 生成可 dispatch 的 action。
  - 能为字符串、数字和对象 payload 选择清晰的数据形状，并让 reducer 按约定读取 payload。
  - 能使用 createSlice 生成的 action creator 检查 type、payload 和 dispatch 结果。
  - 能用描述事件的 action 名称表达发生了什么，而不是把每个状态字段写成 setter。
recap:
  - action 是描述已发生事件的普通对象，type 是必需的字符串字段。
  - payload 承载事件需要的主要数据，形状由应用约定，可以是原始值或对象。
  - action creator 是返回 action 对象的函数；调用它，再把结果交给 dispatch。
  - createSlice 默认把 action creator 的单个参数放入 payload；多参数或需要整理输入时使用 prepare。
  - action 的数据契约应稳定、可读，并与处理它的 reducer 保持一致。
sources:
  - title: Redux Essentials Part 1：Action 与 Action Creator
    url: https://redux.js.org/tutorials/essentials/part-1-overview-concepts
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - action 对象至少包含 type 字符串，附加信息通常放在 payload。
      - action creator 是创建并返回 action 对象的函数。
  - title: Redux Style Guide：描述事件而不是 setter
    url: https://redux.js.org/style-guide
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - 推荐使用描述已发生事件的 action 名称，以获得更有意义的 action 日志和更少的 dispatch。
      - 推荐使用 Flux Standard Action 约定保持 action 字段一致。
  - title: Redux Toolkit 2.12.0 createAction API
    url: https://redux-toolkit.js.org/api/createAction
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 默认 action creator 接收一个参数并把它放到 payload。
      - prepare callback 接收全部调用参数并返回 payload，可选返回 meta 或 error。
      - type 字段由 action creator 自动加入。
  - title: Redux Toolkit 2.12.0 createSlice API
    url: https://redux-toolkit.js.org/api/createSlice
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - createSlice 中的 reducer key 会生成对应的 action creator，带 payload 的 case reducer 读取 action.payload。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
  - title: Redux 5.0.1 npm Latest Metadata
    url: https://registry.npmjs.org/redux/latest
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - npm latest 在核验日指向 Redux 5.0.1。
---

# Action 与 Payload

## 一、学习目标

- 识别合法 action 的最小结构，并为事件选择合适的 payload 形状。
- 区分 action 对象和 action creator，使用 creator 生成可交给 `dispatch` 的对象。
- 读取 `type`、`payload`、`meta` 和 `error`，理解它们各自承载的信息。
- 用 `createSlice` 生成的 action creator 观察参数如何进入 payload。
- 用描述事件的名称设计 action，而不是把状态字段写成一串 setter。

## 二、为什么需要 Action 与 Payload

Redux 的状态更新不是由组件直接改字段，而是先提交一条“发生了什么”的消息。消息需要一个稳定的名称，可能还要带
上发生事件所需的数据；reducer 根据这条消息决定下一份状态。

如果调用方在不同位置手写不同形状的对象，reducer 就必须猜测字段，调试日志也难以比较。明确 action 和 payload
的契约，可以把“事件名称”“事件数据”和“状态计算”分开，让同一事件能被不同入口一致地提交。

## 三、核心概念

### 1. Action 是描述事件的普通对象

Redux action 至少要有一个字符串 `type` 字段：

```ts
const action = { type: 'tasks/taskCompleted' }
```

`type` 应该能说明发生了什么。对象可以带其他字段；最常见的主要数据字段是 `payload`：

```ts
const action = {
  type: 'tasks/taskAdded',
  payload: { id: 'task-1', title: '学习 Action' },
}
```

`payload` 没有被 Redux 固定成某一种类型。它可以是字符串、数字、对象或数组，但同一个 action type 应保持稳定
的数据契约，让处理它的 reducer 知道应该读取什么。

### 2. Action Creator 负责创建对象

Action creator 是返回 action 对象的函数：

```ts
function taskCompleted(taskId: string) {
  return {
    type: 'tasks/taskCompleted',
    payload: taskId,
  }
}

const action = taskCompleted('task-1')
// { type: 'tasks/taskCompleted', payload: 'task-1' }
```

调用方应该调用 creator，再把返回值交给 `dispatch`。函数本身不是 action 对象：

```ts
store.dispatch(taskCompleted('task-1'))
```

### 3. Payload 描述事件需要的数据

当事件只需要一个值时，可以直接使用原始值：

```ts
const renamed = {
  type: 'profile/nameChanged',
  payload: '林晓',
}
```

当事件需要多个相互关联的值时，使用对象通常更容易阅读和扩展：

```ts
const edited = {
  type: 'tasks/taskEdited',
  payload: {
    id: 'task-1',
    title: '完成练习',
  },
}
```

Reducer 读取的是约定好的 `action.payload`，而不是从 action 顶层随意寻找业务字段：

```ts
type Task = { id: string; title: string }

function taskAdded(state: Task[], action: { type: string; payload: Task }) {
  if (action.type !== 'tasks/taskAdded') return state
  return [...state, action.payload]
}
```

### 4. meta 与 error 是可选附加字段

Flux Standard Action 约定还允许使用 `meta` 和 `error`。`meta` 可以描述请求来源、追踪信息等辅助数据；`error`
可以标记或携带失败信息。它们不是每个 action 都必须存在，业务主要数据仍应放在 `payload`：

```ts
const failed = {
  type: 'tasks/taskLoadFailed',
  payload: '无法读取任务列表',
  error: true,
  meta: { requestId: 'request-1' },
}
```

使用这些字段时要遵守团队约定。不要把同一个业务值一会儿放在 `payload`，一会儿放在 `meta`，否则 reducer 和日志
消费者都会面对不稳定的数据形状。

### 5. createSlice 默认把参数放入 payload

由 `createSlice` 创建的 slice 会自动生成 action creator。普通 reducer key 对应的 creator 默认接收一个参数，并把该参数
作为 `payload`：

```ts
const action = counterSlice.actions.incrementByAmount(3)

action.type // 'counter/incrementByAmount'
action.payload // 3
```

无参数的 creator 仍会生成 action，只是 payload 为 `undefined`。需要多个参数或要生成统一对象时，可以使用
`prepare` 返回 `{ payload }`；这是“创建 action 时整理输入”，不是让 reducer 负责生成随机值或读取外部环境。

## 四、用法与示例

### 1. 直接创建与 dispatch

```ts
const taskAdded = (title: string) => ({
  type: 'tasks/taskAdded',
  payload: { title },
})

store.dispatch(taskAdded('整理笔记'))
```

在现代 Redux 应用中，通常把 creator 放在 slice 或 feature 模块中导出，调用方不需要重复拼写 type 字符串。

### 2. 用对象 payload 表达多个参数

```ts
const taskEdited = (id: string, title: string) => ({
  type: 'tasks/taskEdited',
  payload: { id, title },
})

const action = taskEdited('task-1', '完成 Redux 练习')
// action.payload.id === 'task-1'
// action.payload.title === '完成 Redux 练习'
```

对象 payload 把 action 的输入契约集中在一个字段中；如果未来增加字段，可以在对象中扩展，而不必改变 action 顶层
结构。

### 3. 用 createSlice creator 观察真实 action

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const taskSlice = createSlice({
  name: 'tasks',
  initialState: [] as string[],
  reducers: {
    taskAdded: (state, action: PayloadAction<string>) => {
      state.push(action.payload)
    },
  },
})

const action = taskSlice.actions.taskAdded('阅读文档')
console.log(action)
// { type: 'tasks/taskAdded', payload: '阅读文档' }
```

这里 `PayloadAction<string>` 让 reducer 和生成的 creator 共享同一个 payload 类型。React 组件只需调用
`taskAdded('阅读文档')` 并 dispatch 结果；组件不需要知道 reducer 如何更新数组。

### 4. 用 prepare 统一多参数输入

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Task = { id: string; title: string }

const taskSlice = createSlice({
  name: 'tasks',
  initialState: [] as Task[],
  reducers: {
    taskAdded: {
      reducer: (state, action: PayloadAction<Task>) => {
        state.push(action.payload)
      },
      prepare: (id: string, title: string) => ({
        payload: { id, title },
      }),
    },
  },
})

const action = taskSlice.actions.taskAdded('task-1', '完成练习')
// { type: 'tasks/taskAdded', payload: { id: 'task-1', title: '完成练习' } }
```

只有在调用方确实需要多个参数、生成 ID 或统一整理数据时才使用 `prepare`。简单参数直接作为 payload 更清晰。

## 五、Demo：观察 Action 与 Payload

Demo 使用真实 `createSlice`、`configureStore` 和 `dispatch`。输入任务标题后，点击“添加任务”会显示完整 action；
点击“完成任务”会生成带字符串 payload 的 action，并显示 store 中的任务状态。

:::demo{id="react.redux.learn.basics.action-and-payload.action-and-payload-demo"}
观察 action 的 type、payload 与 dispatch 后的状态如何保持同一份数据契约。
:::

## 六、易错使用提示

:::pitfalls
### 错误：把 action creator 函数直接 dispatch

**触发条件：** 将 `taskAdded` 函数本身传给 `dispatch`，没有调用它。

**原因：** creator 是生成对象的函数，只有调用后才得到包含 `type` 的 action。

**后果：** dispatch 收到的值没有合法 action 结构，类型检查或运行时校验会失败。

**错误示例：**

```ts
store.dispatch(taskAdded)
```

**正确写法：**

```ts
store.dispatch(taskAdded('整理笔记'))
```

**验证方式：** dispatch 前记录 `taskAdded('整理笔记')`，确认它是带 `type` 的对象。

### 错误：把业务数据散落在 action 顶层

**触发条件：** 有时使用 `action.title`，有时使用 `action.payload.title`。

**原因：** 没有为 action 规定稳定的数据契约。

**后果：** reducer、日志工具和其他调用方必须分支处理多种形状。

**错误示例：**

```ts
{ type: 'tasks/taskAdded', title: '整理笔记' }
```

**正确写法：**

```ts
{ type: 'tasks/taskAdded', payload: { title: '整理笔记' } }
```

**验证方式：** 对同一个 action type 的所有调用点检查业务数据是否都位于约定的 `payload`。

### 错误：同一 action type 混用不同 payload 形状

**触发条件：** 一个调用传字符串，另一个调用传对象，但 reducer 只按其中一种读取。

**原因：** payload 契约没有保持稳定。

**后果：** 运行时出现 `undefined` 字段、错误更新或难以定位的类型绕过。

**错误示例：**

```ts
taskAdded('整理笔记')
taskAdded({ title: '整理笔记' })
```

**正确写法：**

```ts
taskAdded({ title: '整理笔记' })
```

**验证方式：** 为 creator 和 reducer 使用同一个明确的 payload 类型。

### 错误：把 setter 名称当成事件名称

**触发条件：** 使用 `setTaskTitle`、`setLoading` 等只表达字段赋值的 action 名称记录业务事件。

**原因：** action 没有描述发生的事实，只描述了某个实现字段。

**后果：** action 日志失去业务语义，多个 reducer 难以响应同一事件。

**错误示例：**

```ts
{ type: 'orders/setTotal', payload: 3 }
```

**正确写法：**

```ts
{ type: 'orders/orderAdded', payload: { productId: 'p-1' } }
```

**验证方式：** 脱离当前组件阅读 action type，确认能说出“发生了什么”。

### 错误：让 reducer 生成随机或时间相关 payload

**触发条件：** 在 reducer 内生成 ID、时间戳或读取外部可变值。

**原因：** reducer 应根据已有 state 和 action 计算结果，action 输入应在 dispatch 前准备好。

**后果：** 同一个 action 无法稳定重放，调试和测试结果会漂移。

**错误示例：**

```ts
reducer: (state, action) => {
  state.push({ id: crypto.randomUUID(), title: action.payload })
}
```

**正确写法：**

```ts
const action = taskAdded({ id: crypto.randomUUID(), title: '整理笔记' })
store.dispatch(action)
```

**验证方式：** 检查所有随机值和时间值是否在 action creator 或 prepare 阶段生成。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux 官方教程把 action 描述为至少包含字符串 `type` 的对象，附加信息通常放进 `payload`；action creator 是
创建并返回 action 的函数。Redux Style Guide 推荐用描述事件的名称，并推荐遵守 Flux Standard Action 的字段约定。

`createAction` 的类型与 API 说明：普通 creator 的一个参数会成为 `payload`；prepare callback 接收调用参数并返回
`payload`，可选返回 `meta` 或 `error`，`type` 由工具加入。`createSlice` 为 reducer key
生成对应 creator，并把 payload 类型传给 case reducer。

### 2. 课程推导

可以把 action 看成“事件名称 + 事件数据”的不可变消息。稳定的 payload 形状减少了 reducer 的条件分支；对象 payload
适合多个相关参数，原始值适合单一值。将数据在 dispatch 前准备好，也能让同一 action 在日志回放时保持可重现。

### 3. 适用边界

本课只讲同步 action 对象、action creator、payload 和 prepare 的基本契约。Reducer 内如何进行不可变更新、异步生命周期
action、middleware、`extraReducers`、RTK Query 和复杂 TypeScript 推导不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建 `taskSlice`，状态为 `Task[]`。提供 `taskAdded` 和 `taskCompleted` 两个 reducer：前者接收
`{ id: string; title: string }` 对象 payload 并加入任务，后者接收任务 ID 字符串 payload 并把对应任务标记为完成。
创建两个 action，打印它们的 `type` 和 `payload`，再用 reducer 依次得到添加后与完成后的状态。

**验收：** `taskAdded({ id: 'task-1', title: '学习 Action' })` 的 type 为 `tasks/taskAdded`；两个 action 的
业务数据都位于 payload；状态依次为一条 `completed: false` 的任务和同一任务变为 `completed: true`，没有在
action 顶层添加 `id` 或 `title`。

**参考答案：**

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Task = {
  id: string
  title: string
  completed: boolean
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState: [] as Task[],
  reducers: {
    taskAdded: (state, action: PayloadAction<Omit<Task, 'completed'>>) => {
      state.push({ ...action.payload, completed: false })
    },
    taskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.find((item) => item.id === action.payload)
      if (task) task.completed = true
    },
  },
})

const added = taskSlice.actions.taskAdded({ id: 'task-1', title: '学习 Action' })
const completed = taskSlice.actions.taskCompleted('task-1')
const afterAdded = taskSlice.reducer(undefined, added)
const afterCompleted = taskSlice.reducer(afterAdded, completed)

console.log({
  addedType: added.type,
  addedPayload: added.payload,
  completedType: completed.type,
  completedPayload: completed.payload,
  states: [afterAdded, afterCompleted],
})
```
:::

## 九、本节小结

- action 是至少包含字符串 `type` 的事件对象，主要业务数据通常放在 `payload`。
- action creator 是生成 action 的函数，必须调用后再 dispatch。
- payload 可以是原始值或对象；同一个 action type 应保持稳定形状。
- `createSlice` 默认把单个 creator 参数放入 payload，需要整理多参数时再使用 prepare。
- 优先用描述已发生事件的名称，避免让 action 只表达字段 setter。

## 十、参考资料

- [Redux Essentials Part 1](https://redux.js.org/tutorials/essentials/part-1-overview-concepts) - 支持 action、payload 和 action creator 的基本定义。
- [Redux Style Guide](https://redux.js.org/style-guide) - 支持事件命名与 Flux Standard Action 约定。
- [Redux Toolkit createAction API](https://redux-toolkit.js.org/api/createAction) - 支持默认 payload 和 prepare callback。
- [Redux Toolkit createSlice API](https://redux-toolkit.js.org/api/createSlice) - 支持 slice 生成 action creator 与 payload reducer。
- [Redux Toolkit npm Latest Metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 支持核验日稳定版本。
- [Redux npm Latest Metadata](https://registry.npmjs.org/redux/latest) - 支持核验日稳定版本。
