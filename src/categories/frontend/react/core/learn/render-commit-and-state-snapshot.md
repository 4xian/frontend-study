---
id: react.core.learn.basics.render-commit-and-state-snapshot
type: lesson
title: React 更新模型
summary: 理解一次 State 更新怎样从事件处理器中的快照与更新队列，经过 React render 和 commit，最终成为屏幕上的下一版界面。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 120
prerequisites:
  - react.core.learn.basics.use-state
related:
  - react.core.learn.basics.component-purity
  - react.core.learn.advanced.flush-sync-dom-commit
tags:
  - React
  - State
  - render
  - commit
  - snapshot
  - batching
  - updater
appliesTo: React 19.2（运行时 19.2.8）
verifiedAt: 2026-08-16
objectives:
  - 能区分 trigger、React render、commit 与 browser paint 的职责。
  - 能解释 State、Props、局部变量、JSX 和事件处理器为什么属于某次 render 的快照。
  - 能说明 setter 为什么只请求后续 render，不会改写当前事件处理器中的 State。
  - 能解释 batching 的价值、常见覆盖范围和有意事件边界。
  - 能把直接值理解为替换指令，把 updater 理解为基于 pending State 的计算。
  - 能按加入顺序手算连续 updater 和直接值、updater 混合队列。
  - 能写出纯 updater，并准确理解 StrictMode 开发检查与同步 DOM 读取边界。
recap:
  - setter 提交更新请求；它不是对当前 State 变量或 DOM 的同步赋值。
  - React render 调用组件并计算下一版 UI，commit 才把必要变化应用到 DOM。
  - browser paint 位于 DOM 更新之后，但一次 commit 不保证对应一个独立可见帧。
  - 每次 render 都创建一组固定的 State、Props、局部变量、JSX 和事件处理器快照。
  - React 会在安全边界内批量处理多个更新，同时保留多个有意用户事件的独立性。
  - 直接值在队列中的语义是替换，updater 则接收当前位置的 pending State。
  - 混合队列严格按加入顺序求值，最后结果取决于每个队列项的位置和返回值。
  - updater 必须纯净；StrictMode 的开发期额外调用不会让一次点击自动变成两次点击。
sources:
  - title: React Render and Commit
    url: https://react.dev/learn/render-and-commit
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - trigger、React render、commit 与 browser paint 的公开阶段模型
      - 初次显示和 State 更新的基础触发方式
      - commit 只应用必要 DOM 变化
  - title: React State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State、局部变量、JSX 与事件处理器的 render 快照
      - setter 只影响后续 render
      - 同步和延迟事件处理器读取所属快照
  - title: React Passing Props to a Component
    url: https://react.dev/learn/passing-props-to-a-component
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Props 是每次 render 接收的只读时间快照
  - title: React Queueing a Series of State Updates
    url: https://react.dev/learn/queueing-a-series-of-state-updates
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - batching 的公开教学边界
      - 直接值替换、updater、pending State 与混合队列的顺序求值
      - updater 纯度与多个有意事件的边界
  - title: React useState Reference
    url: https://react.dev/reference/react/useState
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - setter 只更新下一次 render 的 State
      - updater 的 pending State、队列处理和 StrictMode 注意事项
  - title: React Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 纯度与 Props、State 的不可变快照边界
  - title: React StrictMode
    url: https://react.dev/reference/react/StrictMode
    sourceType: api-doc
    appliesTo: React 19.2
    claims:
      - 开发期额外调用应纯函数的检查范围与生产环境边界
  - title: React 18 Upgrade Guide
    url: https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching
    sourceType: release-note
    appliesTo: React 18+
    claims:
      - createRoot 下 Promise、timeout 与原生事件来源的 automatic batching
---

# React 更新模型

## 一、学习目标

- 区分触发更新、计算界面、修改 DOM 和浏览器绘制四件事。
- 解释为什么 setter 前后读取的是同一份 State 快照。
- 判断多个 setter 调用会形成哪些替换项或 updater 项。
- 按加入顺序计算连续 updater 与混合队列的最终 State。
- 根据下一值是否依赖 pending State 选择直接值或 updater。
- 识别 updater 中的副作用、错误的精确次数假设和不必要的同步提交。

## 二、为什么需要完整的更新模型

下面的事件处理器看起来连续执行了三次“加一”：

```tsx
/** 连续提交三个由当前快照计算出的直接值。 */
function handleIncrease() {
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1)
}
```

如果按钮点击前页面显示 `0`，点击后通常显示 `1`，不是 `3`。只记住“setter 会更新 State”无法解释
这个结果，还需要回答：

1. 三个表达式读取的是哪一个 `count`？
2. setter 调用时，当前变量和 DOM 是否已经改变？
3. React 何时处理这三个更新请求？
4. 三个请求是累加、覆盖，还是按什么规则求值？
5. 最终数字怎样变成 DOM 文本和屏幕像素？

React 的公开更新模型把这些问题连成一条因果链：

```text
Trigger
   |
   v
React render：读取快照、处理更新队列、计算下一版 UI
   |
   v
Commit：把必要变化应用到 DOM
   |
   v
Browser paint：浏览器绘制更新后的页面
```

事件处理器中的 State 快照、batching 和更新队列位于这条链的输入端。React render、commit 与 browser
paint 位于结果端。把它们分开，才能准确预测代码行为，也能避免用“更新有延迟”解释固定合同。

## 三、一次更新的核心术语

### 1. 八个术语各自负责什么

| 术语 | 准确含义 | 不能等同于 |
| --- | --- | --- |
| Trigger | 请求 React 开始一次界面计算 | DOM 已经改变 |
| React render | React 调用组件并计算下一版 UI | 浏览器绘制像素 |
| Snapshot | 某次 render 使用的 State、Props、局部变量、JSX 与 handler 的时间归属 | 深拷贝或冻结算法 |
| Update request | setter 交给 React 的直接值或 updater | 对局部 State 变量赋值 |
| Batching | 在安全边界内一起处理多个更新 | 永久合并所有事件 |
| Queue model | 对同一 State 按顺序应用替换项和 updater 项的公开教学模型 | 应用可访问的内部数组 |
| Commit | React 把必要变化应用到 DOM | 再执行一次事件处理器 |
| Browser paint | 浏览器根据更新后的 DOM 绘制页面 | React render |

“render”在不同资料里有时也泛指浏览器渲染。这里始终使用“React render”表示组件计算，使用
“browser paint”表示浏览器绘制，避免把两个系统的工作混在一起。

### 2. 初次显示与交互更新

客户端初次显示可以压缩为：

```text
root.render(<App />)
        |
        v
Trigger -> React render -> Commit -> Browser paint
```

一次交互产生 State 更新时，完整链路是：

```text
render R0 提供 State S0 与 Props P0
        |
        v
R0 创建 JSX、局部变量和事件处理器 H0
        |
        v
用户触发 H0；H0 读取 S0 与 P0
        |
        v
setter 提交直接值或 updater
        |
        v
React 在安全边界内 batching 请求
        |
        v
后续 render 按顺序处理队列，得到 State S1
        |
        v
组件使用 S1 计算下一版 UI
        |
        v
Commit 必要 DOM 变化 -> Browser paint
```

这张图表达职责和概念顺序，不表达固定线程、毫秒数、任务队列、render 次数或浏览器帧数。

## 四、Trigger：什么会请求 React render

### 1. 初次显示由 Root 请求

客户端 Root 建立后，`root.render(<App />)` 请求初次 render：

```tsx
import { createRoot } from 'react-dom/client'

import { App } from './App'

const container = document.querySelector('#app')

if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
```

`<App />` 是交给 React 的元素描述。React 决定何时调用 `App`，再沿组件返回的 JSX 继续计算所需的
子组件。

### 2. State 更新请求后续 render

组件已经显示后，setter 可以提交下一 State，请求 React 使用它再次计算相关界面：

```tsx
import { useState } from 'react'

/** 展示 State 更新如何触发界面重新计算。 */
function Counter() {
  const [count, setCount] = useState(0)

  /** 提交下一计数。 */
  function handleIncrement() {
    setCount(count + 1)
  }

  return <button onClick={handleIncrement}>当前：{count}</button>
}
```

`setCount(count + 1)` 是更新请求，不是以下任何一种动作：

- 对当前函数里的 `count` 重新赋值；
- 直接找到并修改按钮文本；
- 保证 setter 返回时 commit 已完成；
- 保证浏览器已经绘制新像素。

多个 setter 与 React render 次数也不是一一对应关系。batching、相同值跳过和开发期检查都可能让
“调用次数 = render 次数”的推断失效。

## 五、React Render：计算下一版 UI

### 1. React 调用组件

收到 trigger 后，React 调用需要计算的组件。初次 render 从 Root 组件开始；组件返回嵌套组件的 JSX
后，React 继续调用相关组件，直到得到要显示的结果。

```tsx
type ScoreProps = {
  label: string
  score: number
}

/** 根据本次 Props 计算分数文本。 */
function Score({ label, score }: ScoreProps) {
  const text = `${label}：${score}`
  return <strong>{text}</strong>
}
```

函数执行和字符串计算属于 React render。此时 `<strong>` 对应的 DOM 文本是否需要变化，要到 commit
阶段才会落实。

### 2. Render 使用本次输入

一次组件调用会读取这次 render 的 Props 和 State，创建局部变量、JSX 与事件处理器。React 可以再次
执行这些计算，因此组件顶层逻辑必须能够安全重复：

- 相同输入产生相同结果；
- 不在 render 中执行外部副作用；
- 不修改本次调用之外创建的值。

这个纯度要求也适用于 React 在 render 中处理的 updater。更新模型只需要这条边界，不需要依赖任何
内部调度结构来解释公开行为。

### 3. Render 不承诺每次都改变 DOM

组件函数被调用，只能证明发生了相应的 React render 计算。如果新旧结果相同，React 可能不需要修改
对应 DOM。反过来，看到 DOM 改变说明 commit 已应用变化，但不能仅凭最终 DOM 反推出中间调用了多少次
组件函数。

## 六、Snapshot：每次 Render 都有自己的值

### 1. State、Props 与 Handler 属于同一次 Render

React 保存组件 State，并在一次 render 中把当次值交给组件。组件使用这份 State、本次 Props 和局部
计算结果创建 JSX；在该次调用中创建的事件处理器也闭包捕获这些绑定。

```tsx
import { useState } from 'react'

type SnapshotCounterProps = {
  label: string
  step: number
}

/** 使用本次 render 的 Props 与 State 创建界面和 handler。 */
function SnapshotCounter({ label, step }: SnapshotCounterProps) {
  const [count, setCount] = useState(0)
  const nextCount = count + step

  /** 提交下一值，同时观察当前 handler 的固定快照。 */
  function handleIncrement() {
    console.info('setter 前', { label, count, nextCount })
    setCount(nextCount)
    console.info('setter 后', { label, count, nextCount })
  }

  return <button onClick={handleIncrement}>{label}：{count}</button>
}
```

假设这次 render 中 `count = 0`、`step = 1`，那么 `nextCount = 1`。点击时：

1. 第一条日志读取 `0` 和 `1`。
2. setter 提交直接值 `1`。
3. 第二条日志仍读取 `0` 和 `1`。
4. 后续 render 获得新的 `count = 1`，并创建一组新的局部变量、JSX 与 handler。

setter 不会回到已经运行的函数调用中改写 `count`，也不会替换当前闭包捕获的绑定。

### 2. Props 也是时间快照

Props 是组件在某次 render 中收到的只读输入。父组件之后提供新 Props 时，React 会用新输入调用
子组件并创建新的 handler；旧 handler 已经捕获的值不会被原地回写。

因此，一个 handler 中的 State、Props 和局部变量通常是彼此一致的一组值。不要把 Props 想象成父组件
持续写入的共享变量，也不要把 State 想象成 setter 可以即时改写的局部变量。

### 3. 延迟执行仍读取创建它的快照

时间经过多久不会自动改变闭包所属的 render：

```tsx
/** 延迟显示本次点击时捕获的计数。 */
function handleDelayedMessage() {
  setTimeout(() => {
    console.info('点击时的 count', count)
  }, 3000)
}
```

等待期间即使组件已经产生其他 render，这个回调仍读取创建它的那次 render 中的 `count`。这是
JavaScript 闭包与 React render 快照共同产生的结果，不是更新速度问题。

### 4. 快照不是深拷贝

“快照”描述值与某次 render 的归属，不表示 React 对所有值执行深拷贝、递归冻结或自动创建不可变
对象。Props 和 State 仍应作为只读输入使用，但快照模型本身不承诺某种复制算法。

## 七、Batching：一起处理安全范围内的更新

### 1. 为什么需要批处理

一个事件处理器可能更新多份 State，也可能连续更新同一份 State。React 会等待事件处理器中的代码执行
完成，再处理其中提交的更新。这种行为称为 batching。

它有两个直接价值：

- 避免同一交互中出现只完成一部分更新的半成品界面；
- 减少不必要的中间 React render 和 DOM 操作。

Batching 不会让当前 handler 的 State 变量改变。handler 仍在自己的 render 快照中运行，只是提交了
一组稍后处理的请求。

### 2. 多个有意事件保持独立

React 不会把多个有意用户事件永久合成一批。例如两次 click 会分别处理；第一次 click 的结果可以在
第二次 click 前生效。

因此“快速连续点击两次”和“一个 click handler 内调用两次 setter”不是同一种情形：

- 前者是两个有意事件，各自拥有事件边界；
- 后者是一个 handler 内的多个更新请求，可以一起处理。

### 3. Automatic Batching 的覆盖范围

使用 `createRoot` 的 React 18+ 应用中，automatic batching 也覆盖常见的 Promise 回调、timeout 和
原生事件处理器来源。这个合同说明这些来源默认可以合并更新，不承诺任意 callback 的精确 render 次数，
也不需要借助事件循环细节解释。

## 八、直接值：队列中的替换指令

### 1. 先计算表达式，再提交值

直接值更新先在当前 handler 中计算表达式，再把结果交给 setter：

```tsx
function handleDirectValues() {
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1)
}
```

若当前快照中 `count = 0`，JavaScript 先把三行都计算成：

```tsx
function handleDirectValues() {
  setCount(1)
  setCount(1)
  setCount(1)
}
```

在官方公开教学模型中，每个直接值都是当前位置的替换指令：

| 顺序 | 队列项 | 是否读取 pending State | 结果 |
| ---: | --- | --- | ---: |
| 1 | replace with `1` | 否 | `1` |
| 2 | replace with `1` | 否 | `1` |
| 3 | replace with `1` | 否 | `1` |

最终 State 是 `1`。不是 React 丢失了两次请求，而是三个请求携带的值本来就相同。

### 2. 直接值适合确定结果

下一值已经确定、不依赖队列中当前位置的 pending State 时，直接值最清楚：

```tsx
setCount(0)
```

直接值不是低级写法，也不会因为存在 updater 就失效。选择依据是更新意图，而不是偏好统一语法。

### 3. 替换不会物理清空整个队列

“replace with `5`”只描述该队列项在当前位置把计算结果替换为 `5`。它不表示删除后面尚未处理的
队列项。后续 updater 仍会接收 `5`，后续直接值也仍可再次替换结果。

## 九、Updater：根据 Pending State 计算

### 1. Updater 接收队列当前位置的值

当下一值依赖同一 State 已经排队的结果时，传入 updater：

```tsx
function handleThreeUpdaters() {
  setCount((pending) => pending + 1)
  setCount((pending) => pending + 1)
  setCount((pending) => pending + 1)
}
```

若队列开始时 State 为 `0`：

| 顺序 | 队列项 | 接收的 `pending` | 返回值 |
| ---: | --- | ---: | ---: |
| 1 | `pending => pending + 1` | `0` | `1` |
| 2 | `pending => pending + 1` | `1` | `2` |
| 3 | `pending => pending + 1` | `2` | `3` |

前一个 updater 的返回值成为后一个 updater 的输入，最终 State 是 `3`。

### 2. Pending State 与闭包中的 State 不同

`count` 来自当前 render 的快照，`pending` 来自 React 正在处理的队列位置：

```tsx
function handleIncrement() {
  setCount((pending) => {
    console.info('handler 快照', count)
    console.info('队列当前位置', pending)
    return pending + 1
  })
}
```

第一项 updater 的 `pending` 通常从当前 State 开始。若前面已有队列项，后续 updater 的
`pending` 可能已经包含前项结果，因此不应在 updater 中忽略参数并改用闭包里的 `count`。

### 3. Updater 必须返回下一 State

大括号函数体需要显式 `return`：

```tsx
setCount((pending) => {
  return pending + 1
})
```

表达式函数体会隐式返回：

```tsx
setCount((pending) => pending + 1)
```

若 updater 没有返回，计算结果就是 `undefined`。这不是 React 自动保留旧值，而是函数没有提供合法的
下一 State。

## 十、混合队列：严格按加入顺序求值

### 1. 先替换，再更新

假设当前快照中 `count = 0`：

```tsx
function handleReplaceThenUpdate() {
  setCount(count + 5)
  setCount((pending) => pending + 1)
}
```

当前快照先把第一项算成 `setCount(5)`。队列按顺序处理：

| 顺序 | 队列项 | 输入 | 结果 |
| ---: | --- | ---: | ---: |
| 1 | replace with `5` | 不使用 | `5` |
| 2 | `pending => pending + 1` | `5` | `6` |

最终 State 是 `6`。updater 没有绕过替换项，而是接收替换后的 `5`。

### 2. 最后再替换

```tsx
function handleFinalReplacement() {
  setCount(count + 5)
  setCount((pending) => pending + 1)
  setCount(42)
}
```

从 `0` 开始：

| 顺序 | 队列项 | 输入 | 结果 |
| ---: | --- | ---: | ---: |
| 1 | replace with `5` | 不使用 | `5` |
| 2 | `pending => pending + 1` | `5` | `6` |
| 3 | replace with `42` | 不使用 | `42` |

最终 State 是 `42`。第二项确实算出了 `6`，随后第三项在自己的位置把结果替换为 `42`。

### 3. 通用手算方法

遇到任意数字 State 队列时，按四步计算：

1. 先用当前 render 的快照展开所有直接值表达式。
2. 写出一个起始 pending State。
3. 从上到下处理队列项：直接值替换，updater 接收上一步结果并返回下一值。
4. 最后一项处理后的结果就是下一 State。

不要把所有直接值提前放到一起，也不要把所有 updater 提前放到一起。位置就是语义的一部分。

### 4. 怎样选择直接值或 updater

| 更新意图 | 推荐写法 | 原因 |
| --- | --- | --- |
| 重置为确定值 | `setCount(0)` | 不依赖 pending State |
| 替换为已经算好的确定结果 | `setCount(nextCount)` | 意图就是替换 |
| 同一 handler 中连续递增 | `setCount((pending) => pending + 1)` | 每一步依赖前一队列结果 |
| 基于可能已排队的同一 State 继续计算 | updater | 需要当前位置的 pending State |

Updater 只应根据自己对应 State 的 pending 值计算。若一次操作需要协调多个彼此依赖的状态值，应先重新
审视状态关系，而不是在一个 updater 中读取并修改多个外部值。

## 十一、Commit 与 Browser Paint

### 1. Commit 应用必要 DOM 变化

React render 得到下一版 UI 后，React 在 commit 阶段把必要变化应用到 DOM。初次显示会放置所需节点；
后续更新只处理让 DOM 匹配最新结果所需的部分。

因此：

- React render 发生，不代表全部 DOM 都改变；
- 某个数字从 `0` 变为 `1`，不代表整个页面节点都被重建；
- 组件函数中的日志不能证明 commit 已完成；
- setter 返回也不能证明 DOM 已经同步到下一结果。

### 2. Browser Paint 位于 DOM 更新之后

React 完成必要 DOM 更新后，浏览器再把页面绘制到屏幕。Commit 和 browser paint 属于不同系统：

- commit 是 React 对宿主 DOM 的变更；
- paint 是浏览器把当前页面状态显示为像素。

这条顺序不承诺一次 commit 立即产生一个独立可见帧，也不承诺可以用固定毫秒数判断 paint 已完成。

### 3. Setter 返回点不是 DOM 提交点

普通 setter 只提交更新请求，不保证下一行代码已经能从 DOM 读到新结果。少数外部系统要求在同一个
同步回调返回前读取最新 DOM，这时需要单独评估 React DOM 的同步提交边界。无论是否同步提交，当前
handler 中的 State 绑定仍属于旧 render，commit 也不等于 browser paint。

## 十二、Updater 纯度与 StrictMode

### 1. Updater 只计算下一值

React 会在 render 中处理 updater，因此 updater 必须是纯函数：

- 只读取参数和稳定的只读输入；
- 不修改 `pending`；
- 不发请求、不写存储、不修改 DOM；
- 不调用其他 setter；
- 每次以相同输入调用都返回相同结果。

```tsx
// 正确：只根据 pending State 返回下一值。
setCount((pending) => pending + 1)
```

```tsx
// 错误：外部写入可能在重复调用时执行多次。
setCount((pending) => {
  localStorage.setItem('count', String(pending + 1))
  return pending + 1
})
```

副作用应由明确的事件边界承担，updater 只负责状态计算。

### 2. StrictMode 的开发期检查

StrictMode 在开发环境中可能额外调用组件函数和 updater，并忽略其中一次结果，以帮助发现不纯逻辑。
纯 updater 即使被额外调用，也只是重复得到同一个返回值，不会产生外部变化。

必须同时记住三个限定：

1. 事件处理器内部代码不会因为这项检查自动执行两次。
2. 页面最终 State 不会因为纯 updater 的一次额外调用而重复累加。
3. 生产环境没有这项额外检查。

不要用关闭 StrictMode 隐藏不纯 updater；应删除 updater 中的副作用。

## 十三、可运行示例：从快照到屏幕

下面的 Demo 使用一个数字 State 展示完整链路：

- 单次请求在 setter 前后记录同一份 handler 快照；
- 三次直接值从 `0` 得到 `1`；
- 三个 updater 从 `0` 得到 `3`；
- 先替换再更新从 `0` 得到 `6`；
- 最后替换从 `0` 得到 `42`；
- 重置把所有观察重新带回统一起点。

:::demo{id="react.core.learn.basics.render-commit-and-state-snapshot.snapshot-demo"}
:::

操作时先重置为 `0`，再单独运行一种队列。页面结果证明下一 State 已经经过 React render 与 commit
显示到 DOM；阶段说明用于理解职责，不能用来断言实际调用次数或独立浏览器帧数。

## 十四、易错使用提示

:::pitfalls
### 错误：把 setter 当成同步赋值

**触发条件：** 调用 setter 后，立即读取当前 handler 中的 State，并期待它已经变化。

**原因：** State 绑定属于创建当前 handler 的那次 render。setter 提交后续 render 的更新请求，不会
改写正在运行的函数调用。

**后果：** 日志、条件判断和请求参数仍使用旧值，代码却误以为更新失败或发生延迟。

**错误示例：**

```tsx
function handleIncrement() {
  setCount(count + 1)
  console.info(count) // 仍是当前 render 的值
}
```

**正确写法：**

```tsx
function handleIncrement() {
  const nextCount = count + 1
  setCount(nextCount)
  console.info(nextCount)
}
```

**验证方式：** 页面从 `0` 更新为 `1`，但同一次 handler 中读取 `count` 仍为 `0`；本地
`nextCount` 为 `1`。

### 错误：把三次直接值当成三次累加

**触发条件：** 在同一个 handler 中连续写三次 `setCount(count + 1)`。

**原因：** 三个表达式都从同一 render 快照读取 `count`。当 `count = 0` 时，三个队列项都是
`replace with 1`。

**后果：** 预期得到 `3`，实际得到 `1`。

**错误示例：**

```tsx
setCount(count + 1)
setCount(count + 1)
setCount(count + 1)
```

**正确写法：**

```tsx
setCount((pending) => pending + 1)
setCount((pending) => pending + 1)
setCount((pending) => pending + 1)
```

**验证方式：** 从 `0` 分别执行两组代码，直接值结果为 `1`，updater 结果为 `3`。

### 错误：忽略混合队列的加入顺序

**触发条件：** 认为 updater 总在直接值之后统一执行，或认为直接值会清除全部其他更新。

**原因：** 替换项和 updater 项共用同一条顺序。每一项都接着前一项的结果处理。

**后果：** 无法正确预测 `replace -> updater -> replace` 等常见组合。

**错误示例：**

```tsx
setCount(5)
setCount((pending) => pending + 1)
setCount(42)
// 错误预测：43
```

**正确写法：**

```text
replace with 5 -> updater 得到 6 -> replace with 42
最终结果：42
```

**验证方式：** 从 `0` 执行该序列，页面最终显示 `42`。

### 错误：在 updater 中忽略 pending 参数

**触发条件：** updater 声明了 `pending`，计算时却继续读取闭包中的 `count`。

**原因：** 闭包中的 `count` 是当前 render 快照；`pending` 才包含该队列位置之前的处理结果。

**后果：** 连续更新仍反复从同一个旧值计算，失去 updater 的意义。

**错误示例：**

```tsx
setCount((_pending) => count + 1)
setCount((_pending) => count + 1)
```

**正确写法：**

```tsx
setCount((pending) => pending + 1)
setCount((pending) => pending + 1)
```

**验证方式：** 从 `0` 开始，错误写法得到 `1`，正确写法得到 `2`。

### 错误：在 updater 中执行副作用

**触发条件：** 在 updater 中写存储、发送请求、修改 DOM 或调用其他 setter。

**原因：** React 可能为检查纯度额外调用 updater，也可能重新进行 render 计算。updater 必须能够安全
重复。

**后果：** 外部操作可能重复执行，开发环境与生产环境表现不一致。

**错误示例：**

```tsx
setCount((pending) => {
  localStorage.setItem('count', String(pending + 1))
  return pending + 1
})
```

**正确写法：**

```tsx
function handleIncrement() {
  setCount((pending) => pending + 1)
  console.info('已提交加一请求')
}
```

**验证方式：** 启用 StrictMode 后，State 最终结果仍正确，事件 handler 中的日志只对应真实用户操作，
updater 不产生外部写入。

### 错误：把 React render、commit 与 paint 当成同一步

**触发条件：** 在组件函数中读取 DOM，或根据 render 日志断言页面像素已经变化。

**原因：** React render 负责计算 UI，commit 负责修改 DOM，browser paint 由浏览器随后完成。

**后果：** 对 DOM 时机、性能和调用次数得出不受保证的结论。

**错误示例：**

```tsx
function Counter() {
  console.info('页面已经显示新数字')
  return <output>{count}</output>
}
```

**正确写法：**

```text
组件日志只证明 render 逻辑执行。
DOM 变化属于 commit。
像素显示属于 browser paint。
```

**验证方式：** 分别记录组件日志和读取最终 DOM，只陈述各自能证明的事实，不从其中推导独立 paint
次数。

### 错误：在 setter 后立即读取下一版 State 或 DOM

**触发条件：** 调用 setter 后，立刻读取当前 State 变量或查询 DOM，并把结果当作下一版界面。

**原因：** Setter 提交的是后续 render 的更新请求；当前 handler 仍持有旧快照，普通更新也不保证下一行
已经完成 commit。

**后果：** 业务判断使用旧 State，DOM 测量也可能读取旧文本或旧几何信息。

**错误示例：**

```tsx
setCount(count + 1)
console.info(count, outputRef.current?.textContent)
```

**正确写法：** 当前逻辑需要下一值时先保存局部变量；依赖已提交界面的后续工作放到合适的提交后入口。
只有外部同步回调明确要求返回前读取 DOM 时，才评估同步提交。

```tsx
const nextCount = count + 1
setCount(nextCount)
console.info(nextCount)
```

**验证方式：** 分别记录 handler 快照、请求的下一值和最终 DOM，不把 setter 后的同步读取混成同一事实。
:::

## 十五、原理推导与适用场景

### 1. 官方公开事实

可以稳定依赖以下事实：

1. 初次 `root.render` 和 State 更新可以 trigger React render。
2. React render 调用组件并计算下一版 UI，commit 应用必要 DOM 变化。
3. 浏览器在 DOM 更新后 paint，但 React 不承诺独立帧数量。
4. setter 只更新后续 render 的 State，当前 handler 继续读取所属快照。
5. React 在安全边界内 batching 更新，并保留多个有意事件的独立性。
6. 同一 State 的替换项与 updater 项按加入顺序求值。
7. updater 接收 pending State，必须纯净。

### 2. 从事实得到的判断

- 当前值只用于生成一个确定下一值时，可以提交直接值。
- 同一 State 的下一值依赖可能已经排队的结果时，使用 updater。
- 预测多个更新时，先展开当前快照中的直接值，再逐项处理队列。
- setter 后仍需在当前 handler 使用下一值时，先保存本地 `nextValue`。
- 调试界面更新时，分别记录 render 计算、最终 DOM 和用户操作，不把它们合成一个时间点。
- 性能分析不能依赖手写的固定 render 次数假设；公开模型只说明职责和 batching 边界。

### 3. 模型边界

本节模型不承诺：

- React 内部队列节点、优先级或调度字段；
- 一个 setter、一个 render、一次 commit 和一个 browser paint 之间的一一对应；
- 任意异步 callback 的固定处理时机；
- commit 后立刻出现独立可见帧；
- 通过等待固定毫秒数观察“最新 State”。

这些边界不会削弱模型的实用性。组件开发真正需要稳定掌握的是快照归属、更新意图、队列顺序以及
render、commit、paint 的职责分离。

## 十六、练习

:::exercise
### 练习：手算并修正更新序列

**要求：**

```tsx
// 假设当前页面显示 count = 10，手算 A、B、C 的最终结果。
// A
setCount(count + 2)
setCount(count + 2)
setCount((pending) => pending * 2)

// B
setCount((pending) => pending + 2)
setCount(5)
setCount((pending) => pending * 2)

// C
setCount(5)
setCount((pending) => pending + 2)
setCount(1)

// D：为 A、B、C 分别写出“队列项、输入、结果”表格。
// E：把三次 setCount(count + 1) 改成真正连续增加三次的写法。
// F：解释 setter 后 console.info(count) 为什么仍输出 10，
//    并说明怎样在当前 handler 中使用已知的下一值。
```

**验收：** A 的结果为 `24`，B 的结果为 `10`，C 的结果为 `1`；连续增加使用三个基于
`pending` 的纯 updater；快照解释同时包含当前 render 与后续 render，不使用“setter 太慢”作为原因。

**参考答案：** A 依次得到 `12`、`12`、`24`；B 依次得到 `12`、`5`、`10`；C 依次得到
`5`、`7`、`1`。当前 handler 的 `count` 属于创建它的 render；已知下一值可先保存到局部变量再同时用于
setter 与当前逻辑。
:::

## 十七、本节小结

- Trigger 只表示 React 收到计算请求，不表示 DOM 或屏幕已经改变。
- React render 计算下一版 UI，commit 应用必要 DOM 变化，browser paint 随后绘制。
- State、Props、局部变量、JSX 和 handler 属于创建它们的那次 render。
- Setter 提交下一 State，不会改写当前 handler 的 State 绑定。
- Batching 一起处理安全范围内的更新，但不会永久合并多个有意事件。
- 直接值是当前位置的替换项；updater 根据 pending State 返回下一值。
- 混合队列严格按加入顺序处理，不能按语法种类重新排序。
- Updater 必须纯净，StrictMode 的开发期额外调用不会重复真实点击。
- Setter 返回不保证 DOM 已提交；同步 DOM 也不会改写当前 handler 的 State 快照。

## 十八、参考资料

- [Render and Commit](https://react.dev/learn/render-and-commit) - trigger、React render、commit 与 browser paint。
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) - State、JSX 与事件处理器的 render 快照。
- [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) - Props 的只读时间快照。
- [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) - batching、替换项、updater 与混合队列。
- [useState](https://react.dev/reference/react/useState) - setter、pending State、队列处理与 StrictMode 注意事项。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) - render 与 updater 的纯度边界。
- [`<StrictMode>`](https://react.dev/reference/react/StrictMode) - 开发期额外调用应纯函数的检查范围。
- [React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide#automatic-batching) - `createRoot` 下的 automatic batching。
