---
id: react.redux.learn.basics.configure-store
type: lesson
title: configureStore
summary: 使用 Redux Toolkit 的标准入口创建 store，并通过 reducer、getState 与 dispatch 验证状态起点和更新结果。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 80
prerequisites:
  - react.redux.learn.basics.redux-one-way-data-flow
related: []
tags:
  - Redux Toolkit
  - configureStore
  - Store
  - Reducer
  - preloadedState
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1
verifiedAt: 2026-08-27
objectives:
  - 能从 @reduxjs/toolkit 导入 configureStore，并用必需的 reducer 配置创建 store。
  - 能解释 reducer 函数和 reducer 对象两种输入形成的 state 结构差异。
  - 能使用 getState 读取 store 当前快照，并用 dispatch 验证 reducer 产生的下一份状态。
  - 能区分 reducer 默认状态、preloadedState 和重新创建 store 三种状态起点。
  - 能说明 configureStore 默认组织 middleware、开发检查和 Redux DevTools 支持，但不在本课提前定制这些能力。
recap:
  - configureStore 是 Redux Toolkit 创建 Redux store 的标准入口，reducer 是必需配置。
  - 传入单个 reducer 函数时它直接成为根 reducer；传入 reducer 对象时会通过 combineReducers 形成对象状态。
  - store.getState 读取当前状态快照，store.dispatch 让 action 经过 reducer 后保存下一份状态。
  - reducer 默认状态用于普通新建 store，preloadedState 可以为当前创建过程提供状态起点。
  - 每次调用 configureStore 都会创建独立 store；重新创建不会沿用旧 store 已经变化的内存状态。
sources:
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs%2ftoolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - npm latest 在核验日指向 Redux Toolkit 2.12.0，并给出对应的官方仓库提交。
  - title: Redux Toolkit 2.12.0 configureStore API
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/docs/api/configureStore.mdx
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - configureStore 是创建 Redux store 的标准方法，接受包含 reducer 和可选 preloadedState 的配置对象。
      - reducer 可以是单个函数，也可以是交给 combineReducers 的 reducer 对象。
      - configureStore 默认组织 middleware、开发检查和 Redux DevTools 支持。
  - title: Redux Toolkit 2.12.0 configureStore Source
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/configureStore.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定版本源码直接使用函数 reducer，或对普通 reducer 对象调用 combineReducers。
      - 固定版本源码在 reducer 缺失或类型非法时抛出明确错误，并把配置结果交给 Redux createStore。
  - title: Redux Toolkit 2.12.0 configureStore Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/tests/configureStore.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试确认函数 reducer 直接传给 createStore，而 reducer 对象会先交给 combineReducers。
      - 官方测试确认缺少 reducer 会抛出必需参数错误，省略 middleware 配置会使用默认 middleware。
---

# configureStore

## 一、学习目标

- 用最小 reducer 创建一份真实 Redux store。
- 从创建后的 store 读取初始状态，并观察一次 dispatch 前后的状态变化。
- 判断单个 reducer 函数与 reducer 对象分别产生什么 state 结构。
- 区分 reducer 默认状态和 `preloadedState` 的职责。
- 识别缺少 reducer、传错 reducer 以及重复创建 store 等常见问题。

## 二、为什么需要 configureStore

Redux store 不只要保存状态，还要知道由哪个 reducer 计算下一份状态，并把 middleware、增强器和开发工具组织在
同一条创建链中。旧式配置需要手动组合多项能力，项目之间容易复制出不同版本的样板代码。

Redux Toolkit 用 `configureStore` 提供统一入口。最小配置只需要一个 `reducer`：

```ts
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({ reducer: counterReducer })
```

这次调用得到一份独立 store。Store 保存当前状态并提供 `getState`、`dispatch` 等基础能力；reducer 仍负责根据旧
状态和 action 计算下一份状态。`configureStore` 解决的是创建与默认配置，不替代 reducer 的业务规则。

## 三、核心概念

### 1. reducer 是必需配置

`configureStore` 接收一个配置对象，其中 `reducer` 是必需项。它可以直接接收一个 reducer 函数：

```ts
type CounterState = { value: number }

function counterReducer(
  state: CounterState = { value: 0 },
  action: { type: string },
): CounterState {
  if (action.type === 'counter/incremented') return { value: state.value + 1 }
  return state
}

const store = configureStore({ reducer: counterReducer })
```

创建时，Redux 会让 reducer 提供初始状态，因此创建完成后可以立即读取：

```ts
store.getState() // { value: 0 }
```

Reducer 对不认识的 action 必须返回当前 state，这既让初始化流程得到有效状态，也让无关 action 保持状态不变。

### 2. reducer 函数决定根状态形状

传入单个函数时，这个函数直接成为根 reducer，`getState()` 返回的就是它产生的状态：

```ts
const store = configureStore({ reducer: counterReducer })

store.getState() // { value: 0 }
```

这里的根状态没有自动增加 `counter` 层。状态形状由 reducer 的返回值决定，不能根据文件名或变量名猜测。

### 3. reducer 对象会形成对象状态

也可以传入由多个 reducer 组成的对象：

```ts
const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

store.getState() // { counter: { value: 0 } }
```

`configureStore` 会把这个对象交给 Redux 的 `combineReducers`。对象 key `counter` 成为根状态字段，每个字段由
对应 reducer 管理。当前只有一个 reducer 时，两种写法都有效；选择哪一种取决于应用需要的根状态结构，而不是
为了固定套用目录模板。

### 4. getState 读取当前快照

`store.getState()` 返回 store 当前保存的状态快照。创建后读取的是状态起点；dispatch 完成后重新读取，得到
reducer 已经计算并由 store 保存的下一份状态：

```ts
const before = store.getState()
store.dispatch({ type: 'counter/incremented' })
const after = store.getState()

console.log(before.value) // 0
console.log(after.value) // 1
```

`getState` 是读取动作，不会触发 reducer，也不会创建新状态。前一课的单向数据流在这里变成可执行接口：action
通过 `dispatch` 进入 store，读取方再通过 `getState` 检查结果。

### 5. preloadedState 提供本次创建的状态起点

需要从已保存数据或服务端结果恢复状态时，可以传入 `preloadedState`：

```ts
const store = configureStore({
  reducer: counterReducer,
  preloadedState: { value: 8 },
})

store.getState() // { value: 8 }
```

它是当前 store 的创建输入，不会修改 reducer 中写下的默认状态。省略 `preloadedState` 时，新 store 仍从 reducer
默认状态开始。传入 reducer 对象时，预加载状态也应匹配对象 key 形成的根状态形状。

### 6. 默认能力由入口统一组织

省略其他配置时，`configureStore` 会使用 Redux Toolkit 的默认 middleware，开发环境还会加入常见错误检查，并
启用 Redux DevTools 支持。这些默认值是推荐入口价值的一部分，因此基础配置不需要手动复制旧式样板。

本课只确认默认能力存在，不修改 middleware、enhancer 或 DevTools 选项。如何观察 DevTools、如何定制默认
middleware，以及异步逻辑如何进入 dispatch 链，都有各自独立的问题边界。

## 四、用法与示例

### 1. 建立最小 store 文件

一个最小 store 文件需要导入、reducer 和创建调用：

```ts
import { configureStore } from '@reduxjs/toolkit'

type SessionState = { signedIn: boolean }

function sessionReducer(
  state: SessionState = { signedIn: false },
  action: { type: string },
): SessionState {
  if (action.type === 'session/signedIn') return { signedIn: true }
  return state
}

export const store = configureStore({ reducer: sessionReducer })
```

这里没有 React 绑定。`store` 已经可以在普通 TypeScript 中被读取和 dispatch；把它提供给 React 组件树属于后续
独立步骤，不影响本课理解创建入口。

### 2. 用前后快照验证更新

调用方可以保留 dispatch 前后的两个快照：

```ts
const before = store.getState()
store.dispatch({ type: 'session/signedIn' })
const after = store.getState()

console.log({ before, after })
// { before: { signedIn: false }, after: { signedIn: true } }
```

这段验证把三个职责分开：`configureStore` 创建 store，reducer 定义更新规则，`dispatch` 与 `getState` 负责触发并
观察一次真实状态变化。

### 3. 重新创建得到独立 store

每次调用都会得到新的 store 实例：

```ts
const firstStore = configureStore({ reducer: counterReducer })
firstStore.dispatch({ type: 'counter/incremented' })

const secondStore = configureStore({ reducer: counterReducer })

firstStore.getState() // { value: 1 }
secondStore.getState() // { value: 0 }
```

第二份 store 不会读取第一份 store 的内存状态。需要延续数据时必须明确传入合适的 `preloadedState`；不能把重新
创建 store 当成普通状态更新方式。

## 五、Demo：观察创建与重新创建

下面的 Demo 使用同一个 reducer 创建 store。点击 `Dispatch +1` 后，它分别显示 dispatch 前后的 `getState()`
结果；点击“重新创建 store”会建立另一份 store，并回到 reducer 的默认状态。Demo 没有使用 React Provider，
界面只在事件处理器中手动读取 store，以便把观察范围保持在创建入口。

:::demo{id="react.redux.learn.basics.configure-store.store-setup-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：省略 reducer

**触发条件：** 调用 `configureStore` 时传入空对象，或只设置其他可选字段。

**原因：** Store 必须知道如何根据旧状态和 action 计算下一份状态，`reducer` 是创建所需的核心输入。

**后果：** Redux Toolkit 2.12.0 会抛出 reducer 是必需参数且必须为函数或 reducer 对象的错误。

**错误示例：**

```ts
const store = configureStore({})
```

**正确写法：**

```ts
const store = configureStore({ reducer: counterReducer })
```

**验证方式：** 创建调用包含有效 reducer，执行完成后 `store.getState()` 能返回 reducer 提供的状态。

### 错误：传入 reducer 的执行结果

**触发条件：** 写成 `reducer: counterReducer()`，把一次计算出的 state 当成 reducer 配置。

**原因：** `configureStore` 需要在每次 dispatch 时调用 reducer 函数，而不是接收某一次调用的结果。

**后果：** 配置值既不是函数，也不是 reducer 函数组成的对象，store 创建立即失败。

**错误示例：**

```ts
const store = configureStore({ reducer: counterReducer(undefined, { type: 'init' }) })
```

**正确写法：**

```ts
const store = configureStore({ reducer: counterReducer })
```

**验证方式：** 检查配置中的 reducer 值本身是函数，或每个对象字段都是 reducer 函数。

### 错误：误判 reducer 对象的状态形状

**触发条件：** 传入 `{ counter: counterReducer }` 后仍读取 `store.getState().value`。

**原因：** reducer 对象会通过 `combineReducers` 形成以对象 key 为字段的根状态。

**后果：** 读取路径得到 `undefined`，后续组件无法取得实际计数值。

**错误示例：**

```ts
const store = configureStore({ reducer: { counter: counterReducer } })
console.log(store.getState().value)
```

**正确写法：**

```ts
const store = configureStore({ reducer: { counter: counterReducer } })
console.log(store.getState().counter.value)
```

**验证方式：** 对照 reducer 配置形态与 `getState()` 的完整输出，再确定读取路径。

### 错误：把 preloadedState 当成 reducer 默认值的永久修改

**触发条件：** 为一份 store 传入 `{ value: 8 }` 后，认为以后创建的所有 store 都会从 8 开始。

**原因：** `preloadedState` 只属于当前 `configureStore` 调用，没有改写 reducer 定义。

**后果：** 重新创建且没有再次传入预加载状态时，计数回到 reducer 默认值，结果与预期不符。

**错误示例：**

```ts
configureStore({ reducer: counterReducer, preloadedState: { value: 8 } })
const nextStore = configureStore({ reducer: counterReducer })
// 错误地期待 nextStore.getState().value 是 8
```

**正确写法：**

```ts
const nextStore = configureStore({
  reducer: counterReducer,
  preloadedState: { value: 8 },
})
```

**验证方式：** 分别创建带和不带 `preloadedState` 的 store，检查两者各自的初始快照。

### 错误：在组件每次渲染时重新创建 store

**触发条件：** 把 `configureStore(...)` 直接放在会频繁执行的组件函数主体中。

**原因：** 每次调用都会返回独立 store；重新渲染就替换实例，旧实例中的状态不再是当前读取目标。

**后果：** 状态反复回到起点，订阅关系也无法稳定指向同一份 store。

**错误示例：**

```tsx
function App() {
  const store = configureStore({ reducer: counterReducer })
  return <output>{store.getState().value}</output>
}
```

**正确写法：**

```ts
export const store = configureStore({ reducer: counterReducer })
```

**验证方式：** 正常应用启动期间复用同一 store 实例；只有明确重置或隔离场景才创建新实例。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Toolkit 2.12.0 的固定源码先读取 `reducer`。函数会被直接作为根 reducer；普通对象会传给
`combineReducers`；其他值会触发明确错误。随后源码组织默认 middleware、enhancer 与 DevTools 配置，并把根
reducer 和 `preloadedState` 交给 Redux 的 `createStore`。

官方测试分别验证函数 reducer 直接进入 `createStore`、reducer 对象会调用 `combineReducers`、缺少 reducer 会
抛错，以及省略 middleware 字段时默认 middleware 会进入创建链。

### 2. 课程推导

因为 reducer 函数与 reducer 对象走不同分支，根状态形状必须从实际配置推导：单函数返回什么，根状态就是什么；
对象配置则以 key 组织子状态。因为每次调用最终都会创建 store，所以两次调用产生的内存状态彼此独立。

### 3. 适用边界

基础应用优先保留默认配置，只提供正确 reducer。只有已经明确需要恢复状态时才加入 `preloadedState`；只有当前课
真正需要多个状态分区时才使用 reducer 对象。Middleware、自定义 enhancer、DevTools 配置和 React 组件接入都
不应为了展示配置项而提前加入最小 store。

## 八、练习

创建一个分数 store：reducer 默认状态为 `{ score: 10 }`，收到 `score/incremented` 后加一。读取初始值，dispatch
一次，再读取更新值；最后重新创建另一份 store，证明它仍从 10 开始。

:::exercise
### 练习目标

**要求：** 使用 `configureStore` 和单个 reducer 完成整段流程，并把三个读取结果依次写入一个数组。不要使用
`preloadedState`，也不要在 reducer 外直接修改状态。

**验收：** 结果数组为 `[10, 11, 10]`；第一次 dispatch 只改变第一份 store，第二份 store 来自新的
`configureStore` 调用。

**参考答案：**

```ts
import { configureStore } from '@reduxjs/toolkit'

type ScoreState = { score: number }

function scoreReducer(
  state: ScoreState = { score: 10 },
  action: { type: string },
): ScoreState {
  if (action.type === 'score/incremented') return { score: state.score + 1 }
  return state
}

const firstStore = configureStore({ reducer: scoreReducer })
const results = [firstStore.getState().score]

firstStore.dispatch({ type: 'score/incremented' })
results.push(firstStore.getState().score)

const secondStore = configureStore({ reducer: scoreReducer })
results.push(secondStore.getState().score)

console.log(results) // [10, 11, 10]
```
:::

## 九、本节小结

- `configureStore` 是 Redux Toolkit 创建 store 的标准入口，最小配置必须提供 reducer。
- 单个 reducer 函数直接决定根状态；reducer 对象会通过 `combineReducers` 形成对象状态。
- `getState` 读取 store 当前快照，dispatch 完成后需要重新读取才能观察新状态。
- `preloadedState` 只提供当前 store 的状态起点，不会改写 reducer 默认状态。
- 每次调用都会创建独立 store，正常应用不应在每次组件渲染时重复创建。

## 十、参考资料

- [Redux Toolkit configureStore API](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/docs/api/configureStore.mdx) - 支持标准创建入口、配置字段、两种 reducer 形式、preloadedState 和默认能力。
- [Redux Toolkit configureStore Source](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/configureStore.ts) - 证明固定版本对 reducer 的分支、非法值错误、默认配置组织和 createStore 调用。
- [Redux Toolkit configureStore Tests](https://github.com/reduxjs/redux-toolkit/blob/576a02f8056fbee2dcaddb4d2e4d2da3b7937c58/packages/toolkit/src/tests/configureStore.test.ts) - 证明函数与对象 reducer、缺少 reducer 和默认 middleware 的测试行为。
- [Redux Toolkit npm Latest Metadata](https://registry.npmjs.org/@reduxjs%2ftoolkit/latest) - 支持本课核验时的稳定版本与固定仓库提交。
