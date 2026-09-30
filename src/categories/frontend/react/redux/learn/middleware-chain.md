---
id: react.redux.learn.intermediate.middleware-chain
type: lesson
title: Middleware 执行链
summary: 用可组合的 middleware 包装 dispatch，观察 action 如何依次通过拦截、转发和 Reducer。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 100
prerequisites:
  - react.redux.learn.intermediate.extra-reducers-action-matcher
related:
  - react.redux.learn.basics.configure-store
  - react.redux.learn.intermediate.thunk-async-logic
  - react.redux.learn.basics.redux-devtools
tags:
  - Redux
  - Redux Toolkit
  - Middleware
  - dispatch
  - next
  - applyMiddleware
  - configureStore
  - Tuple
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能写出 Redux middleware 的三层函数签名，并说明每一层的职责。
  - 能根据注册顺序预测 action 进入和离开 middleware 的顺序。
  - 能区分用 next 转发当前 action 与用 dispatch 重新进入完整执行链。
  - 能实现观察、短路和返回值传递等 middleware 行为。
  - 能使用 configureStore 的 middleware 回调注入自定义 middleware，并保留明确的顺序。
recap:
  - middleware 通过 ({ dispatch, getState }) => next => action 包装 store.dispatch。
  - next(action) 只把当前 action 交给链中的后续部分；dispatch(action) 会从链的最外层重新开始。
  - 不调用 next 会短路当前 action；middleware 返回值会成为 dispatch 的返回值。
  - configureStore 是 RTK 应用的入口，middleware 回调返回 Tuple 或默认 middleware 结果。
  - middleware 只应承担跨 action 的观察、转换或副作用边界，业务状态仍由 Reducer 负责。
sources:
  - title: Redux applyMiddleware API
    url: https://redux.js.org/api/applymiddleware
    sourceType: api-doc
    appliesTo: Redux 5.0.1+
    claims:
      - middleware 接收 dispatch、getState 和后续 next，并可以调用或不调用 next(action)。
      - middleware 可组合，最后一个 middleware 的 next 是原始 store.dispatch。
      - middleware 是扩展 dispatch 的机制，Redux Toolkit 的 configureStore 会自动配置 middleware 支持。
  - title: Redux Middleware Guide
    url: https://redux.js.org/understanding/history-and-design/middleware
    sourceType: official-reference
    appliesTo: Redux 5.0.1+
    claims:
      - middleware 位于 dispatch action 与 Reducer 接收 action 之间。
      - middleware 可以记录 action、读取更新后的 state，并通过组合形成执行链。
      - middleware 的链式函数结构通过 next 参数实现，而不是要求直接改写 store.dispatch。
  - title: Redux 5.0.1 applyMiddleware Source
    url: https://github.com/reduxjs/redux/blob/v5.0.1/src/applyMiddleware.ts
    sourceType: source-code
    appliesTo: Redux 5.0.1
    claims:
      - 固定源码按传入顺序创建 middleware chain，并用 compose 将其接到原始 store.dispatch 前。
      - middlewareAPI.dispatch 指向最终组装后的 dispatch，因此 middleware 内部 dispatch 会重新进入完整链。
      - middleware 初始化期间调用 dispatch 会抛出错误，避免使用尚未组装完成的链。
  - title: Redux 5.0.1 Middleware Type Source
    url: https://github.com/reduxjs/redux/blob/v5.0.1/src/types/middleware.ts
    sourceType: source-code
    appliesTo: Redux 5.0.1
    claims:
      - Middleware 类型定义 api 到 next、再到 action 的三层函数结构。
      - Redux 5 的 next 与 action 参数按 unknown 处理，middleware 需要在读取字段前完成运行时判断。
  - title: Redux 5.0.1 applyMiddleware Tests
    url: https://github.com/reduxjs/redux/blob/v5.0.1/test/applyMiddleware.spec.ts
    sourceType: official-test
    appliesTo: Redux 5.0.1
    claims:
      - 官方测试覆盖 middleware 的包装、递归 dispatch 和派发返回值传递。
      - 官方测试覆盖 middleware 初始化阶段禁止 dispatch 的行为。
  - title: Redux Toolkit configureStore API
    url: https://redux-toolkit.js.org/api/configureStore
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - configureStore 的 middleware 选项可以接收 getDefaultMiddleware 回调并返回 middleware Tuple。
      - TypeScript 场景下，未使用默认 middleware 结果时应使用 Tuple 维持 middleware 类型推导。
      - middleware 选项负责 middleware，只有需要扩展 enhancer 时才使用 enhancers 选项。
  - title: Redux Toolkit 2.12.0 configureStore Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码将 middleware 交给 applyMiddleware enhancer，并按回调返回值构造最终链。
      - 开发环境会检查 middleware 是否为函数、是否重复，以及 middleware enhancer 是否保留。
  - title: Redux Toolkit Latest npm Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
    sourceType: official-reference
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 核验日 npm latest 指向 Redux Toolkit 2.12.0。
---

# Middleware 执行链

## 一、学习目标

- 写出 middleware 的三层函数，并解释 `dispatch`、`getState`、`next` 和 `action` 的作用。
- 根据 middleware 注册顺序预测 action 进入和离开每一层的顺序。
- 用 `next` 转发当前 action，用 `dispatch` 重新从链首派发另一个 action。
- 实现观察、短路和返回值传递，并知道这些行为如何影响 Reducer。
- 使用 `configureStore` 注入一组顺序明确的自定义 middleware。

## 二、为什么需要 Middleware

Reducer 应该只根据 action 计算下一个 state，但日志、埋点、路由跳转、异步触发和错误上报等横切行为不属于某一个 Slice。
如果每个组件都手动包一层 `dispatch`，调用方很快会出现重复逻辑和不一致的顺序。

Middleware 提供一个集中扩展点：action 已经被派发，但还没有交给 Reducer 时，middleware 可以读取当前状态、记录事件、改写或拦截 action，
也可以派发另一个 action。多个 middleware 组合后形成一条可复用的执行链。

## 三、核心概念

### 1. 三层函数签名

一个 middleware 的最小结构是：

```ts
const observe: Middleware = ({ dispatch, getState }) => (next) => (action) => {
  console.log('before', action)
  const result = next(action)
  console.log('after', getState())
  return result
}
```

- 第一层收到 store API。`dispatch` 会重新进入完整链，`getState` 读取当前 state。
- 第二层收到链中后续的 `next` 函数。
- 第三层收到当前 action，决定记录、转发、改写、短路或返回什么。

Redux 5 的 `Middleware` 类型把 `action` 和 `next` 的输入视为 `unknown`。读取 `action.type` 前应先用类型守卫确认它是带字符串 `type` 的对象；
这不是改变链的规则，而是 TypeScript 对未知 action 的显式约束。

### 2. 顺序是嵌套的

若注册顺序是 `first`、`second`、`third`，一个普通 action 的顺序是：

```text
first before
  second before
    third before
      reducer
    third after
  second after
first after
```

进入阶段按注册顺序，离开阶段按反向顺序。每一层只有调用 `next(action)`，链才会继续向后移动。

### 3. `next` 与 `dispatch` 不是同一个入口

`next(action)` 表示“把当前 action 交给我后面的链”。它不会再次经过当前 middleware 或前面的 middleware。

`dispatch(action)` 表示“从 store 的派发入口重新开始”。因此 middleware 内部用 `dispatch` 派发审计 action 时，审计 action 会再次经过完整链；
用 `next` 转发原 action 时，则只会继续后半段。这个区别决定了日志是否重复、某个拦截器是否会再次运行，以及是否可能产生递归。

### 4. 不调用 `next` 就是短路

```ts
const blockDemoAction: Middleware = () => (next) => (action) => {
  if (isDemoAction(action) && action.type === 'demo/blocked') {
    return { type: 'middleware/blocked' }
  }

  return next(action)
}
```

短路 action 不会到达后面的 middleware 和 Reducer。短路不是错误处理的默认方式：只有明确不应继续的 action 才应该被拦截，
并且调用方应能理解返回值代表“被拦截”，而不是误以为 Reducer 已更新状态。

### 5. 返回值会沿 dispatch 返回

Middleware 可以返回 `next(action)` 的结果，也可以返回自定义结果。`store.dispatch(action)` 得到的就是最外层 middleware 返回的值。
因此应保持返回链，除非当前 middleware 明确提供了新的返回契约；无意间省略 `return` 会让调用方拿到 `undefined`，也可能破坏异步组合。

### 6. 用 configureStore 注入 middleware

RTK 应用使用 `configureStore` 创建 store。只使用自己提供的 middleware 时，TypeScript 可以用 `Tuple` 明确顺序和类型：

```ts
const store = configureStore({
  reducer,
  middleware: () => new Tuple(observe, blockDemoAction),
})
```

如果需要保留 RTK 默认 middleware，应在后续课程学习的 `getDefaultMiddleware()` 结果上使用 `.concat()` 或 `.prepend()`；不要把普通数组直接替换默认配置，
再把默认检查行为误认为本课的执行链规则。

## 四、用法与示例

### 1. 观察 Reducer 前后的状态

记录 action 前后的日志时，`getState()` 在 `next(action)` 返回后才代表 Reducer 已经处理当前 action。若在调用 `next` 之前读取，看到的是旧状态。

### 2. 只在需要时重新派发

Middleware 可以根据当前 action 派发一个独立的审计 action，但要确保审计 action 不会再次触发相同条件。通常用不同的 action type，或在 guard 中明确排除审计事件。

### 3. 先确定责任，再选择短路还是转发

身份校验、重复提交或开发诊断可能需要短路；日志和埋点通常必须转发；action 改写则要清楚说明 Reducer 最终收到的是什么。不要让多个 middleware 隐式争夺同一个业务字段。

## 五、Demo：观察 Middleware 执行链

:::demo{id="react.redux.learn.intermediate.middleware-chain.middleware-chain-observer-demo"}
:::

Demo 注册 `outer`、`dispatch-inside`、`blocker` 和 `inner` 四层 middleware：

1. “普通 action”展示进入顺序、Reducer 处理和反向离开顺序。
2. “内部 dispatch”在 middleware 中派发审计 action，事件列表能看到审计 action 从链首重新开始。
3. “短路 action”由 `blocker` 返回结果，不调用 `next`，因此 Reducer 计数不会变化。
4. 每次派发都显示最外层返回值和最近事件，重置会清空状态与观察日志。

## 六、易错使用提示

:::pitfalls
### 错误：直接返回而不调用 next

**触发条件：** 在记录日志后忘记 `return next(action)`。

**原因：** middleware 没有把 action 交给链的后续部分。

**后果：** 后续 middleware 和 Reducer 都收不到 action，界面看起来像 dispatch 失效。

**错误示例：**

```ts
const logger: Middleware = () => (_next) => (action) => {
  console.log(action)
}
```

**正确写法：**

```ts
const logger: Middleware = () => (next) => (action) => {
  console.log(action)
  return next(action)
}
```

**验证方式：** 派发一个 Reducer 会计数的 action；正确写法的计数应增加。

### 错误：用 dispatch 转发当前 action

**触发条件：** middleware 收到 action 后用 `dispatch(action)` 代替 `next(action)`。

**原因：** `dispatch` 会从链首重新开始，而不是只进入后续 middleware。

**后果：** 当前 middleware 可能再次收到同一个 action，形成递归或重复日志。

**错误示例：**

```ts
const badForward: Middleware = ({ dispatch }) => () => (action) => dispatch(action)
```

**正确写法：**

```ts
const forward: Middleware = () => (next) => (action) => next(action)
```

**验证方式：** 在 middleware 中记录同一 action 的次数；转发一次只能让当前层处理一次。

### 错误：依赖“所有 middleware 都会执行”的假设

**触发条件：** 在前面的 middleware 短路后，仍期待后面的日志或 Reducer 运行。

**原因：** 不调用 `next` 会终止当前 action 的后续链路。

**后果：** 状态不变，后续观察器也没有记录，调用方只能依赖 middleware 返回值判断结果。

**错误示例：**

```ts
const blocker: Middleware = () => (_next) => (action) => {
  if (isDemoAction(action)) return { type: 'blocked' }
  return undefined
}
```

**正确写法：**

```ts
const blocker: Middleware = () => (next) => (action) => {
  if (isDemoAction(action) && action.type === 'demo/blocked') {
    return { type: 'middleware/blocked' }
  }
  return next(action)
}
```

**验证方式：** 对被拦截 action 检查 Reducer 计数不变，对普通 action 检查计数正常增加。

### 错误：用普通数组替换 RTK 默认 middleware 却没有意识到边界

**触发条件：** 在 `configureStore` 中只返回自定义数组，却仍假设 thunk 和开发检查自动存在。

**原因：** 提供 middleware 回调后，返回值就是最终 middleware 集合。

**后果：** 既有异步逻辑或错误检查可能静默消失，问题被误归因于自定义 middleware 顺序。

**错误示例：**

```ts
configureStore({ reducer, middleware: () => new Tuple(logger) })
```

**正确写法：**

```ts
configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
})
```

**验证方式：** 如果应用依赖 RTK 默认能力，分别检查自定义 middleware 与默认 middleware 是否都在最终配置中。
:::

## 七、源码推导与适用场景

### 1. Middleware API 为什么能组合

Redux 5.0.1 的 `applyMiddleware.ts` 固定源码先建立 `middlewareAPI`，再把每个 middleware 映射为接收 `next` 的函数，最后用 `compose` 套在原始 `store.dispatch` 上。
官方测试还验证了递归 dispatch 会重新经过链，说明 `middlewareAPI.dispatch` 必须指向组装后的 dispatch，而不是初始化时的占位函数。

由此推导：middleware 应保持纯粹的“接收 action、决定是否转发、返回结果”边界，把跨模块副作用集中在链上。

边界是这些是实现机制，不承诺某个第三方 middleware 的内部日志格式；middleware 初始化阶段也不能调用 dispatch。

### 2. `next` 与 `dispatch` 的不同来自类型和实现

固定的 `Middleware` 类型把 `next` 定义为接收 unknown 并返回 unknown 的函数；`applyMiddleware` 源码则把 `middlewareAPI.dispatch` 绑定到最终 dispatch。
这解释了 `next` 只进入后半段、`dispatch` 重新进入完整链的行为。

由此推导：用 `next` 继续当前 action，用 `dispatch` 发起语义上独立的新 action；两者不要根据“都能让 Reducer 收到 action”而混用。

边界是 action 的 payload 结构仍由 action creator 和 Reducer 共同定义，middleware 不应替代业务类型校验。

### 3. RTK 的 middleware 选项是链的装配点

RTK 2.12.0 的 `configureStore.ts` 固定源码把 middleware 回调结果交给 Redux 的 `applyMiddleware`，并在开发环境检查函数类型、重复引用和 enhancer 是否保留。

由此推导：课程代码可以用 `Tuple` 明确自定义链；生产应用若依赖默认检查，应在 `getDefaultMiddleware()` 上追加，而不是无意覆盖。

边界是默认 middleware 的具体成员和检查规则属于下一课；本课只使用它们作为配置边界，不把默认列表当作当前知识点。

## 八、练习

:::exercise
### 组合两个 Middleware 并观察短路

**要求：** 使用 `configureStore` 创建一个带计数 Reducer 的 store。编写 `recordingMiddleware` 记录 action 进入和离开，编写 `blockMiddleware` 拦截 `demo/blocked`，其他 action 用 `next` 转发；用 `new Tuple(recordingMiddleware, blockMiddleware)` 注入。分别派发普通 action 和被拦截 action，记录返回值与计数。

**验收：** 普通 action 的进入、Reducer 更新、离开顺序正确；被拦截 action 不会更新计数且返回值明确；middleware 始终返回 `next(action)` 或短路结果；答案不依赖 Redux Toolkit 默认 middleware。

**参考答案：**

```ts
import { configureStore, createAction, createSlice, Tuple, type Middleware } from '@reduxjs/toolkit'

const increment = createAction('demo/increment')
const blocked = createAction('demo/blocked')

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(increment, (state) => {
      state.count += 1
    })
  },
})

const events: string[] = []
const isTypedAction = (action: unknown): action is { type: string } =>
  typeof action === 'object' && action !== null && 'type' in action && typeof action.type === 'string'

const recordingMiddleware: Middleware = () => (next) => (action) => {
  const type = isTypedAction(action) ? action.type : 'unknown'
  events.push(`enter:${type}`)
  const result = next(action)
  events.push(`leave:${type}`)
  return result
}

const blockMiddleware: Middleware = () => (next) => (action) => {
  if (isTypedAction(action) && action.type === blocked.type) {
    events.push('blocked')
    return { type: 'middleware/blocked' }
  }
  return next(action)
}

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
  middleware: () => new Tuple(recordingMiddleware, blockMiddleware),
})

const acceptedResult = store.dispatch(increment())
const blockedResult = store.dispatch(blocked())

console.log(acceptedResult.type)
console.log(blockedResult.type)
console.log(store.getState().counter.count)
console.log(events)
```
:::

## 九、本节小结

- middleware 通过 `({ dispatch, getState }) => next => action` 包装 dispatch。
- 注册顺序决定进入顺序，`next` 返回时形成反向离开顺序。
- `next` 继续当前 action 的后半链，`dispatch` 让新 action 从链首重新开始。
- 不调用 `next` 会短路；返回值会成为 `store.dispatch` 的返回值。
- RTK 用 `configureStore` 装配 middleware；是否保留默认 middleware 必须是明确选择。

## 十、参考资料

- [Redux applyMiddleware API](https://redux.js.org/api/applymiddleware) - middleware 签名、组合和 dispatch 扩展边界。
- [Redux Middleware Guide](https://redux.js.org/understanding/history-and-design/middleware) - middleware 的动机、链式结构和实践示例。
- [Redux 5.0.1 applyMiddleware 源码](https://github.com/reduxjs/redux/blob/v5.0.1/src/applyMiddleware.ts) - chain 装配、递归 dispatch 和初始化占位 dispatch。
- [Redux 5.0.1 Middleware 类型源码](https://github.com/reduxjs/redux/blob/v5.0.1/src/types/middleware.ts) - 三层函数类型和 unknown action 边界。
- [Redux 5.0.1 applyMiddleware 官方测试](https://github.com/reduxjs/redux/blob/v5.0.1/test/applyMiddleware.spec.ts) - 链式调用、递归 dispatch、返回值与初始化约束。
- [Redux Toolkit configureStore API](https://redux-toolkit.js.org/api/configureStore) - middleware 回调、Tuple 和默认 middleware 边界。
- [Redux Toolkit 2.12.0 configureStore 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts) - middleware 到 applyMiddleware enhancer 的装配。
