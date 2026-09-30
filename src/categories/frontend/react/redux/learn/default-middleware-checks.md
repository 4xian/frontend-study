---
id: react.redux.learn.intermediate.default-middleware-checks
type: lesson
title: 默认 Middleware 检查
summary: 理解 configureStore 自动加入的开发期检查，并在保留默认能力的前提下配置例外。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 110
prerequisites:
  - react.redux.learn.intermediate.middleware-chain
related:
  - react.redux.learn.basics.configure-store
  - react.redux.learn.basics.reducer-and-immer
  - react.redux.learn.intermediate.thunk-async-logic
tags:
  - Redux
  - Redux Toolkit
  - Middleware
  - getDefaultMiddleware
  - serializableCheck
  - immutableCheck
  - actionCreatorCheck
  - configureStore
appliesTo: Redux Toolkit 2.12.0、Redux 5.0.1、React Redux 9.3.0、React 19.2.8
verifiedAt: 2026-08-31
objectives:
  - 能说出开发和生产环境下 getDefaultMiddleware 的默认成员与顺序。
  - 能识别 action creator 误派、状态变更和非序列化值三类开发期问题。
  - 能使用 immutableCheck、serializableCheck 和 actionCreatorCheck 配置默认检查。
  - 能在追加自定义 middleware 时保留默认检查和 thunk，并理解关闭检查的代价。
  - 能为确有边界的非序列化数据选择 ignoredActions 或 ignoredPaths，而不是静默关闭所有检查。
recap:
  - configureStore 未覆盖 middleware 时会使用 getDefaultMiddleware；开发环境默认按 action creator、immutable、thunk、serializable 的顺序组合，生产环境默认只保留 thunk。
  - action creator 检查提醒 dispatch(actionCreator) 的误用；immutable 检查发现状态被直接变更；serializable 检查报告 action 或 state 中的非序列化值。
  - middleware 回调从 getDefaultMiddleware(options) 开始，再用 concat 或 prepend 追加自定义 middleware，普通数组会替换默认集合。
  - ignoredActions、ignoredActionPaths 和 ignoredPaths 应只覆盖已知边界；关闭检查会失去对应的开发期反馈。
sources:
  - title: Redux Toolkit getDefaultMiddleware API
    url: https://redux-toolkit.js.org/api/getDefaultMiddleware
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - configureStore 默认使用 getDefaultMiddleware 返回的 middleware 集合。
      - 开发环境默认顺序为 actionCreatorInvariant、immutableStateInvariant、thunk、serializableStateInvariant，生产环境默认只有 thunk。
      - thunk、immutableCheck、serializableCheck 和 actionCreatorCheck 可以用布尔值或选项对象配置。
  - title: Redux Toolkit configureStore API
    url: https://redux-toolkit.js.org/api/configureStore
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - middleware 回调接收 getDefaultMiddleware，并应返回希望加入 store 的 middleware 集合。
      - 未使用 getDefaultMiddleware 结果时，TypeScript 应使用 Tuple 维持 middleware 类型推导。
      - middleware 回调返回的集合会交给 Redux applyMiddleware，返回普通数组会替换默认集合。
  - title: Redux Toolkit 2.12.0 getDefaultMiddleware Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/getDefaultMiddleware.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - 固定源码按开发环境条件组装 action creator、immutable、thunk 和 serializable middleware。
      - 生产环境分支只把 thunk 放入默认 Tuple。
  - title: Redux Toolkit 2.12.0 configureStore Source
    url: https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts
    sourceType: source-code
    appliesTo: Redux Toolkit 2.12.0
    claims:
      - configureStore 在未提供 middleware 时调用 getDefaultMiddleware，并把结果交给 applyMiddleware。
      - 开发环境会检查 middleware 是否为函数、是否重复，以及 middleware enhancer 是否保留。
  - title: Redux Toolkit Serializability Middleware API
    url: https://redux-toolkit.js.org/api/serializabilityMiddleware
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - serializable middleware 检查 action 和 state 中的非序列化值并将诊断记录到 console.error。
      - serializableCheck 支持 ignoredActions、ignoredActionPaths、ignoredPaths 和检查函数等配置。
  - title: Redux Toolkit Immutability Middleware API
    url: https://redux-toolkit.js.org/api/immutabilityMiddleware
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - immutable middleware 检测到状态变更时抛出错误。
      - immutableCheck 支持 ignoredPaths、isImmutable 和 warnAfter 等配置。
  - title: Redux Toolkit Action Creator Middleware API
    url: https://redux-toolkit.js.org/api/actionCreatorMiddleware
    sourceType: api-doc
    appliesTo: Redux Toolkit 2.12.0+
    claims:
      - action creator middleware 检测把 action creator 本身传给 dispatch 的常见误用。
      - actionCreatorCheck 可以关闭或通过 isActionCreator 自定义识别规则。
---

# 默认 Middleware 检查

## 一、学习目标

- 说出 `getDefaultMiddleware` 在开发和生产环境的默认成员与顺序。
- 识别 action creator 误派、状态直接变更和非序列化值三类问题。
- 使用 `immutableCheck`、`serializableCheck` 和 `actionCreatorCheck` 配置默认检查。
- 追加自定义 middleware 时保留默认检查和 thunk，并知道替换默认集合的后果。
- 为明确的第三方边界配置忽略路径，而不是无条件关闭诊断。

## 二、为什么需要默认检查

Middleware 执行链解决了“如何组合”的问题，但没有回答“哪些错误值得在开发期立刻暴露”。Redux Toolkit 的默认 middleware 把几类高频错误放到同一条链上：误把 action creator 当 action 派发、在 dispatch 之间直接改 state、把函数或 Date 放进 action/state，以及异步逻辑所需的 thunk。

这些检查服务于开发反馈，不是业务运行时验证。它们会增加开发期 dispatch 的检查成本，生产环境默认移除诊断 middleware；不能把关闭检查当成修复错误。

## 三、核心概念

### 1. 默认集合和顺序

未提供 `middleware` 选项时，`configureStore` 会调用 `getDefaultMiddleware`。Redux Toolkit 2.12.0 的开发环境默认顺序是：

```text
actionCreatorInvariant
immutableStateInvariant
thunk
serializableStateInvariant
```

生产环境默认只保留 `thunk`。顺序属于当前版本实现事实，升级时应重新核对。

### 2. 三类检查

Action creator 是生成 action 的函数。正确派发的是 `dispatch(increment())`，而不是 `dispatch(increment)`；后者会被 action creator 检查诊断。由于默认 `thunk` 会把函数当作 thunk 执行，误派 action creator 不一定会再由 Redux 抛出普通 action 错误。

Immutable 检查发现 state 被直接修改。应通过 reducer 返回更新，或在 Redux Toolkit 的 Immer draft 中使用允许的“可变写法”。检测到变更时 middleware 会抛出错误。

Serializable 检查会检查 dispatch 的 action 和 reducer 处理后的 state。函数、Promise、Symbol、Date、Map、Set 和 class 实例等值通常不属于默认可序列化数据，发现后通过 `console.error` 报告字段路径。

### 3. 配置选项是边界声明

`getDefaultMiddleware` 的选项可以关闭某项检查，也可以传入选项对象：

```ts
const middleware = getDefaultMiddleware({
  immutableCheck: { ignoredPaths: ['editor.largeDraft'] },
  serializableCheck: {
    ignoredActions: ['persist/FLUSH'],
    ignoredPaths: ['cache.runtimeObject'],
  },
  actionCreatorCheck: true,
})
```

忽略项表达的是“哪些路径属于已知边界”，不是让 reducer 可以随意改变 state。配置越宽，开发期反馈越少。

### 4. 追加而不是替换

要加入自定义 middleware，应从默认结果开始：

```ts
const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
})
```

直接返回 `new Tuple(logger)` 会替换默认 thunk 和开发检查。只有明确要建立完全自定义集合时，才选择替换。

## 四、用法与示例

### 1. 先修复错误，再考虑忽略

先修复 action creator 误派和 state 直接变更；只有确认非序列化对象由外部协议要求且无法在边界转换时，才添加最小的忽略项。

### 2. 使用路径级忽略

`ignoredPaths` 和 `ignoredActionPaths` 可以把例外限制在一个字段。不要把根路径全部忽略，否则其他模块的错误也会被静音。

### 3. 保留 thunk 和默认反馈

追加 logger、埋点或错误上报时，使用 `getDefaultMiddleware().concat(...)` 或 `.prepend(...)`；不要因为自定义 middleware 的类型写法而无意替换 thunk。

## 五、Demo：检查默认 Middleware

:::demo{id="react.redux.learn.intermediate.default-middleware-checks.default-middleware-checks-demo"}
:::

Demo 直接使用 `configureStore` 提供的 `getDefaultMiddleware`，因此开发服务会运行真实默认检查，生产构建则体现生产环境只保留 `thunk` 的行为。

Demo 为每条检查路径创建隔离 store，并显示：

1. 正常 action 通过默认链更新计数。
2. 误派 action creator 在 `actionCreatorCheck` 开启时产生诊断，关闭时显示无诊断的对照。
3. 普通 reducer 直接变更 state 在 `immutableCheck` 开启时抛错，关闭时显示无诊断的对照。
4. Date payload 在 `serializableCheck` 开启时产生诊断，关闭该检查的对照不会产生诊断。
5. 重置会清空报告，临时 store 不与宿主其他课程共享。

## 六、易错使用提示

:::pitfalls
### 错误：把 action creator 本身传给 dispatch

**触发条件：** 写成 `dispatch(increment)`，而不是调用 action creator。

**原因：** action creator 是函数，不是已经创建好的 action 对象。

**后果：** 开发环境的 action creator 检查会产生诊断；默认 thunk 可能把这个函数当作 thunk 执行，因此不能把是否抛出 Redux 错误当成可靠判断。

**错误示例：**

```ts
dispatch(increment)
```

**正确写法：**

```ts
dispatch(increment())
```

**验证方式：** 在开发环境分别开启和关闭 `actionCreatorCheck`，比较误派写法的诊断；正确写法仍应调用 action creator。

### 错误：在 reducer 外直接修改 state

**触发条件：** 对 `store.getState()` 返回的对象或数组直接赋值、`push` 或 `splice`。

**原因：** Redux 依赖不可变更新判断状态变化。

**后果：** immutable middleware 抛错，或更新绕过 action/reducer 造成状态污染。

**错误示例：**

```ts
store.getState().todos.push(todo)
```

**正确写法：**

```ts
builder.addCase(addTodo, (state, action) => {
  state.push(action.payload)
})
```

**验证方式：** 用 action 触发 reducer 更新，检查错误消失且状态仍可追踪。

### 错误：把非序列化值无条件塞进 state

**触发条件：** 把 Date、Promise、函数或 class 实例直接放入 action 或 state。

**原因：** 默认 serializable 检查依赖普通可序列化数据。

**后果：** console.error 报告字段路径，DevTools、持久化或重放语义可能失真。

**错误示例：**

```ts
dispatch(saveSession({ expiresAt: new Date() }))
```

**正确写法：**

```ts
dispatch(saveSession({ expiresAt: new Date().toISOString() }))
```

**验证方式：** 检查 action 和 state 只保存字符串、数字、布尔值、数组或普通对象。

### 错误：为了一个例外关闭全部检查

**触发条件：** 遇到一个第三方 action 后直接设置 `serializableCheck: false` 或 `immutableCheck: false`。

**原因：** 用全局关闭掩盖边界没有被准确建模的问题。

**后果：** 其他模块的错误不再有开发期反馈。

**错误示例：**

```ts
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({ serializableCheck: false, immutableCheck: false })
```

**正确写法：**

```ts
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/FLUSH'],
      ignoredPaths: ['cache.runtimeObject'],
    },
  })
```

**验证方式：** 只有已知例外被忽略，普通错误仍产生诊断。

### 错误：直接返回自定义数组

**触发条件：** 返回 `[logger]` 或 `new Tuple(logger)`，却仍依赖 thunk 和默认检查。

**原因：** middleware 回调返回值会成为最终 middleware 集合。

**后果：** thunk 或开发检查消失。

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

**验证方式：** 检查最终 store 仍能派发 thunk，错误 action 仍能触发默认诊断。
:::

## 七、源码推导与适用场景

### 1. 默认顺序来自固定源码

Redux Toolkit 2.12.0 的 `getDefaultMiddleware.ts` 在开发分支加入 action creator invariant、immutable invariant、thunk 和 serializable invariant，生产分支只加入 thunk。

由此推导：应用配置应从 `getDefaultMiddleware` 开始，而不是复制一份默认列表。固定列表属于当前版本实现，升级时重新核对。

边界是 middleware 的内部实现和警告文案不是业务 API；应用只能依赖文档声明的检查选项和错误类别。

### 2. 三类反馈不应混为业务错误

Action creator 和 serializable 检查通过 console 产生开发诊断，immutable 检查在发现变更时抛出错误。Demo 将同步反馈捕获为报告，只为避免教学页面污染宿主 console，不改变 middleware 的真实反馈类型。

由此推导：可以在开发环境把诊断接入调试面板，但不能在生产环境依赖这些 middleware 做权限、校验或错误处理。

### 3. 选项对象表达例外边界

固定 API 文档列出 `ignoredActions`、`ignoredActionPaths` 和 `ignoredPaths`，说明例外可以限定到 action 或 state 的路径。

由此推导：把忽略项写在 store 配置附近并说明来源，能让维护者区分合法边界和误把错误静音。

边界是忽略配置不会把非序列化对象变成可序列化对象，也不会让直接变更 state 变成合法更新。

## 八、练习

:::exercise
### 保留默认检查并精确忽略一个 action

**要求：** 使用 `configureStore` 创建 store，保留默认 middleware，追加一个 `logger`。模拟 `persist/FLUSH` action 含有不可序列化的 Promise payload，同时派发普通 action；通过 `serializableCheck.ignoredActions` 只忽略 `persist/FLUSH`，并记录两次 dispatch 的结果。

**验收：** 配置从 `getDefaultMiddleware` 开始并使用 `concat(logger)`；`persist/FLUSH` 不产生 serializable 诊断；普通 action 仍更新 reducer，且答案没有关闭 immutable、action creator 或 thunk。

**参考答案：**

```ts
import { configureStore, createAction, createSlice } from '@reduxjs/toolkit'

const flush = createAction<Promise<void>>('persist/FLUSH')
const increment = createAction('counter/increment')

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(increment, (state) => {
      state.value += 1
    })
  },
})

const logger = () => (next: (action: unknown) => unknown) => (action: unknown) => next(action)

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/FLUSH'],
      },
    }).concat(logger),
})

store.dispatch(flush(Promise.resolve()))
store.dispatch(increment())
console.log(store.getState().counter.value)
```
:::

## 九、本节小结

- `configureStore` 默认使用 `getDefaultMiddleware`；开发环境默认顺序为 action creator、immutable、thunk、serializable，生产环境默认只保留 thunk。
- Action creator 误派、state 直接变更和非序列化值分别由不同检查提供反馈。
- 自定义 middleware 应从 `getDefaultMiddleware(options)` 开始，再使用 `concat` 或 `prepend` 追加。
- 对合法第三方边界使用精确的 ignored 选项；关闭检查会减少开发期反馈，不会修复数据设计。
- 检查属于开发辅助能力，不能替代业务校验、权限控制或生产错误处理。

## 十、参考资料

- [Redux Toolkit getDefaultMiddleware API](https://redux-toolkit.js.org/api/getDefaultMiddleware) - 默认成员、顺序、环境差异和配置选项。
- [Redux Toolkit configureStore API](https://redux-toolkit.js.org/api/configureStore) - middleware 回调、Tuple 和默认集合替换边界。
- [Redux Toolkit 2.12.0 getDefaultMiddleware 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/getDefaultMiddleware.ts) - 固定版本的默认组装顺序。
- [Redux Toolkit 2.12.0 configureStore 源码](https://github.com/reduxjs/redux-toolkit/blob/v2.12.0/packages/toolkit/src/configureStore.ts) - configureStore 与 applyMiddleware 的装配。
- [Redux Toolkit Serializable Middleware API](https://redux-toolkit.js.org/api/serializabilityMiddleware) - 非序列化 action/state 检查与 ignored 选项。
- [Redux Toolkit Immutability Middleware API](https://redux-toolkit.js.org/api/immutabilityMiddleware) - 状态变更检查与 ignoredPaths。
- [Redux Toolkit Action Creator Middleware API](https://redux-toolkit.js.org/api/actionCreatorMiddleware) - action creator 误派检查。
