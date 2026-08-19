# Error Boundary 与渲染失败隔离研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.error-boundary-render-failures`
- 标题：Error Boundary
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.lab-render-performance`
- 核验日期：`2026-08-17`
- 研究状态：已核验官方事实、版本边界、宿主报告分层、恢复语义和同源 Demo 合同
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本课只回答一条主线：怎样用最小 class Error Boundary 把后代在 React 渲染和生命周期路径中的失败
限制在明确子树内，显示局部 fallback，并在失败原因已解除后通过改变 boundary 身份显式重建子树。

必须覆盖：

1. Error Boundary 捕获 React 组件树中后代的失败，而不是任意 JavaScript 异常。
2. `static getDerivedStateFromError` 纯粹派生 fallback 状态；`componentDidCatch` 承担可选的错误报告
   副作用和组件栈读取，不能继续用后者更新 fallback 作为推荐写法。
3. fallback 替换的是 boundary 内崩溃的子树；boundary 外的页面和相邻区域继续存在。
4. 最近可处理该错误的祖先 boundary 接管失败；boundary 自身或自己的 fallback render 再抛错时，
   只能继续交给更高层 boundary。
5. fallback 状态不会因为原后代“现在可能安全”而自动清空；恢复必须先解除失败条件，再清除
   boundary 状态或重建 boundary。本课固定用递增 `key` 建立可见、确定的显式恢复。
6. Error Boundary 不捕获事件处理器、SSR、普通 timer / RAF / Promise 回调中的错误，也不捕获自身
   错误；React 19.2 对 `useTransition` 返回的 `startTransition` Action 有窄例外，但本课不展开。
7. React 官方当前仍没有函数组件版 `getDerivedStateFromError` / `componentDidCatch`；允许一个最小
   class boundary 作为本课唯一 legacy 例外，其他业务组件继续使用函数组件。
8. React 19 的 `onCaughtError`、`onUncaughtError`、`onRecoverableError` 是 root 级报告入口，不负责
   生成 fallback，也不是 boundary 或 reset API。
9. 教学宿主必须把 `onCaughtError` 与未捕获错误分开处理：已捕获错误保留在局部 fallback 内，
   未捕获和可恢复错误继续进入宿主兜底。
10. Demo 只使用本地确定性 State 和同步 render throw，不使用网络、timer、随机数、第三方 boundary
    包、Suspense、Transition 或服务端渲染。

明确排除：完整 class 组件教程、日志平台、`captureOwnerStack`、第三方 `react-error-boundary`、事件错误
处理教程、任意异步错误统一捕获、Suspense、`lazy`、`use(promise)`、Transition、SSR / streaming / RSC、
路由级错误页面和全局 `window.onerror` 教程。

## 调研与证据边界

1. 按仓库外部搜索顺位先调用 Tavily。三组限定 `react.dev` / `github.com/facebook/react` 的
   `tavily_search` 均返回套餐用量上限，无法取得候选。
2. 按顺位接替 Exa，成功发现并读取 React `Component`、`createRoot`、State 重置、`useTransition`
   官方页面和固定 React 源码/测试入口。Exa 已得到可靠官方结果，因此未继续 Parallel、Perplexity
   或 `codex --search`。
3. Exa 只承担 URL 发现和正文提取。最终事实回到 `react.dev`、固定 `reactjs/react.dev` 提交、
   `facebook/react@v19.2.8` 源码/测试、npm 发布元数据、当前锁文件和已安装包核验；搜索摘要、Issue、
   PR 评论、legacy 文档和第三方文章均不承担课程事实证明。
4. `raw.githubusercontent.com` 在首轮批量请求中超时，GitHub tag API 也一度因匿名限流返回 `403`；
   后续针对固定 URL 的请求成功返回官方 Markdown、源码和测试。工具失败只影响读取路径，不改变来源
   层级。
5. npm registry 确认 `react@19.2.8` 与 `react-dom@19.2.8` 的 `gitHead` 都是
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`；当前 `package.json`、`package-lock.json` 和
   `node_modules` 也都安装同一版本。
6. GitHub commit API 确认固定 react.dev 提交 `c7d6b700...` 存在且签名有效。浮动官网用于当前
   `19.2` 公共语义，固定提交用于防止后续滚动更新无记录地改变课程事实。
7. 本研究稿只约束 Error Boundary 的渲染失败隔离、局部 fallback、显式恢复和 Root 报告分层，
   不扩展相邻知识点。

## 官方来源卡

| 编号 | 一手来源 | 版本固定 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [`Component`：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | React 文档 `19.2` | 默认渲染失败、局部 fallback、最小实现、粒度、未捕获范围和函数组件现状。 |
| S2 | [固定 `Component` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Component.md#L205-L231) | 文档提交 `c7d6b700...` | `componentDidCatch` 参数、组件栈、开发/生产报告差异和函数组件无直接等价 API。 |
| S3 | [固定 Error Boundary 章节](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Component.md#L1270-L1342) | 文档提交 `c7d6b700...` | 事件、SSR、自身、普通异步回调不捕获，`useTransition` 的窄例外，以及推荐实现。 |
| S4 | [`getDerivedStateFromError`](https://react.dev/reference/react/Component#static-getderivedstatefromerror) | React 文档 `19.2` | 返回 fallback 状态、保持纯函数，副作用应进入 `componentDidCatch`。 |
| S5 | [`createRoot` 参数](https://react.dev/reference/react-dom/client/createRoot#parameters) | React DOM 文档 `19.2` | 三类 root 错误回调的层级：caught、uncaught、recoverable。 |
| S6 | [`createRoot` 错误报告](https://react.dev/reference/react-dom/client/createRoot#error-logging-in-production) | React DOM 文档 `19.2` | 默认向 console 报告；传入自定义回调实现自己的报告；开发期应保留默认处理或自行实现 overlay。 |
| S7 | [固定 `createRoot` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/client/createRoot.md#L356-L426) | 文档提交 `c7d6b700...` | 固定三类回调示例与“开发期默认处理或自有 overlay”边界。 |
| S8 | [React 19 Upgrade Guide：render errors](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#errors-in-render-are-not-re-thrown) | React 19 | 已捕获错误默认交给 `console.error`，未捕获错误默认交给 `window.reportError`；root callbacks 可定制。 |
| S9 | [React 19.2.8 `ReactFiberThrow.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberThrow.js#L91-L199) | React `v19.2.8` | 根失败渲染 `null`；class capture update；派生状态、报告回调和 legacy `componentDidCatch` 边界。 |
| S10 | [React 19.2.8 boundary 查找](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberThrow.js#L639-L681) | React `v19.2.8` | 从失败节点的父路径向上找 HostRoot 或带错误生命周期的 ClassComponent。 |
| S11 | [React 19.2.8 `ReactFiberErrorLogger.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberErrorLogger.js#L27-L183) | React `v19.2.8` | 默认 caught / uncaught 报告差异；捕获后调用 root 的 `onCaughtError` 并提供 component stack。 |
| S12 | [React 19.2.8 `ReactDOMRoot.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/client/ReactDOMRoot.js#L178-L249) | React DOM `v19.2.8` | root 先采用默认 callbacks；options 中任一自定义 callback 直接替换对应默认 callback。 |
| S13 | [React 19.2.8 Error Boundary tests](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactErrorBoundaries-test.internal.js) | React DOM `v19.2.8` | render、constructor、class lifecycle、Effect 捕获，以及 boundary 自身错误向上层传播。 |
| S14 | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key) | React 文档 `19.2` | 不同 key 形成不同身份，旧 State 销毁，新 State 创建。 |
| S15 | [`useState`：key reset](https://react.dev/reference/react/useState#resetting-state-with-a-key) | React 文档 `19.2` | key 变化使组件和全部 children 从头重建。 |
| S16 | [`useTransition` 错误边界](https://react.dev/reference/react/useTransition#displaying-an-error-to-users-with-error-boundary) | React 文档 `19.2` | 传给 Hook 返回的 `startTransition` 的函数抛错时可交给 Error Boundary。 |
| S17 | [React `v19.2.8` release](https://github.com/facebook/react/releases/tag/v19.2.8) | 发布 tag `v19.2.8` | patch 发布身份；本课能力不是 19.2.8 新增功能。 |

## 版本与类型基线

### 1. 文档 minor 与运行时 patch 分层

`react.dev` 当前公开 Reference 是 React `19.2`，并不为 `19.2.8` 建独立文档站。因此课程对公开 API
和概念引用 React 19.2 文档，对 boundary 查找、root callback 替换、Effect 捕获和失败根卸载等实现
细节引用固定的 `v19.2.8` 源码/测试（S1-S13）。

不得把“React 19.2 官方文档”写成“React 19.2.8 文档快照”，也不得用 `main` 或 Canary 行为说明
当前依赖。升级 React minor、patch 或类型包后，必须重新核验未捕获范围、root callback 参数和开发期
默认报告行为。

### 2. 当前公开 TypeScript 形状

本课最小 boundary 需要显式 Props / State 类型：

```tsx
type BoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

type BoundaryState = {
  hasError: boolean
}
```

`@types/react@19.2.18` 把 `componentDidCatch` 建模为 `(error: Error, errorInfo: ErrorInfo) => void`，其中
`ErrorInfo.componentStack` 可缺失或为 `null`。JavaScript 实际允许 `throw` 任意值，React 官方文档也
明确错误值不保证是 `Error`；课程 Demo 固定抛 `Error`，不把 TypeScript 类型误写成运行时保证。

`@types/react-dom@19.2.4` 的 root callbacks 接收 `unknown` error。`onCaughtError` 的 `errorInfo` 还可
包含 boundary 实例，但 React 官方文档只承诺本课需要的 `componentStack`；正文不教授或依赖类型包
额外暴露的 `errorBoundary` 字段。

### 3. class 是最小兼容外壳，不是课程风格倒退

React 官方仍推荐一般组件使用函数，但当前没有函数组件版 `getDerivedStateFromError` 或
`componentDidCatch`（S1-S4）。固定 `v19.2.8` 查找逻辑也只把具有错误生命周期的 `ClassComponent`
识别为 boundary（S10）。

因此本课允许一个职责单一、可复用的 class `ErrorBoundary`；抛错源、控制面板、业务区和 Demo 根仍用
函数组件。不得扩展为 constructor、普通 lifecycle、class State 或 class 迁移教程，也不得声称 class
Error Boundary 已废弃或函数组件已经有等价 Hook。

## 官方事实与课程推导

### 1. Error Boundary 是 React 子树失败边界

默认情况下，应用在 render 中抛错会使 React 从屏幕移除失败 UI。Error Boundary 让应用以 fallback
替换崩溃部分（S1、S3）。固定 React 19.2.8 实现从失败 Fiber 的父路径向上寻找最近 HostRoot 或具备
错误生命周期的 class boundary；找到 boundary 后安排捕获更新并重渲染（S9、S10）。

所以课程所说的“隔离”有两个维度：

- React 树维度：boundary 内崩溃子树换成 fallback。
- 页面维度：boundary 外的标题、控制区、相邻面板和 Vue 学习站宿主继续存在。

它不是进程隔离、worker 隔离、事务回滚或所有 JavaScript 错误的全局捕获。boundary 放得太高会把整块
页面都换成 fallback；放得过细则产生重复外壳。课程只按“用户仍能理解并重试的功能区域”选择一个
边界，不给每个小组件套 boundary。

### 2. 捕获的是后代，不是 boundary 自身

Error Boundary 只接管它下面的组件。实现从失败节点的 `returnFiber` 开始向上查找，而不是让当前失败
boundary 捕获自己（S10）。固定测试也证明：内层 boundary 在 render fallback 时再抛错，错误由外层
boundary 捕获（S13）。

因此以下两种结构语义不同：

```tsx
<ErrorBoundary fallback={<LocalFallback />}>
  <ReportPanel />
</ErrorBoundary>
```

`ReportPanel` 的 render 错误可由这个 boundary 捕获；但 `ErrorBoundary` 自己的 render、
`getDerivedStateFromError`、`componentDidCatch` 或直接写在其 render 路径里的失败不能由自己接管。
若没有更高层 boundary，它最终成为 root 未捕获错误。

### 3. 捕获范围必须按 React 执行路径表述

公开 Error Boundary 章节用“rendering errors”描述主模型。固定 React 19.2.8 测试进一步证明下列由
React 执行的后代路径可被祖先 boundary 捕获（S13）：

- 函数组件或 class 组件的 render。
- 后代 class constructor。
- 后代 class mount、update、unmount 生命周期。
- 后代 `useLayoutEffect` 与 `useEffect` 回调本身同步抛出的错误。

最后一项不等于“任意异步错误都能捕获”。React 调度并执行 Effect 回调时仍保有组件树归属；Effect
内部启动的 timer、RAF、裸 Promise continuation 或外部订阅稍后抛错，已离开该 React 执行路径，不会
因为 Effect 外面有 boundary 就自动被捕获。

本课 Demo 只用函数组件 render 中的同步 throw 建立主反馈环。constructor、生命周期和 Effect 作为
范围说明及临时固定测试，不各自扩张为一套可见场景。

### 4. `getDerivedStateFromError` 决定 fallback

`static getDerivedStateFromError(error)` 在捕获更新的 render 路径中返回新 State；`render` 再根据
`hasError` 返回 fallback（S4、S9）。它必须是纯函数，不能写日志、请求网络、修改外部变量或调用其他
副作用。

课程固定最小语义：

```tsx
class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  /** 把后代渲染失败转换为当前边界的回退状态。 */
  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  /** 根据错误状态显示回退内容或继续渲染后代。 */
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
```

`getDerivedStateFromError` 不需要把 Error 对象存入 UI State。本课只显示稳定的用户可理解文案，避免
把内部错误消息直接暴露给页面或误教生产错误泄漏。

### 5. `componentDidCatch` 是可选报告层

`componentDidCatch(error, info)` 在 commit callback 路径执行，`info.componentStack` 描述抛错组件及
祖先组件（S2、S9）。日志、遥测或通知等副作用属于这里，不属于
`getDerivedStateFromError`。旧写法在 `componentDidCatch` 中 `setState` 来显示 fallback 已被官方标记
为 deprecated；固定实现还会在只实现 `componentDidCatch` 却没有安排恢复更新时给出开发警告（S2、
S9）。

课程为观察捕获次数可实现一个无网络的 `onCatch` Props，并从 `componentDidCatch` 调用它；但不能在
被捕获子树内部更新日志 State，避免制造额外失败循环。若 fallback 本身足以完成验收，最简单实现可以
省略 `componentDidCatch`，正文仍需说明它的职责。

### 6. fallback 是持续状态，不是自动重试

标准最小 boundary 把 `hasError` 从 `false` 改为 `true` 后，会持续返回 fallback。后代失败条件即使在
外部变回安全，boundary 的 State 也不会自动重置。React 核心没有名为 `resetErrorBoundary` 的公共 API；
那类命名通常来自第三方库。

本课固定用 boundary 外的父组件管理两个值：

- `shouldCrash`：当前失败条件。
- `boundaryVersion`：作为 boundary 的 `key`。

“重新加载局部面板”必须先令 `shouldCrash = false`，再递增 `boundaryVersion`。不同 key 让 React 把
boundary 及其全部 children 从头重建，新的 boundary State 回到 `hasError: false`（S14、S15）。只递增
key 而不解除失败条件会让新子树立即再次抛错；只解除失败条件而不重建 boundary 则仍停留在 fallback。

这是一种明确的应用恢复策略，不是 Error Boundary 自带重试协议。真实应用还需要由业务确认缓存、表单
草稿和外部资源是否应一起丢弃，本课只验证局部 Demo State。

### 7. 没有 boundary 时是 root 级失败

固定 React 19.2.8 在找不到 class boundary 时创建 root error update，payload 是 `{ element: null }`，
即为该 React root 渲染 `null`，随后调用 `onUncaughtError`（S9）。这说明未捕获 render 失败和局部
fallback 不是同一状态：前者失去该 root 的 React UI，后者保留 boundary fallback 和其余树。

当前站点每个 React Demo 有独立 root，所以一个 Demo root 未捕获失败不应破坏 Vue 导航或其他页面。
宿主仍需要显示“React Demo 运行失败”并允许重新加载；这属于 `onUncaughtError` 的兜底，而不是课程
Error Boundary 的 fallback。

### 8. 事件处理器不属于 render 失败

官方明确把事件处理器列为不捕获范围（S3）。事件发生时 UI 已经提交，React 仍知道屏幕上应显示什么；
若点击 handler 直接 `throw`，把按钮包在 Error Boundary 中也不会把当前区域切成 fallback。

事件代码应使用普通 JavaScript `try/catch`、把可展示错误写入 State，或把后续 render 需要表达的失败
转换为 State 后在 render 路径抛出。本课不把第二种技巧包装成通用业务错误处理策略，Demo 的按钮只把
`shouldCrash` 设为 `true`，真正的 `throw new Error(...)` 发生在后代组件下一次 render。

### 9. 普通异步、SSR 与 Transition 窄例外

官方不捕获清单还包括 server-side rendering、`setTimeout` / `requestAnimationFrame` 等普通异步回调
和 boundary 自身错误（S3）。裸 Promise rejection 也不能因为组件外面有 boundary 就自动转换成
fallback。

React 19.2 文档同时注明一个窄例外：`useTransition` Hook 返回的 `startTransition` 所执行 Action 抛错
时，包围调用该 Hook 组件的 Error Boundary 可以显示 fallback（S16）。这是 React 管理的 Transition
错误传播合同，不应泛化为“Error Boundary 能捕获异步错误”。本课只写一句版本边界；完整调用位置、
pending、async Action 和更新顺序不在本课展开。

`use(promise)` rejection、Suspense pending 和流式 SSR 的客户端重试拥有各自的公共合同，本课只用
它们划清边界，不提前演示。

### 10. 开发与生产错误报告不能用次数等同

React 官方说明 `componentDidCatch` 在开发与生产的错误冒泡/报告表现有差异（S2）。React 19 又调整了
render 错误报告：已捕获错误默认交给 `console.error`，未捕获错误默认交给 `window.reportError`，避免
旧版本重复抛出/重复记录（S8、S11）。

因此功能验证不应断言默认 console/window 精确次数，也不使用旧式
`expect(() => root.render(...)).toThrow()` 证明 React 19 行为。确定性证据应是：局部 fallback DOM、
相邻 UI 保留、catch 记录、root callback 分类以及恢复后的新子树。console 结果必须结合下一节的宿主
自定义策略解释。

## React 19 root 错误报告层

### 1. 三类 callback 的职责互斥

`createRoot` / `hydrateRoot` 提供三种观测入口（S5-S8）：

| callback | 触发层级 | 本课判断 | 不承担的职责 |
| --- | --- | --- | --- |
| `onCaughtError` | 错误已由某个 Error Boundary 捕获 | 局部 fallback 正常工作时仍会报告 | 不生成 fallback，不表示 root 失败 |
| `onUncaughtError` | 没有 Error Boundary 接管 | React root 级失败 | 不替代局部 boundary |
| `onRecoverableError` | React 自己从某类错误恢复 | React 自动恢复的宿主诊断 | 不是“被 boundary 捕获”的别名 |

三者都提供 error 和含 `componentStack` 的 errorInfo。它们是每个 root 的报告策略，不是 Hook、组件、
fallback 或 reset API。`onRecoverableError` 常见于 hydration 等 React 自动恢复路径，本课不展开这些
触发场景，但当前宿主继续保留兜底。

### 2. 自定义 callback 替代对应默认处理

React DOM 19.2.8 创建 root 时先设置 `defaultOnUncaughtError`、`defaultOnCaughtError` 和
`defaultOnRecoverableError`；options 中某一 callback 不为 `undefined` 时，直接用它替换对应默认函数
（S11、S12）。捕获错误提交后，`logCaughtError` 只调用 root 当前保存的 `onCaughtError`。

因此“提供自定义 `onCaughtError` 后 React 仍会额外执行默认 `console.error`”是错误结论。若自定义函数
不调用 console，React 的默认 caught-error console 报告就不会发生；若应用需要 overlay 或遥测，必须
在自定义函数中自行实现（S6、S7、S11、S12）。

## 教学宿主集成边界

### 1. 已捕获错误保留局部界面

教学宿主对三类 Root 错误采用分层策略：

```ts
/** 保留已由 React Error Boundary 接管的局部失败。 */
function preserveCaughtError(): void {}

root = createRoot(currentContainer, {
  onCaughtError: preserveCaughtError,
  onRecoverableError: reportError,
  onUncaughtError: reportError,
})
```

含义是：

1. `onCaughtError` 不设置宿主 `errorMessage`，让 Error Boundary 的局部 fallback 保持唯一用户可见
   失败状态。
2. `onUncaughtError` 进入宿主失败 UI，使 boundary 外或无 boundary 的错误仍有最后兜底。
3. `onRecoverableError` 保留宿主诊断策略，但不能被误标成 Error Boundary 捕获。
4. 动态导入、创建 Root 和首次挂载的异常仍由宿主兜底，不受 caught 分支影响。

### 2. 观测取舍

no-op caught handler 会有意替代 React 默认 console 报告。不能据此声称错误“不需要记录”；这里只
是教学宿主把已捕获失败留给局部 UI，并避免把预期的演示错误计为浏览器异常。正式业务可在该 handler、
`componentDidCatch` 或框架集成中报告，但本课明确排除日志平台。

若 Demo 需要可见捕获证据，应由 boundary 的 fallback 和本地 `componentDidCatch` 计数提供，不能重新
调用宿主 `reportError`，也不能依赖 console 输出。

## Demo 合同

Demo ID：

`react.core.learn.advanced.error-boundary-render-failures.local-fallback-recovery-demo`

### 1. 结构

使用一个稳定外层控制器、一个最小外层 guard boundary、一个目标 boundary 和一个函数组件报告面板：

```text
ErrorBoundary（外层 guard）
└── DemoController（持有 shouldCrash / boundaryVersion）
    ├── 控制按钮与相邻状态（目标 boundary 外）
    └── ErrorBoundary key={boundaryVersion}（目标 boundary）
        └── ReportPanel（shouldCrash 时在 render 抛 Error）
```

外层 guard 只用于验证目标 boundary 自身失败向上传播；正常路径只显示内层局部 fallback。控制按钮和
相邻状态放在目标 boundary 外，确保后代失败后仍可点击恢复并观察隔离效果。

### 2. 确定性交互

1. 冷挂载显示报告面板、相邻状态“可用”、boundary 版本 `1`，没有 fallback 或宿主失败 UI。
2. 点击“触发渲染失败”只把 `shouldCrash` 设为 `true`；`ReportPanel` 下一次 render 同步抛错。
3. 目标 boundary 显示局部 fallback；相邻状态、控制按钮和 Vue 页面仍存在；宿主“React Demo 运行
   失败”不得出现。
4. 点击“重新加载局部面板”先把 `shouldCrash` 设为 `false`，再把 boundary 版本增至 `2`；新 key
   重建 boundary 和后代，报告面板恢复，局部输入/计数回到初始值。
5. 临时/可控验证目标 boundary 的 fallback render 自身抛错时，目标 boundary 不自捕获，外层 guard
   显示 fallback；该路径不制造未处理 console 噪声。
6. 离页并重进后恢复冷状态，不保留错误、版本或日志。

### 3. 实现限制

- 正式 TSX 只定义一个可复用 boundary class；若嵌套验证需要外层 guard，复用同一 class，不复制实现。
- 错误源必须是 render 中的同步 `throw new Error('报告面板渲染失败')`；点击 handler 不直接 throw。
- `getDerivedStateFromError` 只返回 `{ hasError: true }`，不写日志或更新外部 State。
- `componentDidCatch` 只允许本地确定性记录，不请求网络、不调用 console、不触发宿主失败 UI。
- 恢复按钮放在目标 boundary 的 fallback 中，但恢复 State 由 boundary 外控制器持有。
- 不使用 `react-error-boundary`、Suspense、`lazy`、Transition、Promise、Effect、timer、RAF、网络、
  随机数、全局 error listener 或服务端 fixture。
- TSX / CSS 遵守中文方法注释、Flexbox、无 CSS Grid、无 `gap`、无非零 `letter-spacing`。

## 易错点账本

### 1. 在事件处理器中直接 throw 来测试 boundary

- **触发条件：** 按钮 `onClick={() => { throw new Error('boom') }}` 外面套 Error Boundary。
- **原因：** 事件处理器不是 React render / lifecycle 捕获路径（S3）。
- **后果：** 局部 fallback 不出现，却把正确边界误判为失效。
- **正确做法：** 事件只更新 `shouldCrash`，由后代下一次 render 根据该 State 抛错。
- **验证方式：** 记录 click handler 正常返回，随后目标 boundary fallback 出现。

### 2. 用父组件的 `try/catch` 包住 JSX

- **触发条件：** 在父组件 render 中 `try { return <Child /> } catch { ... }`。
- **原因：** JSX 只创建 element；React 稍后调用 `Child`，不在该 JavaScript 调用栈内。
- **后果：** catch 永远接不到子组件 render 错误。
- **正确做法：** 用具备错误生命周期的 class Error Boundary 包围后代。
- **验证方式：** 临时负例证明父级 try/catch 不显示 fallback，boundary 正例显示局部 fallback。

### 3. 在 `getDerivedStateFromError` 做副作用

- **触发条件：** 在静态方法中上报、修改外部变量或写 console。
- **原因：** 该方法属于派生 State 的 render 路径，官方要求保持纯粹（S4）。
- **后果：** 重试或开发检查可能重复副作用，render 语义不再可预测。
- **正确做法：** 这里只返回 fallback State；副作用放进 `componentDidCatch` 或 root 报告层。
- **验证方式：** AST 检查静态方法只有 State return，不调用其他函数。

### 4. 只实现 `componentDidCatch` 却不建立 fallback State

- **触发条件：** class 只有 `componentDidCatch` 日志，没有 `getDerivedStateFromError`。
- **原因：** 报告错误和渲染 fallback 是两个职责；旧式在 catch 中 setState 已不推荐（S2、S9）。
- **后果：** 错误被记录但没有稳定 fallback，开发环境还可能警告。
- **正确做法：** 用静态方法派生 `hasError`，catch 只作可选报告。
- **验证方式：** render 失败后同时观察 fallback DOM 和无 React lifecycle warning。

### 5. 认为 boundary 能捕获自己

- **触发条件：** 在 boundary 自己的 fallback render 中抛错，期待同一个 boundary 再显示另一层 fallback。
- **原因：** 查找从失败节点父级开始；boundary 自身失败只会向更高祖先传播（S3、S10、S13）。
- **后果：** 没有外层 guard 时变成 root 未捕获失败。
- **正确做法：** 保持 fallback 极简；需要分层隔离时在更高功能区域放另一个 boundary。
- **验证方式：** 内层自身失败由外层 guard fallback 接管，内层 catch 计数不增加。

### 6. 认为修好 Props 后 fallback 会自动消失

- **触发条件：** 只把 `shouldCrash` 改回 `false`，不重置 boundary State。
- **原因：** `hasError` 已留在同一 boundary 实例中，没有自动 reset 协议。
- **后果：** 安全后代仍不重新渲染，界面一直停在 fallback。
- **正确做法：** 在解除失败条件后改变 boundary `key`，显式创建新实例。
- **验证方式：** 只切安全条件仍是 fallback；安全条件加 version key 后恢复初始面板。

### 7. 未解除失败条件就反复改变 key

- **触发条件：** fallback 的重试按钮只递增 version，`shouldCrash` 仍为 `true`。
- **原因：** 新 boundary 虽重置了 State，新后代第一次 render 仍立即抛错。
- **后果：** 用户看到 fallback 循环，误以为 key reset 无效。
- **正确做法：** 同一恢复动作先解除失败原因，再递增 key。
- **验证方式：** 重试后版本增长一次、面板安全渲染、无第二次 fallback。

### 8. 把普通异步错误都归给 Error Boundary

- **触发条件：** 在 timer、RAF、裸 Promise callback 中 throw，期待 boundary 捕获。
- **原因：** 普通异步回调在官方未捕获清单中；Effect 回调本身被 React 捕获也不能泛化到其后来启动的
  异步任务（S3、S13）。
- **后果：** 未处理 rejection 或全局错误越过局部 fallback。
- **正确做法：** 在异步边界显式 catch 并建模错误 State；Transition / `use(promise)` 例外按各自课程
  合同处理。
- **验证方式：** 本课 AST 禁止 timer / Promise；范围表明确普通异步与窄例外。

### 9. 把 `onCaughtError` 当成 root 失败

- **触发条件：** caught、uncaught、recoverable 三个 callback 都设置同一个宿主失败 State。
- **原因：** caught 表示 Error Boundary 已经接管，不表示 root 失效（S5-S7）。
- **后果：** 正常局部 fallback 与宿主失败 UI 同时出现，本课无法证明隔离。
- **正确做法：** caught 只记录或静默保留局部 UI；uncaught 继续进入宿主兜底。
- **验证方式：** 同一 fixture 分别触发 caught / uncaught，只有后者显示宿主失败 UI。

### 10. 以为自定义 root callback 后默认日志仍会执行

- **触发条件：** 提供自定义 `onCaughtError`，同时期待 React 默认 `console.error` 自动保留。
- **原因：** React DOM 19.2.8 直接用 options callback 替换对应默认函数（S11、S12）。
- **后果：** 生产观测悄然丢失，或测试错误地等待不存在的 console 输出。
- **正确做法：** 明确选择默认处理或自己的 overlay/报告；当前教学宿主有意使用不升级失败的自定义
  caught handler。
- **验证方式：** 临时 fixture 对比未提供 callback 与提供 no-op callback 的 console / UI 结果。

### 11. 把 `onRecoverableError` 当成 caught 的别名

- **触发条件：** Error Boundary fallback 出现后等待 `onRecoverableError`。
- **原因：** boundary 捕获对应 `onCaughtError`；recoverable 表示 React 自己从另一类错误恢复（S5）。
- **后果：** 报告分类和监控语义错误。
- **正确做法：** 分别断言三类 root callback，不用一个“error”桶替代层级。
- **验证方式：** render throw + boundary 只增加 caught 记录，不增加 recoverable 记录。

### 12. 把开发 console 次数当稳定 API

- **触发条件：** 精确断言 window/console 报告次数，并把开发结果推广到 production。
- **原因：** `componentDidCatch` 与 React 19 默认报告在开发/生产有差异，自定义 callback 又会替换默认
  处理（S2、S8、S11、S12）。
- **后果：** 环境变化产生脆弱测试，甚至重复上报。
- **正确做法：** 功能以 fallback、隔离、callback 分类和恢复 DOM 为证据；console 只检查当前宿主
  政策下无意外 error/warning。
- **验证方式：** development 与 production fixture 都验证最终 UI，不冻结默认 console 精确次数。

## 验证要点

### 1. 结构与范围

- 正文必须保留固定章节顺序、唯一 Demo ID、完整易错点和可验收练习。
- Demo 只定义一个可复用的 class boundary 实现；业务组件保持函数组件。
- `getDerivedStateFromError` 只返回 State；`componentDidCatch` 只记录已提交的捕获结果。
- 错误源位于后代 render；事件处理器不直接 throw，也不引入 timer、Promise、网络或后续异步能力。
- 源码区同时展示真实运行的 TSX 与 CSS，不能用复制文本代替运行文件。

### 2. 可观察行为

- 冷挂载显示安全报告、相邻功能和边界版本，不显示任何 fallback。
- 后代 render 失败后只替换目标子树；控制区、相邻状态和课程页面继续存在。
- 局部恢复先解除失败条件，再改变边界 key；新后代的局部 State 回到初始值。
- 内层 fallback 失败后由更高层边界接管，证明边界不能捕获自身错误。
- caught 路径不升级为宿主失败，uncaught 路径仍保留宿主兜底。
- 页面和 Demo 在桌面、窄屏与放大文字下无横向溢出、裁切或重叠。

## 内容复核清单

- 只讲 Error Boundary 的渲染失败隔离、fallback、错误报告分工、边界粒度与显式恢复。
- 后代 render 失败显示目标 fallback，目标边界之外的界面继续可用。
- 事件、普通异步、SSR 和边界自身没有被错误归入同一边界的捕获范围。
- 恢复顺序为先解除失败原因，再重建边界身份；边界内 State 随新身份重置。
- Root 的 caught、uncaught、recoverable 三类报告入口分工准确，不承担 fallback 或 reset 职责。
- class 只作为原生 Error Boundary 的必要外壳，不扩展为 class 组件教程。

## 拆分判断

- `getDerivedStateFromError`、`componentDidCatch`、局部 fallback 与显式恢复共同构成一个 Error Boundary
  失败隔离合同，拆开会无法完成从失败到恢复的闭环。
- root 三类 callbacks 只作为当前宿主正确承载该合同的必要集成边界，不展开监控或 hydration 教程，
  不构成第二条主线。
- 事件、普通异步、SSR、Transition 与 `use(promise)` 只用于划清未捕获范围和稳定例外，均不进入
  Demo 实现。
- 当前没有第二条独立主线；所有内容都服务于“隔离失败子树并明确恢复”这一完整合同。
