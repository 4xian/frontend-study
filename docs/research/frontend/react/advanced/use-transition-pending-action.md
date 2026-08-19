# Transition 与 pending UI 研究记录

## 研究范围

本文以 React 官方文档 `19.2`、React `v19.2.8` 官方源码和测试、`@types/react@19.2.18` 为依据，整理
`startTransition`、`useTransition`、Action、非阻塞更新和 pending UI 的公开行为。重点是可以直接由应用
代码观察到的合同，不把 Fiber、lane、thenable 等内部实现名称当作应用 API。

覆盖以下知识：

- standalone `startTransition` 与 `useTransition` 返回函数的共同语义，以及二者是否能提供 pending 状态；
- Action 的同步调用、异步 Action、`await` 后再次包裹 State setter 的限制；
- 后台渲染的非阻塞、可中断和重启行为，以及普通交互在 pending 期间的响应性；
- 受控文本输入限制；
- Suspense 已显示内容的保留、嵌套新边界的 fallback 和 pending 指示器分工；
- Action 错误进入 Error Boundary 的路径；
- 异步 Action 的完成顺序限制，以及 `isPending` 不能表达队列或业务提交结果的边界；
- 适用与不适用的场景。

## 版本与来源

官网 Reference 按 `19.2` minor 维护，不为每个 patch 单独发布文档。运行时行为用 React `v19.2.8` tag
固定，类型用 `@types/react@19.2.18` 固定。以下来源均为 React 或其官方类型包的第一方材料。

| 编号 | 来源 | 固定方式 | 支撑的事实 |
| --- | --- | --- | --- |
| S1 | [React `startTransition` Reference](https://react.dev/reference/react/startTransition) | React 文档 `19.2` | 参数、立即调用、同步更新范围、非阻塞、可中断、输入限制、返回 `void`、Hook 外使用。 |
| S2 | [React `useTransition` Reference](https://react.dev/reference/react/useTransition) | React 文档 `19.2` | Hook 返回值、Action、`isPending` 生命周期、异步 Action、错误边界、输入限制和顺序限制。 |
| S3 | [React `<Suspense>` Reference](https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding) | React 文档 `19.2` | Transition 避免隐藏已显示内容，只等待到足以保护已有内容；嵌套新边界仍可显示 fallback。 |
| S4 | [固定 `useTransition` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useTransition.md) | `reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac` | 固定公共文字和示例，尤其是 `await` 后重包、Action 立即执行、异步顺序和 pending 生命周期。 |
| S5 | [固定 `startTransition` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/startTransition.md) | 同上 | standalone API 的无 pending 边界、非阻塞更新、可中断和受控输入限制。 |
| S6 | [固定 `<Suspense>` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md) | 同上 | 已显示内容保护和嵌套 Suspense 的 reveal 规则。 |
| S7 | [React `ReactStartTransition.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactStartTransition.js#L45-L117) | `facebook/react@v19.2.8` | standalone `startTransition` 同步调用 scope、观察可选 Promise、最终返回 `void` 的实现旁证。 |
| S8 | [React `ReactFiberHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L3090-L3220) | `facebook/react@v19.2.8` | Hook Action 的同步/异步分支、pending 更新、完成状态和错误重新抛出的实现旁证。 |
| S9 | [React `ReactFiberHooks.js` 的 `useTransition` 实现](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L3398-L3443) | `facebook/react@v19.2.8` | 返回数组顺序、稳定 start 函数和异步 Action 完成前读取 pending 的实现旁证。 |
| S10 | [React `ReactAsyncActions-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js#L127-L157) | `facebook/react@v19.2.8` | `isPending` 从异步 Action 开始到 Promise 完成的可观察生命周期。 |
| S11 | [React `ReactAsyncActions-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js#L352-L429) | `facebook/react@v19.2.8` | async Action pending 期间，普通 urgent State 仍能先提交。 |
| S12 | [React `ReactAsyncActions-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js#L432-L518) | `facebook/react@v19.2.8` | 同步或异步 Action 抛错后由外层 Error Boundary 显示错误。 |
| S13 | [React `ReactSuspenseWithNoopRenderer-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactSuspenseWithNoopRenderer-test.js#L2407-L2507) | `facebook/react@v19.2.8` | Transition 触发 Suspense 时，已有内容保持显示直到新内容可提交。 |
| S14 | [`@types/react@19.2.18` `index.d.ts`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm 类型包 `19.2.18` | `TransitionFunction` 可同步或返回 Promise，Hook 返回 `[boolean, TransitionStartFunction]`，start 返回 `void`。 |
| S15 | [React `Component` Error Boundary Reference](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | React 文档 `19.2` | Error Boundary 不捕获事件处理函数、异步回调等不属于渲染路径的错误。 |

## 核心合同

### `startTransition` 的共同语义

`startTransition(action)` 接收一个无参数函数。React 会在当前调用栈中立即执行这个函数；函数执行期间
同步安排的 State 更新被标记为 Transition。它不是 `setTimeout`、debounce、任务队列，也不是把回调推迟
到浏览器空闲时间的调度器。下面的输出顺序仍然是 `1、2、3`：

```tsx
console.log(1)
startTransition(() => {
  console.log(2)
  setPage('/about')
})
console.log(3)
```

“后台”描述的是被标记 State 更新的 render/commit 调度，而不是 Action 函数本身延迟执行。Action 内可以
安排多个 State 更新，也可以执行与该更新相关的副作用；但副作用的业务顺序、取消和持久化成功不由
`startTransition` 自动定义。

standalone API 的公开返回值是 `void`，不会返回 Action 的 Promise，也没有查询 pending 的能力：

```tsx
startTransition(() => setPage('/about'))
// 不能写成：await startTransition(...)
```

当代码处于组件外、例如某个数据层或自定义库中，使用 standalone `startTransition`。需要在组件中展示
过渡状态时，改用 `useTransition`。两者包裹 State 更新的 Transition 语义相同，但反馈能力不同。

### `useTransition` 的返回值与调用位置

`useTransition()` 是 Hook，必须在函数组件或自定义 Hook 的顶层调用，不接收参数，返回数组的固定顺序是：

```tsx
const [isPending, startTransition] = useTransition()
```

- `isPending` 是 React 管理的布尔值，表示当前组件关联的 Transition 仍有 Action 未完成或最终状态尚未
  显示；
- `startTransition` 是稳定身份的函数，负责创建 Action；
- 不能交换两个位置，不能把 `isPending` 改成手工 `useState`，也不能在条件、循环或事件处理函数中调用
  `useTransition`；
- Hook 外需要启动 Transition 时，使用 standalone API，但它不提供 `isPending`。

### 同步 Action、非阻塞和可中断更新

同步 Action 适合把本地导航式 State（例如面板、标签页、结果视图）标记为非紧急更新。React 可以在
后台准备这个更新，在有更紧急的普通更新到达时先处理后者，再继续或重启 Transition render。官方测试
证明 async Action 等待期间普通 State 仍可先提交（S11）；官方文档则明确说明 Transition render 会被其他
State 更新中断，并在处理更紧急的更新后重新开始（S1、S2、S5）。

因此需要区分三件事：

1. Action 回调本身立即运行；
2. Transition render 可以被暂停、丢弃并重启；
3. 用户的普通交互不必等待 Transition 最终 commit。

这不会带来固定的毫秒数、固定 render 次数或“并行执行 JavaScript”的保证。渲染阶段必须保持无副作用，
因为被中断的工作可能不会 commit。

### async Action 与 `await` 后的 State 更新

Action 可以声明为 `async` 并返回 Promise。`useTransition` 会把这个 Promise 纳入 pending 生命周期：
首次调用 start 后 `isPending` 变为 `true`，直到 Action 完成且最终 State 已向用户显示才回到 `false`
（S2、S4、S8-S10）。

React 19.2 的已知限制是：`await` 之后的 State setter 不会自动继承 Transition 标记。每个 `await` 后要
再调用一次 `startTransition`：

```tsx
const [isPending, startTransition] = useTransition()

function openReport() {
  startTransition(async () => {
    const report = await readReport()

    startTransition(() => {
      setReport(report)
    })
  })
}
```

这里外层 Action 的 Promise 负责 pending 生命周期，内层 start 负责重新建立 `await` 后 State 更新的
Transition 标记。不能把 `await startTransition(...)` 当成等待完成的写法，因为 start 的类型和运行时返回
值都是 `void`。如果 Action 内有多个 `await`，每个后续 State 更新都要重新包裹。

`isPending` 的 `false` 也不能被理解为网络请求、数据库写入或任意副作用已经成功；它只表示 React 观察到的
Action/最终 State 生命周期已经结束。

### pending UI 应该表达什么

`isPending` 适合用来显示“当前视图正在切换”“结果仍在准备”等就地反馈，或暂时降低导航容器的不透明度。
它是聚合信号，不是某个请求的 ID、进度百分比、队列游标或提交回执。同步 Action 很快时，`true` 可能短到
难以稳定观察，不能为了展示 spinner 而用 timer 延长 Transition。

pending 期间，属于普通更新的按钮、选择器或输入仍应立即响应；启动新的 Transition 是否允许，应由应用的
身份、取消或排序策略决定，而不是假设 `useTransition` 自动排队。一个简单 UI 可以在已有 Action pending
时禁用会产生歧义的重复入口，但这属于界面策略，不是 Hook 的内置队列能力。

### 受控文本输入的限制

Transition 更新是非阻塞的，而受控文本输入需要在输入事件中同步更新。因此不能把控制 `<input value>` 的
State setter 放进 Transition：

```tsx
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  startTransition(() => {
    setText(event.target.value) // 错误：输入控制 State 必须同步更新
  })
}
```

官方给出两种边界清晰的做法（S2、S5）：

1. 用一个 State 同步保存输入值，再用另一个 State 在 Transition 中更新昂贵的结果视图；
2. 输入值保持同步，结果视图使用 `useDeferredValue` 延后跟随。

本主题只需要记住输入控制 State 的同步合同；`useDeferredValue` 的陈旧值策略属于另一个 API，不能用
`isPending` 代替它。

### Suspense 与已显示内容保护

当 Transition 中的更新触发一个**已经显示过的** Suspense 边界重新挂起时，React 会尽量保留已有内容，避免
整个已显示页面突然被根 fallback 覆盖。Transition 只等待到足以避免隐藏已有内容，不会等待所有后代内容。

因此存在两个不同观察：

- 已显示的布局、标签容器或页面内容可以继续留在屏幕上，由 `isPending` 提供轻量指示；
- 新出现的嵌套 Suspense 边界仍可立即显示自己的 fallback，让新内容逐步 reveal。

这不是“所有 Suspense fallback 都被禁止”的合同。初次加载、没有旧内容可保留时仍然需要 fallback；不同页面
或不同实体需要重新开始边界时，可以用新的 `key` 表达内容身份变化。Suspense 只负责挂起内容的显示策略，
`useTransition` 只提供更新优先级和 pending 反馈，两者不是同一个状态源。

### Action 错误与 Error Boundary

如果传给 `useTransition` 返回的 start 的同步或异步 Action 抛出错误，React 会在后续渲染中重新抛出该错误，
包住调用组件的 Error Boundary 可以显示 fallback（S2、S8、S12）。这条路径的含义是：

```tsx
<ErrorBoundary fallback={<p>报告加载失败</p>}>
  <ReportPanel /> {/* 内部调用 useTransition */}
</ErrorBoundary>
```

它不等于 Error Boundary 能捕获任意事件回调、任意裸 Promise rejection 或组件外任务的错误。错误 fallback
恢复、重置边界和错误上报仍由 Error Boundary 自身的合同负责；`isPending` 也不是错误状态。

### 异步完成顺序的已知限制

多个 async Action 可能以不同于启动顺序的顺序完成。React 19.2 文档明确指出，跨 async 边界的更新无法让
React 推断调用方想要的业务顺序；Transition 内的 Action 不保证执行顺序。多个 ongoing Transition 当前
还可能被一起 batch（S1、S2、S4、S5）。

所以不能用以下推断设计业务逻辑：

- “后点击的一定最后提交”；
- “`isPending` 变为 `false` 就代表最后一次请求胜出”；
- “Transition 会自动取消旧请求”；
- “一个布尔 pending 值就是 FIFO 队列”。

需要顺序、去重、取消或 last-write-wins 时，必须在应用层维护请求身份和排序协议，或采用专门处理顺序的
Action 抽象。Transition 本身只描述 React State 更新的优先级和可见 pending 生命周期。

## 适用与不适用

### 适用

- 切换标签页、面板、列表结果或本地导航状态，且新视图 render 可能较重；
- 需要保持按钮、普通选择器或其他交互响应，同时让较慢视图在后台准备；
- 与 Suspense 配合刷新已显示内容，希望旧内容保持可见并用 `isPending` 显示轻量反馈；
- 组件内部需要 `isPending` 时使用 `useTransition`，组件外只能启动更新时使用 standalone `startTransition`；
- async Action 已有清晰的成功、错误和身份策略，并且能在每个 `await` 后重新包裹 State 更新。

### 不适用

- 控制受控文本输入的 State，或任何要求输入事件同步回显的关键反馈；
- 需要严格 FIFO、取消旧请求、去重、事务、持久化确认或业务提交顺序的场景；
- 把 `startTransition` 当作 debounce、定时器、后台线程、Promise 或性能数字保证；
- 仅为显示 spinner 而人为延长同步更新，或把 `isPending` 当成手工加载 State；
- 期望 Transition 自动处理所有数据加载、错误捕获或任意外部副作用的场景。

## 易错点

### 1. 把两个 API 或返回数组混为一谈

- **错误名称：** 把 `useTransition` 当成 standalone API，或写反返回数组。
- **触发条件：** 在组件中需要 pending，或在组件外调用 Hook。
- **原因：** `useTransition` 是 Hook，返回 `[isPending, startTransition]`；standalone API 只返回 `void`，不提供 pending。
- **后果：** Hook 违反调用规则、布尔值被当成函数，或组件无法显示真实 pending。
- **错误示例：** `const [startTransition, isPending] = useTransition()`；在模块顶层调用 `useTransition()`。
- **正确示例：** 组件顶层使用 `const [isPending, startTransition] = useTransition()`；组件外使用 `import { startTransition } from 'react'`。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S5、S14。

### 2. 以为 Action 会被延迟调用

- **错误名称：** 把 `startTransition` 理解为 timer 或 debounce。
- **触发条件：** 需要在 Action 中记录调用时间、准备数据或安排 State 更新。
- **原因：** React 立即调用 Action；只有其中安排的 State 更新以 Transition 优先级调度。
- **后果：** 错误地把 Action 本身的执行时机当成后台工作完成时机，或重复使用 timer 制造 pending。
- **错误示例：** `startTransition(() => setTimeout(() => setPage('/about'), 1000))`，并认为 setter 已被标记。
- **正确示例：** 在真正发生更新的事件中调用 `startTransition(() => setPage('/about'))`；异步回调恢复后再次包裹 setter。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S4、S5、S7。

### 3. 把非阻塞误解成 JavaScript 并行

- **错误名称：** 认为 Transition 会创建后台线程，或保证 render 不会重启。
- **触发条件：** 需要处理昂贵列表、图表或面板切换。
- **原因：** React 可中断、丢弃并重启 Transition render，让更紧急更新先处理；Action 仍在同一 JavaScript 环境中立即执行。
- **后果：** 在 render 中放副作用、依赖固定 render 次数，或误以为 CPU 计算自动并行。
- **错误示例：** 在组件 render 中发送请求，并把 `startTransition` 当作线程隔离。
- **正确示例：** render 保持纯函数；只将可延后的 State 更新包在 start 中，让普通交互继续同步处理。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S5、S11。

### 4. `await` 后裸调用 State setter

- **错误名称：** 以为 async Action 会自动继承 Transition 上下文。
- **触发条件：** Action 中等待异步函数后提交结果 State。
- **原因：** React 19.2 在 JavaScript async 边界后无法自动保留 Transition 标记。
- **后果：** `await` 后的 setter 不被视为 Transition，可能出现不同的优先级和 Suspense 行为。
- **错误示例：** `startTransition(async () => { const value = await read(); setValue(value) })`。
- **正确示例：** `startTransition(async () => { const value = await read(); startTransition(() => setValue(value)) })`。
- **适用版本：** React 19.2；`await` 后重新包裹是当前公开限制。
- **来源：** S1、S2、S4、S5、S8。

### 5. 用 Transition 控制受控输入

- **错误名称：** 把 `<input value>` 的控制 State 放进 start。
- **触发条件：** 希望输入时同时过滤、搜索或更新昂贵视图。
- **原因：** 输入事件要求同步回显，而 Transition 更新可以延后。
- **后果：** 输入显示滞后、光标体验异常，不能可靠地反映用户刚输入的值。
- **错误示例：** `onChange={e => startTransition(() => setText(e.target.value))}`。
- **正确示例：** `onChange={e => setText(e.target.value)}`；另用结果 State 包在 Transition，或使用 `useDeferredValue`。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S5。

### 6. 把 `isPending` 当成请求队列或成功回执

- **错误名称：** 用一个布尔值推断具体 Action、顺序或业务提交结果。
- **触发条件：** 连续启动多个异步更新，或需要展示“最后一次请求”的结果。
- **原因：** `isPending` 是聚合的 React UI 信号；多个 ongoing Transition 可能被 batch，Action 顺序不保证。
- **后果：** 旧结果覆盖新结果、错误的提交提示，或误以为旧请求已取消。
- **错误示例：** `if (!isPending) showToast('最后一次请求已保存')`，但没有请求身份或顺序协议。
- **正确示例：** 为业务请求维护版本/身份并自行排序、取消或丢弃结果；`isPending` 仅用于 UI 指示。
- **适用版本：** React 19.2；异步顺序限制仍属已知限制。
- **来源：** S1、S2、S4、S5。

### 7. 认为 Transition 会隐藏所有 Suspense fallback

- **错误名称：** 把“保护已显示内容”扩大成“所有 fallback 都不显示”。
- **触发条件：** 切换到会挂起的新页面或新嵌套内容。
- **原因：** Transition 只等待到足以避免隐藏已有内容；新出现的边界仍需即时反馈。
- **后果：** 设计出没有初次加载状态的页面，或期待新内容出现前整棵树保持旧 UI。
- **错误示例：** 认为任何 `Suspense` 都会等待到数据全部加载完才显示 fallback。
- **正确示例：** 旧边界保持已有内容，新嵌套边界使用自己的 fallback；用 `isPending` 表达整个过渡仍在进行。
- **适用版本：** React 19.2。
- **来源：** S2、S3、S6、S13。

### 8. 用固定时间制造或断言 pending

- **错误名称：** 用 timer 延长同步 Transition，或断言 `isPending` 必须持续固定毫秒数。
- **触发条件：** 为了让 spinner 肉眼可见或编写脆弱的 UI 断言。
- **原因：** pending 由 Action 和最终 State 的真实生命周期决定，轻量同步更新可能很快完成。
- **后果：** 引入与业务无关的延迟，测试在不同设备和调度下不稳定。
- **错误示例：** `startTransition(() => { setPage('/about'); setTimeout(() => setLoading(false), 500) })`。
- **正确示例：** 直接渲染 React 返回的 `isPending`；验证状态变化和最终 DOM，而不是固定时间窗口。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S4、S9、S10。

### 9. 认为 Action 的任意错误都自动被当前边界捕获

- **错误名称：** 把 Error Boundary 合同扩展到事件回调、裸 Promise 或组件外任务。
- **触发条件：** Action 失败后需要显示错误，或同时存在多个异步任务。
- **原因：** `useTransition` Action 的错误会在渲染路径重新抛出；Error Boundary 只捕获其规定的渲染错误范围。
- **后果：** 错误无人处理、出现未处理 Promise rejection，或错误边界放置位置不正确。
- **错误示例：** 认为 `window.addEventListener` 回调中的 `throw` 会被包住 `useTransition` 的边界捕获。
- **正确示例：** 用 Error Boundary 包住调用 `useTransition` 的组件，并为组件外任务建立显式错误通道。
- **适用版本：** React 19.2。
- **来源：** S2、S8、S12、S15。

### 10. 用 `startTransition` 替代紧急反馈

- **错误名称：** 把需要立即可见的输入、校验或安全提示标成 Transition。
- **触发条件：** 希望所有 State 更新都“更平滑”，不区分紧急和非紧急。
- **原因：** Transition 明确允许更新被延后或中断；它只适合用户可以短暂看到旧内容的非紧急视图。
- **后果：** 关键反馈延迟，用户继续操作时看到过时状态。
- **错误示例：** `startTransition(() => setValidationError('密码错误'))`，并要求错误文字立即跟随按键出现。
- **正确示例：** 紧急反馈同步更新；只把昂贵的结果视图、非紧急导航或 Suspense 刷新包在 Transition。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S3、S5。

## 结论

`startTransition` 的核心是“立即运行 Action，降低其中 State 更新的紧急程度”；`useTransition` 在此基础上
提供 `[isPending, startTransition]`，让组件能够表达从 Action 开始到最终 State 显示完成的 pending UI。它
允许 React 在后台准备、暂停、重启或放弃非紧急 render，同时保留普通交互的响应性；它不提供 Promise 返回值、
请求队列、取消协议、业务顺序或持久化确认。

使用 async Action 时，外层 Promise 决定 pending 生命周期，每个 `await` 后的 State setter 仍需再次包裹。
受控输入保持同步；Suspense 只在 Transition 中尽量保留已显示内容，新边界仍可显示 fallback；Action 错误需由
包住调用组件的 Error Boundary 处理；异步结果的顺序、身份和取消必须由应用层负责。

## 参考资料

- [React `startTransition` Reference](https://react.dev/reference/react/startTransition)
- [React `useTransition` Reference](https://react.dev/reference/react/useTransition)
- [React `<Suspense>`：防止隐藏已显示内容](https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding)
- [固定 `startTransition` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/startTransition.md)
- [固定 `useTransition` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/useTransition.md)
- [固定 `<Suspense>` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md)
- [React `v19.2.8` `ReactStartTransition.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactStartTransition.js)
- [React `v19.2.8` `ReactFiberHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js)
- [React `v19.2.8` `ReactAsyncActions-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js)
- [React `v19.2.8` `ReactSuspenseWithNoopRenderer-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactSuspenseWithNoopRenderer-test.js)
- [React `Component`：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [`@types/react@19.2.18` `index.d.ts`](https://unpkg.com/@types/react@19.2.18/index.d.ts)
