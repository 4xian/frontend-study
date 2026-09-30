---
id: react.zustand.learn.advanced.zustand-testing
type: lesson
title: Zustand 测试
summary: 用 getState 断言 Store，组件交互走 Testing Library，用例之间用 getInitialState 整份替换重置。
domain: frontend
technology: react
module: zustand
stage: advanced
level: advanced
estimatedMinutes: 55
prerequisites:
  - react.zustand.learn.intermediate.state-reset
related:
  - react.zustand.learn.intermediate.state-reset
  - react.zustand.learn.advanced.store-factory
  - react.zustand.learn.advanced.context-scope
tags:
  - Zustand
  - 测试
  - getState
  - getInitialState
appliesTo: Zustand 5.0.15、React 19.2.8
verifiedAt: 2026-09-11
objectives:
  - 能在测试里调用 Action，再用 getState 断言当前字段。
  - 能说明模块级 Store 会在用例之间留下旧值，要用 getInitialState 整份替换回去。
  - 能给 create 和 createStore 写支持柯里化的测试包装，并在 afterEach 里重置。
  - 能识别把 StateCreator 当成 Store 调用，或重置时不包 act。
recap:
  - 测 Store 时先调 Action，再读 getState。
  - 测组件时用 Testing Library 点击，再用文案或 getState 断言。
  - 官方 mock 在创建时记下 getInitialState，用例结束后 setState(快照, true)。
  - 柯里化的 create<T>()(...) 也要包进同一份 mock。
sources:
  - title: Zustand 5.0.15 npm Latest Metadata
    url: https://registry.npmjs.org/zustand/latest
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - npm latest 在核验日指向 Zustand 5.0.15。
  - title: Zustand 5.0.15 Testing guide
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/testing.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 连接 Zustand 的 React 组件建议用 React Testing Library。
      - 测试包装记下 getInitialState，用例结束后 setState(initialState, true)。
      - 包装要同时支持柯里化和非柯里化的 create、createStore。
      - Vitest 需要 vi.mock('zustand')，并把 __mocks__/zustand.ts 放在正确的 root 下。
      - 测组件时渲染后点击，断言文案。
      - 测 Store 时还可以断言 useCounterStore.getState().count。
      - 多实例示例用 createStore 包同一份 StateCreator。
  - title: Zustand 5.0.15 How to reset state
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md
    sourceType: official-reference
    appliesTo: Zustand 5.0.15
    claims:
      - 一次重置多份 Store 时，官方示例使用 store.setState(store.getInitialState(), true)。
  - title: Zustand 5.0.15 vanilla store implementation
    url: https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts
    sourceType: source-code
    appliesTo: Zustand 5.0.15
    claims:
      - getInitialState 返回创建时保存的快照。
      - setState 在 replace 为 true 时整份替换当前 state。
      - 这是固定版本实现，不是另一套公共合同。
---

# Zustand 测试

## 一、学习目标

- 在测试里调用 Action，再用 `getState` 断言当前字段。
- 说明模块级 Store 会在用例之间留下旧值，要用 `getInitialState` 整份替换回去。
- 给 `create` 和 `createStore` 写支持柯里化的测试包装，并在 `afterEach` 里重置。
- 识别把 `StateCreator` 当成 Store 调用，或重置时不包 `act`。

## 二、为什么测试会读到上一例的计数

`create` 写在模块顶层时，整个测试文件共用一份 api。上一例点过「增加」，下一例的 `getState().count` 不会自动回到 `1`。

这不是测试框架的锅。Store 没有按用例新建。官方 Testing 指南的做法是：包装真正的 `create` / `createStore`，创建时把 `getInitialState()` 记下来，每个用例结束后 `setState(initialState, true)`。

组件测试仍然用 React Testing Library 渲染和点击。Zustand 多出来的只是：断言可以读 `getState`，用例之间要清掉模块级状态。

## 三、核心概念

### 1. 先测 Store，再读 getState

官方把初始化函数抽成 `StateCreator`，再用 `create<CounterStore>()(counterStoreCreator)` 做成模块级 Hook：

```ts
import { type StateCreator } from 'zustand'
import { create } from 'zustand'

type CounterStore = {
  count: number
  inc: () => void
}

const counterStoreCreator: StateCreator<CounterStore> = (set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
})

const useCounterStore = create<CounterStore>()(counterStoreCreator)
```

测 Store 时不必先渲染。调用 `inc`，再读 `useCounterStore.getState().count`。官方 Testing Stores 示例在点击按钮后断言 `getState().count` 从 `1` 变成 `2`。

`getState` 是公共 api，不是测试专用通道。它读的就是当前那份对象。

### 2. 测组件时渲染、点击，必要时再读 getState

官方建议用 React Testing Library。组件测试先 `render(<Counter />)`，再 `userEvent.click`，最后用文案或 `getState` 断言。

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('should increase count by clicking a button', async () => {
  const user = userEvent.setup()
  render(<Counter />)

  expect(useCounterStore.getState().count).toBe(1)
  await user.click(await screen.findByRole('button', { name: /one up/i }))
  expect(useCounterStore.getState().count).toBe(2)
})
```

文案断言证明界面更新；`getState` 断言证明同一份 Store 里的字段也变了。两套断言看的是同一份状态。

### 3. 用例结束时用 getInitialState 整份替换

官方 mock 不是换成假的 `set`。它调用真正的 `create`，然后：

```ts
const initialState = store.getInitialState()
storeResetFns.add(() => {
  store.setState(initialState, true)
})
```

`afterEach` 里用 Testing Library 的 `act` 包住这些重置。`replace` 为 `true` 才会整份写回创建时的快照，Action 也还在。这和状态重置课的写法一致。

Vitest 还要 `vi.mock('zustand')`，并把 `__mocks__/zustand.ts` 放在 Vitest `root` 下面。官方警告：若 `root` 改成 `./src`，mock 文件要放在 `./src/__mocks__`。

包装必须识别柯里化。`create<T>()` 第一次调用没传函数，返回的是下一层函数。官方用 `typeof stateCreator === 'function'` 区分。少了这一层，测试里会出现 `getState is not a function`。

### 4. 多实例不要调用 StateCreator

官方上下文示例把同一份 `counterStoreCreator` 交给 `createStore<CounterStore>(counterStoreCreator)`。测试里应为每个用例调用这份工厂，得到新的 api，再放进 Provider。

`StateCreator` 是 `(set, get, store) => state`。直接 `counterStoreCreator()` 得不到带 `getState` 的 Store。多实例测试用 `createStore` 或课程里的创建函数。

下面的 Demo 左侧调用 `inc` 后读 `getState`。中间同样增加，再按官方 mock 的方式整份替换，计数回到 `1`。右侧每次新建一份 `createStore`，互不影响。

:::demo{id="react.zustand.learn.advanced.zustand-testing.zustand-testing-demo"}
:::

## 四、用法与示例

### 1. Vitest 包装 create

官方 Vitest mock 从真实模块取出 `create` 和 `createStore`，再导出同名包装。`afterEach` 里：

```ts
afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn()
    })
  })
})
```

`setup-vitest.ts` 里写 `vi.mock('zustand')`。没有开启 Vitest `globals` 时，还要显式导入 `vi`、`afterEach`。

### 2. 单用例里手动重置

没有 mock 时，也可以在用例末尾自己写：

```ts
useCounterStore.setState(useCounterStore.getInitialState(), true)
```

官方 How to reset state 在一次重置多份 Store 时用的就是这句。测试包装只是替所有已创建的 Store 登记同一件事。

### 3. 工厂实例按用例新建

```ts
import { createStore } from 'zustand'

const createCounterStore = () => createStore<CounterStore>()(counterStoreCreator)

test('should start from 1 for each case', () => {
  const store = createCounterStore()
  store.getState().inc()
  expect(store.getState().count).toBe(2)

  const nextStore = createCounterStore()
  expect(nextStore.getState().count).toBe(1)
})
```

模块级 `create` 测的是应用里那一份单例。需要隔离时，用 `createStore` 工厂，不要在测试里给单例偷偷换一份新的模块绑定。

## 五、易错使用提示

:::pitfalls
### 错误：模块级 Store 不重置

**触发条件：** 第一例调用 `inc`，第二例直接断言 `getState().count` 为 `1`。

**原因：** `create` 在模块加载时只执行一次。测试文件共用这份 api。

**后果：** 第二例读到 `2`，用例顺序一换结果就变。

**错误示例：**

```ts
test('starts at 1', () => {
  expect(useCounterStore.getState().count).toBe(1)
})

test('inc once', () => {
  useCounterStore.getState().inc()
  expect(useCounterStore.getState().count).toBe(2)
})
```

**正确写法：**

```ts
afterEach(() => {
  useCounterStore.setState(useCounterStore.getInitialState(), true)
})
```

**验证方式：** 先跑增加用例，再跑「初始为 1」的用例，后者仍然读到 `1`。

### 错误：mock 不支持柯里化

**触发条件：** 包装写成 `create = (fn) => actualCreate(fn)`，应用代码却是 `create<CounterStore>()(counterStoreCreator)`。

**原因：** 柯里化第一次调用得到的是函数，不是 Store。官方 mock 用 `typeof stateCreator === 'function'` 决定要不要再包一层。

**后果：** 测试里 `useCounterStore.getState` 不是函数。

**错误示例：**

```ts
export const create = (stateCreator) => actualCreate(stateCreator)
```

**正确写法：**

```ts
export const create = ((stateCreator) =>
  typeof stateCreator === 'function'
    ? createUncurried(stateCreator)
    : createUncurried) as typeof actualCreate
```

**验证方式：** `create<CounterStore>()(counterStoreCreator)` 之后可以调用 `getState()`。

### 错误：把 StateCreator 当成 Store

**触发条件：** 写成 `const store = counterStoreCreator()`，再 `store.getState()`。

**原因：** `StateCreator` 需要 `set`。官方工厂是 `createStore<CounterStore>(counterStoreCreator)`。

**后果：** 返回值没有 `getState`，测试立刻失败。

**错误示例：**

```ts
const store = counterStoreCreator()
expect(store.getState().count).toBe(1)
```

**正确写法：**

```ts
const store = createStore<CounterStore>()(counterStoreCreator)
expect(store.getState().count).toBe(1)
```

**验证方式：** `store.getState` 是函数，`count` 初始为 `1`。

### 错误：重置时不包 act

**触发条件：** 组件已经订阅 Store，`afterEach` 里直接 `setState(initial, true)`，不包 `act`。

**原因：** 重置会通知订阅者，触发 React 更新。官方 mock 把重置放进 `act(() => { ... })`。

**后果：** 测试报告 “not wrapped in act(...)”。

**错误示例：**

```ts
afterEach(() => {
  storeResetFns.forEach((resetFn) => resetFn())
})
```

**正确写法：**

```ts
afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => resetFn())
  })
})
```

**验证方式：** 组件测试在点击后重置，控制台没有 act 警告。

### 错误：只 mock 掉 getState 却不跑真实 Action

**触发条件：** `vi.spyOn(useCounterStore, 'getState').mockReturnValue({ count: 2, inc })`，不再调用 `inc`。

**原因：** 官方测的是真实 `set` 之后的状态。假的 `getState` 不再走中间件，也不通知订阅者。

**后果：** Action、浅合并和订阅都没被测到。

**错误示例：**

```ts
vi.spyOn(useCounterStore, 'getState').mockReturnValue({
  count: 2,
  inc: () => undefined,
})
```

**正确写法：**

```ts
useCounterStore.getState().inc()
expect(useCounterStore.getState().count).toBe(2)
```

**验证方式：** 调用 `inc` 之后，选择 `count` 的组件文案变成 `2`。
:::

## 六、原理与适用场景

### 1. 官方事实

Testing 指南建议用 React Testing Library 测连接 Zustand 的组件，并用 mock 在每个用例后重置。Jest / Vitest 的 mock 都从真实 `create`、`createStore` 包一层，记下 `getInitialState()`，再 `setState(initialState, true)`。包装同时支持柯里化。Vitest 需要 `vi.mock('zustand')`。测组件看文案；测 Store 可以再断言 `getState()`。多实例用 `createStore` 包同一份 `StateCreator`。How to reset state 同样使用 `setState(getInitialState(), true)`。

### 2. 课程推导

测试没有新的 Store API。`getState`、`setState` 和 `getInitialState` 就是生产代码里的那三个方法。mock 只解决模块单例在用例间串味。组件是否更新，仍然靠订阅和 Testing Library，不靠直接改组件 state。

### 3. 适用边界

本课不配置完整 Jest 工程，不展开 MSW、React Native Testing Library 和 `useStoreWithEqualityFn`。`persist` 水合、SSR 与自定义 middleware 的测试不作为主线。

## 七、练习

:::exercise
### 给计数 Store 写一条可重置的断言

**要求：** 使用 `create<CounterStore>()(counterStoreCreator)` 得到 `useCounterStore`。写两个步骤：先调用 `inc`，断言 `getState().count` 为 `2`；再 `setState(getInitialState(), true)`，断言 `count` 回到 `1`，且 `inc` 仍是函数。不要 mock 掉 `getState`，不要调用 `counterStoreCreator()` 当 Store。

**验收：** 增加后计数为 `2`；重置后计数为 `1`，`getState().inc` 仍可调用。

**参考答案：**

```ts
import { create, type StateCreator } from 'zustand'

type CounterStore = {
  count: number
  inc: () => void
}

const counterStoreCreator: StateCreator<CounterStore> = (set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
})

const useCounterStore = create<CounterStore>()(counterStoreCreator)

useCounterStore.getState().inc()
if (useCounterStore.getState().count !== 2) {
  throw new Error('inc 后应为 2')
}

useCounterStore.setState(useCounterStore.getInitialState(), true)
if (useCounterStore.getState().count !== 1) {
  throw new Error('重置后应回到 1')
}
if (typeof useCounterStore.getState().inc !== 'function') {
  throw new Error('重置后 inc 仍应是函数')
}
```
:::

## 八、本节小结

- 测 Store 就调用 Action，再读 `getState`。
- 模块级 Store 要在用例之间 `setState(getInitialState(), true)`。
- 测试包装必须支持柯里化的 `create` / `createStore`，重置放进 `act`。
- 多实例用 `createStore` 工厂，不要调用 `StateCreator`。

## 九、参考资料

- [Zustand 5.0.15 npm Latest Metadata](https://registry.npmjs.org/zustand/latest) - 核验当前稳定版。
- [Zustand 5.0.15 Testing guide](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/testing.md) - mock 重置、组件测试与 Store 断言。
- [Zustand 5.0.15 How to reset state](https://github.com/pmndrs/zustand/blob/v5.0.15/docs/learn/guides/how-to-reset-state.md) - `setState(getInitialState(), true)`。
- [Zustand 5.0.15 vanilla store implementation](https://github.com/pmndrs/zustand/blob/v5.0.15/src/vanilla.ts) - `getInitialState` 与 replace。
