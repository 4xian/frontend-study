---
id: react.redux.learn.basics.redux-one-way-data-flow
type: lesson
title: Redux 单向数据流
summary: 理解事件如何沿 action、reducer、store 与 UI 的固定方向完成一次可追踪更新。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.redux.learn.basics.modern-redux-stack
related: []
tags:
  - Redux
  - 单向数据流
  - Action
  - Reducer
  - Store
appliesTo: Redux 5.0.1、Redux Toolkit 2.12.0、React Redux 9.3.0
verifiedAt: 2026-08-27
objectives:
  - 能按顺序说明 state、UI、action、reducer、store 通知与 UI 更新之间的关系。
  - 能解释为什么业务代码不能直接改写 Redux store 中的状态快照。
  - 能区分 action 描述的事件与 reducer 计算出的下一份状态。
  - 能根据初始状态、action 和更新规则推导一次或多次 dispatch 后的状态与界面结果。
  - 能说明订阅通知代表状态可能已经更新，读取方仍需重新读取自己关心的数据。
recap:
  - Redux 的共享状态保存在 store 中，UI 根据当前状态快照渲染。
  - 事件发生后，业务代码 dispatch action，由 reducer 根据旧状态和 action 计算下一份状态。
  - store 保存 reducer 的结果后通知订阅者，读取方再检查所需数据并更新 UI。
  - action 描述发生了什么，不是下一份状态，也不会自己修改 store。
  - 单向数据流约束更新入口，使状态变化能够沿 action 和 reducer 被追踪。
sources:
  - title: Redux 5.0.1 npm Latest Metadata
    url: https://registry.npmjs.org/redux/latest
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - npm latest 在核验日指向 Redux 5.0.1，并给出对应的官方仓库提交。
  - title: Redux 5.0.1 Concepts and Data Flow
    url: https://github.com/reduxjs/redux/blob/50b010210df25c470386f7e39a9389a4a77b3842/docs/tutorials/fundamentals/part-2-concepts-data-flow.md
    sourceType: official-reference
    appliesTo: Redux 5.0.1
    claims:
      - 官方说明 UI 根据状态渲染，事件通过 dispatch 进入 reducer，store 保存新状态并通知 UI。
      - 官方把 action 定义为对已发生事件的描述，并把 reducer 定义为由旧状态和 action 计算新状态的函数。
      - 官方要求应用通过 dispatch action 更新 Redux 状态，reducer 保持纯计算。
  - title: Redux 5.0.1 createStore Source
    url: https://github.com/reduxjs/redux/blob/50b010210df25c470386f7e39a9389a4a77b3842/src/createStore.ts
    sourceType: source-code
    appliesTo: Redux 5.0.1
    claims:
      - 固定版本源码在 dispatch 中先调用当前 reducer 保存新状态，再依次调用订阅监听器。
      - 固定版本源码禁止 reducer 执行期间再次 dispatch，并以无参数方式调用监听器。
  - title: Redux 5.0.1 createStore Tests
    url: https://github.com/reduxjs/redux/blob/50b010210df25c470386f7e39a9389a4a77b3842/test/createStore.spec.ts
    sourceType: official-test
    appliesTo: Redux 5.0.1
    claims:
      - 官方测试确认订阅者被通知时可以读取到当前 dispatch 产生的最新状态。
      - 官方测试确认从 reducer 内 dispatch 会抛出错误。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0。
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0。
---

# Redux 单向数据流

## 一、学习目标

- 按固定顺序说出一次 Redux 状态更新经过的环节。
- 区分状态快照、事件描述、状态计算和界面更新各自的职责。
- 根据初始状态与 action 推导更新后的状态和界面结果。
- 解释为什么直接改状态、从 reducer 内 dispatch 或依赖旧快照会破坏可追踪性。
- 把订阅通知理解为“需要重新读取”，而不是新状态本身。

## 二、为什么需要单向数据流

假设任务数量同时显示在顶部统计和任务列表中。用户点击“新增任务”后，如果两个区域各自改一份数字，应用就有
两个更新入口：列表可能显示 4 项，顶部仍然显示 3 项，而且很难从日志判断哪一处漏掉了更新。

Redux 把共享状态的变化限制在一条可追踪路径中。界面先读取同一份状态；事件发生后，代码提交一条 action；
reducer 根据旧状态和 action 算出下一份状态；store 保存结果并发出通知；需要该数据的界面再读取并显示新结果。
每次更新都沿同一个方向前进，不由多个界面区域分别维护答案。

“单向”不是说数据只移动一次，而是说每次更新都遵守同一顺序。新一轮界面事件可以再次开始这条路径，但不会
从中间跳过 action，也不会让 UI 直接改写 store 状态。

## 三、核心概念

### 1. State 是当前快照

State 描述应用在某个时刻的状态。例如：

```ts
const state = { taskCount: 3 }
```

UI 根据这个快照显示“3 个任务”。业务代码把它视为只读输入；要产生下一份状态，需要让事件进入 Redux 更新
流程，而不是直接给 `taskCount` 赋值。

### 2. Action 描述已经发生的事件

Action 是带有 `type` 的普通对象，用来描述发生了什么：

```ts
const action = { type: 'tasks/taskAdded' }
```

它不是下一份 state，也不会自己执行更新。`type` 让 reducer 能识别事件；事件需要附带数据时，可以把数据放在
action 的其他字段中。这里关注的是 action 在数据流中的位置，不展开 action 的创建方式。

### 3. Reducer 计算下一份状态

Reducer 接收上一份状态和当前 action，并返回下一份状态：

```text
(previousState, action) -> nextState
```

在任务示例中，更新规则可以表达为：遇到 `tasks/taskAdded`，下一份 `taskCount` 等于旧值加一。Reducer 负责
计算，不负责点击事件、请求或界面渲染。

### 4. Store 保存结果并通知

业务代码把 action dispatch 给 store。Store 让 reducer 运行，保存 reducer 返回的状态，然后通知订阅者 store
已经完成一次更新。订阅者收到的是通知，不是自动传入的新状态对象；读取方需要重新读取自己关心的数据。

因此，一次更新的完整顺序是：

```text
当前 state -> UI -> 事件 -> dispatch(action) -> reducer -> 下一份 state -> 通知 -> UI 重新读取
```

箭头只沿这个顺序前进。UI 可以发起事件，但不能绕过 action 和 reducer 直接改 store；reducer 可以计算 state，
但不能反过来触发新的 dispatch。

### 5. 单一来源与多个读取方

顶部统计和任务列表可以读取同一份 `taskCount`。Store 保存新状态后，两处都会收到更新信号，各自重新检查需要
的数据。这样不必给每个区域复制一份计数，也不必安排两个互相同步的更新函数。

单一来源不等于所有界面状态都必须进入 Redux。只有已经确定由 Redux 拥有的数据，才沿这条 Redux 数据流更新；
组件自己的局部状态仍由组件负责。

## 四、用法与示例

### 1. 追踪一次更新

初始状态是 `{ taskCount: 3 }`，界面显示“3 个任务”。用户新增一项任务后，可以按下面的轨迹检查结果：

| 顺序 | 环节 | 当前信息 | 结果 |
| --- | --- | --- | --- |
| 1 | UI | 读取 `taskCount: 3` | 显示“3 个任务” |
| 2 | 事件 | 用户完成新增操作 | 准备描述事件 |
| 3 | Action | `{ type: 'tasks/taskAdded' }` | 交给 store |
| 4 | Reducer | 旧值 `3`，规则为加一 | 返回 `taskCount: 4` |
| 5 | Store | 保存 reducer 结果 | 当前状态变为 `4` |
| 6 | 通知与读取 | 读取方检查 `taskCount` | 两处 UI 都显示“4 个任务” |

排查错误时也按这个顺序向前走：先确认事件是否 dispatch 正确 action，再确认 reducer 是否得到预期输入并返回正确
结果，最后确认读取方是否重新读取了新状态。

### 2. 区分两个方向

界面读取数据时，state 从 store 流向 UI；用户操作发生后，事件通过 action 回到 store。两种箭头看起来方向相反，
但它们组成的是同一条固定循环：

```text
store state -> UI -> event/action -> reducer -> store state -> UI
```

“单向”约束的是环节顺序。每一轮都从已有 state 出发，经过事件和 reducer 得到下一份 state，不在 UI 与 store
之间进行任意的双向写入。

### 3. 连续事件仍逐次完成

如果用户连续新增两项任务，Redux 会对两次 dispatch 分别运行更新流程：

```text
3 --tasks/taskAdded--> 4 --tasks/taskAdded--> 5
```

第二次 reducer 接收到的是第一次已经保存的状态 `4`，不是最初的 `3`。因此推导连续结果时，需要按 action 的
实际顺序逐步计算，不能让两次事件都基于同一份旧快照。

## 五、易错使用提示

:::pitfalls
### 错误：在 UI 中直接修改状态快照

**触发条件：** 组件读取 Redux state 后，直接给其中的字段赋值，希望其他区域自动同步。

**原因：** 绕过了 action、dispatch 和 reducer，更新没有进入 Redux 的单向路径。

**后果：** Store 无法按正常流程记录变化或通知读取方，界面可能继续显示旧值。

**错误示例：**

```ts
state.taskCount += 1
```

**正确写法：**

```ts
dispatch({ type: 'tasks/taskAdded' })
```

**验证方式：** 状态变化应能对应到一条被 dispatch 的 action，并由 reducer 计算结果。

### 错误：把 action 当成下一份状态

**触发条件：** Dispatch 后直接把 action 对象当作 store 的新状态使用。

**原因：** Action 只描述事件；下一份状态由 reducer 根据旧状态和 action 共同计算。

**后果：** 事件描述和状态结构混在一起，读取方拿不到 reducer 真正计算出的结果。

**错误示例：**

```ts
const nextState = { type: 'tasks/taskAdded' }
```

**正确写法：**

```ts
dispatch({ type: 'tasks/taskAdded' })
const nextState = store.getState()
```

**验证方式：** Action 保持事件对象职责；需要状态时，在 dispatch 完成后重新读取 store。

### 错误：在 reducer 中执行副作用

**触发条件：** Reducer 在计算状态时发请求、写存储或读取随机值。

**原因：** Reducer 应只根据已有 state 和 action 计算下一份 state。

**后果：** 相同输入可能得到不同结果，状态轨迹无法稳定复现。

**错误示例：**

```ts
function reducer(state, action) {
  localStorage.setItem('lastAction', action.type)
  return state
}
```

**正确写法：**

```ts
function reducer(state, action) {
  return action.type === 'tasks/taskAdded'
    ? { ...state, taskCount: state.taskCount + 1 }
    : state
}
```

**验证方式：** 使用同一份 state 和 action 多次调用 reducer，应得到相同含义的结果且不改变外部环境。

### 错误：从 reducer 内再次 dispatch

**触发条件：** Reducer 为了触发另一项更新而调用 `store.dispatch()`。

**原因：** Reducer 正在处理当前 action 时又启动一轮数据流，破坏 reducer 的纯计算职责。

**后果：** Redux 5.0.1 会抛出“Reducers may not dispatch actions”错误，当前更新失败。

**错误示例：**

```ts
function reducer(state) {
  store.dispatch({ type: 'tasks/recounted' })
  return state
}
```

**正确写法：**

```ts
function reducer(state, action) {
  return action.type === 'tasks/recounted' ? { ...state, taskCount: 0 } : state
}
```

**验证方式：** Reducer 内只计算并返回 state；dispatch 发生在 reducer 外部。

### 错误：把订阅通知当成状态参数

**触发条件：** 订阅回调声明 `nextState` 参数，并假设 store 会把新状态传进来。

**原因：** Redux 5.0.1 的基础 store 以无参数方式调用监听器，通知只表示一次 dispatch 已完成。

**后果：** 回调读到 `undefined`，或者继续使用闭包中的旧状态。

**错误示例：**

```ts
store.subscribe((nextState) => {
  console.log(nextState.taskCount)
})
```

**正确写法：**

```ts
store.subscribe(() => {
  console.log(store.getState().taskCount)
})
```

**验证方式：** Dispatch 后，订阅回调通过 store 重新读取当前状态；官方测试应能观察到更新后的值。
:::

## 六、源码推导与适用场景

### 1. 官方事实

Redux 5.0.1 的 `createStore` 固定源码在 `dispatch` 中先执行
`currentState = currentReducer(currentState, action)`，退出 reducer 执行阶段后再遍历监听器并调用
`listener()`。官方测试进一步确认，订阅者被通知时通过 `getState()` 读到的是当前 dispatch 产生的新状态。

### 2. 课程推导

订阅通知可以理解为“状态可能已经变化，请重新读取”的信号。读取方不应把旧快照长期保存为另一份事实来源，也
不应期待通知携带完整新状态。按需重新读取，可以让多个 UI 区域围绕同一份 store 状态保持一致。

### 3. 适用边界

源码事实描述 Redux 5.0.1 基础 store 的 dispatch 顺序。Middleware 可以包装 dispatch 的输入与返回值，但最终
进入基础 store 的普通 action 仍遵守 reducer 计算、保存状态、通知监听器的顺序。React 组件如何订阅和减少无关
渲染不属于本课范围。

## 七、练习

一个计数状态从 `{ count: 1 }` 开始，更新规则如下：

- 收到 `{ type: 'counter/incremented' }` 时，`count` 加一。
- 收到 `{ type: 'counter/reset' }` 时，`count` 变为零。

依次发生下面三件事：UI 首次读取、dispatch `counter/incremented`、dispatch `counter/reset`。

:::exercise
### 练习目标

**要求：** 写出每次读取或 dispatch 后的 `count`，并为两次 dispatch 分别列出“旧 state -> action -> 新 state ->
通知 -> UI 读取”五个环节。再解释为什么第二次更新不能继续使用初始值 `1`。

**验收：** 状态序列为 `1 -> 2 -> 0`；两次 action 都先交给 reducer，再由 store 保存结果和通知；第二次 reducer
使用第一次已经保存的 `2` 作为旧状态。

**参考答案：**

```ts
import { createStore } from 'redux'

type CounterState = { count: number }
type CounterAction =
  | { type: 'counter/incremented' }
  | { type: 'counter/reset' }

const initialState: CounterState = { count: 1 }

// 根据旧状态和 action 计算下一状态。
function counterReducer(state = initialState, action: CounterAction): CounterState {
  if (action.type === 'counter/incremented') return { count: state.count + 1 }
  if (action.type === 'counter/reset') return { count: 0 }
  return state
}

const store = createStore(counterReducer)
let previousState = store.getState()
let currentAction: CounterAction | undefined

console.log(store.getState().count) // UI 首次读取：1

// 在 store 通知后读取已保存的新状态，并输出完整更新链路。
store.subscribe(() => {
  const nextState = store.getState()

  console.log({
    oldState: previousState,
    action: currentAction,
    newState: nextState,
    notification: '订阅者收到通知',
    uiRead: nextState.count,
  })
})

// 记录 dispatch 前的旧状态和 action，再交给 store 执行更新。
function dispatchWithTrace(action: CounterAction) {
  previousState = store.getState()
  currentAction = action
  store.dispatch(action)
}

dispatchWithTrace({ type: 'counter/incremented' })
// { oldState: { count: 1 }, action: { type: 'counter/incremented' },
//   newState: { count: 2 }, notification: '订阅者收到通知', uiRead: 2 }

dispatchWithTrace({ type: 'counter/reset' })
// { oldState: { count: 2 }, action: { type: 'counter/reset' },
//   newState: { count: 0 }, notification: '订阅者收到通知', uiRead: 0 }
```
:::

## 八、本节小结

- UI 根据当前 state 渲染，事件通过 dispatch action 进入 Redux 更新流程。
- Action 描述发生了什么，reducer 根据旧 state 与 action 计算下一份 state。
- Store 先保存 reducer 结果，再通知读取方重新检查所需数据。
- 直接改写状态、在 reducer 中执行副作用或再次 dispatch 都会破坏固定更新路径。
- 连续 action 按实际顺序逐次计算，每次都以上一次已经保存的状态为起点。

## 九、参考资料

- [Redux Concepts and Data Flow](https://github.com/reduxjs/redux/blob/50b010210df25c470386f7e39a9389a4a77b3842/docs/tutorials/fundamentals/part-2-concepts-data-flow.md) - 支持单向数据流、action、reducer、store 通知与 UI 更新的公共模型。
- [Redux createStore Source](https://github.com/reduxjs/redux/blob/50b010210df25c470386f7e39a9389a4a77b3842/src/createStore.ts) - 证明固定版本 dispatch 先保存 reducer 结果，再无参数通知监听器，并禁止 reducer 内 dispatch。
- [Redux createStore Tests](https://github.com/reduxjs/redux/blob/50b010210df25c470386f7e39a9389a4a77b3842/test/createStore.spec.ts) - 证明订阅者读取到最新状态以及 reducer 内 dispatch 的错误行为。
- [Redux npm Latest Metadata](https://registry.npmjs.org/redux/latest) - 支持本课核验时的 Redux 稳定版本与固定仓库提交。
- [Redux Toolkit npm Latest Metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 支持本课核验时的 Redux Toolkit 稳定版本。
- [React Redux npm Latest Metadata](https://registry.npmjs.org/react-redux/latest) - 支持本课核验时的 React Redux 稳定版本。
