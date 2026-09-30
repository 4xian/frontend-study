---
id: react.redux.learn.basics.provider
type: lesson
title: Provider
summary: 使用 React Redux Provider 把已有 Redux store 接入 React 子树，并理解它建立的共享边界。
domain: frontend
technology: react
module: redux
stage: basics
level: beginner
estimatedMinutes: 75
prerequisites:
  - react.redux.learn.basics.configure-store
related: []
tags:
  - React Redux
  - Provider
  - Redux store
  - React Context
  - 组件树
appliesTo: React Redux 9.3.0、Redux Toolkit 2.12.0、React 19.2.8
verifiedAt: 2026-08-27
objectives:
  - 能说明 Provider 接收已有 store，并把它提供给包裹的 React 子树。
  - 能写出在应用根部使用 `<Provider store={store}>` 的最小结构，并正确放置 children。
  - 能解释 Provider 建立的 Context 与订阅边界，而不把 Provider 当成 store 创建器。
  - 能从缺少 Provider、错误 context 和 render 中重复创建 store 的现象定位接入错误。
  - 能说明 serverState、自定义 context 和 selector 检查属于可选或后续边界，不在普通客户端入口中随意加入。
recap:
  - '`configureStore` 创建 store，Provider 只把这份已有 store 接入 React 子树。'
  - 'Provider 的必需输入是 `store` 和 `children`，通常在应用根部包裹整个 App。'
  - Provider 为后代 React Redux API 建立 Context 和订阅边界；后代必须位于同一个 Provider 子树中。
  - Provider 不替代 reducer、action 或 dispatch，也不会因为包裹组件就创建新的 store。
  - '普通客户端不需要 `serverState` 或自定义 context；引入它们前必须有明确的渲染或隔离需求。'
sources:
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0，并给出官方仓库提交。
  - title: React Redux Provider API
    url: https://react-redux.js.org/api/provider
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - Provider 接收 store 和 children，并使 store 对嵌套组件可用。
      - serverState、context、stabilityCheck 和 identityFunctionCheck 是可选属性。
  - title: React Redux 9.3.0 Provider Source
    url: https://raw.githubusercontent.com/reduxjs/react-redux/4134f88f179c46d3ae9c4ee7baaa589ff0fecfa8/src/components/Provider.tsx
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - Provider 用 store 和可选 serverState 创建 context value，并在布局效果中建立和清理 store 订阅。
      - Provider 最终渲染 context Provider，并把 children 作为 React 子树交给它。
  - title: React Redux Accessing the Store
    url: https://react-redux.js.org/using-react-redux/accessing-store
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - React Redux 通过 Provider 将 Redux store 接入 React 组件树。
      - 自定义 context 的 Provider 与消费者必须使用同一个 context 实例。
  - title: React Redux 9.3.0 Provider Tests
    url: https://raw.githubusercontent.com/reduxjs/react-redux/4134f88f179c46d3ae9c4ee7baaa589ff0fecfa8/test/components/Provider.spec.tsx
    sourceType: official-test
    appliesTo: React Redux 9.3.0
    claims:
      - 官方测试覆盖 StrictMode、Provider 卸载时的订阅清理和替换 store 时的订阅切换。
  - title: React Redux Provider SSR Usage
    url: https://react-redux.js.org/api/provider#react-18-ssr-usage
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - serverState 用于 hydrateRoot 的服务端状态快照，以保持首轮 hydration 输出一致。
---

# Provider

## 一、学习目标

- 说明 Provider 如何把已有 Redux store 接到 React 组件树。
- 写出 Provider 的最小根级包裹结构，并理解 `children` 的范围。
- 解释 Provider 建立的 Context 与订阅边界。
- 定位缺少 Provider、context 不匹配和重复创建 store 造成的接入问题。
- 识别 `serverState` 与自定义 context 的使用边界。

## 二、为什么需要 Provider

使用 `configureStore` 创建的 store 在普通 TypeScript 代码中可以通过 `getState` 和 `dispatch` 工作，
但 React 组件树还不知道应该使用哪一份 store。若每个组件都通过 Props 逐层传递 store，组件树会被与业务无关的
参数占满，深层组件也很难保持同一份状态来源。

React Redux 的 Provider 解决的是“让 React 子树接入哪一份已有 store”。它通常位于应用根部，把 `<App />` 作为
`children` 放进去。Provider 不负责创建 store，也不负责定义 reducer；这些职责仍属于 Redux Toolkit 和应用自己的
状态逻辑。

## 三、核心概念

### 1. Provider 的最小合同

Provider 的最小写法只有两个必需输入：已有的 `store` 和要被包裹的 `children`。

```tsx
import { Provider } from 'react-redux'
import { store } from './store'
import { App } from './App'

export function Root(): React.ReactElement {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
```

`store` 必须是 `configureStore` 或其他合法 Redux store 创建入口返回的实例。`children` 是 Provider 的 React 子树，
可以是一个 App，也可以是多个 React 节点。Provider 不会从 children 推断 reducer，也不会因为 children 重新渲染而
自动创建新的 store。

### 2. 根级包裹与作用域

Provider 只对自己的后代生效。下面的 `InsidePanel` 在 Provider 子树中，具备使用 React Redux 连接 API 的上下文；
同级但位于 Provider 外部的 `OutsidePanel` 不在这个作用域中。

```tsx
function InsidePanel(): React.ReactElement {
  return <p>这里属于 Provider 子树</p>
}

function OutsidePanel(): React.ReactElement {
  return <p>这里不属于 Provider 子树</p>
}

export function Root(): React.ReactElement {
  return (
    <>
      <Provider store={store}>
        <InsidePanel />
      </Provider>
      <OutsidePanel />
    </>
  )
}
```

实际应用通常把 Provider 放在 React 根部，让需要访问 Redux 的页面、布局和功能组件都处于同一作用域。只有确实
需要隔离 store 的嵌入模块或测试边界，才会使用多个 Provider。

### 3. Context 与订阅边界

Provider 内部用 React Context 保存 store 和 React Redux 连接所需的订阅信息。后代连接 API 会从最近的 Provider
取得这份值，而不是自行寻找全局变量。Provider 还会订阅 store，并在组件树卸载时清理订阅；这让 store 的状态变化
能够沿 React 子树传播到相应的消费者。

这里的“订阅边界”是一个浅层心智模型：Provider 建立接入点，后代 API 读取该接入点并注册自己的监听关系。它不
意味着每次 Provider 渲染都会创建 store，也不意味着本课需要手写 Context 或订阅实现。

### 4. Provider 不替代 Redux 更新链

一次完整更新仍然有清晰分工：

| 角色 | 负责什么 | 本课的位置 |
| --- | --- | --- |
| `configureStore` | 创建 store 和根 reducer | Provider 的输入来源 |
| Provider | 把已有 store 放入 React 子树的 Context | 当前知识点 |
| reducer | 根据旧状态和 action 计算下一份状态 | 由前置课程建立 |
| `useSelector` / `useDispatch` | 让组件读取或发起更新 | 后续组件 API |

Provider 本身不会 dispatch action，也不会替组件选择字段。组件要真正读取或更新状态，仍需使用对应的 React Redux
API；本课只确认这些 API 的共同入口是 Provider 建立的作用域。

### 5. 可选属性的边界

Provider 还有几个可选属性，但普通 Vite 客户端入口不需要为了“配置完整”而添加它们：

- `serverState` 为 `hydrateRoot` 的 SSR hydration 提供服务端状态快照，首轮输出需要与服务端 HTML 对齐时才使用。
- `context` 用于明确的自定义 React Context 场景；Provider 和消费者必须共享同一个 context 实例。
- `stabilityCheck` 与 `identityFunctionCheck` 用于覆盖 selector 的开发检查频率，属于 Hooks 与调试延伸。

## 四、用法与示例

### 1. 在入口固定 store 身份

把 store 创建放在模块作用域或明确的应用工厂中，再在入口使用同一实例：

```tsx
// store.ts
import { configureStore } from '@reduxjs/toolkit'

type AppState = Readonly<{ ready: boolean }>

/** 为应用提供初始状态，并返回未知 action 的原状态。 */
function appReducer(state: AppState = { ready: true }, _action: { type: string }): AppState {
  return state
}

export const store = configureStore({ reducer: appReducer })
```

```tsx
// main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { App } from './App'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
```

StrictMode 仍然属于 React 的开发检查边界。它可能让开发期挂载与清理发生额外次数，但不改变 Provider 应提供的
store 身份；React Redux 会对订阅建立与清理保持对称。

### 2. 用后代组件观察同一 store

在不提前展开 selector 或 dispatch 的情况下，可以让一个后代探针通过低层 Context 观察 Provider 提供的 store 身份，
确认它与入口传入的对象相同。这个探针只用于理解作用域，不是业务组件的状态读取方案。

```tsx
import { ReactReduxContext } from 'react-redux'

type StoreProbeProps = {
  expectedStore: typeof store
}

/** 显示后代取得的 store 是否就是入口传入的实例。 */
function StoreProbe({ expectedStore }: StoreProbeProps): React.ReactElement {
  return (
    <ReactReduxContext.Consumer>
      {(contextValue) => (
        <output>{contextValue?.store === expectedStore ? '同一份 store' : '未接入 Provider'}</output>
      )}
    </ReactReduxContext.Consumer>
  )
}
```

把这个低层探针放在 Provider 外部时，`ReactReduxContext.Consumer` 会收到默认值 `null`，因此显示“未接入
Provider”；如果改为在同一位置调用 React Redux hooks，则会触发“找不到 react-redux context value”的开发错误。
排查这类接入问题时，先检查组件是否位于正确的 Provider 子树，而不是在组件里重新创建 store。

### 3. 通过 children 组合多个区域

Provider 不要求 children 必须是单个元素。只要这些节点处在 Provider 标签内部，它们就属于同一个 store 作用域：

```tsx
<Provider store={store}>
  <header>导航</header>
  <main>
    <App />
  </main>
</Provider>
```

如果只有一部分页面需要 Redux，也可以把 Provider 放在那部分页面的共同父级；位置的选择应由状态消费者范围
决定，而不是机械地为每个组件增加一层 Provider。

## 五、Demo：观察 Provider 的作用域

下面的 Demo 使用 `configureStore` 创建 store，并在 Provider 内放置一个 store 身份探针。点击“重新渲染外层组件”会让
根组件和 Provider 一起重新渲染，探针仍会显示它拿到的是 Provider 接入的同一份 store；Demo 不在组件 render 中调用
`configureStore`，也不通过按钮 dispatch 业务 action。

:::demo{id="react.redux.learn.basics.provider.provider-scope-demo"}
观察 Provider 如何把入口 store 传给后代组件，以及 React 重新渲染时 store 身份如何保持不变。
:::

## 六、易错使用提示

:::pitfalls

### 错误：把 Provider 当成 store 创建器

**触发条件：** 认为写下 `<Provider>` 就会自动得到一份新的 Redux store，或没有在外部创建并传入 `store`。

**原因：** Provider 的职责是把已有 store 放进 React Context；store 仍由 `configureStore` 等 Redux 入口创建。

**后果：** 缺少 `store` 会在类型检查或运行时失败，组件也没有可连接的状态来源。

**错误示例：**

```tsx
<Provider>
  <App />
</Provider>
```

**正确写法：**

```tsx
const store = configureStore({ reducer: appReducer })

<Provider store={store}>
  <App />
</Provider>
```

**验证方式：** 检查 Provider 的 `store` 属性引用一份真实 store，并确认该实例在应用入口创建。

### 错误：把需要连接的组件放在 Provider 外部

**触发条件：** 页面或功能组件位于 Provider 标签外，却在其中调用 React Redux 连接 API。

**原因：** Context 只向 Provider 的后代传播，兄弟节点和祖先节点不会自动获得这份值。

**后果：** 使用 React Redux hooks 时会出现 `could not find react-redux context value`，组件无法连接到 store；
直接读取 `ReactReduxContext.Consumer` 则只会得到默认值 `null`。

**错误示例：**

```tsx
<>
  <Provider store={store}>
    <AppHeader />
  </Provider>
  <TaskList />
</>
```

**正确写法：**

```tsx
<Provider store={store}>
  <AppHeader />
  <TaskList />
</Provider>
```

**验证方式：** 从使用 React Redux API 的组件沿父级向上检查，直到能找到提供同一 store 的 Provider。

### 错误：在组件 render 中重复创建 store

**触发条件：** 把 `configureStore(...)` 直接写在会重复执行的组件函数体内。

**原因：** 每次函数执行都会生成新的 store 实例，Provider 的上下文和后代订阅可能随渲染被替换。

**后果：** 状态回到初始值，store identity 不稳定，订阅关系也不再指向同一份状态。

**错误示例：**

```tsx
function App(): React.ReactElement {
  const store = configureStore({ reducer: appReducer })
  return <Provider store={store}><Page /></Provider>
}
```

**正确写法：**

```tsx
const store = configureStore({ reducer: appReducer })

function App(): React.ReactElement {
  return <Provider store={store}><Page /></Provider>
}
```

**验证方式：** 在组件重新渲染前后比较 store identity；正常应用入口应继续使用同一个实例。

### 错误：Provider 与消费者使用不同的 context

**触发条件：** Provider 传入自定义 `context`，但消费者仍使用默认 React Redux hooks 或另一个 Context 实例。

**原因：** Context 按对象身份匹配；名字相同或结构相同的两个 Context 也不会互相读取。

**后果：** 消费者看不到 Provider 的值，得到与缺少 Provider 类似的 context 错误。

**错误示例：**

```tsx
const customContext = createContext(null)

<Provider context={customContext} store={store}>
  <TaskList />
</Provider>
// TaskList 仍使用默认 hooks，无法读取 customContext
```

**正确写法：**

```tsx
import { createContext } from 'react'
import {
  Provider,
  createStoreHook,
  type ReactReduxContextValue,
} from 'react-redux'

const customContext = createContext<ReactReduxContextValue | null>(null)
const useCustomStore = createStoreHook(customContext)

<Provider context={customContext} store={store}>
  <TaskList />
</Provider>

/** 从自定义 Context 读取当前 Provider 提供的 store。 */
function TaskList() {
  const connectedStore = useCustomStore()
  return <output>{connectedStore === store ? '已接入' : '未接入'}</output>
}
```

**验证方式：** 检查 Provider 和消费者是否引用同一个 context 实例；不需要自定义 context 时省略该属性。

### 错误：在普通客户端入口加入不匹配的 serverState

**触发条件：** 没有使用 `hydrateRoot`，却随意向 Provider 传入另一份或不完整的服务端快照。

**原因：** `serverState` 是 SSR hydration 的首轮 server snapshot 合同，不是普通客户端的第二份状态来源。

**后果：** 首轮渲染可能与服务端 HTML 或客户端 store 的状态不一致，排查时出现难以解释的 hydration 差异。

**错误示例：**

```tsx
<Provider store={store} serverState={{ ready: false }}>
  <App />
</Provider>
```

**正确写法：**

```tsx
// 普通 Vite 客户端只传入当前应用的 store
<Provider store={store}>
  <App />
</Provider>
```

**验证方式：** 只有在 hydrateRoot 使用与 store 起点一致的完整服务端快照时才设置 `serverState`。
:::

## 七、源码推导与适用场景

### 1. 官方事实

React Redux 9.3.0 的 Provider 源码根据 `store` 和可选 `serverState` 创建 context value，其中包含 store、内部
订阅对象以及需要时的服务端快照读取函数。布局效果建立 store 订阅，卸载时取消订阅并清理回调，最终通过
`Context.Provider` 把 value 和 `children` 放入 React 树。

官方测试还覆盖了 StrictMode 下无 Provider 错误、Provider 卸载后的订阅清理，以及替换 store 时订阅切换。这些是
实现行为的证据，不等于业务代码应手写相同的订阅流程。

### 2. 课程推导

因此可以把 Provider 记成“已有 store 的 React 入口”：它决定哪些后代共享同一 store，并把连接所需的订阅边界
交给 React Redux 管理。若组件不在这个范围内，使用连接 API 就没有可读取的 context；若 store 在 render 中不断变化，
Provider 也无法提供稳定的共享来源。

### 3. 适用边界

普通客户端通常在根级创建一次 store，再用一个 Provider 包裹应用。多 store、可复用组件库的自定义 context、SSR
hydration 的 `serverState` 和 selector 开发检查都需要额外的上下文，不应为了展示 props 而加入最小入口。

## 八、练习

:::exercise
### 练习目标

**要求：** 分别创建 `store.ts`、`App.tsx` 和 `main.tsx`。`App.tsx` 使用
`ReactReduxContext.Consumer` 显示 Context 是否存在；`main.tsx` 用稳定导出的 store 包裹 `App`，并在根节点
旁边渲染一个 Provider 外探针。组件重新渲染后仍复用同一个 store，不要在组件函数体内调用 `configureStore`，也不要
添加 `serverState` 或自定义 context。

**验收：** Provider 内的 App 显示 `同一份 store`，外部探针显示 `未接入 Provider`；触发任意 React State 更新后，
Provider 仍引用同一个 store，且代码只在模块或入口初始化阶段创建一次 store。

**参考答案：**

```tsx
// store.ts
import { configureStore } from '@reduxjs/toolkit'

type AppState = Readonly<{ ready: boolean }>

/** 为 Provider 提供可用的最小 Redux reducer。 */
function appReducer(state: AppState = { ready: true }, _action: { type: string }): AppState {
  return state
}

export const store = configureStore({ reducer: appReducer })

// App.tsx
import type { ReactElement } from 'react'
import { ReactReduxContext } from 'react-redux'
import { store } from './store'

/** 通过 React Redux Context 显示 App 是否接入入口 store。 */
export function App(): ReactElement {
  return (
    <ReactReduxContext.Consumer>
      {(contextValue) => (
        <output>{contextValue?.store === store ? '同一份 store' : '未接入 Provider'}</output>
      )}
    </ReactReduxContext.Consumer>
  )
}

// main.tsx
import { StrictMode, useState, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, ReactReduxContext } from 'react-redux'
import { App } from './App'
import { store } from './store'

/** 通过局部 State 触发重新渲染，同时保持 Provider 的 store 不变。 */
function Root(): ReactElement {
  const [renderCount, setRenderCount] = useState(0)
  return (
    <>
      <Provider store={store}>
        <App />
        <button type="button" onClick={() => setRenderCount((count) => count + 1)}>
          重新渲染 {renderCount}
        </button>
      </Provider>
      <OutsideProbe />
    </>
  )
}

/** 观察根节点旁未被 Provider 包裹的 Context 状态。 */
function OutsideProbe(): ReactElement {
  return (
    <ReactReduxContext.Consumer>
      {(contextValue) => (
        <output>{contextValue === null ? '未接入 Provider' : '意外接入'}</output>
      )}
    </ReactReduxContext.Consumer>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
```
:::

## 九、本节小结

- 先由 `configureStore` 创建 store，再由 Provider 把它接入 React 子树。
- Provider 的作用域只覆盖 `children` 及其后代，根级包裹通常最容易保持边界清晰。
- Provider 建立 Context 和订阅边界，但不创建 reducer、不 dispatch，也不替代组件 Hooks。
- Provider 与消费者必须共享同一个 context；普通客户端不需要随意加入 `serverState`。
- store 身份应在应用生命周期内稳定，避免在 render 中重复调用 `configureStore`。

## 十、参考资料

- [Provider API](https://react-redux.js.org/api/provider) - Provider props、children、serverState 和自定义 context。
- [React Redux Getting Started](https://react-redux.js.org/introduction/getting-started) - 根级 Provider 接入示例。
- [Accessing the Store](https://react-redux.js.org/using-react-redux/accessing-store) - React 组件访问 store 的上下文边界。
- [Provider.tsx](https://raw.githubusercontent.com/reduxjs/react-redux/4134f88f179c46d3ae9c4ee7baaa589ff0fecfa8/src/components/Provider.tsx) - 固定版本的 context value 与订阅生命周期。
