---
id: react.core.learn.advanced.error-boundary-render-failures
type: lesson
title: Error Boundary
summary: 用局部错误边界替换崩溃的后代子树，并在解除失败原因后显式重建恢复。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - react.core.learn.advanced.lab-render-performance
related:
  - react.core.learn.basics.react-root-lifecycle
  - react.core.learn.intermediate.state-preservation-and-reset
tags:
  - React
  - Error Boundary
  - 渲染错误
  - fallback
  - 恢复
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能解释 Error Boundary 捕获后代 React 渲染与生命周期失败，而不是任意 JavaScript 异常。
  - 能用最小 class 实现区分 fallback State 与错误报告副作用。
  - 能选择局部边界，使崩溃子树被替换而相邻功能继续存在。
  - 能说明边界不捕获自身错误，并判断错误如何交给更高层边界。
  - 能在解除失败原因后改变 boundary key，显式重建边界与后代。
recap:
  - Error Boundary 用 fallback 替换崩溃的后代子树，边界之外的界面可以继续工作。
  - getDerivedStateFromError 纯粹派生 fallback State，componentDidCatch 承担可选报告副作用。
  - 边界捕获后代而不捕获自身；自身或 fallback 失败会继续交给更高层边界。
  - 事件处理器、普通异步回调与 SSR 不在常规捕获范围内。
  - fallback 不会自动消失；恢复要先解除失败原因，再重置状态或重建边界身份。
sources:
  - title: Component - Error Boundary
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Error Boundary 的最小实现、捕获范围、fallback 与函数组件边界
  - title: static getDerivedStateFromError
    url: https://react.dev/reference/react/Component#static-getderivedstatefromerror
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - fallback State 派生与纯函数要求
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 改变 key 会重建组件及后代 State
  - title: createRoot error options
    url: https://react.dev/reference/react-dom/client/createRoot#parameters
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - caught、uncaught 与 recoverable 根级报告入口的分工
  - title: React 19.2.8 ReactFiberThrow Source
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberThrow.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 最近 class boundary 查找、捕获更新与无边界根失败的实现佐证
---

# Error Boundary

## 一、学习目标

- 说明 Error Boundary 能接管哪些 React 子树失败，以及哪些普通 JavaScript 错误不会被它捕获。
- 用一个最小 class 边界显示 fallback，同时让业务组件继续使用函数组件。
- 把纯粹的 fallback State 与错误报告副作用分开放置。
- 选择局部边界粒度，使崩溃区域被替换，而控制区与相邻功能继续存在。
- 在失败原因已经解除后，通过改变 `key` 重建边界与后代并恢复初始状态。

## 二、为什么需要

一个组件在 render 中抛错时，React 无法继续信任那棵失败子树。没有局部边界，失败会一路到达 Root，
该 React Root 的界面可能被移除。一个报告面板的错误不应该让整页导航、恢复按钮和相邻功能一起
消失。

Error Boundary 把失败限制在明确的 React 子树内：后代正常时显示原内容；后代渲染失败时，边界保存
失败状态并改为显示 fallback。边界外的界面仍然存在，用户才有机会理解问题、继续使用其他区域，或
执行一次明确的恢复动作。

它不是全局异常捕获器。边界只处理 React 仍能关联到组件树的后代失败，不能替代事件、异步任务、
服务端渲染或日志平台各自的错误处理。

## 三、核心概念

### 1. 最小边界仍然是 class 组件

React 19.2 目前没有函数组件版的 `getDerivedStateFromError` 或 `componentDidCatch`。原生 Error Boundary
仍需要一个职责单一的 class，其他业务组件可以继续使用函数组件：

```tsx
import { Component } from 'react'
import type { ReactNode } from 'react'

type BoundaryProps = Readonly<{
  children: ReactNode
  fallback: ReactNode
}>

type BoundaryState = Readonly<{
  hasError: boolean
}>

/** 隔离后代渲染失败，并显示调用方提供的回退内容。 */
class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  /** 把后代错误纯粹转换为当前边界的回退状态。 */
  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  /** 根据捕获状态显示回退内容或继续渲染后代。 */
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
```

这个 class 只承担失败边界，不扩展为普通 class State、生命周期或迁移教程。函数组件与 class 组件都
可以成为抛错的后代；只有承担原生边界职责的组件必须使用 class。

### 2. fallback State 与报告副作用分开

`static getDerivedStateFromError(error)` 处在派生 State 的 render 路径，只应返回新的边界 State。它
必须保持纯粹，不能发送请求、修改外部变量或写日志。

需要报告错误时使用 `componentDidCatch(error, errorInfo)`：

```tsx
/** 在回退界面提交后，把错误与组件栈交给报告入口。 */
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  reportError(error, errorInfo.componentStack)
}
```

`errorInfo.componentStack` 提供组件栈。实际错误上报还涉及隐私、采样和去重，不影响这里的职责分工。
旧式只实现 `componentDidCatch`，再在其中 `setState` 显示 fallback 的写法已经不推荐；显示失败界面
应由 `getDerivedStateFromError` 建立的 State 决定。

### 3. 边界只捕获后代

React 从失败组件的祖先路径向上寻找最近可处理错误的边界。因此：

- 边界内的后代 render 失败，可以由这个边界接管。
- 边界自己的 render、错误生命周期或 fallback 再次失败，不能由自己接管。
- 内层边界无法处理自己的失败时，错误继续交给更高层边界。
- 没有任何边界时，错误到达 Root，属于未捕获失败。

这也是 fallback 必须简单可靠的原因。边界不是一面能无限捕获自己的墙；有独立恢复价值的更大功能
区域，可以再设置一层更高边界。

### 4. fallback 不会自动恢复

最小边界一旦把 `hasError` 设为 `true`，就会持续显示 fallback。即使外部已经把失败 Props 改回安全值，
同一个边界实例的错误 State 也不会自动消失。

一种明确的恢复策略是先解除失败原因，再改变边界 `key`：

```tsx
/** 解除失败条件，并重建目标边界与它的后代。 */
function recoverPanel() {
  setShouldCrash(false)
  setBoundaryVersion((version) => version + 1)
}

<ErrorBoundary key={boundaryVersion} fallback={<Fallback onRecover={recoverPanel} />}>
  <ReportPanel shouldCrash={shouldCrash} />
</ErrorBoundary>
```

不同 `key` 让 React 销毁旧边界和后代，再创建新实例。新边界回到未捕获状态，后代自己的局部 State 也
从头开始。真实应用要判断哪些草稿或外部资源应该保留；恢复顺序始终是“解除原因，再显式重建”。

## 四、用法与示例

### 1. 让事件更新失败条件，由 render 抛错

事件处理器不是 Error Boundary 的常规捕获范围。要观察渲染失败，按钮只更新 State，真正的错误发生在
后代下一次 render：

```tsx
/** 根据当前失败条件渲染报告。 */
function ReportPanel({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error('报告面板渲染失败')
  }

  return <article>季度报告</article>
}

<button type="button" onClick={() => setShouldCrash(true)}>
  触发渲染失败
</button>
```

如果直接在 `onClick` 中 `throw`，错误发生在已提交 UI 的事件回调里，不会因为按钮外面有 Error
Boundary 就自动变成 fallback。

### 2. 按可恢复功能区域设置粒度

边界放得太高，一个小面板失败会替换整页内容；放得过细，又会产生大量重复外壳。实用判断是：把仍能
独立理解、独立恢复的功能区域包成一棵子树，并把恢复控制放在该边界之外或稳定的 fallback 中。

示例的控制区、相邻状态和捕获记录都在目标边界之外。报告面板失败后，用户仍能看到“相邻功能
保持可用”，并点击局部恢复按钮。更高层 guard 只用来证明目标边界自己的 fallback 失败时会继续向上
传播。

### 3. 区分边界与 Root 报告入口

React 19 的 Root 提供三类错误回调：

- `onCaughtError`：错误已经被 Error Boundary 捕获。
- `onUncaughtError`：没有边界接管，错误到达 Root。
- `onRecoverableError`：React 自己从另一类错误中恢复。

它们负责宿主报告策略，不生成 fallback，也不重置边界。局部 fallback 是否出现，由 Error Boundary
的 State 决定；Root 回调只观察对应层级。

## 五、用法示例或 Demo

冷挂载时先修改一次局部草稿，观察局部 State 增长。点击“触发渲染失败”后，报告面板应被局部
fallback 替换，而相邻状态、控制区和整个页面继续存在。捕获记录增加一次，宿主失败提示不得
出现。

点击“重新加载局部面板”，恢复动作会先解除失败条件，再让目标边界版本递增。新边界重新显示报告，
局部草稿版本回到 `0`。再点击“验证向上层传播”，目标边界的 fallback 会故意失败，更高层 guard
接管整个实验；点击“重建整个实验”即可回到冷状态。

:::demo{id="react.core.learn.advanced.error-boundary-render-failures.local-fallback-recovery-demo"}
:::

## 六、易错使用提示

::::pitfalls
### 错误一：在事件处理器中直接 throw

**触发条件：** 在按钮 `onClick` 中直接抛错，期待外层 Error Boundary 显示 fallback。

**原因：** 事件处理器发生在 UI 提交之后，不属于常规 render 或生命周期捕获路径。

**后果：** 局部 fallback 不出现，错误可能进入事件或全局报告路径，并被误诊为边界失效。

**错误示例：**

```tsx
<button onClick={() => { throw new Error('保存失败') }}>保存</button>
```

**正确写法：**

```tsx
<button onClick={() => setShouldCrash(true)}>触发渲染失败</button>
<ReportPanel shouldCrash={shouldCrash} />
```

**验证方式：** 点击处理器正常返回，后代下一次 render 抛错，随后局部 fallback 出现。

### 错误二：用父组件 try/catch 包住 JSX

**触发条件：** 在父组件 render 中用 `try/catch` 包住 `<Child />`，期待捕获子组件 render 错误。

**原因：** JSX 只创建 React element；React 稍后调用 `Child`，不在父组件这个 JavaScript 调用栈里。

**后果：** 父级 catch 接不到错误，失败继续向 Root 传播。

**错误示例：**

```tsx
try {
  return <ReportPanel />
} catch {
  return <p>报告失败</p>
}
```

**正确写法：**

```tsx
return (
  <ErrorBoundary fallback={<p>报告失败</p>}>
    <ReportPanel />
  </ErrorBoundary>
)
```

**验证方式：** 让 `ReportPanel` 在 render 抛错；只有 Error Boundary 路径显示 fallback。

### 错误三：在 getDerivedStateFromError 中执行副作用

**触发条件：** 在静态方法中发送日志、请求网络或修改组件外变量。

**原因：** 该方法属于派生 State 的 render 路径，必须保持纯粹。

**后果：** 重试或开发检查可能重复执行副作用，渲染结果不再可预测。

**错误示例：**

```tsx
static getDerivedStateFromError(error: Error) {
  sendError(error)
  return { hasError: true }
}
```

**正确写法：**

```tsx
static getDerivedStateFromError() {
  return { hasError: true }
}
```

**验证方式：** 检查静态方法只返回新 State；报告调用只出现在 `componentDidCatch` 或 Root 报告层。

### 错误四：只实现 componentDidCatch 却没有 fallback State

**触发条件：** class 只记录错误，没有用 `getDerivedStateFromError` 建立错误状态。

**原因：** 报告错误和渲染 fallback 是两个职责；在 catch 中 `setState` 的旧式恢复写法已不推荐。

**后果：** 错误可能被记录，却没有稳定的用户界面替代崩溃子树。

**错误示例：**

```tsx
componentDidCatch(error: Error) {
  reportError(error)
}
```

**正确写法：**

```tsx
static getDerivedStateFromError() {
  return { hasError: true }
}

componentDidCatch(error: Error, info: ErrorInfo) {
  reportError(error, info.componentStack)
}
```

**验证方式：** render 失败后同时看到 fallback DOM，且没有缺失错误恢复 State 的开发警告。

### 错误五：认为边界可以捕获自己

**触发条件：** 目标边界自己的 fallback 抛错，却期待同一边界显示第二层 fallback。

**原因：** React 从失败节点的祖先路径寻找边界，不让当前失败边界接管自己。

**后果：** 没有更高层边界时，错误继续到达 Root；有更高层边界时，由上层接管。

**错误示例：**

```tsx
<ErrorBoundary fallback={<BrokenFallback />}>
  <ReportPanel />
</ErrorBoundary>
```

**正确写法：**

```tsx
<ErrorBoundary fallback={<PageFallback />}>
  <ErrorBoundary fallback={<LocalFallback />}>
    <ReportPanel />
  </ErrorBoundary>
</ErrorBoundary>
```

**验证方式：** 让内层 fallback 失败；内层不能自捕获，更高层 fallback 应出现。

### 错误六：认为修好 Props 后 fallback 会自动消失

**触发条件：** 只把失败条件改回安全值，不重置已经捕获错误的边界 State。

**原因：** 同一个边界实例仍保存 `hasError: true`，没有内建自动 reset 协议。

**后果：** 后代已经安全，界面仍停留在 fallback。

**错误示例：**

```tsx
setShouldCrash(false)
```

**正确写法：**

```tsx
setShouldCrash(false)
setBoundaryVersion((version) => version + 1)
```

**验证方式：** 恢复后边界版本增长，安全后代重新出现，局部 State 从初始值开始。

### 错误七：未解除失败原因就反复改变 key

**触发条件：** 恢复按钮只递增 key，却保留 `shouldCrash: true`。

**原因：** 新边界虽然重置了 State，新后代第一次 render 仍会立即抛错。

**后果：** fallback 循环出现，看起来像 key 重建没有生效。

**错误示例：**

```tsx
setBoundaryVersion((version) => version + 1)
```

**正确写法：**

```tsx
setShouldCrash(false)
setBoundaryVersion((version) => version + 1)
```

**验证方式：** 一次恢复只增加一次版本，面板安全渲染，没有立刻出现第二次 fallback。

### 错误八：把普通异步错误都交给 Error Boundary

**触发条件：** 在 timer、动画帧或裸 Promise callback 中抛错，期待当前边界捕获。

**原因：** 普通异步回调已经离开 Error Boundary 的常规 React 执行路径。

**后果：** 出现未处理异常或 rejection，局部 fallback 没有接管。

**错误示例：**

```tsx
setTimeout(() => {
  throw new Error('后台任务失败')
}, 100)
```

**正确写法：**

```tsx
runTask().catch((error) => {
  setTaskError(toMessage(error))
})
```

**验证方式：** 在异步边界显式处理 rejection 并显示错误 State；不要用 Error Boundary fallback
断言普通异步捕获。

### 错误九：把 onCaughtError 当成 Root 已失败

**触发条件：** caught、uncaught 和 recoverable 三类 Root 回调都切换同一个全局失败界面。

**原因：** caught 表示某个 Error Boundary 已经接管，不表示整个 Root 失效。

**后果：** 局部 fallback 与宿主失败同时出现，错误粒度被放大。

**错误示例：**

```tsx
createRoot(container, {
  onCaughtError: showRootFailure,
  onUncaughtError: showRootFailure,
})
```

**正确写法：**

```tsx
createRoot(container, {
  onCaughtError: reportCaughtError,
  onUncaughtError: showRootFailure,
})
```

**验证方式：** 后代错误被边界捕获时只显示局部 fallback；没有边界时才显示 Root 失败状态。
::::

## 七、源码推导与适用场景

1. React 19.2 官方文档规定：Error Boundary 用 fallback 替换崩溃后代；`getDerivedStateFromError`
   负责 fallback State，`componentDidCatch` 负责可选报告。
2. React 19.2.8 固定源码从失败组件的父路径向上寻找最近带错误生命周期的 class boundary；找不到时
   安排 Root 失败更新。Fiber 标记与内部更新队列不是应用层公共 API。
3. 边界适合围住能够独立理解和恢复的功能区域。它隔离 React 子树失败，不提供 worker、事务或进程
   级隔离。
4. 事件处理器、服务端渲染、普通 timer、动画帧与 Promise callback 不在常规捕获范围。React 管理的
   Transition Action 与 `use(promise)` rejection 有各自合同，需要分别按对应 API 处理。
5. `key` 恢复会重建边界及全部后代 State。先解除失败原因，再选择是否丢弃这棵子树的本地状态；
   Error Boundary 本身没有通用的 `resetErrorBoundary` API。

## 八、练习

:::exercise
### 判断捕获范围与最近边界

**要求：** 面对“后代 render 抛错”“后代 `componentDidMount` 抛错”“目标边界自己的 fallback
抛错”“按钮事件处理器直接抛错”“`setTimeout` 回调抛错”和“服务端渲染抛错”六种情况，逐项判断
当前边界能否接管。对能接管的情况指出最近祖先边界；对不能接管的情况指出应由事件、异步任务、
服务端或更高层边界中的哪一层处理。

**验收：** 不把“组件附近发生的错误”当成统一类别；能用“React 后代渲染或生命周期路径”和“边界
自身不自捕获”解释每个结论。
:::

:::exercise
### 设计边界粒度

**要求：** 一个页面包含永久导航、筛选条件、报告图表、评论编辑器和保存按钮。图表与评论可以独立
理解、独立重试，筛选条件需要在图表恢复后保留。画出组件树并选择 Error Boundary 的位置，说明每个
fallback 替换哪棵子树、哪些控制必须留在边界外，以及为什么不应只在页面最外层放一个边界。

**验收：** 单个功能失败不会移除永久导航或无关功能；恢复入口仍可点击；边界数量由独立恢复单元决定，
而不是给每个叶子组件机械增加一层。
:::

:::exercise
### 编写可恢复的最小边界

**要求：** 为一个函数组件报告面板补上类型完整的 class Error Boundary。使用
`getDerivedStateFromError` 进入 fallback State，使用 `componentDidCatch` 接收 `Error` 与
`ErrorInfo`，禁止在派生 State 方法中执行副作用。实现“先解除失败条件，再递增 boundary key”的恢复
动作，并预测恢复前后边界 State 与后代局部 State 的变化。

**验收：** fallback 显示职责与报告职责分离；恢复顺序不会让新后代立即再次抛错；能够说明改变 key
会同时重建边界和全部后代，而不会重置边界外 State。
:::

:::exercise
### 分类 Root 错误回调

**要求：** 分别分析三条记录：错误已显示局部 fallback、错误没有任何边界而到达 Root、React 已自行
恢复某类错误。把它们对应到 `onCaughtError`、`onUncaughtError`、`onRecoverableError`，并说明每个
回调是否负责生成 fallback、重置边界或改变组件 State。

**验收：** 三类回调不混用；能说明局部错误被报告不等于 Root 已失败，也不会把报告入口当作恢复 API。
:::

:::exercise
### 验证局部隔离、向上传播与显式恢复

**要求：** 冷挂载后把局部草稿版本改为 `1`，再触发报告面板渲染失败。确认目标 fallback 出现，边界外
相邻状态仍为“保持可用”，捕获次数增加且宿主失败提示不存在。点击局部恢复，确认边界版本增加，报告
重新出现且草稿版本回到 `0`。最后触发 fallback 失败，说明为什么由更高层 guard 接管，再重建整个实验。

**验收：** 能指出实际 throw 发生在后代 render；能区分目标边界与更高层边界；恢复顺序先解除原因再
改变 key；重建后的局部 State 符合新组件身份；没有把事件或普通异步错误误称为已捕获。
:::

## 九、本节小结

- Error Boundary 捕获后代在 React 渲染和生命周期路径中的失败，用 fallback 替换崩溃子树。
- 原生边界目前仍需要最小 class；业务组件可以继续使用函数组件。
- `getDerivedStateFromError` 纯粹派生 fallback State，报告副作用进入 `componentDidCatch`。
- 边界不捕获自己；自己的 fallback 失败时，只能继续交给更高层边界。
- 事件、普通异步回调和 SSR 不是常规捕获范围，不能用一个边界替代所有错误处理。
- fallback 不会自动恢复；先解除失败原因，再重置状态或改变 `key` 重建边界与后代。
- Root 错误回调负责分类报告，不生成局部 fallback，也不是恢复 API。

## 十、参考资料

- [`Component`：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) - 最小实现、捕获范围、fallback 与函数组件边界，适用于 React 19.2。
- [`getDerivedStateFromError`](https://react.dev/reference/react/Component#static-getderivedstatefromerror) - 纯粹派生 fallback State 与副作用分工。
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key) - 改变 key 重建组件与后代 State。
- [`createRoot` 参数](https://react.dev/reference/react-dom/client/createRoot#parameters) - caught、uncaught 与 recoverable Root 报告入口。
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#errors-in-render-are-not-re-thrown) - React 19 的 render 错误默认报告变化。
- [React 19.2.8 `ReactFiberThrow.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberThrow.js) - 最近边界查找、捕获更新和 Root 失败的固定版本实现佐证。
