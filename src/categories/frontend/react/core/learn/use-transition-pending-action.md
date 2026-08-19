---
id: react.core.learn.advanced.use-transition-pending-action
type: lesson
title: Transition 与 pending UI
summary: 用 startTransition 标记非紧急更新，用 useTransition 观察同步与异步 Action 的 pending 生命周期。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 55
prerequisites:
  - react.core.learn.advanced.use-resource-reading
related:
  - react.core.learn.advanced.error-boundary-render-failures
  - react.core.learn.advanced.use-deferred-value-stale-content
  - react.core.learn.intermediate.use-reducer
tags:
  - React
  - startTransition
  - useTransition
  - Transition
  - Action
  - isPending
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能在组件外使用 startTransition 标记已有 State setter 的非紧急更新。
  - 能在组件顶层按固定顺序读取 useTransition 返回的 isPending 与 startTransition。
  - 能区分 Action 立即执行、更新非阻塞和最终界面提交这三个时间点。
  - 能编写同步 Action 和返回 Promise 的异步 Action。
  - 能在 await 后再次使用 startTransition 标记最终 State 更新。
  - 能让 pending 期间的旧内容和边界外普通交互保持可用。
  - 能说明 Suspense 内容保护、受控文本输入、错误边界和异步 Action 顺序的限制。
recap:
  - standalone startTransition 接收无参数 Action，立即调用它，返回 void，不提供 pending 信号。
  - useTransition 只能在组件或自定义 Hook 顶层调用，返回 [isPending, startTransition]。
  - async Action 的 Promise 会延长 isPending；await 后的 setter 仍需再次包裹。
  - isPending 是 React 工作的聚合反馈，不是请求身份、队列游标或业务提交结果。
  - Transition 不能控制受控文本输入，普通 State 更新应保持直接响应。
  - Transition 刷新已显示的 Suspense 内容时会尽量保留旧内容，新嵌套边界仍可显示 fallback。
sources:
  - title: startTransition
    url: https://react.dev/reference/react/startTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - standalone API 的参数、立即执行、非阻塞更新、void 返回值和 Hook 外调用
      - 输入限制、打断重启、timer/async 边界与无 pending 信号
  - title: useTransition
    url: https://react.dev/reference/react/useTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Hook 返回值、同步与异步 Action、isPending 生命周期和非阻塞行为
      - await 后重新包装、输入限制、错误边界和异步顺序限制
  - title: Suspense
    url: https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Transition 刷新时保护已显示内容和新嵌套边界的 fallback 行为
      - 初次挂起与内容身份变化时仍可能显示 fallback
  - title: Component Error Boundary
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Action 进入渲染错误路径时可由包住组件的错误边界显示 fallback
      - 事件处理器和任意异步回调不由错误边界自动捕获
---

# Transition 与 pending UI

## 一、学习目标

- 选择 standalone `startTransition` 或 `useTransition`，并说清两者提供的反馈不同。
- 用普通 State 保持输入和即时交互，用 Transition 承担非紧急的面板或列表更新。
- 观察同步 Action、异步 Action、`await` 后最终提交和 `isPending` 的完整过程。
- 在 pending 期间保留已提交的旧内容，避免用一个 boolean 臆造业务队列或请求状态。

## 二、Transition 解决什么问题

一次交互可能同时产生两类更新：输入框的值、焦点和按钮反馈必须马上响应；大型列表、图表或面板切换
可以稍后完成。Transition 让后者以非阻塞更新参与调度。它不会把 JavaScript 函数丢到空闲回调里，
也不会自动变成网络请求、缓存或事务。

`startTransition` 有两种调用形态：

- standalone `startTransition` 是普通函数，适合已经拿到 State setter 的组件外工具、事件处理器或自定义
  更新函数。它返回 `void`，不能读取 pending 状态。
- `useTransition()` 是组件 Hook，返回 `[isPending, startTransition]`。它在标记 Transition 的同时，
  让组件读取 React 管理的 pending 反馈。

两者使用同一套 Transition 标记语义，但调用位置和可观察信号不同。需要 loading 文案时不能给
standalone 函数手工加一个同名 boolean；应该在组件内使用 `useTransition`。

## 三、standalone startTransition

### 1. Action 立即执行

`startTransition(action)` 接收一个无参数函数。React 会在调用 `startTransition` 的过程中立即调用这个
Action；Action 内同步安排的 State 更新会被标记为 Transition：

```tsx
import { startTransition } from 'react'

export function selectBackgroundView(
  setView: (nextView: string) => void,
  nextView: string,
): void {
  startTransition(() => {
    setView(nextView)
  })
}
```

这里的 `selectBackgroundView` 不需要是组件，也没有 Hook。调用者仍必须持有真实 setter；
`startTransition` 不会从模块或 DOM 中寻找 State。Action 本身也没有参数，所需值通过闭包传入。

“立即执行”和“非阻塞更新”并不矛盾：Action 的函数体立即运行，State 更新立即被安排；React 随后可以
把 Transition render 作为较低优先级的后台工作。同步 Action 很轻时，整个 render 和 commit 可能快到
用户看不见单独的 loading 状态。

### 2. standalone 没有 pending 查询

standalone API 的返回值是 `undefined`。下面的写法不能等待 Transition 完成：

```tsx
await startTransition(() => {
  setView('history')
})
```

`await` 只会立即继续，因为函数没有返回 Promise。若需要在界面上表达“仍在处理”，应把更新放到使用
`useTransition` 的组件中，读取其 `isPending`。不要维护一份由 `setIsPending(true/false)` 模拟的状态，
因为手工状态无法知道最终 Transition render 是否已经提交。

### 3. 非阻塞、打断和重启

Transition 的非阻塞性体现在 render 工作可以被更紧急的输入更新打断。假设一个面板包含大量本地计算：

1. 点击按钮时，Action 立即安排面板 State 的 Transition 更新。
2. React 开始渲染新面板，但结果尚未 commit。
3. 用户输入文本时，输入 State 的普通更新优先处理，输入框保持响应。
4. React 可以丢弃尚未提交的旧尝试，从最新 State 重新开始面板 Transition。
5. 最终只提交与最新输入和最新面板 State 一致的结果。

不要把某一次 render 尝试次数当成公开合同。轻量设备上 Transition 可能在输入到达前完成，观察不到一次
可见的丢弃；验收重点应是输入始终可编辑，最终面板使用最新 State。

### 4. 受控输入必须保持普通更新

受控文本输入的 `value` setter 不能放进 Transition：

```tsx
function SearchBox() {
  const [query, setQuery] = useState('')
  const [viewQuery, setViewQuery] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextQuery = event.target.value
    setQuery(nextQuery)
    startTransition(() => {
      setViewQuery(nextQuery)
    })
  }

  return <input value={query} onChange={handleChange} />
}
```

输入 State 负责每个键击的即时回显，`viewQuery` 代表允许后台更新的结果视图。不要为了展示
Transition 而延迟输入本身，也不要在本课把它扩展成防抖、节流、网络搜索或数据缓存。

### 5. 异步边界的标记范围

standalone `startTransition` 只覆盖 Action 执行期间同步安排的 State 更新。下面的 timer 回调不再处于
原来的 Transition 上下文：

```tsx
startTransition(() => {
  setStatus('scheduled')
  setTimeout(() => {
    setStatus('finished')
  }, 0)
})
```

这段代码还可能有 timer 的生命周期、取消和竞态问题。若异步操作在 `await` 后更新 State，需要重新调用
`startTransition` 标记那个更新；本课的异步 Demo 使用本地 deferred gate，使等待窗口由用户控制，
不引入网络和固定计时。

## 四、useTransition 返回值

### 1. Hook 调用位置和顺序

`useTransition()` 不接收参数，只能在组件或自定义 Hook 的顶层调用，不能放在条件、循环或事件处理器
内部。返回数组的顺序固定：

```tsx
const [isPending, startTransition] = useTransition()
```

- `isPending` 是 React 管理的 boolean，表示相关 Transition 工作尚未完成并显示最终结果。
- `startTransition` 是组件内配套的 Action 启动函数，调用方式与 standalone API 相同。

不要反过来解构，也不要为 `isPending` 再创建一个 State。Hook 本身必须在每次 render 中以相同顺序读取，
但启动函数可以在事件处理器中调用。

### 2. 同步 Action 的生命周期

同步 Action 可以只安排本地 State：

```tsx
const [isPending, startTransition] = useTransition()
const [panel, setPanel] = useState<'overview' | 'history'>('overview')

function openHistory(): void {
  startTransition(() => {
    setPanel('history')
  })
}
```

Action 调用记录会同步产生，面板更新则按 Transition 调度。若更新很轻，`isPending` 可能只在很短的时间
内为 `true`，不能要求它稳定显示某个毫秒数。可靠观察应检查 Action 被调用、面板最终提交，以及普通
交互没有被锁死。

### 3. async Action 和 pending 生命周期

Action 可以返回 Promise。React 会把 Promise 的等待过程纳入 pending 生命周期，直到最终 Transition State
已经显示：

```tsx
const gate = createDeferred<'review'>()

startTransition(async () => {
  const nextPanel = await gate.promise

  startTransition(() => {
    setPanel(nextPanel)
  })
})
```

在 gate 兑现前，`isPending` 保持为 `true`，已提交的旧面板仍可见；兑现后，内层 Transition 安排最终面板
更新，DOM 提交完成后 pending 才回到 `false`。Promise 已兑现、Action callback 已恢复执行和最终 DOM
已更新是三个不同时点，不能把其中任意一个提前当作完成。

### 4. await 后为什么要再次包裹

当前 React 的 async Action 不会让 `await` 之后的 setter 自动继承 Transition 标记。必须在异步边界之后
重新调用 `startTransition`：

```tsx
startTransition(async () => {
  const result = await loadPanel()

  startTransition(() => {
    setPanel(result)
  })
})
```

外层 Action 的 Promise 负责让 `isPending` 覆盖等待阶段，内层 Action 负责给最终 setter 建立新的
Transition 上下文。两层职责不要合并成“只要在 async 函数里就自动是 Transition”。

### 5. pending 期间的普通 State

`isPending` 适合驱动文案、禁用重复启动按钮和保留旧内容，但不应阻塞整个页面。异步 Action 等待时，
边界外的普通 State 仍可以直接更新：

```tsx
function markScene(): void {
  setMarkerCount((count) => count + 1)
}
```

如果应用允许同时启动多个互相竞争的 Action，不能从一个 boolean 推断是哪一个在运行，也不能推断最后
完成的顺序。课程 Demo 只允许一个本地异步 Action 在途，避免把 `isPending` 误读成队列、取消令牌或
业务事务状态。

### 6. Suspense 与已显示内容保护

当 Transition 更新让一个已经显示内容的 Suspense 边界再次挂起时，React 会尽量保留当前内容，避免整个
区域立即退回 fallback。界面可以继续显示旧面板，并用 `isPending` 表达新内容仍在准备：

```tsx
const [isPending, startTransition] = useTransition()

function selectReport(reportId: string): void {
  startTransition(() => {
    setSelectedReportId(reportId)
  })
}

return (
  <>
    {isPending && <p>正在准备新报告</p>}
    <Suspense fallback={<p>正在加载报告</p>}>
      <Report reportId={selectedReportId} />
    </Suspense>
  </>
)
```

这不是“Transition 会隐藏所有 fallback”。初次渲染时没有旧内容可保留，边界仍会显示 fallback；更新后
新出现的嵌套 Suspense 边界也可以显示自己的 fallback，让新区域逐步出现。若 `key` 改变表示进入不同
内容身份，React 也不会把旧内容保护误当成同一份内容的刷新。

Suspense 决定挂起内容如何展示，Transition 决定 State 更新的调度和 pending 反馈。两者可以配合，但
`isPending` 不是 Suspense 状态的别名，也不能替代边界本身。

## 五、Action 的错误和顺序边界

### 1. Error Boundary 的范围

如果传给 `startTransition` 的 Action 在 React 处理更新的路径上抛错，包住调用组件的 Error Boundary 可以
显示 fallback：

```tsx
<ErrorBoundary fallback={<p>面板更新失败</p>}>
  <PanelEditor />
</ErrorBoundary>
```

这不是任意错误的捕获器。普通事件处理器里的 `throw`、脱离 React 树的 Promise rejection 和外部任务
错误仍需在对应边界处理。Transition 课程只使用 Error Boundary 说明错误归属，不把错误分支伪装成业务
提交结果。

### 2. async Action 不保证顺序

多个异步 Action 可能以不同于发起顺序的顺序完成。React 当前不会替应用决定 FIFO、取消旧请求或让最新
请求必胜；多个 Transition 也可能被批处理。因此不能这样建模：

```tsx
const latestResult = !isPending
```

需要排序、取消、去重、重试或业务事务时，应另建明确的请求身份和状态机。本课只讲 Transition 反馈，
不实现远程请求队列。

## 六、Demo：两条 Transition 路径

### 1. standalone 后台视图

第一个 Demo 使用模块外的 `startBackgroundUpdate` 包装函数，把已有 `setView` 传给 standalone
`startTransition`。输入框由普通 State 控制，视图选择由 Transition 标记，源码区展示真实运行的 TSX、
TS 和 CSS。界面会明确显示 standalone API 没有 pending 信号：

:::demo{id="react.core.learn.advanced.use-transition-pending-action.background-update-demo"}
:::

观察重点：

- 点击视图按钮时，Action 调用次数先增加，目标视图最终提交。
- 输入框可以在后台视图渲染时继续输入，输入值没有交给 Transition。
- 页面不会把一个自定义 boolean 标成 React pending；standalone API 本身只返回 `void`。
- 列表计算可能被更高优先级输入打断，但不要依赖固定 render 尝试次数。

### 2. pending Action 面板

第二个 Demo 在组件顶层调用 `useTransition`。同步按钮直接提交历史面板；异步按钮等待本地 gate。
等待时旧概览面板保持可见，“标记现场”使用普通 State 立即增加；点击“继续 Action”后，最终复核面板
提交，pending 才回到 idle。实验可以重建，以便重复观察同一状态顺序。

:::demo{id="react.core.learn.advanced.use-transition-pending-action.pending-action-demo"}
:::

观察重点：

```text
idle -> waiting/pending -> committing -> final panel committed -> idle
```

这里的 `waiting` 是 Demo 对本地 gate 的说明，`isPending` 是 React 的独立反馈。两者不能互相替代。

## 七、易错使用提示

:::pitfalls
### 错误一：把 startTransition 当延迟执行器

**触发条件：** 看到“后台更新”就认为 Action 会在空闲时刻才调用。

**原因：** 非阻塞描述的是 Transition render 的调度优先级，不是 JavaScript Action 的调用时间。

**后果：** 把必须立即记录的同步逻辑放进错误的 timer 或 Promise，改变交互语义。

**错误示例：**

```tsx
startTransition(() => setTimeout(() => setPanel('history'), 0))
```

**正确写法：**

```tsx
startTransition(() => setPanel('history'))
```

**验证方式：** 在 Action 首行记录调用次数，并确认 timer 回调中的更新没有被误当成同一个同步范围。

### 错误二：把 standalone 返回值当 Promise 或 pending

**触发条件：** 对 `startTransition(...)` 使用 `await`，或把返回值写入 `isLoading`。

**原因：** standalone API 的返回类型是 `void`，没有完成 Promise 和 pending 查询。

**后果：** 页面提前显示完成，或者以为自己观察到了 React 的 Transition 状态。

**错误示例：**

```tsx
const pending = await startTransition(() => setPanel('history'))
```

**正确写法：**

```tsx
const [isPending, startTransition] = useTransition()
startTransition(() => setPanel('history'))
```

**验证方式：** 直接检查 standalone 调用的返回值类型为 `void`，pending 文案只出现在 `useTransition` 组件中。

### 错误三：反向解构 useTransition 返回值

**触发条件：** 把启动函数写在第一个位置。

**原因：** Hook 返回顺序固定为 boolean 在前、函数在后。

**后果：** 把 boolean 当函数调用，或把函数当成渲染状态。

**错误示例：**

```tsx
const [startTransition, isPending] = useTransition()
```

**正确写法：**

```tsx
const [isPending, startTransition] = useTransition()
```

**验证方式：** 让按钮调用第二个变量、让状态文案读取第一个变量，并在运行时完成一次同步 Action。

### 错误四：把受控输入 setter 放进 Transition

**触发条件：** 为了降低工作优先级，把 `input` 的 `value` setter 包进 `startTransition`。

**原因：** Transition 不适合控制受控文本输入，输入反馈必须按事件即时同步。

**后果：** 输入回显延迟、光标体验不稳定，用户无法区分输入 State 和结果 State。

**错误示例：**

```tsx
startTransition(() => setQuery(event.target.value))
```

**正确写法：**

```tsx
setQuery(event.target.value)
startTransition(() => setFilteredQuery(event.target.value))
```

**验证方式：** pending 期间连续输入，确认 `value` 每个键击都更新；结果 State 可以稍后提交。

### 错误五：await 后直接更新最终 State

**触发条件：** 以为 async Action 内所有 setter 都自动继承第一次 Transition。

**原因：** 当前 React 不会跨过 `await` 自动保留 State 更新的 Transition 标记。

**后果：** 最终 setter 变成普通更新，pending 和更新优先级的理解不一致。

**错误示例：**

```tsx
startTransition(async () => {
  const panel = await loadPanel()
  setPanel(panel)
})
```

**正确写法：**

```tsx
startTransition(async () => {
  const panel = await loadPanel()
  startTransition(() => setPanel(panel))
})
```

**验证方式：** 在 `await` 前后分别检查 setter 所在的 Action，确认最终 setter 被新的 `startTransition` 包裹。

### 错误六：手工复制 isPending

**触发条件：** 在 Action 前后调用 `setIsPending(true/false)`。

**原因：** 手工 boolean 只知道函数调用，不知道最终 Transition render 何时提交。

**后果：** loading 可能在旧内容仍显示时提前消失，或在 React 已经完成后继续显示。

**错误示例：**

```tsx
setIsPending(true)
runAction()
setIsPending(false)
```

**正确写法：**

```tsx
const [isPending, startTransition] = useTransition()
startTransition(runAction)
```

**验证方式：** 对照 gate 未兑现、兑现后和最终 DOM 提交后三个时点，确认手工 boolean 没有参与 pending 文案。

### 错误七：把 isPending 当队列或业务提交状态

**触发条件：** 根据一个 boolean 推断具体 Action、最后完成者或后端是否已保存。

**原因：** `isPending` 是相关 React 工作的聚合反馈，多个 Transition 可能合并，异步 Action 也可能乱序。

**后果：** UI 错误承诺 FIFO、最后一次点击必胜或事务成功。

**错误示例：**

```tsx
const lastRequestSucceeded = !isPending
```

**正确写法：**

```tsx
const hasPendingReactWork = isPending
```

**验证方式：** 只启动一个异步 Action，并把 `isPending` 解释为 React 工作是否仍在进行，不显示请求身份或队列位置。

### 错误八：把 timer 或网络请求当作 Transition 自带能力

**触发条件：** 用固定延时制造 loading，或说 Transition 会取消和跟踪网络请求。

**原因：** timer、请求、缓存和取消是外部异步协议；Transition 只标记 React State 更新。

**后果：** Demo 受环境影响并混入竞态、重试和网络失败语义。

**错误示例：**

```tsx
startTransition(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  setPanel('review')
})
```

**正确写法：**

```tsx
startTransition(async () => {
  const panel = await localGate.promise
  startTransition(() => setPanel(panel))
})
```

**验证方式：** 删除 timer 和网络依赖，使用本地 gate 控制等待窗口，并在 await 后显式重新包裹 setter。

### 错误九：把 Action 错误等同于任意异常都能被边界捕获

**触发条件：** 认为 Error Boundary 会自动捕获事件处理器、timer 或裸 Promise rejection。

**原因：** 边界捕获的是 React 渲染路径中的错误；外部回调需要自己的错误处理。

**后果：** 失败路径没有真正的 fallback，错误变成未处理异常。

**错误示例：**

```tsx
button.onclick = () => {
  throw new Error('事件错误')
}
```

**正确写法：**

```tsx
startTransition(() => setPanel('review'))
// 由包住 PanelEditor 的 Error Boundary 处理渲染路径错误
```

**验证方式：** 分别触发渲染路径错误和事件回调错误，确认只有前者由包住组件的 Error Boundary 显示 fallback。

### 错误十：用固定 render 次数证明 Transition 被打断

**触发条件：** 把“必须发生一次丢弃”或固定尝试次数写成验收条件。

**原因：** 是否能观察到打断取决于负载、设备和输入到达时间，公开合同只保证更紧急更新可以优先处理。

**后果：** 轻量设备上看不到丢弃时误判 API 失效，或用人为延时污染 Demo。

**错误示例：**

```tsx
expect(renderAttempts).toBe(2)
```

**正确写法：**

```tsx
expect(input.value).toBe(latestQuery)
expect(panel.textContent).toContain(latestQuery)
```

**验证方式：** 只断言输入值和最终面板使用最新 State，不断言固定 render 尝试次数或必然出现一次丢弃。
:::

## 八、源码推导与适用场景

### 1. 公共签名确定的事实

React 的公开类型可以概括为以下签名：

```ts
type TransitionAction = () => void | Promise<void>

declare function startTransition(action: TransitionAction): void

declare function useTransition(): [
  isPending: boolean,
  startTransition: (action: TransitionAction) => void,
]
```

两种 start 函数都接收同步或异步 Action，并且自身返回 `void`。只有 `useTransition` 额外返回 React 管理的
pending boolean。公开文档进一步规定 Action 会立即执行、同步安排的 State 更新被标记为 Transition，
以及当前 `await` 后的 setter 需要再次包裹。类型签名没有承诺固定延迟、render 次数、请求取消或执行顺序。

### 2. 从合同推导选择方式

调用位置已经持有 setter、但不需要渲染 pending 反馈时，可以使用 standalone `startTransition`。组件需要
根据同一 Transition 显示 pending 文案或禁用重复启动控件时，使用 `useTransition`。无论选择哪种形态，
受控输入和其他紧急反馈都保持普通更新，只把允许在后台准备的结果 State 放入 Action。

异步 Action 需要同时处理两个边界：外层 Promise 延长 pending，`await` 后的新 `startTransition` 标记最终
setter。与 Suspense 配合时，已显示内容保护和新嵌套边界 fallback 分别由边界位置决定，`isPending` 只
提供 Transition 仍在处理的反馈。

### 3. 适用边界

Transition 适合较重的本地面板、列表、标签页或会触发 Suspense 的内容刷新，前提是旧内容暂时保留仍然
正确。它不适合控制文本输入，也不负责防抖、节流、缓存、请求取消、FIFO、last-write-wins 或业务提交
成功。涉及并发异步结果时，应用仍需用明确的请求身份和状态模型保证业务顺序。

## 九、练习

:::exercise
### 练习一：区分 Action 调用和最终提交

**要求：** 在 standalone Demo 中记录按钮点击后的 Action 调用次数、后台视图文字和提交历史。说明为什么调用次数
增加不能证明 DOM 已经提交，也说明 standalone API 为什么没有 pending 文案。

**验收：** 能分别指出 Action 立即执行、Transition render 和 commit 的观察位置；输入框在切换视图时仍能
逐字回显。
:::

:::exercise
### 练习二：观察异步 pending

**要求：** 在 pending Action Demo 中重建实验，启动异步复核，保持 gate 未继续，连续点击两次“标记现场”，再继续
Action。记录 pending、当前面板、普通标记次数和提交历史的变化。

**验收：** gate 未兑现时旧面板保持可见、普通标记次数为 2；继续后复核面板进入提交历史，DOM 提交后
pending 回到 idle，并能解释 await 后第二个 `startTransition` 的职责。
:::

:::exercise
### 练习三：设计输入与结果 State

**要求：** 给一个受控搜索框增加昂贵的本地结果视图。写出输入 State 和结果 State 的分工，指出哪一个 setter 放在
普通事件更新中，哪一个 setter 可以放进 Transition；不要加入防抖、网络请求或固定延时。

**验收：** 输入值始终由普通 State 控制，结果视图允许后台更新；能说明 Transition 不是请求取消器或
队列。
:::

## 十、本节小结

- standalone `startTransition` 在 Hook 外立即执行 Action，标记同步 State 更新，返回 `void`，没有 pending 信号。
- `useTransition()` 在组件顶层返回 `[isPending, startTransition]`；同步 Action 很快时不保证 pending 可见。
- async Action 返回的 Promise 会延长 pending；`await` 后的最终 setter 需要再次包进 `startTransition`。
- pending 期间可以保留旧面板，让边界外普通 State 继续响应；受控文本输入不应由 Transition 控制。
- Transition 刷新已显示的 Suspense 内容时会尽量保留旧内容，新边界和初次加载仍可显示 fallback。
- `isPending` 不能被解释为请求身份、FIFO 队列、业务事务结果或固定 render 次数。

## 十一、参考资料

- [startTransition](https://react.dev/reference/react/startTransition) - standalone 调用、Action、非阻塞更新、输入限制和异步边界。
- [useTransition](https://react.dev/reference/react/useTransition) - Hook 返回值、pending 生命周期、async Action、await 后重包和顺序限制。
- [Suspense：防止已显示内容被隐藏](https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding) - Transition 刷新、已显示内容保护和嵌套边界行为。
- [Component Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) - Action 错误和边界范围。
