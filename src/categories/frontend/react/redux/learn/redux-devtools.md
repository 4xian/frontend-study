---
id: react.redux.learn.basics.redux-devtools
type: lesson
title: Redux DevTools
summary: 使用 Redux DevTools 观察 action 和状态历史，并配置开发环境中的调试边界。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 70
prerequisites:
  - react.redux.learn.basics.state-ownership
related: []
tags:
  - Redux Toolkit
  - Redux DevTools
  - configureStore
  - time travel
  - action history
  - state inspection
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、@redux-devtools/extension 4.0.0、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能说明 Redux DevTools 扩展、Redux store 和 configureStore 之间的关系。
  - 能使用 configureStore 的 devTools 布尔值或配置对象控制扩展集成。
  - 能通过 action 历史检查状态变化，并区分当前状态与历史快照。
  - 能解释 time travel 的调试用途，以及它不会撤销服务端副作用。
  - 能在开发和生产边界上控制 DevTools、trace、历史长度和敏感数据暴露。
recap:
  - Redux DevTools 是观察 Redux store 的浏览器扩展，configureStore 默认启用其集成。
  - devTools 为 false 时关闭集成，为对象时可以设置名称、trace 和历史长度等选项。
  - action 历史记录把每次更新与对应状态快照关联起来，选择历史项是调试观察。
  - time travel 只改变 Redux 的调试视角，不会回滚已经发出的网络请求或其他外部副作用。
  - 不要把令牌、密码和个人敏感数据放进可被 DevTools 记录的 action 或 state。
sources:
  - title: Redux Essentials：Redux DevTools Extension
    url: https://redux.js.org/tutorials/essentials/part-1-overview-concepts#redux-devtools-extension
    sourceType: official-reference
    appliesTo: Redux 5.0.1、Redux DevTools Extension
    claims:
      - Redux DevTools Extension 显示 Redux store 随时间变化的历史，并支持 time-travel debugging。
  - title: Redux Toolkit configureStore API
    url: https://redux-toolkit.js.org/api/configureStore
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - devTools 默认为 true，可以传入 false 或 DevTools 配置对象。
      - 配置对象会传给 Redux DevTools 的 composeWithDevTools，trace 在开发环境默认开启。
  - title: Redux Toolkit 2.12.0 configureStore Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - configureStore 在 devTools 为真时使用 composeWithDevTools，并在非生产环境设置 trace。
      - devTools 为 false 时使用普通 compose，不接入扩展 enhancer。
  - title: Redux DevTools Extension 4.0.0 README
    url: https://github.com/reduxjs/redux-devtools/blob/c6fd44977cb09f80cb5f3757f9f76cd96a5848a3/extension/README.md
    sourceType: official-reference
    appliesTo: '@redux-devtools/extension 4.0.0'
    claims:
      - 浏览器扩展通过注入的 Redux DevTools API 或 @redux-devtools/extension 包接入 Redux store。
      - 扩展提供 action 历史、状态检查和 trace 等调试能力；没有扩展时 store 仍可使用普通 Redux 流程。
  - title: Redux DevTools Extension 4.0.0 Options
    url: https://github.com/reduxjs/redux-devtools/blob/c6fd44977cb09f80cb5f3757f9f76cd96a5848a3/extension/docs/API/Arguments.md
    sourceType: api-doc
    appliesTo: '@redux-devtools/extension 4.0.0'
    claims:
      - name 用于标识实例，maxAge 限制历史动作数量，trace 记录派发动作的调用栈。
      - trace 默认关闭，traceLimit 默认限制调用栈帧数量，选项应按调试需要配置。
  - title: Redux DevTools Extension 4.0.0 Trace
    url: https://github.com/reduxjs/redux-devtools/blob/c6fd44977cb09f80cb5f3757f9f76cd96a5848a3/extension/docs/Features/Trace.md
    sourceType: official-reference
    appliesTo: '@redux-devtools/extension 4.0.0'
    claims:
      - trace 可以在扩展中查看触发 action 的调用栈，生成和序列化调用栈会带来额外开销。
  - title: Redux Toolkit 2.12.0 configureStore Tests
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts
    sourceType: official-test
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 官方测试覆盖 configureStore 的默认 enhancer 组合和关闭 DevTools 后的配置行为。
  - title: '@redux-devtools/extension 4.0.0 npm Metadata'
    url: https://registry.npmjs.org/@redux-devtools%2fextension/latest
    sourceType: official-reference
    appliesTo: '@redux-devtools/extension 4.0.0'
    claims:
      - npm latest 在核验日指向 @redux-devtools/extension 4.0.0。
---

# Redux DevTools

## 一、学习目标

- 说明 Redux DevTools 扩展、Redux store 和 `configureStore` 之间的关系。
- 使用 `configureStore` 的 `devTools` 布尔值或配置对象控制扩展集成。
- 通过 action 历史检查状态变化，并区分当前状态与历史快照。
- 解释 time travel 的调试用途，以及它不会撤销服务端副作用。
- 在开发和生产边界上控制 DevTools、`trace`、历史长度和敏感数据暴露。

## 二、为什么需要 Redux DevTools

Redux 的状态更新由 action 驱动。只看页面最终显示的值，往往无法回答“是哪一次 action 改变了它”“变化前的状态是什么”或“这个 action 从哪里派发”。Redux DevTools Extension 把 store 的 action 和状态变化放进可检查的历史中，让开发者可以定位状态转移，而不必在每个 reducer 和组件里手动插入日志。

DevTools 是 Redux store 的调试增强器，不是第二个 store，也不是 React 组件的状态容器。应用仍然通过 `dispatch` 更新 store，通过 selector 读取状态；扩展只是观察和调试这条已有的数据流。使用 Redux Toolkit 的 `configureStore` 时，扩展集成默认已经打开，因此基础项目通常不需要手动拼接旧式 `composeWithDevTools` 样板。

## 三、核心概念

### 1. `configureStore` 默认接入扩展

最小配置可以直接使用默认值：

```ts
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: rootReducer,
})
```

`devTools` 默认是 `true`。如果浏览器中安装了 Redux DevTools Extension，扩展可以观察这个 store；如果没有安装，store 仍然按照普通 Redux 流程工作，不应因此在运行时失败。

### 2. 布尔值和配置对象

不需要扩展集成时传入 `false`：

```ts
const store = configureStore({
  reducer: rootReducer,
  devTools: false,
})
```

需要标识实例或调整调试选项时传入对象：

```ts
const store = configureStore({
  reducer: rootReducer,
  devTools: {
    name: '任务工作区',
    trace: true,
    maxAge: 20,
  },
})
```

`name` 便于在多个 store 或多个页面之间定位实例；`maxAge` 限制扩展保存的历史长度；`trace` 让扩展记录派发 action 的调用栈。调用栈有额外开销，应只在需要定位派发来源时启用或保留开发环境默认行为。

### 3. Action 历史和状态快照

一次典型的调试观察可以分成三步：

1. 触发一个明确的 action，例如 `counter/incremented`。
2. 在扩展历史中选中这条 action，查看 action payload 和更新后的 state。
3. 对比当前 state 与选中时间点的快照，定位状态从哪里开始偏离预期。

历史项描述的是状态转移，不是 reducer 的替代实现。选择历史项可以帮助观察过去的状态，但不要把它理解成数据库事务回滚；已经发出的请求、写入的日志和其他外部副作用不会因为调试视角改变而自动撤销。

### 4. 扩展和本地代码的边界

浏览器扩展通过注入的 `window.__REDUX_DEVTOOLS_EXTENSION__` API 与 store enhancer 连接。现代 Redux Toolkit 应用通常只需要配置 `configureStore` 的 `devTools`，不应再安装已经迁移用途的旧 `redux-devtools-extension` 包来重复接入。

如果扩展没有安装，`configureStore` 仍会创建 store；课程 Demo 因此同时显示“扩展检测结果”和一个本地动作历史镜像。镜像只用于在没有浏览器扩展时观察 action 与快照的对应关系，不等价于扩展提供的完整 time-travel 控制台。

## 四、用法与示例

### 1. 为调试实例命名

同一页面可能同时存在多个独立 store，例如嵌入式编辑器和主应用。为每个 store 指定不同 `name`，可以在扩展中快速确认当前查看的是哪一份状态：

```ts
const editorStore = configureStore({
  reducer: editorReducer,
  devTools: { name: '编辑器工作区' },
})
```

名称只影响调试识别，不会改变 `RootState` 的字段名，也不会改变 action type。

### 2. 为需要定位的 action 开启 trace

`trace` 记录派发 action 的调用栈，适合排查“谁在什么时候发出了这条 action”：

```ts
const store = configureStore({
  reducer: rootReducer,
  devTools: {
    trace: true,
    traceLimit: 10,
  },
})
```

trace 不是 reducer 的业务数据，不应写入 Redux state。生产构建应根据安全和性能要求关闭 DevTools，或只启用经过审查的受限配置。

### 3. 在调试中保持可重复的 action

扩展最容易观察的是带有清晰 type 和可序列化 payload 的 action：

```ts
dispatch(taskAdded({ id: 'task-1', title: '检查状态流' }))
dispatch(taskCompleted('task-1'))
```

每次 action 都应该表达一个已经发生的事件或更新意图。不要为了让扩展显示得更详细，把组件实例、DOM 节点或请求对象塞进 payload；这些值既难以序列化，也会让历史难以重放。

## 五、Demo：观察 action 历史和状态快照

Demo 使用 `configureStore` 开启 `name`、`trace` 和 `maxAge`，通过按钮派发计数和模式切换 action。页面上方显示当前 store 状态，下方的本地历史镜像记录每次 action 后的快照。点击历史项只改变观察面板中的选中快照，不会修改当前 store；如果浏览器安装了扩展，可以在扩展面板中继续检查真实 action 历史。

:::demo{id="react.redux.learn.basics.redux-devtools.redux-devtools-demo"}
先点击“增加 count”和“切换 mode”生成几条 action，再选择历史项，对比当前状态与选中的状态快照；观察没有安装扩展时 store 仍能工作。
:::

## 六、易错使用提示

:::pitfalls
### 错误：在 `configureStore` 外重复安装旧扩展包

**触发条件：** 已经使用 Redux Toolkit，却又安装旧的 `redux-devtools-extension` 并手动拼接 enhancer。

**原因：** 没有意识到 `configureStore` 默认已经包含 Redux DevTools 集成。

**后果：** 配置重复、依赖过时，甚至改变 enhancer 顺序导致调试行为不一致。

**错误示例：**

```ts
import { composeWithDevTools } from 'redux-devtools-extension'

const store = configureStore({
  reducer: rootReducer,
  enhancers: () => [composeWithDevTools()],
})
```

**正确写法：**

```ts
const store = configureStore({
  reducer: rootReducer,
  devTools: { name: '任务工作区' },
})
```

**验证方式：** 检查 store 创建入口是否只有一个 DevTools 配置来源，并确认没有重复的扩展 enhancer。

### 错误：为了调试而把所有值写入 Redux

**触发条件：** 把 DOM 节点、组件实例、密码或访问令牌放入 action 或 state，希望在扩展中查看。

**原因：** 把“可观察”误认为“应该进入 Redux 数据流”。

**后果：** 序列化失败、历史不可重放，敏感信息还可能出现在浏览器扩展和调试截图中。

**错误示例：**

```ts
dispatch(debugPayloadAdded({ token: accessToken, node: buttonElement }))
```

**正确写法：**

```ts
dispatch(loginSucceeded({ userId }))
```

**验证方式：** 逐项检查 action payload 和 state，确认只包含可序列化且允许进入开发调试记录的数据。

### 错误：把 time travel 当成副作用回滚

**触发条件：** 在扩展中选择旧状态后，认为之前发出的保存请求、支付请求或日志写入也已经撤销。

**原因：** 混淆 Redux 的客户端状态快照与服务端或外部系统的真实状态。

**后果：** 页面显示旧数据，但服务端已经保留新数据，继续操作可能产生错误判断。

**错误示例：**

```ts
// 选择旧快照后，假设服务端订单也自动回到了旧状态
const order = selectOrder(store.getState())
```

**正确写法：**

```ts
// 把 time travel 当成定位状态 bug 的观察手段；需要修复服务端时发送明确的业务命令
dispatch(orderCorrectionRequested({ orderId, targetStatus }))
```

**验证方式：** 分别记录客户端 state 和服务端响应，确认调试操作没有被当作业务回滚流程。

### 错误：在生产环境无条件记录 trace 和完整历史

**触发条件：** 所有构建都启用 `trace: true`，并把 `maxAge` 设置得很大或不做限制。

**原因：** 只关注开发时的可见性，没有评估调用栈、历史和敏感字段的性能与暴露风险。

**后果：** 增加内存和序列化开销，生产调试记录可能包含不应暴露的信息。

**错误示例：**

```ts
const store = configureStore({
  reducer: rootReducer,
  devTools: { trace: true, maxAge: 5000 },
})
```

**正确写法：**

```ts
const store = configureStore({
  reducer: rootReducer,
  devTools: isDevelopment ? { trace: true, maxAge: 20 } : false,
})
```

**验证方式：** 分别检查开发和生产构建的 store 配置，确认生产环境符合项目的调试与数据暴露策略。

### 错误：把本地历史镜像当成第二份业务状态

**触发条件：** 为了显示历史，在 React 组件中维护一份可写的业务 state，并让它参与真正的业务更新。

**原因：** 没有区分“调试观察数据”和 Redux 的唯一业务真相。

**后果：** 观察面板和 store 产生两条更新路径，用户操作可能读取到过期副本。

**错误示例：**

```tsx
const [localCount, setLocalCount] = useState(0)
const onIncrement = () => setLocalCount((value) => value + 1)
```

**正确写法：**

```tsx
const count = useAppSelector(selectCount)
const onIncrement = () => dispatch(countIncremented())
```

**验证方式：** 让状态面板始终从 selector 读取当前 Redux state，历史镜像只保存不可写的观察快照。
:::

## 七、源码推导与适用场景

### 1. 官方事实

Redux Toolkit 2.12.0 的 `configureStore` 源码把 `devTools` 默认设为 `true`。当它为真时，源码调用 `composeWithDevTools`；非生产环境还默认把 `trace` 设为 `true`。当它为 `false` 时，源码使用普通 `compose`，不会接入 DevTools enhancer。

Redux DevTools Extension 4.0.0 的文档说明，扩展可以通过注入的 API 或 `@redux-devtools/extension` 包接入 store。扩展选项中的 `maxAge` 限制历史长度，`trace` 记录 action 调用栈；文档同时提醒调用栈生成和序列化会带来开销。

Redux Essentials 将 DevTools 描述为查看 Redux store 历史和进行 time-travel debugging 的工具。它观察的是 Redux 状态转移，不会取代 reducer，也不改变 React Redux 的 Provider、selector 和 dispatch 关系。

### 2. 课程推导

可以把调试问题拆成“事件 -> reducer -> 新状态 -> 观察快照”：先在 action 历史中找到异常事件，再对照前后 state 和派发调用栈，最后回到真实组件或业务命令修复原因。扩展只提供证据，不替应用决定状态所有权。

### 3. 适用边界

本课覆盖浏览器扩展集成、action 历史、状态检查、time travel 的调试含义和基础配置。远程 DevTools、复杂序列化、生产审计策略、Middleware 可观测性和 Redux 应用测试不在本课展开。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建一个带 `counter` slice 的 Redux store，并用 `configureStore` 的 `devTools` 对象配置 `name`、`trace` 和 `maxAge`。创建 React 控制区派发增加、切换模式和恢复 action；创建当前状态面板和动作历史面板。历史面板可以选择快照，但不得把快照当作第二份可写业务状态；扩展不存在时页面仍能运行。Demo 必须位于 `Provider` 内，并展示实际运行的 `.ts`、`.tsx`、`.css` 源码。

**验收：** 点击按钮后当前状态和动作历史同步增加；选择历史项能看到对应 `count` 与 `mode`，但当前状态不会因此改变；恢复按钮会产生新的 reset action；扩展检测不到时仍能正常 dispatch；store 配置包含 `name`、`trace: true` 和有限的 `maxAge`，没有把 token、DOM 节点或组件实例写入 Redux。

**参考答案：**

```tsx
// redux-devtools-store.ts
import { configureStore, createSlice, type Middleware } from '@reduxjs/toolkit'

type DevToolsDemoState = {
  count: number
  mode: 'idle' | 'active'
}

export type DevToolsHistoryEntry = Readonly<{
  id: number
  actionType: string
  count: number
  mode: DevToolsDemoState['mode']
}>

const initialState: DevToolsDemoState = { count: 0, mode: 'idle' }

const devToolsSlice = createSlice({
  name: 'devToolsDemo',
  initialState,
  reducers: {
    countIncremented: (state) => {
      state.count += 1
    },
    modeToggled: (state) => {
      state.mode = state.mode === 'idle' ? 'active' : 'idle'
    },
    reset: () => initialState,
  },
})

type DevToolsDemoRootState = {
  devToolsDemo: DevToolsDemoState
}

/** 判断值是否为带字符串 type 的 Redux action。 */
function isReduxAction(value: unknown): value is { type: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  )
}

/** 创建记录动作与状态快照的本地观察中间件。 */
function createHistoryMiddleware(
  history: DevToolsHistoryEntry[],
  notify: () => void,
): Middleware<{}, DevToolsDemoRootState> {
  return ({ getState }) => (next) => (action) => {
    const result = next(action)
    if (isReduxAction(action) && !action.type.startsWith('@@redux/')) {
      const state = getState().devToolsDemo
      history.push({
        id: history.length,
        actionType: action.type,
        count: state.count,
        mode: state.mode,
      })
      notify()
    }
    return result
  }
}

/** 创建启用 Redux DevTools 配置的独立 Demo store。 */
export function createDevToolsDemoStore() {
  const history: DevToolsHistoryEntry[] = [
    { id: 0, actionType: '@@INIT', count: initialState.count, mode: initialState.mode },
  ]
  const listeners = new Set<() => void>()
  const notify = (): void => {
    listeners.forEach((listener) => listener())
  }
  const store = configureStore({
    reducer: {
      devToolsDemo: devToolsSlice.reducer,
    },
    devTools: {
      name: 'Redux DevTools 课程 Demo',
      trace: true,
      maxAge: 20,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(createHistoryMiddleware(history, notify)),
  })

  /** 返回当前本地动作历史快照。 */
  function getHistory(): readonly DevToolsHistoryEntry[] {
    return history.slice()
  }

  /** 订阅本地动作历史变化。 */
  function subscribeHistory(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { store, getHistory, subscribeHistory }
}

export type DevToolsDemoStore = ReturnType<typeof createDevToolsDemoStore>['store']
export type RootState = ReturnType<DevToolsDemoStore['getState']>
export type AppDispatch = DevToolsDemoStore['dispatch']

/** 读取 Demo 当前计数。 */
export const selectCount = (state: RootState) => state.devToolsDemo.count

/** 读取 Demo 当前模式。 */
export const selectMode = (state: RootState) => state.devToolsDemo.mode

export const { countIncremented, modeToggled, reset } = devToolsSlice.actions

// redux-devtools-hooks.ts
import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './redux-devtools-store'

/** 创建绑定 Redux DevTools Demo dispatch 类型的 Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 创建绑定 Redux DevTools Demo RootState 类型的 Hook。 */
export const useAppSelector = useSelector.withTypes<RootState>()

// redux-devtools-demo.tsx
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import {
  countIncremented,
  createDevToolsDemoStore,
  modeToggled,
  reset,
  selectCount,
  selectMode,
  type DevToolsHistoryEntry,
} from './redux-devtools-store'
import { useAppDispatch, useAppSelector } from './redux-devtools-hooks'

import './redux-devtools-demo.css'

const modeLabels = {
  idle: '待机',
  active: '运行中',
} as const

type DevToolsWindow = Window & {
  __REDUX_DEVTOOLS_EXTENSION__?: unknown
}

/** 检测浏览器是否注入 Redux DevTools Extension API。 */
function hasDevToolsExtension(): boolean {
  return (
    typeof window !== 'undefined' &&
    '__REDUX_DEVTOOLS_EXTENSION__' in (window as DevToolsWindow)
  )
}

type DevToolsWorkspaceProps = {
  demoStore: ReturnType<typeof createDevToolsDemoStore>
}

/** 显示当前 Redux 状态、动作历史和选中的状态快照。 */
function DevToolsWorkspace({ demoStore }: DevToolsWorkspaceProps): ReactElement {
  const count = useAppSelector(selectCount)
  const mode = useAppSelector(selectMode)
  const dispatch = useAppDispatch()
  const [history, setHistory] = useState<readonly DevToolsHistoryEntry[]>(demoStore.getHistory())
  const [selectedEntryId, setSelectedEntryId] = useState(0)
  const selectedEntry = history.find((entry) => entry.id === selectedEntryId) ?? history[0]

  useEffect(() => demoStore.subscribeHistory(() => setHistory(demoStore.getHistory())), [demoStore])

  /** Dispatch 一个计数 action。 */
  function increment(): void {
    dispatch(countIncremented())
  }

  /** Dispatch 一个模式切换 action。 */
  function toggleMode(): void {
    dispatch(modeToggled())
  }

  /** Dispatch 一个恢复初始状态 action。 */
  function resetDemo(): void {
    dispatch(reset())
  }

  return (
    <section className="redux-devtools-demo" data-testid="redux-devtools-demo">
      <header className="redux-devtools-heading">
        <p>Redux Toolkit + Redux DevTools</p>
        <h2>动作历史与状态快照</h2>
        <span>当前状态来自 store，历史列表用于观察每次 action 后的快照。</span>
      </header>

      <section className="redux-devtools-integration" aria-label="DevTools 集成配置">
        <div>
          <span>store 配置</span>
          <strong>configureStore.devTools</strong>
          <code>{`{ name: 'Redux DevTools 课程 Demo', trace: true, maxAge: 20 }`}</code>
        </div>
        <div>
          <span>浏览器扩展</span>
          <strong data-testid="redux-devtools-extension-status">
            {hasDevToolsExtension() ? '已检测到，可打开扩展面板' : '未检测到，store 仍可正常运行'}
          </strong>
        </div>
      </section>

      <section className="redux-devtools-current" aria-live="polite">
        <div>
          <span>当前 Redux 状态</span>
          <strong data-testid="redux-devtools-current-count">count：{count}</strong>
          <small data-testid="redux-devtools-current-mode">mode：{modeLabels[mode]}</small>
        </div>
        <code>{`state.devToolsDemo = { count: ${count}, mode: '${mode}' }`}</code>
      </section>

      <div className="redux-devtools-actions">
        <button type="button" data-testid="redux-devtools-increment" onClick={increment}>
          增加 count
        </button>
        <button type="button" data-testid="redux-devtools-toggle-mode" onClick={toggleMode}>
          切换 mode
        </button>
        <button type="button" data-testid="redux-devtools-reset" onClick={resetDemo}>
          恢复初始状态
        </button>
      </div>

      <section className="redux-devtools-history" aria-label="动作历史">
        <div className="redux-devtools-section-heading">
          <span>本地动作历史镜像</span>
          <strong>{history.length} 条</strong>
        </div>
        <div className="redux-devtools-history-list">
          {history.map((entry) => (
            <button
              key={entry.id}
              type="button"
              data-testid={`redux-devtools-history-${entry.id}`}
              aria-pressed={entry.id === selectedEntryId}
              onClick={() => setSelectedEntryId(entry.id)}
            >
              <span>{entry.actionType}</span>
              <small>count {entry.count} · mode {modeLabels[entry.mode]}</small>
            </button>
          ))}
        </div>
        <div className="redux-devtools-snapshot" data-testid="redux-devtools-selected-snapshot">
          <span>选中的状态快照</span>
          <strong>{selectedEntry?.actionType ?? '@@INIT'}</strong>
          <code>
            {`{ count: ${selectedEntry?.count ?? 0}, mode: '${selectedEntry?.mode ?? 'idle'}' }`}
          </code>
          <small>选择快照只改变观察视角，不会改写当前 store。</small>
        </div>
      </section>
    </section>
  )
}

/** 为每次宿主挂载创建独立 store，并提供 Provider。 */
function ReduxDevToolsDemoRoot(): ReactElement {
  const [demoStore] = useState(createDevToolsDemoStore)
  return (
    <Provider store={demoStore.store}>
      <DevToolsWorkspace demoStore={demoStore} />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 Redux DevTools 观察组件。 */
export function createReduxDevToolsDemo(): ComponentType {
  return ReduxDevToolsDemoRoot
}

// redux-devtools-demo.css
.redux-devtools-demo {
  min-width: 0;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.redux-devtools-heading p,
.redux-devtools-heading h2,
.redux-devtools-heading span {
  overflow-wrap: anywhere;
}

.redux-devtools-heading p {
  margin: 0 0 var(--space-1);
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 800;
}

.redux-devtools-heading h2 {
  margin: 0;
  font-size: 1.05rem;
}

.redux-devtools-heading span {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.redux-devtools-integration,
.redux-devtools-current,
.redux-devtools-actions,
.redux-devtools-history {
  margin-top: var(--space-4);
}

.redux-devtools-integration {
  display: flex;
  flex-wrap: wrap;
  margin-right: -4px;
  margin-left: -4px;
}

.redux-devtools-integration > div {
  box-sizing: border-box;
  flex: 1 1 230px;
  min-width: 0;
  margin: 0 4px 8px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
}

.redux-devtools-integration span,
.redux-devtools-integration strong,
.redux-devtools-integration code {
  display: block;
  overflow-wrap: anywhere;
}

.redux-devtools-integration span,
.redux-devtools-current span,
.redux-devtools-section-heading span,
.redux-devtools-snapshot span {
  color: var(--color-text-secondary);
  font-size: 0.74rem;
}

.redux-devtools-integration strong {
  margin-top: 4px;
  color: var(--color-text);
  font-size: 0.88rem;
}

.redux-devtools-integration code {
  margin-top: var(--space-2);
  color: var(--color-accent);
  font-size: 0.72rem;
}

.redux-devtools-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg);
}

.redux-devtools-current > div,
.redux-devtools-current code {
  min-width: 0;
}

.redux-devtools-current strong,
.redux-devtools-current small {
  display: block;
  overflow-wrap: anywhere;
}

.redux-devtools-current strong {
  margin-top: 4px;
  font-size: 1.25rem;
}

.redux-devtools-current small {
  margin-top: 4px;
  color: var(--color-text-secondary);
}

.redux-devtools-current code {
  max-width: 54%;
  margin-left: var(--space-3);
  color: var(--color-accent);
  font-size: 0.74rem;
  overflow-wrap: anywhere;
  text-align: right;
}

.redux-devtools-actions {
  display: flex;
  flex-wrap: wrap;
  margin-right: -4px;
  margin-left: -4px;
}

.redux-devtools-actions button,
.redux-devtools-history-list button {
  min-height: 40px;
  margin: 0 4px 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.redux-devtools-actions button:last-child {
  border-color: var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
}

.redux-devtools-actions button:focus-visible,
.redux-devtools-history-list button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.redux-devtools-actions button:active,
.redux-devtools-history-list button:active {
  opacity: 0.8;
}

.redux-devtools-history {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
}

.redux-devtools-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.redux-devtools-section-heading strong {
  margin-left: var(--space-3);
  color: var(--color-accent);
  font-size: 0.8rem;
}

.redux-devtools-history-list {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) -4px 0;
}

.redux-devtools-history-list button {
  display: flex;
  min-width: 145px;
  align-items: flex-start;
  flex: 1 1 180px;
  flex-direction: column;
  border-color: var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  text-align: left;
}

.redux-devtools-history-list button[aria-pressed='true'] {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.redux-devtools-history-list button span,
.redux-devtools-history-list button small {
  overflow-wrap: anywhere;
}

.redux-devtools-history-list button small {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  font-weight: 400;
}

.redux-devtools-snapshot {
  margin-top: var(--space-2);
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.redux-devtools-snapshot span,
.redux-devtools-snapshot strong,
.redux-devtools-snapshot code,
.redux-devtools-snapshot small {
  display: block;
  overflow-wrap: anywhere;
}

.redux-devtools-snapshot strong {
  margin-top: 4px;
  color: var(--color-accent);
  font-size: 0.9rem;
}

.redux-devtools-snapshot code {
  margin-top: var(--space-2);
  font-size: 0.82rem;
}

.redux-devtools-snapshot small {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: 0.72rem;
}

@media (max-width: 480px) {
  .redux-devtools-demo {
    padding: var(--space-3);
  }

  .redux-devtools-current {
    align-items: flex-start;
    flex-direction: column;
  }

  .redux-devtools-current code {
    max-width: none;
    margin: var(--space-2) 0 0;
    text-align: left;
  }

  .redux-devtools-actions button {
    box-sizing: border-box;
    width: calc(100% - 8px);
  }
}
```
:::

## 九、本节小结

- Redux DevTools 是观察 Redux action 和状态历史的扩展，`configureStore` 默认开启集成。
- `devTools: false` 可以关闭集成，配置对象可以设置实例名称、trace 和历史长度。
- action 历史用于定位状态转移；选择历史快照不等价于回滚外部副作用。
- 调试镜像不能成为第二份业务状态，真正的当前值仍应从 Redux selector 读取。
- 生产环境要按安全、性能和数据暴露策略控制 DevTools、trace、历史长度及 payload 内容。

## 十、参考资料

- [Redux Essentials：Redux DevTools Extension](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#redux-devtools-extension) - 说明 action 历史和 time-travel debugging 的用途。
- [Redux Toolkit configureStore API](https://redux-toolkit.js.org/api/configureStore) - 说明 `devTools` 的默认值、布尔值和配置对象。
- [Redux Toolkit 2.12.0 configureStore Source](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts) - 说明 `composeWithDevTools`、开发环境 `trace` 与关闭分支。
- [Redux DevTools Extension 4.0.0 README](https://github.com/reduxjs/redux-devtools/blob/c6fd44977cb09f80cb5f3757f9f76cd96a5848a3/extension/README.md) - 说明浏览器 API、npm 包和扩展能力。
- [Redux DevTools Extension 4.0.0 Options](https://github.com/reduxjs/redux-devtools/blob/c6fd44977cb09f80cb5f3757f9f76cd96a5848a3/extension/docs/API/Arguments.md) - 说明 `name`、`maxAge`、`trace` 等选项。
- [Redux DevTools Extension 4.0.0 Trace](https://github.com/reduxjs/redux-devtools/blob/c6fd44977cb09f80cb5f3757f9f76cd96a5848a3/extension/docs/Features/Trace.md) - 说明调用栈记录和性能边界。
- [Redux Toolkit 2.12.0 configureStore Tests](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/tests/configureStore.test.ts) - 说明默认 enhancer 与 DevTools 配置行为的官方测试覆盖。
- [@redux-devtools/extension 4.0.0 npm Metadata](https://registry.npmjs.org/@redux-devtools%2fextension/latest) - 核验扩展 npm 包稳定版本。
