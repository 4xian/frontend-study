---
id: react.redux.learn.intermediate.use-selector-result-identity-and-subscription
type: lesson
title: useSelector 结果身份与订阅
summary: 理解 useSelector 如何用结果身份决定组件更新，并在对象选择、浅比较与拆分订阅之间作出选择。
domain: frontend
technology: react
module: redux
stage: intermediate
level: intermediate
estimatedMinutes: 100
prerequisites:
  - react.redux.learn.intermediate.create-selector
related:
  - react.redux.learn.basics.use-selector
  - react.redux.learn.intermediate.selector
  - react.redux.learn.intermediate.create-selector
tags:
  - React Redux
  - useSelector
  - equalityFn
  - shallowEqual
  - Subscription
  - Profiler
appliesTo: React Redux 9.3.0、Redux Toolkit 2.12.0、Redux 5.0.1、React 19.2.8
verifiedAt: 2026-08-30
objectives:
  - 能区分 store 通知、Selector 执行、结果比较和组件提交四个环节。
  - 能解释默认严格相等比较为什么关注对象与数组的引用身份。
  - 能预测原始值、稳定对象引用和每次新建对象对组件更新的影响。
  - 能在拆分 useSelector、shallowEqual 和记忆化 Selector 之间选择常规方案。
  - 能说明同一组件多次调用 useSelector 时的独立订阅与批处理结果。
  - 能用开发模式检查发现不稳定结果和返回根状态的 Selector。
recap:
  - useSelector 默认用严格等于比较前后两次选择结果，不对对象字段做浅比较。
  - store 更新可以触发 Selector 检查，但结果相等时不会由该订阅推动组件更新。
  - 直接选择 Reducer 保留引用的对象通常稳定，每次创建对象或数组则会产生新身份。
  - 多个原始值可以拆成多个 useSelector，对象结果也可按需要配合 shallowEqual 或记忆化 Selector。
  - 同一组件的多个 useSelector 各自建立订阅，一次 dispatch 中的多个变化通常只形成一次组件提交。
  - stabilityCheck 与 identityFunctionCheck 是开发期诊断，不替代正确的 Selector 边界设计。
sources:
  - title: React Redux Hooks API
    url: https://react-redux.js.org/api/hooks
    sourceType: api-doc
    appliesTo: React Redux 9.3.0
    claims:
      - useSelector 接收 Selector 与可选的 equalityFn 或 options，默认使用严格等于比较选择结果。
      - action 派发后，只有选择结果比较为不相等时，该订阅才推动组件重新渲染。
      - 同一组件可以多次调用 useSelector，每次调用建立独立订阅，并由更新批处理避免重复渲染。
      - 官方建议按场景拆分 Hook、使用记忆化 Selector，或为对象结果传入 shallowEqual。
      - stabilityCheck 与 identityFunctionCheck 默认在开发模式首次选择时执行。
  - title: React Redux 9.3.0 useSelector Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useSelector.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - 固定源码把 subscription.addNestedSub、store.getState、包装后的 Selector 和 equalityFn 交给 useSyncExternalStoreWithSelector。
      - 固定源码的默认 equalityFn 是引用严格相等函数。
      - 固定源码在开发模式执行结果稳定性与根状态身份检查。
  - title: React Redux 9.3.0 Provider Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/components/Provider.tsx
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - Provider 为 store 建立订阅，并把开发检查的默认频率写入 Context。
      - Provider 卸载时取消订阅并清除状态变更处理函数。
  - title: React Redux 9.3.0 Subscription Source
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/src/utils/Subscription.ts
    sourceType: source-code
    appliesTo: React Redux 9.3.0
    claims:
      - 固定源码通过 addNestedSub 登记嵌套监听器，并在通知时使用批处理边界。
      - 订阅引用计数归零时会取消上游订阅并清理监听集合。
  - title: React Redux 9.3.0 useSelector Official Tests
    url: https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/useSelector.spec.tsx
    sourceType: official-test
    appliesTo: React Redux 9.3.0
    claims:
      - 官方测试覆盖默认引用比较、自定义 equalityFn、多次 Hook 调用和卸载后的订阅清理。
      - 官方测试覆盖开发模式下的不稳定结果与根状态身份警告。
  - title: React Redux 9.3.0 npm Latest Metadata
    url: https://registry.npmjs.org/react-redux/latest
    sourceType: official-reference
    appliesTo: React Redux 9.3.0
    claims:
      - npm latest 在核验日指向 React Redux 9.3.0。
  - title: Redux Toolkit 2.12.0 npm Latest Metadata
    url: https://registry.npmjs.org/@reduxjs/toolkit/latest
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
  - title: React 19.2.8 npm Latest Metadata
    url: https://registry.npmjs.org/react/latest
    sourceType: official-reference
    appliesTo: React 19.2.8
    claims:
      - npm latest 在核验日指向 React 19.2.8。
---

# useSelector 结果身份与订阅

## 一、学习目标

- 把一次 Redux 更新拆成 store 通知、Selector 检查、结果比较和组件提交。
- 预测默认 `===` 面对原始值、稳定引用与新对象时的结果。
- 用拆分 `useSelector`、`shallowEqual` 或记忆化 Selector 保持合适的结果身份。
- 解释同一组件多个 `useSelector` 为什么是独立订阅，以及一次 dispatch 为什么通常只提交一次。
- 用开发模式检查发现不稳定结果和选择整个根状态的问题。

## 二、为什么需要理解结果身份

基础用法中，`useSelector` 看起来只是“从 store 读取一个值”：

```tsx
/** 读取当前主题。 */
const theme = useSelector((state: RootState) => state.preferences.theme)
```

真正决定组件是否因为 Redux 更新而重新渲染的，不是“store 有没有派发 action”，而是前后两次选择结果是否相等。默认
情况下，React Redux 使用严格相等比较：

```ts
const resultChanged = previousSelected !== nextSelected
```

字符串、数字和布尔值按值比较，通常容易保持相等。对象与数组按引用比较，即使字段完全相同，只要重新创建了容器，
结果身份也会变化。理解这条边界，才能判断某个组件更新是业务数据真的变化，还是 Selector 每次制造了新引用。

## 三、从 store 更新到组件提交

### 1. 四个环节不是同一件事

一次 action 派发后，可以按以下顺序理解：

1. Reducer 计算新的 store state。
2. store 通知订阅者检查最新快照。
3. `useSelector` 用 Selector 取得结果，并通过 `equalityFn` 与上次结果比较。
4. 结果不相等时，该订阅要求组件更新；结果相等时，该订阅不会推动组件更新。

因此，Selector 执行不等于组件提交。即使无关 slice 让 RootState 成为新对象，只要当前 Selector 仍返回相等结果，组件就
可以跳过这次更新。

### 2. 默认比较是严格等于

`useSelector` 的公共签名允许传入 Selector，以及可选的相等函数或 options：

```ts
const selected = useSelector(selector, equalityFnOrOptions?)
```

省略第二个参数时，默认比较相当于：

```ts
/** 比较两次选择结果是否为同一值或同一引用。 */
const refEquality = (left: unknown, right: unknown) => left === right
```

这与旧式 `connect` 对返回对象字段进行浅比较的习惯不同。`useSelector` 不会自动逐字段比较一个新对象。

### 3. 原始值与稳定引用

直接选择原始值通常稳定：

```tsx
/** 只读取主题字符串。 */
const theme = useSelector((state: RootState) => state.preferences.theme)
```

选择由 Reducer 保留引用的对象也可以稳定：

```tsx
/** 直接读取 preferences 对象引用。 */
const preferences = useSelector((state: RootState) => state.preferences)
```

如果 action 只更新 `activity`，不可变更新会保留未变的 `preferences` 引用，前后结果仍然严格相等。若 Reducer 复制了
`preferences`，即使字段值未变，默认比较也会认为结果变化。

### 4. 每次创建对象会产生新身份

下面的 Selector 每次运行都返回对象字面量：

```tsx
/** 每次调用都会创建新的选择结果。 */
const preferences = useSelector((state: RootState) => ({
  theme: state.preferences.theme,
  density: state.preferences.density,
}))
```

只要 Selector 在 store 更新后再次执行，新的对象引用就不等于上一次结果。即使两个字段都没变，默认比较仍会推动组件
更新。这不是对象内容错误，而是结果身份不稳定。

## 四、选择合适的结果策略

### 1. 拆分多个 useSelector

只需要少量彼此独立的原始值时，可以拆分调用：

```tsx
/** 分别读取两个原始值。 */
function PreferencesSummary() {
  const theme = useSelector((state: RootState) => state.preferences.theme)
  const density = useSelector((state: RootState) => state.preferences.density)

  return <p>{`${theme} / ${density}`}</p>
}
```

每个 Hook 独立比较自己的结果。一个 action 同时改变两个字段时，两个订阅都会发现变化，但 React Redux 的更新批处理会让
该组件通常只完成一次重新渲染，而不是每个 Hook 各提交一次。

### 2. 对小型对象使用 shallowEqual

调用方确实需要一个小型对象时，可以显式使用 `shallowEqual`：

```tsx
import { shallowEqual, useSelector } from 'react-redux'

/** 比较结果对象的第一层字段。 */
const preferences = useSelector(
  (state: RootState) => ({
    theme: state.preferences.theme,
    density: state.preferences.density,
  }),
  shallowEqual,
)
```

Selector 仍然会创建对象，但字段值全部浅相等时，`useSelector` 可以保留上一次选择结果并跳过该订阅更新。若结果包含嵌套
对象，`shallowEqual` 只比较第一层值的身份，不会递归比较深层内容。

### 3. 对派生对象或数组使用记忆化 Selector

筛选、排序、聚合或对象组装属于可复用派生查询时，优先让 `createSelector` 在输入不变时复用结果引用：

```tsx
import { createSelector } from '@reduxjs/toolkit'

/** 读取偏好设置。 */
const selectPreferences = (state: RootState) => state.preferences

/** 只在偏好输入变化时重新组装摘要。 */
const selectPreferenceSummary = createSelector([selectPreferences], (preferences) => ({
  label: `${preferences.theme} / ${preferences.density}`,
  compact: preferences.density === 'compact',
}))

/** 订阅稳定的记忆化结果。 */
const summary = useSelector(selectPreferenceSummary)
```

记忆化既能跳过重复派生计算，也能保持对象或数组结果身份。直接字段读取不需要为了形式全部改成 `createSelector`。

### 4. 选择顺序

常规选择可以从简单到复杂判断：

1. 只要一个原始值或稳定字段引用，直接选择。
2. 需要少量独立原始值，拆分多个 `useSelector`。
3. 需要一次返回小型扁平对象，且字段都适合浅比较，使用 `shallowEqual`。
4. 需要派生计算、可组合查询或稳定数组与对象结果，使用记忆化 Selector。

自定义深比较函数通常不是第一选择。它会在每次检查中承担递归比较成本，也可能掩盖 Selector 边界设计不清的问题。

## 五、订阅、批处理与开发检查

### 1. 每次调用建立独立订阅

同一组件多次调用 `useSelector` 时，每个 Hook 都有自己的选择结果和订阅检查。独立订阅让每个值可以使用自己的 Selector
与相等策略，不表示一次 action 必然产生多次组件提交。

当同一次 dispatch 同时改变多个选择结果，React Redux 与 React 的更新批处理会合并同一轮更新。应使用 React DevTools
Profiler 观察真实 commit。教学观察台也可以在隔离 Reader 的 `useLayoutEffect` 中记录已完成提交；不要在 render 阶段
递增 `ref` 充当渲染计数，因为开发模式可能额外调用渲染逻辑来检查纯度。

### 2. Selector 必须保持纯函数

Selector 可能在组件渲染和 store 更新检查中执行，时间与次数不应成为业务逻辑的一部分。Selector 不能发请求、修改
state、写日志计数作为业务状态，也不能依赖当前时间或随机数：

```ts
/** 纯 Selector 只根据输入返回结果。 */
const selectTheme = (state: RootState) => state.preferences.theme
```

课程 Demo 为了教学观察，会用实例内统计器记录 Selector 执行次数；该统计只用于观察，不参与选择结果或业务判断。

### 3. stabilityCheck

开发模式的 `stabilityCheck` 会用同一输入再次检查 Selector，并通过当前 `equalityFn` 判断两次结果是否稳定。默认频率是
`once`，即当前 Hook 实例首次选择时检查。每次返回新对象且使用默认 `===` 的 Selector 会触发警告。

需要定位问题时，可以为单次 Hook 调整频率：

```tsx
/** 在开发模式持续检查选择结果稳定性。 */
const value = useSelector(selectValue, {
  devModeChecks: { stabilityCheck: 'always' },
})
```

这项检查是诊断工具，不应通过设为 `never` 来掩盖本可修正的不稳定结果。

### 4. identityFunctionCheck

`identityFunctionCheck` 检查 Selector 是否直接返回整个 RootState：

```tsx
// 错误：任何 RootState 变化都会让结果身份变化。
const state = useSelector((rootState: RootState) => rootState)
```

选择整个根状态会让组件订阅所有 Redux 更新，也模糊了组件真正依赖的字段。该检查默认同样是 `once`。应把 Selector 收窄到
组件实际读取的最小状态。

## 六、Demo：结果身份与订阅观察台

:::demo{id="react.redux.learn.intermediate.use-selector-result-identity-and-subscription.subscription-observer-demo"}

观察台用真实 `Provider` 和 store 挂载三个由 `memo` 隔离的 Reader。直接对象 Reader 使用默认 `===`；浅比较 Reader 每次
返回 `{ theme, density }` 并传入 `shallowEqual`；拆分 Reader 在同一组件调用两个 `useSelector`。

“更新无关 activity”会让所有订阅检查最新结果，但三个 Reader 都不提交。“克隆偏好对象”保持字段值不变，只有默认引用
比较的 Reader 提交。“切换 theme”让三种结果都变化。“同时修改两个字段”让拆分 Reader 的两个选择结果同时变化，但该
组件只提交一次。“恢复初始状态”提供可重复的观察起点。

面板中的 Selector 执行是最近一次 action 的检查增量，组件 commit 由每个隔离 Reader 的布局 effect 在提交后记录，开发
构建与生产构建都能观察。源码面板展示实际运行的 store、Selector、Reader、统计逻辑和样式。
:::

## 七、易错使用提示

:::pitfalls
### 错误：用默认比较接收每次新建的对象

**触发条件：** Selector 返回对象字面量、数组 `map` 或 `filter` 结果，却没有稳定引用策略。

**原因：** 默认 `===` 只比较对象与数组引用，新容器即使内容相同也不相等。

**后果：** 无关 store 更新也可能推动组件重新渲染，并触发开发模式稳定性警告。

**错误示例：**

```tsx
/** 错误：每次检查都返回新对象。 */
const preferences = useSelector((state: RootState) => ({
  theme: state.preferences.theme,
  density: state.preferences.density,
}))
```

**正确写法：**

```tsx
/** 用浅比较判断扁平字段是否真的变化。 */
const preferences = useSelector(
  (state: RootState) => ({
    theme: state.preferences.theme,
    density: state.preferences.density,
  }),
  shallowEqual,
)
```

**验证方式：** 派发只更新无关 slice 的 action。错误写法会产生新结果并推动更新；正确写法的字段浅相等，不由该订阅推动
组件更新。

### 错误：把 Selector 执行次数当成组件提交次数

**触发条件：** 在 Selector 内记录一次执行，就断定组件完成了一次重新渲染。

**原因：** Selector 需要先执行才能得到比较结果；结果相等时，组件仍可跳过提交。

**后果：** 把正常订阅检查误判成渲染问题，并进行无效优化。

**错误示例：**

```ts
/** 错误：这个计数不能单独证明组件已经提交。 */
const selectTheme = (state: RootState) => {
  selectorRuns += 1
  return state.preferences.theme
}
```

**正确写法：**

```tsx
/** 提交完成后记录一次，而不是在 render 阶段计数。 */
useLayoutEffect(() => {
  recordCommit()
})
```

**验证方式：** 同时记录 Selector 检查和提交后的布局 effect。派发无关 action 时可以观察到前者增加、后者保持不变。

### 错误：用深比较修补所有不稳定结果

**触发条件：** 为大型嵌套对象统一传入递归深比较函数。

**原因：** 每次 store 更新都需要执行比较，成本随数据规模增加，而且没有修正过宽的选择边界。

**后果：** 订阅检查变重，性能问题从重新渲染转移到比较过程。

**错误示例：**

```tsx
/** 错误：把整个复杂对象交给通用深比较。 */
const dashboard = useSelector(selectDashboard, deepEqual)
```

**正确写法：**

```tsx
/** 只选择组件实际需要的原始值。 */
const activePanel = useSelector((state: RootState) => state.dashboard.activePanel)
```

**验证方式：** 列出组件真实读取字段，并记录无关 action 后的选择范围。能够收窄为原始值或稳定引用时，不需要深比较。

### 错误：直接选择整个 RootState

**触发条件：** Selector 原样返回传入的 `state`。

**原因：** 任意 slice 更新通常都会创建新的 RootState 引用。

**后果：** 组件订阅所有 Redux 更新，并触发 `identityFunctionCheck` 开发警告。

**错误示例：**

```tsx
/** 错误：订阅整棵状态树。 */
const rootState = useSelector((state: RootState) => state)
```

**正确写法：**

```tsx
/** 只订阅组件展示所需的字段。 */
const theme = useSelector((state: RootState) => state.preferences.theme)
```

**验证方式：** 开启默认开发检查并派发另一个 slice 的 action。正确写法结果不变，也不会出现根状态身份警告。

### 错误：在 Selector 中执行副作用

**触发条件：** Selector 发请求、修改外部变量作为业务状态，或依赖当前时间与随机数。

**原因：** Selector 可能在渲染、订阅检查和开发诊断中多次执行，调用次数不是业务合同。

**后果：** 副作用重复发生，选择结果不稳定，组件行为依赖运行环境。

**错误示例：**

```ts
/** 错误：查询函数发起网络请求。 */
const selectProfile = (state: RootState) => {
  void fetch(`/api/users/${state.session.userId}`)
  return state.profile
}
```

**正确写法：**

```ts
/** 纯查询只读取并返回现有状态。 */
const selectProfile = (state: RootState) => state.profile
```

**验证方式：** 对同一 state 连续调用 Selector，返回值应由输入唯一决定，并且不产生网络、日志或状态修改。
:::

## 八、源码推导与适用场景

### 1. 结果比较连接订阅与 React 更新

React Redux 9.3.0 固定源码把 `subscription.addNestedSub`、`store.getState`、服务端快照读取函数、包装后的
Selector 和 `equalityFn` 传给 `useSyncExternalStoreWithSelector`。默认 `equalityFn` 是引用严格相等函数。

由此可以推导：store 通知只是检查入口，选择结果与相等函数共同决定该 Hook 是否向 React 提供新快照。业务代码应依赖
公开的 `useSelector` 与相等比较合同，不依赖内部 Hook 的具体调用次数或缓存变量结构。

### 2. 嵌套订阅与批处理

固定版本的 `Subscription` 源码通过 `addNestedSub` 登记监听器，并在通知监听器时进入批处理边界。官方 Hooks 文档明确说明，
同一组件的多个 `useSelector` 各自建立订阅，同一个 action 让多个结果变化时通常只导致一次重新渲染。

由此可以推导：拆分少量原始值不会按 Hook 数量机械地产生多次提交。具体调度次数仍属于 React 与 React Redux 的实现和
运行环境，应使用 Profiler 测量，而不是把一次 dispatch 等同于固定次数的 Selector 调用。

### 3. 开发检查与清理边界

固定 `useSelector` 源码在开发模式执行稳定性检查和根状态身份检查，Provider 默认把两项频率设置为 `once`。Provider 卸载
时调用 `tryUnsubscribe` 并清除状态变更处理函数；订阅引用归零时也会取消上游监听并清理监听集合。

这证明开发检查与订阅清理是 React Redux 的固定版本实现证据。应用仍应保持 Selector 纯净、结果稳定，并让组件通过正常
卸载释放订阅；不要把内部订阅对象当作公共 API 直接操作。

### 4. 适用边界

本课的选择策略适用于 React 组件从 Redux store 读取客户端状态。是否应把某份数据放进 Redux、如何构造参数化 Selector
实例、如何进行全局渲染性能治理，属于其他设计问题。本课只在既定 Redux 状态边界内判断结果身份与订阅更新。

## 九、练习

:::exercise
### 对比三种偏好选择策略

**要求：** 创建一个可运行的 React Redux 页面，store 包含 `preferences` 与无关的 `activityCount`。实现直接选择偏好对象、
返回新对象并传入 `shallowEqual`、拆分两个原始值三种 Reader；在隔离 Reader 提交后的布局 effect 中记录真实 commit。
提供无关更新、克隆偏好对象、切换主题和一次同时修改主题与密度四个操作。不得在 render 阶段递增 ref 充当提交计数。

**验收：** 以当前页面显示的累计 commit 为基线；无关更新后三个计数都不增加；克隆偏好对象后只有直接对象 Reader 增加
1；切换主题后三个 Reader 都各增加 1；一次同时修改两个字段时，拆分 Reader 的两个选择结果都变化，但 commit 只增加
1。开发控制台没有 Selector 稳定性或根状态身份警告。

**参考答案：**

```tsx
import { configureStore, createSlice } from '@reduxjs/toolkit'
import {
  memo,
  type ReactElement,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react'
import { Provider, shallowEqual, useSelector } from 'react-redux'

type Theme = 'light' | 'dark'
type Density = 'comfortable' | 'compact'

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    preferences: {
      theme: 'light' as Theme,
      density: 'comfortable' as Density,
    },
    activityCount: 0,
  },
  reducers: {
    /** 更新与偏好设置无关的活动计数。 */
    activityRecorded: (state) => {
      state.activityCount += 1
    },
    /** 只替换偏好对象引用。 */
    preferencesCloned: (state) => {
      state.preferences = { ...state.preferences }
    },
    /** 切换主题字段。 */
    themeToggled: (state) => {
      state.preferences.theme = state.preferences.theme === 'light' ? 'dark' : 'light'
    },
    /** 在同一个 action 中切换两个字段。 */
    appearanceUpdated: (state) => {
      state.preferences.theme = state.preferences.theme === 'light' ? 'dark' : 'light'
      state.preferences.density =
        state.preferences.density === 'comfortable' ? 'compact' : 'comfortable'
    },
  },
})

const store = configureStore({ reducer: workspaceSlice.reducer })
type RootState = ReturnType<typeof store.getState>

/** 直接读取偏好对象引用。 */
const selectPreferences = (state: RootState) => state.preferences

/** 每次创建一个只包含所需字段的新对象。 */
const selectPreferenceFields = (state: RootState) => ({
  theme: state.preferences.theme,
  density: state.preferences.density,
})

/** 读取主题原始值。 */
const selectTheme = (state: RootState) => state.preferences.theme

/** 读取密度原始值。 */
const selectDensity = (state: RootState) => state.preferences.density

type ReaderProps = {
  recordCommit: () => void
}

/** 用默认严格相等比较读取对象引用。 */
const DirectReader = memo(function DirectReader({ recordCommit }: ReaderProps): ReactElement {
  const preferences = useSelector(selectPreferences)

  useLayoutEffect(() => {
    recordCommit()
  })

  return <p>直接对象：{`${preferences.theme} / ${preferences.density}`}</p>
})

/** 用 shallowEqual 比较新对象的第一层字段。 */
const ShallowReader = memo(function ShallowReader({ recordCommit }: ReaderProps): ReactElement {
  const preferences = useSelector(selectPreferenceFields, shallowEqual)

  useLayoutEffect(() => {
    recordCommit()
  })

  return <p>浅比较对象：{`${preferences.theme} / ${preferences.density}`}</p>
})

/** 用两个独立 useSelector 读取原始值。 */
const SplitReader = memo(function SplitReader({ recordCommit }: ReaderProps): ReactElement {
  const theme = useSelector(selectTheme)
  const density = useSelector(selectDensity)

  useLayoutEffect(() => {
    recordCommit()
  })

  return <p>拆分原始值：{`${theme} / ${density}`}</p>
})

type ReaderObserversProps = {
  recordDirectCommit: () => void
  recordShallowCommit: () => void
  recordSplitCommit: () => void
}

/** 隔离三个 Reader，避免计数面板更新干扰提交计数。 */
const ReaderObservers = memo(function ReaderObservers({
  recordDirectCommit,
  recordShallowCommit,
  recordSplitCommit,
}: ReaderObserversProps): ReactElement {
  return (
    <section aria-label="偏好选择策略">
      <DirectReader recordCommit={recordDirectCommit} />
      <ShallowReader recordCommit={recordShallowCommit} />
      <SplitReader recordCommit={recordSplitCommit} />
    </section>
  )
})

type CommitCounts = {
  direct: number
  shallow: number
  split: number
}

/** 提供操作按钮和真实 commit 计数。 */
function SubscriptionExercise(): ReactElement {
  const [commits, setCommits] = useState<CommitCounts>({
    direct: 0,
    shallow: 0,
    split: 0,
  })

  /** 累加直接对象 Reader 的提交次数。 */
  const recordDirectCommit = useCallback(() => {
    setCommits((current) => ({ ...current, direct: current.direct + 1 }))
  }, [])

  /** 累加浅比较 Reader 的提交次数。 */
  const recordShallowCommit = useCallback(() => {
    setCommits((current) => ({ ...current, shallow: current.shallow + 1 }))
  }, [])

  /** 累加拆分 Reader 的提交次数。 */
  const recordSplitCommit = useCallback(() => {
    setCommits((current) => ({ ...current, split: current.split + 1 }))
  }, [])

  /** 派发无关活动更新。 */
  function updateActivity(): void {
    store.dispatch(workspaceSlice.actions.activityRecorded())
  }

  /** 派发偏好对象克隆。 */
  function clonePreferences(): void {
    store.dispatch(workspaceSlice.actions.preferencesCloned())
  }

  /** 派发主题切换。 */
  function toggleTheme(): void {
    store.dispatch(workspaceSlice.actions.themeToggled())
  }

  /** 派发一次双字段更新。 */
  function updateAppearance(): void {
    store.dispatch(workspaceSlice.actions.appearanceUpdated())
  }

  return (
    <main>
      <h1>useSelector 结果身份练习</h1>
      <div>
        <button type="button" onClick={updateActivity}>
          更新无关 activity
        </button>
        <button type="button" onClick={clonePreferences}>
          克隆偏好对象
        </button>
        <button type="button" onClick={toggleTheme}>
          切换主题
        </button>
        <button type="button" onClick={updateAppearance}>
          同时修改两个字段
        </button>
      </div>

      <ReaderObservers
        recordDirectCommit={recordDirectCommit}
        recordShallowCommit={recordShallowCommit}
        recordSplitCommit={recordSplitCommit}
      />

      <dl aria-live="polite">
        <div>
          <dt>直接对象 commit</dt>
          <dd>{commits.direct}</dd>
        </div>
        <div>
          <dt>浅比较对象 commit</dt>
          <dd>{commits.shallow}</dd>
        </div>
        <div>
          <dt>拆分原始值 commit</dt>
          <dd>{commits.split}</dd>
        </div>
      </dl>
    </main>
  )
}

/** 挂载练习使用的 React Redux Provider。 */
export default function App(): ReactElement {
  return (
    <Provider store={store}>
      <SubscriptionExercise />
    </Provider>
  )
}
```
:::

## 十、本节小结

- `useSelector` 默认用 `===` 比较前后选择结果，对象与数组的引用身份会直接影响更新。
- store 通知可以触发 Selector 检查，Selector 执行不等于组件已经提交。
- 原始值和 Reducer 保留的对象引用天然稳定；新对象可按场景拆分选择、使用 `shallowEqual` 或交给记忆化 Selector。
- 同一组件的多个 `useSelector` 独立订阅，但一次 dispatch 中的多个变化通常只形成一次组件更新。
- `stabilityCheck` 和 `identityFunctionCheck` 帮助发现不稳定结果与过宽选择范围，Selector 本身仍需保持纯净。

## 十一、参考资料

- [React Redux Hooks API](https://react-redux.js.org/api/hooks)
- [React Redux 9.3.0 useSelector 源码](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/hooks/useSelector.ts)
- [React Redux 9.3.0 Provider 源码](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/components/Provider.tsx)
- [React Redux 9.3.0 Subscription 源码](https://github.com/reduxjs/react-redux/blob/v9.3.0/src/utils/Subscription.ts)
- [React Redux 9.3.0 useSelector 官方测试](https://github.com/reduxjs/react-redux/blob/v9.3.0/test/hooks/useSelector.spec.tsx)
- [React Redux 9.3.0 npm 最新版元数据](https://registry.npmjs.org/react-redux/latest)
- [Redux Toolkit 2.12.0 npm 最新版元数据](https://registry.npmjs.org/@reduxjs/toolkit/latest)
- [Redux 5.0.1 npm 最新版元数据](https://registry.npmjs.org/redux/latest)
- [React 19.2.8 npm 最新版元数据](https://registry.npmjs.org/react/latest)
