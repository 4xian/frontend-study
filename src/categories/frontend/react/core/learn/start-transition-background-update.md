---
id: react.core.learn.advanced.start-transition-background-update
type: lesson
title: startTransition 后台更新
summary: 在 Hook 外标记非紧急 State 更新，让输入保持及时响应并观察后台视图最终提交。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 45
prerequisites:
  - react.core.learn.advanced.use-resource-reading
related:
  - react.core.learn.basics.react-forms
  - react.core.learn.basics.render-commit-and-state-snapshot
tags:
  - React
  - startTransition
  - Transition
  - State
  - 并发渲染
appliesTo: React 19.2
verifiedAt: 2026-08-14
objectives:
  - 能说明 startTransition 如何立即执行同步 action，并标记 action 内安排的 State 更新。
  - 能把真实 State setter 传给 Hook 外的 startTransition 包装函数。
  - 能让受控输入 State 保持普通更新，把非紧急视图 State 单独标记为 Transition。
  - 能解释更紧急的输入更新可以先提交，后台 render 可能被打断并从最新 State 重启。
  - 能说明 standalone startTransition 返回 void，不提供 isPending；timer 与异步回调不会自动继承标记。
recap:
  - startTransition 是 standalone API，不读取组件 State，也不是 Hook 或延迟队列。
  - action 会立即执行；同步 setter 更新才会在 action 范围内标记为 Transition。
  - 受控输入不能把自身 setter 放进 Transition，后台视图应使用分离的 State。
  - Transition 是非阻塞后台工作，最终结果应来自最新 State；不能要求固定的 render 或中断次数。
  - pending 信号属于下一课 useTransition；本课不创建网络、Promise 或 timer。
sources:
  - title: startTransition
    url: https://react.dev/reference/react/startTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - standalone API、同步 action、非阻塞更新、输入限制与打断重启
      - void 返回值、无 pending 查询信号以及 timer/异步边界
  - title: 固定 startTransition 文档
    url: https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/startTransition.md
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 固定版本的 API 参数、同步范围和调用位置说明
  - title: useTransition
    url: https://react.dev/reference/react/useTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - isPending 与 Action 属于 Hook API 的相邻课程边界
  - title: React 19.2.8 ReactStartTransition 源码
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactStartTransition.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - standalone 函数立即执行 scope，并在同步范围结束后恢复 Transition 上下文
  - title: React 19.2.8 ReactFiberWorkLoop 源码
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - setter 在 Transition 上下文中选择非紧急更新优先级
---

# startTransition 后台更新

## 学习目标

- 知道 `startTransition(action)` 接收无参数函数，并立即执行这个 action。
- 在 Hook 外使用一个接收真实 State setter 的包装函数标记后台更新。
- 把输入 State 与后台视图 State 分离，让输入继续使用普通事件更新。
- 观察后台视图的最终提交，并理解更紧急更新可以打断旧的后台 render。
- 识别 standalone API 没有 `isPending`，并把 pending Action 留给 `useTransition`。

## 为什么需要

一个交互同时包含两类工作：文本输入需要每个字符及时反映，昂贵视图却可以在后台重渲染。如果两个
setter 都使用同一种更新方式，视图工作就可能阻塞更紧急的输入；如果把输入本身也放进 Transition，受控
输入又失去了 React 明确要求的即时更新路径。

`startTransition` 解决的是优先级标记。它不会替你找到 State，也不会把 action 放进延迟队列。调用方把
已有的 setter 传入 Hook 外包装函数，React 立即执行 action，并把 action 内同步安排的非紧急更新交给
后台调度。输入的普通 State 与视图的 Transition State 仍然是两个独立的值。

## 核心概念

### action 立即执行，更新标记随后影响调度

`startTransition` 接收一个无参数 action：

```tsx
import { startTransition } from 'react'

/** 在 Hook 外标记已有 setter 的同步更新。 */
function startBackgroundUpdate(update: () => void): void {
  startTransition(update)
}
```

action 会立即被 React 调用。若 action 同步调用 `setView`，这个更新会被标记为 Transition；这不是
Promise、debounce 或定时队列。函数返回 `void`，因此不能从它读取一个 pending 值。

### 用两个 State 保留输入与视图的职责

输入框自身的 State 直接在事件中更新；可以被昂贵子树读取的视图 State 另行保存：

```tsx
function SearchView() {
  const [inputValue, setInputValue] = useState('')
  const [view, setView] = useState('overview')

  function handleChange(nextValue: string): void {
    setInputValue(nextValue)
    startBackgroundUpdate(() => setView(nextValue === '' ? 'overview' : 'details'))
  }

  return <input value={inputValue} onChange={(event) => handleChange(event.target.value)} />
}
```

关键不是让两个值永远同步，而是让输入 DOM value 只由普通 State 控制。视图 State 可以稍后提交，期间
用户仍然能够继续输入。

### Transition 是非阻塞后台工作

当昂贵的视图正在 render，React 可以先处理更紧急的输入更新；旧的后台 render 可能被放弃，随后从最新
State 重新开始。这个过程的可观察合同是“输入保持最新、后台视图最终显示最新选择”，而不是固定的 render
尝试次数、毫秒数或某个设备一定出现一次中断。

Demo 使用本地确定性计算让视图有可重复的工作量，但只记录实际提交的后台视图。日志不声称某次 render
一定被丢弃，也不把计算耗时当成 `startTransition` 的返回值。

### 标记只覆盖同步 action

`startTransition` 的标记只覆盖 action 执行期间同步安排的 State 更新。`setTimeout` 回调和异步请求
完成后的 setter 不会自动继承；需要重新进入 `startTransition` 时，应把它作为后续 Action 课程的主题。
本课 Demo 不创建 timer、Promise、网络请求或缓存。

### 与 useTransition 的边界

`startTransition` 可以在组件和自定义 Hook 外使用，但它没有 `isPending`。`useTransition` 返回
`[isPending, startTransition]`，还负责组件内的 pending Action；那是下一课的职责。本课只观察真实提交的
状态和 action 调用次数，不伪造 pending 指示器。

## 用法示例或 Demo

下面的 Demo 将受控输入 State 与后台视图 State 分开。按钮把真实的视图 setter 传入模块外包装函数；
选择按钮点击后 action 调用计数立即增加，昂贵视图最终显示最新选择。快速输入并切换多个视图时，输入仍由
普通 State 驱动，日志只记录实际提交的后台结果。

:::demo{id="react.core.learn.advanced.start-transition-background-update.background-update-demo"}
:::

## 易错使用提示

:::pitfalls
### 错误：把受控输入 setter 放进 Transition

**触发条件：** 在 `startTransition(() => setInput(nextValue))` 中更新输入框自身的 State。

**原因：** React 要求控制文本输入的 State 使用普通更新，不能把每个键击依赖后台 Transition。

**后果：** 输入反馈可能不及时，且输入与昂贵视图的职责混在一起。

**错误示例：**

```tsx
startTransition(() => setInput(nextValue))
```

**正确写法：** 输入事件直接调用 `setInput(nextValue)`；只把独立的视图 setter 放进
`startTransition`。

```tsx
setInput(nextValue)
startBackgroundUpdate(() => setView(nextView))
```

**验证方式：** 输入框的 DOM value 始终与普通输入 State 同步，同时后台视图单独显示已提交值。

### 错误：把 startTransition 当作 pending 信号或延迟队列

**触发条件：** 读取 `startTransition` 的返回值、创建一个同名 `isPending`，或声称 action 会稍后才执行。

**原因：** standalone API 返回 `void`，只改变同步 State 更新的调度标记。

**后果：** 把下一课 `useTransition` 的反馈能力提前混入本课。

**错误示例：**

```tsx
const isPending = startTransition(() => setView(nextView))
```

**正确写法：** 通过已提交 State 或独立的 commit 日志观察结果；需要 pending 时使用 `useTransition`。

```tsx
startBackgroundUpdate(() => setView(nextView))
```

**验证方式：** 检查 Demo 没有 `useTransition` 或 `isPending`，且 action 调用后视图最终显示最新选择。

### 错误：用固定 render 次数或耗时证明中断

**触发条件：** 断言每次点击必然产生固定数量的 render，或用固定毫秒数判断 Transition 成功。

**原因：** 调度结果受设备、浏览器和负载影响；公开合同只保证更紧急更新可先处理并从最新 State 重启。

**后果：** 把实现细节误写成稳定 API 保证。

**错误示例：**

```tsx
expect(renderCount).toBe(2)
```

**正确写法：** 核对输入保持响应，后台视图最终显示最后一次选择，并只记录真实提交事件。

```tsx
expect(input.value).toBe(latestInput)
expect(view.textContent).toContain(latestView)
```

**验证方式：** 快速输入并连续点击不同视图按钮，不以 render 次数或时间阈值作断言。

### 错误：认为异步回调会自动继承 Transition

**触发条件：** 在 action 中安排 timer 或异步请求，随后把回调里的 setter 当作同一个 Transition。

**原因：** 标记只覆盖 action 的同步执行范围。

**后果：** 把后续 Action、请求或缓存边界提前塞进本课。

**错误示例：**

```tsx
startTransition(() => {
  setTimeout(() => setView(nextView), 0)
})
```

**正确写法：** 本课不创建 timer 或网络请求；异步完成后的更新要在新的 `startTransition` 中重新标记。

```tsx
startTransition(() => setView(nextView))
```

**验证方式：** 检查 Demo 只由本地输入和点击驱动，没有 timer、Promise、fetch 或外部数据源。
:::

## 源码推导与适用场景

1. React 官方文档把 `startTransition` 定义为可在 Hook 外调用的 standalone API，action 会立即执行，
   同步 State 更新才会被标记为 Transition。
2. 非阻塞表示 React 可以让更紧急更新先处理，并在需要时放弃旧的后台 render，从最新 State 重新开始；
   这不承诺固定的 lane、耗时或中断次数。
3. 当前实现会在 action 期间建立临时 Transition 上下文，并在同步范围结束后恢复；这解释了为什么后续
   timer 或异步回调不会自动继承标记，但不构成应用代码可读取的内部对象合同。
4. `useTransition` 的 pending 信号属于组件内 Hook；本课有意只使用 standalone 函数和真实 setter。

## 练习

:::exercise
### 练习：把输入和后台视图拆成两个 State

**要求：** 在 Demo 中连续输入文字并快速点击三个视图按钮。记录输入值始终及时更新，后台视图最终显示
最后一次选择，且 action 调用次数与点击次数一致。

**验收：** 能指出输入 setter 位于普通事件路径，视图 setter 位于 Hook 外包装函数；能解释为什么没有
`isPending`，也不以固定 render 次数证明发生过中断。
:::

## 本节小结

- `startTransition(action)` 立即执行 action，并标记其中同步安排的非紧急 State 更新。
- Hook 外包装函数必须接收真实 setter；standalone API 不会凭空获得组件 State。
- 受控输入保持普通更新，昂贵视图使用独立 State 进入 Transition。
- 更紧急输入可以先提交，后台 render 允许被打断并从最新 State 重启；只验证最终状态关系。
- `startTransition` 返回 `void`，没有 pending 信号；timer 和异步回调不会自动继承标记。

## 参考资料

- [startTransition](https://react.dev/reference/react/startTransition) - standalone API、非阻塞更新、输入限制、同步 action 范围与 `void` 返回值。
- [固定 startTransition 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/startTransition.md) - 固定版本的公开语义。
- [useTransition](https://react.dev/reference/react/useTransition) - `isPending` 与 pending Action 的后续课程边界。
- [React 19.2.8 ReactStartTransition 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactStartTransition.js) - Transition 上下文生命周期的实现旁证。
- [React 19.2.8 ReactFiberWorkLoop 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberWorkLoop.js) - setter 选择 Transition 更新优先级的实现旁证。
