# AL2「实战：异步报告查看器」官方研究记录

## 研究范围、版本与证据边界

- 目标课程标识：`react.core.learn.advanced.lab-lazy-report-viewer`。
- 课程标题：`实战：异步报告查看器`。
- 教学层级：React Core 高级实战，本科前端课程范围。
- 核验日期：`2026-08-17`。
- React 官方文档基线：React `19.2`。
- 本地运行时基线：`react@19.2.8`、`react-dom@19.2.8`。
- TypeScript 类型基线：`@types/react@19.2.18`、`@types/react-dom@19.2.4`。
- 固定 React 文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。
- 固定 React 源码标签：`facebook/react@v19.2.8`。

本记录研究一条完整的客户端异步读取链：报告查看器的代码通过 `lazy` 按需加载，报告数据用已缓存的
Promise 交给 `use` 读取，`Suspense` 表达等待，Error Boundary 表达渲染失败。数据失败时替换 Promise
和数据 boundary，代码失败时替换 lazy 类型和外层 boundary；只有重建整次尝试时才同时替换三种身份。
报告数据和代码加载均使用可控制的本地确定性 fixture，便于在浏览器中逐个观察状态。

只采用 React 的公开行为。固定源码和类型用于校准文档描述、输入形状和状态转移，不把 Fiber、lane、
内部标志、`_status`、`_payload` 或 thenable expando 变成学习者需要依赖的 API。

明确排除：React Server Components、SSR/streaming、Hydration、数据框架、远程请求客户端、完整缓存
失效和淘汰架构、Transition、`useTransition`、`useDeferredValue`、路由、第三方 Error Boundary、
全局错误平台和网络重试策略。课程只保留能在浏览器本地验证的组件树、Promise、边界和 State 身份。

## 调研方式

1. 先用 Tavily 定位 React 官方页面，再用 `curl -L --fail --silent --show-error` 回读固定的
   `react.dev` 文档源码；采用的结论均回到官方页面或固定版本仓库源码。
2. 逐项核对 `lazy`、`Suspense`、`Component` Error Boundary、`use`、State/key 文档，以及
   React `v19.2.8` 中的 lazy、thenable、`use` 分派和错误捕获源码。
3. 不采用社区文章、搜索摘要、第三方 boundary 包的 API 或一次浏览器观感作为 React 合同。
4. 只把源码中与公开语义一一对应的事实写入事实账本；实现细节若不需要帮助理解公开行为则不进入正文。
5. 本记录可包含课程标识和验收合同，但未来课程正文只描述报告查看器本身，不出现路线、批次、计划、
   完成度、构建或复审叙事。

## 一手来源卡

| ID | 官方来源 | 固定 URL | 采用范围 |
| --- | --- | --- | --- |
| `R00` | React Versions | [最新版本](https://react.dev/versions#latest-version) | 官方文档版本基线；本记录按 React `19.2` 公共文档核验。 |
| `R01` | React `lazy` | [`lazy`](https://react.dev/reference/react/lazy)；[固定文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/lazy.md#L21-L84) | loader 调用时机、默认导出、Promise/结果缓存、挂起和 rejection。 |
| `R02` | React `<Suspense>` | [`Suspense`](https://react.dev/reference/react/Suspense)；[固定文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md#L24-L60) | fallback、最近边界、`lazy`/`use` 激活、首次挂起 State、嵌套和共同 reveal。 |
| `R03` | React `Component` | [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)；[固定文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Component.md#L1270-L1342) | 渲染失败范围、`getDerivedStateFromError`、`componentDidCatch`、边界排除项和 fallback。 |
| `R04` | React `use` | [`use`](https://react.dev/reference/react/use)；[固定文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/use.md#L21-L79) | Promise 三态、Suspense/Error Boundary 关系、缓存、条件调用和 `try/catch` 限制。 |
| `R05` | Preserving and Resetting State | [State 与 key](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key)；[固定源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/preserving-and-resetting-state.md#L742-L1016) | 组件身份、位置、key、子树状态重建和保留边界。 |
| `R06` | React `useState` | [`useState` key reset](https://react.dev/reference/react/useState#resetting-state-with-a-key) | 改变 key 会重建组件和其所有 children；可作为重置 boundary 状态的公开依据。 |
| `R07` | `ReactLazy.js` | [React `v19.2.8` 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactLazy.js#L68-L207) | 每个 `lazy` 类型的独立 payload、pending/resolved/rejected 分支、默认导出和失败抛出。 |
| `R08` | `ReactFiberThenable.js` | [React `v19.2.8` 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberThenable.js#L107-L285) | Promise 身份追踪、fulfilled/rejected 同步读取、pending 挂起和 uncached 警告。 |
| `R09` | `ReactFiberHooks.js` | [React `v19.2.8` 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L1095-L1166) | `use` 先按 thenable 或 Context 分派；这只是公开输入合同的实现佐证。 |
| `R10` | `ReactFiberThrow.js` | [React `v19.2.8` 源码](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberThrow.js#L621-L681) | 错误沿父级路径寻找可处理的 class boundary；当前 boundary 自身不处理自己的错误。 |
| `R11` | `ReactTypes.js` | [React `v19.2.8` 类型](https://github.com/facebook/react/blob/v19.2.8/packages/shared/ReactTypes.js#L97-L145) | 运行时 thenable、Context 与 `Usable<T>` 的输入形状佐证。 |
| `R12` | `@types/react` | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts)（`lazy` 约 1611 行，`Usable/use` 约 1971-1973 行） | TypeScript 的 `lazy` 默认导出约束、`SuspenseProps.fallback` 和 `use<T>(usable)` 返回类型。 |

## 二、逐 Claim 事实账本

| Claim | 可用于课程的准确表述 | 来源 | 边界 |
| --- | --- | --- | --- |
| `C01` | `lazy(load)` 应在组件 render 之外声明；第一次真正尝试渲染返回组件时才调用 `load`。 | `R01`、`R07` | 不把“首次尝试”解释为模块导入发生在文件加载时。 |
| `C02` | loader 必须最终 resolve 为带有效 `.default` React 组件的模块；动态 import 的模块应使用默认导出。 | `R01`、`R12` | 命名导出需另写适配 Promise，不在本课扩展 bundler 规则。 |
| `C03` | 同一个 lazy 类型会缓存 loader Promise 及其 resolved 模块结果，不会因为父组件普通重渲染再次调用 loader。 | `R01`、`R07` | 缓存是该 lazy 类型的公共行为，不等于应用级数据缓存。 |
| `C04` | loader rejection 会在渲染 lazy 组件时抛出，并交给最近 Error Boundary；Suspense 只表达 pending。 | `R01`、`R02`、`R03`、`R07` | 不把 import 网络层的所有异常都称为 React 可捕获错误。 |
| `C05` | 每次调用 `lazy` 都创建新的 React lazy 类型及自己的内部 payload；改变类型身份可以获得新的 loader/cache。 | `R07`、`R05` | payload 字段是内部实现；课程只使用“新 lazy 身份”这一公开可观察结果。 |
| `C06` | 在组件内部每次 render 创建 lazy 类型会使 React 看到不同组件类型，导致子树 State 被重置；应避免这种写法。 | `R01` | “为重试显式创建一次新类型”只能发生在初始化或点击处理器中，并保存到 State。 |
| `C07` | lazy pending 会激活最近父级 Suspense，并显示该边界的 fallback；resolve 后 React 重试并显示真实组件。 | `R01`、`R02` | 不承诺具体加载毫秒数或 bundler chunk 下载细节。 |
| `C08` | `use(promise)` 在 Promise pending 时挂起，fulfilled 时返回值，rejected 时抛出 rejection reason。 | `R04`、`R08` | Promise 的三态是公开语义；源码中的 `status` expando 不是教学 API。 |
| `C09` | Client 组件传给 `use` 的 Promise 必须跨 render 复用同一个实例；render 内直接创建 Promise 会重复挂起并触发 uncached 警告。 | `R04`、`R08` | 课程只用小型 Map fixture，不讲通用缓存、淘汰、请求去重或框架集成。 |
| `C10` | `use` Promise rejected 时，最近 Error Boundary 显示失败 fallback；Promise 本身不会因再次读取自动变为成功。 | `R04`、`R08`、`R03` | 重试必须换 Promise 身份，并让 boundary 重新参与 render。 |
| `C11` | `use` 可以放在条件和循环中，但仍须在函数组件或自定义 Hook 内，不能在事件处理器、模块顶层或 `try/catch` 中调用。 | `R04`、`R09` | 例外只属于 `use`，不改变其他 Hook 的顶层规则。 |
| `C12` | Suspense 只检测 React 支持的挂起源，如 `lazy` 和 `use` Promise；Effect 或事件处理器中开始的异步工作不会自动激活它。 | `R02` | 本课不通过 Effect 请求报告。 |
| `C13` | 一个 Suspense 边界默认把其整棵 children 当成一个 reveal 单元；任一后代 pending 时，边界内已完成的兄弟也会被 fallback 替换。 | `R02` | 不把 fallback 描述成只遮住挂起叶子的遮罩。 |
| `C14` | 最近的父级 Suspense 负责 pending；嵌套边界可把加载顺序细分为外层框架、内层摘要和详情内容。 | `R02` | 边界粒度按用户希望的加载顺序决定，不按组件数量机械切分。 |
| `C15` | 首次 mount 尚未成功就挂起时，React 不保留那次 render 的 State；资源就绪后从头重试挂起树。 | `R02` | 已经成功显示后再次挂起的 State 行为是另一情形，本课不依赖 Transition 保护旧内容。 |
| `C16` | Error Boundary 用 `static getDerivedStateFromError` 产生 fallback State；`componentDidCatch` 用于可选的报告副作用。 | `R03`、`R10` | 不推荐在 `componentDidCatch` 中 `setState` 代替派生 fallback。 |
| `C17` | Error Boundary 捕获后代 render 路径中的错误，包括 lazy 初始化和 `use` 读取抛出的错误；不捕获事件处理器、SSR、普通 timer/RAF、boundary 自身错误。 | `R03`、`R10` | Transition Action 的窄例外不属于本课。 |
| `C18` | 错误沿父级路径寻找最近可处理的 class boundary；内层 boundary 的 fallback 自己抛错时由外层 boundary 接管。 | `R03`、`R10` | 这是边界分层的结构合同，不展开 Fiber 遍历实现。 |
| `C19` | 改变组件 `key` 会让 React 把组件视为新的身份，重建该组件及其 children 的 State；边界自身也因此回到初始状态。 | `R05`、`R06` | key 不是任意命令式 reset API，只在同一父级范围内定义身份。 |
| `C20` | 可靠重试应替换失败层拥有的身份：数据失败换 Promise 和数据 boundary key，代码失败换 lazy 类型和外层 boundary key；整次重建才同时更换三种身份。 | `R01`、`R04`、`R05`、`R07` | 这是由各自缓存/State 合同推出的课程模式，不是 React 单一 `retry` API。 |
| `C21` | 同一尝试下父级普通重渲染应复用原 lazy 类型、原 Promise 和原 boundary key，成功内容不应无故回到 loading。 | `R01`、`R04`、`R05` | 不以单次精确时间作为验收条件。 |
| `C22` | `lazy` 和 `use` 的 TypeScript 合同分别要求 `Promise<{ default: T }>` 与 `use<T>(Usable<T>): T`。 | `R12` | 类型说明输入和返回值，不说明边界时序、缓存策略或最近边界。 |

## 三、异步报告查看器的功能合同

### 1. 产品目标

页面展示固定的本地报告列表。用户选择报告后，查看器按两个异步阶段展示详情：先等待查看器代码，
再等待报告数据。成功后显示报告标题、摘要、统计值和一份本地审阅信息。用户可以切换报告、重试
失败的代码加载或数据读取，并观察外层页面在局部失败时仍可操作。

所有报告、错误和延迟均来自本地确定性 fixture；不请求网络、不读取服务器、不依赖当前时间或随机数。
“异步”只用于呈现 React 的 pending/fulfilled/rejected 状态，不模拟真实 API 的认证、分页、缓存淘汰或
重试退避。

### 2. 建议的可见区域

1. 页面标题和固定报告列表始终位于局部 Error Boundary 之外。
2. 报告选择区显示当前 ID、标题和选择按钮；选择后更新父级的 `reportId`。
3. 查看器外层显示 `正在加载查看器代码` fallback，内层显示 `正在读取报告数据` fallback。
4. 成功视图显示报告标题、摘要、生成时间的固定文本和统计数据；边界外控制区保留“重建整次尝试”按钮。
5. 代码加载失败显示“查看器代码加载失败”和重试按钮；数据失败显示“报告读取失败”和重试按钮。
6. 错误 fallback 必须同步渲染，按钮可以调用边界外父级提供的重试 handler。
7. 页面不显示课程编号、路线编号、计划、批次、完成度、构建或测试过程文字。

### 3. 边界层级

```text
页面外壳
├─ 页面标题与报告列表（普通同步 UI）
└─ 外层 ErrorBoundary（捕获查看区 fallback 自身或未分层的 render 错误）
   └─ 报告查看区
      ├─ 当前报告工具栏（不因详情 pending 消失）
      └─ Suspense：查看器代码 fallback
         └─ 内层 ErrorBoundary key={attempt}
            └─ LazyReportViewer
               └─ Suspense：报告数据 fallback
                  └─ ReportBody resource={reportPromise}
```

这里有两个独立的 Suspense 粒度：代码没准备好时替换“查看器内容”，数据没准备好时只替换查看器
内部的报告主体。两个 Error Boundary 负责失败而不是等待；内层 boundary 只保护当前报告，外层 boundary
保护报告区域的最后一层 fallback。标题、报告列表和选择按钮不应包进会被替换的局部 Suspense。

边界可以写成如下 JSX 形状：

```tsx
<OuterBoundary fallback={<ReportAreaFailure onRetry={retryReportArea} />}>
  <ReportAreaToolbar reportId={reportId} />
  <Suspense fallback={<ViewerCodeLoading />}>
    <InnerBoundary
      key={attempt}
      fallback={<ReportFailure kind={failureKind} onRetry={retryAttempt} />}
    >
      <LazyReportViewer reportPromise={reportPromise} />
    </InnerBoundary>
  </Suspense>
</OuterBoundary>
```

若 `LazyReportViewer` 内部的数据 `<Suspense>` 需要显示比代码 fallback 更细的 loading，应把它放在
`LazyReportViewer` 的真实组件内部；不要在代码 pending 之前渲染依赖该组件的 loading 内容。

### 4. 固定报告模型

```ts
type ReportId = 'enrollment' | 'runtime'

type Report = {
  readonly id: ReportId
  readonly title: string
  readonly summary: string
  readonly metrics: readonly { label: string; value: string }[]
}

type Attempt = {
  readonly reportId: ReportId
  readonly number: number
}
```

- 报告数据是模块级只读 fixture，不进入组件 State。
- `reportId` 是当前选择的业务身份；`Attempt.number` 只表达一次明确重试。
- `reportId` 和 attempt number 组成资源缓存 key 与 boundary key 的输入。
- 指标数组是固定数据，渲染时直接读取；不引入派生缓存或数据层。

## 四、三种身份与重试模型

### 1. Promise 资源身份

`use` 要求同一资源跨 render 复用同一个 Promise。研究 Demo 可以使用一个小型 module-level Map，
只按 `reportId:attempt` 记录当前 fixture：

```ts
const reportResources = new Map<string, Promise<Report>>()

function getReportResource(reportId: ReportId, attempt: number) {
  const key = `${reportId}:${attempt}`
  let promise = reportResources.get(key)
  if (!promise) {
    promise = createControlledReportPromise(reportId, attempt)
    reportResources.set(key, promise)
  }
  return promise
}
```

同一个 key 每次 render 返回同一个 Promise；attempt 增加后得到不同 key 和全新的 Promise。Map 在本课
只是解释 `use` 的身份合同，不负责过期、淘汰、跨用户隔离、并发去重、持久化或错误缓存策略。

不要写成下面这样：

```tsx
// 错误：每次 render 都产生新 Promise。
const report = use(loadReport(reportId))

// 错误：即使 loadReport 返回缓存 Promise，then 仍会产生新 Promise。
const report = use(loadReport(reportId).then(normalizeReport))
```

### 2. lazy 类型身份

一次尝试的 lazy 类型应只创建一次，并保存到父级 State。为重试创建的新类型必须在点击处理器或
初始化器中产生，不得在报告组件的 render 中调用 `lazy`：

```tsx
function createReportLazy(loader: () => Promise<{ default: ReportView }>) {
  return lazy(loader)
}

// 仅在初始化和 retry handler 调用，不在 render 中反复调用。
const nextLazy = createReportLazy(() => loadReportView(attempt))
setLazyReport(() => nextLazy)
```

同一尝试的父级重渲染复用 `lazyReport`；重试时新建一次并替换它。这样既能观察 lazy 的独立缓存，也
避免官方文档指出的“render 内声明 lazy 导致 State 每次重置”问题。

### 3. Error Boundary 身份

Error Boundary 自己保存 `hasError` State。它进入 fallback 后，即使原来的错误条件在外部已经解除，
也不会因为一次普通父级重渲染自动清除。把 `key={attemptKey}` 放在内层 boundary 上，重试时递增 key，
React 会把 boundary 和其 children 当作新子树创建，`hasError` 回到初始值。

```tsx
<InnerBoundary key={`${reportId}:${attempt}`} fallback={...}>
  <LazyReportViewer reportPromise={reportPromise} />
</InnerBoundary>
```

只改变 boundary key 而复用该层已经 rejected 的 Promise 或 lazy 类型，会在新 boundary 第一次 render
时再次抛出同一个失败；只改变失败资源而保留已经失败的 boundary，也会继续显示旧 fallback。数据失败
需要新 Promise 和新数据 boundary，代码失败需要新 lazy 类型和新外层 boundary；整次重建才同时替换
lazy、Promise 和两个 boundary 身份。

### 4. 分层重试与整次重建

```tsx
function rebuildCurrentReportAttempt() {
  const nextAttempt = attempt.number + 1
  const nextPromise = getReportResource(reportId, nextAttempt)
  const nextLazy = createReportLazy(() => loadReportView(nextAttempt))

  setAttempt({reportId, number: nextAttempt})
  setReportPromise(nextPromise)
  setLazyReport(() => nextLazy)
}
```

上述代码表示整次重建，而不是每一种局部失败都必须执行的操作。关键合同是：

1. 新 attempt 产生新 Promise。
2. 新 attempt 产生新 lazy 类型。
3. 新 attempt 进入 boundary key。
4. 所有新身份由 boundary 外仍存活的父级持有。
5. 旧 fallback 内的按钮只请求父级更新，不直接修改 boundary 内失败组件的 State。

若错误来源明确，数据重试只创建新 Promise 并重建数据 boundary；代码重试只创建新 lazy 类型并重建
外层 boundary。两者都不应无故替换已经成功的另一层身份。

## 五、Error Boundary 合同

### 1. 最小 class boundary

React `19.2` 仍没有函数组件版 `static getDerivedStateFromError` 或 `componentDidCatch`。本课只允许
一个很小的 class 外壳承载公共边界能力，报告查看器的业务组件仍使用函数组件：

```tsx
type BoundaryProps = {
  readonly children: ReactNode
  readonly fallback: ReactNode
}

type BoundaryState = {
  readonly hasError: boolean
}

class InnerBoundary extends Component<BoundaryProps, BoundaryState> {
  state = {hasError: false}

  static getDerivedStateFromError(): BoundaryState {
    return {hasError: true}
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // 可选：把本地演示日志交给边界外的报告面板。
    console.error(error, info.componentStack)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
```

`getDerivedStateFromError` 必须是纯的，只返回下一次 render 使用的 fallback State。`componentDidCatch` 只
承担报告副作用；不把 `setState` 放在其中作为主要 fallback 机制。`ErrorInfo.componentStack` 可用于
本地观测，但课程不制作日志平台或组件栈解析器。

### 2. 捕获范围

Error Boundary 能捕获后代组件 render 路径中的错误，包括：

- lazy loader rejection 在 lazy 组件 render 时转成的错误；
- `use(rejectedPromise)` 在 render 时抛出的 rejection reason；
- 报告展示组件自身同步抛出的确定性错误。

Error Boundary 不自动捕获：

- 事件处理器里的普通 `throw`；
- `setTimeout`、`requestAnimationFrame` 或普通 Promise callback 中的异常；
- SSR 中的错误；
- boundary 自身的 render/fallback 错误。

若需要把事件错误转换成可显示的 State，应在事件 handler 中显式更新父级 State；不把所有异步异常
都伪装成 Error Boundary 捕获。

### 3. 最近边界和分层

内层 boundary 失败时，外层页面标题和报告列表仍在树中，继续可操作。若内层 fallback 自身 render
失败，错误继续向上交给外层 boundary；若外层 boundary 也失败，则只能交给更高层或 root 级处理。

因此 boundary 的位置是产品设计合同：

- 过宽会把报告列表和全局操作一起替换，用户无法换报告或重试；
- 过窄会让同一失败被拆成难以理解的多块 fallback；
- fallback 本身应同步、轻量，不依赖同一 lazy 或 Promise；
- retry handler 位于仍可见的父级，避免按钮随失败子树一起被销毁。

## 六、Suspense 合同

### 1. pending 的来源

本课使用两种公开挂起源：

| 挂起源 | 触发点 | 最近边界 | 成功后的结果 |
| --- | --- | --- | --- |
| `lazy` loader pending | 第一次渲染 `LazyReportViewer` | 查看器代码的 Suspense | loader resolve 为默认组件后重试 render |
| `use(reportPromise)` pending | `ReportBody` render 读取 Promise | 报告数据的内层 Suspense | Promise fulfilled 后 `use` 返回 `Report` |

Suspense fallback 只说明“尚未能够完成这次 render”。它不是错误 UI，也不捕获 rejection。rejection
必须进入 Error Boundary。

### 2. 共同 reveal 与嵌套 reveal

同一 Suspense 内的标题、工具栏和报告内容默认被当作一组。若报告内容 pending，边界内所有 children
会一起被 fallback 替换。要让工具栏保持可见，应把工具栏放在边界外；要让摘要先于指标出现，应在
详情内部增加内层 Suspense。

```tsx
<ReportToolbar />
<Suspense fallback={<ViewerCodeLoading />}>
  <LazyReportViewer>
    <Suspense fallback={<MetricsLoading />}>
      <ReportMetrics />
    </Suspense>
  </LazyReportViewer>
</Suspense>
```

边界数量不等于加载层数。边界应对应用户真正理解的顺序，例如“查看器框架 → 报告主体 → 指标”，
而不是给每个叶子组件套一个 spinner。

### 3. 首次挂起与再次挂起

首次 mount 在真实内容提交前就挂起时，React 不保留那次 render 产生的局部 State，资源就绪后从头
重试。报告查看器的初次输入应由边界外父级或固定 Props 提供，不能依赖一次尚未提交的局部 State。

已经成功显示后再次挂起时，React 默认可以再次显示 fallback；本课不使用 Transition 或 deferred value
去改变这一默认行为。验证只要求观察边界结构和最终 DOM，不比较某个固定毫秒值。

## 七、TypeScript 公共合同

### 1. lazy loader

`@types/react@19.2.18` 的声明约束：

```ts
function lazy<T extends ComponentType<any>>(
  load: () => Promise<{default: T}>,
): LazyExoticComponent<T>
```

因此动态模块必须在类型层面提供 `default` 组件：

```tsx
const LazyReportViewer = lazy(
  () => import('./ReportViewer'),
)
```

如果模块只有命名导出，需要在 loader 中把它映射成默认导出形状；这只解决 TypeScript/模块形状，不
改变 Promise 缓存或 Error Boundary 语义。

### 2. use resource

`@types/react@19.2.18` 把 `Usable<T>` 定义为 React Promise、Context 或 renderer 扩展，并把 `use`
声明为：

```ts
function use<T>(usable: Usable<T>): T
```

本课只传 `Promise<Report>`，让返回值直接推导为 `Report`：

```tsx
function ReportBody({reportPromise}: {reportPromise: Promise<Report>}) {
  const report = use(reportPromise)
  return <h2>{report.title}</h2>
}
```

类型不会告诉程序 Promise 何时 pending、哪个 Suspense 会接管、哪个 Error Boundary 会显示，也不会
自动保证 Promise 缓存；这些属于运行时合同，必须由资源准备和浏览器状态证明。

### 3. Boundary 类型

`ComponentDidCatch` 的 `info.componentStack` 在类型里是可选字符串；错误值实际允许任意 thrown value。
演示 fallback 不应假设错误一定有 `message`，也不应把错误对象直接暴露给用户。课程只显示固定错误
分类和重试按钮。

## 八、Demo 可观察合同

### 1. 确定性 fixture

- 使用两个固定报告 ID 和固定标题、摘要、指标。
- 使用手动控制器暴露 `resolve`/`reject` 按钮；不使用网络、随机数、当前时间或不可控竞态。
- 每个 `reportId:attempt` 只创建一个 Promise，并在 Map 中复用。
- 每次 attempt 的 lazy loader 只调用一次；loader 可以等待同一手动控制器后返回默认组件。
- 错误 fixture 明确区分 `lazy-error` 与 `resource-error`，便于判断是哪个边界处理了失败。

### 2. 状态矩阵

| 操作 | 期望可见结果 | 证明的合同 |
| --- | --- | --- |
| 初次选择报告，代码 pending | 查看器代码 fallback；标题和列表仍可见 | `lazy` pending 进入最近 Suspense，局部边界不吞页面外壳。 |
| 代码 resolve，数据 pending | 查看器框架出现，报告主体显示数据 fallback | lazy 与 `use` 可由嵌套 Suspense 分层。 |
| 数据 resolve | 报告标题、摘要和指标完整出现 | fulfilled Promise 被 `use` 同步读取。 |
| 数据 reject | 内层 Error Boundary 显示读取失败，列表仍可操作 | rejected Promise 进入最近 Error Boundary。 |
| 代码 reject | 查看器区域显示代码加载失败，页面外壳仍存在 | lazy rejection 不由 Suspense 当作成功 loading。 |
| 重试数据 | 新 boundary fallback → 新数据成功，旧错误不再立即出现 | 新 Promise + 新 boundary key。 |
| 重试代码 | 新 lazy pending → 新组件成功 | 新 lazy 类型 + 新 boundary key。 |
| 同尝试父级普通重渲染 | 已成功的内容不回到 loading，局部 State 保留 | lazy、Promise、boundary key 身份稳定。 |
| 内层 fallback 故意抛错 | 外层 boundary 显示报告区域兜底；标题和列表仍在 | boundary 自身 fallback 失败由更高边界接管。 |
| 只换 boundary key、不换 Promise | 新 boundary 仍显示同一 rejected 结果 | boundary reset 不能改变旧资源身份。 |
| 只换 Promise、不换 boundary | 若 boundary 已处于错误 State，仍先显示旧 fallback | 资源更新与 boundary State 是两个独立边界。 |
| render 内直接创建 Promise | 开发环境报告 uncached 警告或持续 fallback | `use` 的缓存 Promise 合同。 |

### 3. 推荐操作顺序

1. 选择报告并保持代码控制器 pending，确认局部 loading。
2. resolve 代码但保持数据 pending，确认内层数据 loading。
3. resolve 数据，确认完整成功视图。
4. 让下一次数据 attempt reject，确认错误 fallback 和页面外壳。
5. 点击重试数据，确认 Promise 和数据 boundary 变化，先 pending 再成功，lazy 身份保持不变。
6. 让下一次 lazy attempt reject，确认代码错误 fallback。
7. 点击重试代码，确认新 lazy loader 只调用一次并显示新成功视图。
8. 在成功状态触发一个不改变 `reportId` 或 attempt 的父级普通 State 更新，确认没有不必要 fallback。
9. 让内层 fallback 自己抛错，确认外层 boundary 分层接管。

### 4. 观测方式

- 为每次 loader 和资源创建记录 `attempt`、身份标签和调用次数；日志保存在边界外。
- 页面显示当前 `reportId`、attempt number、`lazy` loader 调用次数和 resource 状态标签，便于人工核对。
- 使用 DOM 文本判断 fallback、成功和错误状态，不依赖截图颜色或精确时间。
- 检查标题、报告列表和选择按钮在局部 fallback/错误期间仍存在且可点击。
- 检查同一 attempt 的 loader 调用次数为 1；新 attempt 的计数单独开始。
- 检查切换报告时得到新的资源 key，不把上一报告的成功结果展示给当前报告。

## 九、高价值错误与修正

### 1. 在 render 中新建 lazy，或在失败后复用 rejected lazy

- **触发条件：** 在组件 render 中调用 `lazy`，或代码失败后只重建 boundary 而继续渲染旧 lazy 类型。
- **错误写法：** 在每次 render 中调用 `lazy`，或代码失败后只递增显示计数并继续渲染原 lazy 类型。
- **原因：** 前者每次都创建新组件类型，后者继续复用已经缓存 rejection 的类型。
- **后果：** 前者反复重置查看器 State，后者让新 boundary 立即得到旧错误。
- **修正：** 常规 lazy 在模块级声明；需要重试代码时，在事件处理器中创建一次新类型并保存到 State。
- **适用版本：** React 19.2。
- **来源：** `R01`、`R07`。

### 2. 数据失败后只换 Promise 或只换 boundary

- **触发条件：** 报告 Promise rejected 后，只替换资源或只递增数据 boundary key。
- **错误写法：** 只替换报告 Promise 而保留失败 boundary，或只换 boundary key 而继续读取 rejected Promise。
- **原因：** 前者保留 `hasError` State，后者保留资源 rejection。
- **后果：** 新资源没有机会进入 reader，或新 boundary 第一次 render 就再次失败。
- **修正：** 用新的 `reportId:attempt` 创建 Promise，并在同一次数据重试中递增数据 boundary key。
- **适用版本：** React 19.2。
- **来源：** `R04`、`R05`、`R08`。

### 3. 在 render 中直接 `use(fetchReport())`

- **触发条件：** 在读取组件的 render 中直接调用会返回新 Promise 的 `fetchReport`。
- **错误写法：** `const report = use(fetchReport(reportId))`。
- **原因：** 每次 suspended retry 或父级 render 都得到不同 Promise。
- **后果：** fallback 反复出现，开发环境可能提示 uncached Promise。
- **修正：** 在 render 前准备资源并按稳定 key 缓存 Promise。
- **适用版本：** React 19.2。
- **来源：** `R04`、`R08`。

### 4. 用 `.then` 产生新的未缓存 Promise

- **触发条件：** 在 render 中对已缓存 Promise 再调用 `.then`，并把派生 Promise 直接交给 `use`。
- **错误写法：** `use(cachedReport.then(normalize))`。
- **原因：** 每次调用 `.then` 都产生新 Promise，即使源 Promise 已缓存。
- **后果：** 读取身份不稳定，可能持续挂起。
- **修正：** 把最终 Promise 作为缓存值存储；规范化逻辑在创建资源时只执行一次。
- **适用版本：** React 19.2。
- **来源：** `R04`。

### 5. 在 render 边界之外处理 `use` 或普通异步

- **触发条件：** 在组件内部 `try/catch` `use`，或在事件处理器中直接 reject Promise 并等待边界显示 UI。
- **错误写法：** 用 `try/catch` 包住 `use(reportPromise)`，或在按钮 handler 中直接 reject Promise 并期待边界接管。
- **原因：** 捕获 `use` 的挂起信号会破坏 Suspense；普通事件 Promise 也不会自动进入 render 边界。
- **后果：** fallback 时序被破坏，或事件异常成为未处理 rejection。
- **修正：** 事件只准备资源并更新父级 State，让下一次 render 的 `use` 交给 Suspense 和 Error Boundary。
- **适用版本：** React 19.2。
- **来源：** `R02`、`R03`、`R04`。

### 6. 把 Suspense fallback 当作错误 UI

- **触发条件：** 把 pending 阶段显示的 Suspense fallback 当作 rejected 后的错误界面。
- **错误写法：** 在 fallback 中显示“读取失败”并提供重试。
- **原因：** pending 与 rejected 是不同状态。
- **后果：** 用户无法区分等待和失败，测试无法判断哪个边界生效。
- **修正：** pending 用 loading 文案，Error Boundary 用失败文案和重试按钮。
- **适用版本：** React 19.2。
- **来源：** `R01`、`R02`、`R03`、`R04`。

### 7. 边界包住整个页面，或细到每个组件

- **触发条件：** 将页面外壳包进详情边界，或为标题、按钮和每个指标分别增加等待边界。
- **错误写法：** 用一个边界包住标题、列表和详情，或为每个指标、标题、按钮分别加边界。
- **原因：** 前者替换范围过大，后者的粒度脱离用户希望的加载顺序。
- **后果：** 用户失去选择和重试入口，或看到大量互不协调的局部 fallback。
- **修正：** 保留边界外页面外壳，按“查看器代码 → 报告主体”的可理解 reveal 顺序分层。
- **适用版本：** React 19.2。
- **来源：** `R02`。

### 8. 在 `componentDidCatch` 中设置 fallback State

- **触发条件：** 只实现 `componentDidCatch`，在副作用回调中调用 `setState` 决定 fallback。
- **错误写法：** 只实现 `componentDidCatch`，在其中 `setState` 再显示失败 UI。
- **原因：** React 文档已将其作为过时模式，fallback 派生应在 `getDerivedStateFromError`。
- **后果：** 边界行为和开发诊断不清晰。
- **修正：** `getDerivedStateFromError` 纯返回 `{hasError: true}`，`componentDidCatch` 只报告副作用。
- **适用版本：** React 19.2。
- **来源：** `R03`、`R10`。

### 9. 误以为 boundary 能捕获按钮或 timer 错误

- **触发条件：** 在按钮 handler、timer 或普通异步 callback 中抛错，并期待最近 Error Boundary 自动显示 fallback。
- **错误写法：** 在按钮 handler 中 `throw`，期待最近 boundary 显示 fallback。
- **原因：** Error Boundary 的一般合同是后代 render/lifecycle，不是事件或普通异步 callback。
- **后果：** fallback 不出现，误判边界失效。
- **修正：** handler 把错误转换为显式 State，或让下一次 render 通过 rejected resource 进入 boundary。
- **适用版本：** React 19.2。
- **来源：** `R03`。

### 10. fallback 自己依赖失败的 lazy 或 Promise

- **触发条件：** 错误 fallback 继续渲染同一 lazy 详情，或读取导致原错误的 rejected resource。
- **错误写法：** 错误 fallback 仍渲染同一个 lazy 详情或读取同一个 rejected resource。
- **原因：** fallback 不能脱离原失败链，甚至可能再次抛错。
- **后果：** 内层 boundary 无法显示 fallback，错误继续向外层传播。
- **修正：** fallback 使用同步文本、固定按钮和边界外 handler。
- **适用版本：** React 19.2。
- **来源：** `R02`、`R03`、`R10`。

## 十、本科范围内容清单

正文应覆盖以下直接可操作内容：

- `lazy(() => import(...))` 的默认导出要求、首次 render 触发和同身份缓存。
- `Suspense` 的 pending fallback、最近边界、整棵子树替换和嵌套加载层级。
- `use(promise)` 的 pending、fulfilled、rejected 三态和稳定 Promise 资源准备。
- Error Boundary 的 class 外壳、fallback 派生、可选报告副作用和捕获范围。
- 报告列表外壳与查看器局部边界的组件树位置。
- 数据失败更换 Promise 与数据 boundary、代码失败更换 lazy 与外层 boundary、整次重建更换全部身份的流程。
- TypeScript `Report`、`Promise<Report>`、`lazy` loader 和 `ErrorInfo` 的最小类型合同。
- 手动控制 pending、成功、失败、恢复和普通父级重渲染的浏览器验证。
- 组件 State 只放当前报告和尝试身份；资源 Map 只解决同一 Promise 复用，不扩展成完整数据层。

## 十一、明确排除内容

- 不讲 RSC 中从 Server Component 向 Client Component 传 Promise 的序列化合同。
- 不讲 SSR、streaming HTML、hydration、服务端错误回退或浏览器/服务器双次 render。
- 不讲 Transition、`useTransition`、`useDeferredValue` 或“保留已显示内容”的非紧急更新策略。
- 不讲 React Router、框架 loader、React Query、SWR、Relay 或第三方 `react-error-boundary`。
- 不讲缓存淘汰、请求取消、并发请求合并、持久化、离线、认证、分页、重试退避和遥测后端。
- 不讲 dynamic import 的 bundler 配置、chunk 命名、预加载优化和网络性能预算。
- 不把内部 `_status`、`_payload`、`_result`、thenable expando、Fiber tag 或 lane 作为代码接口。
- 不把事件 handler、timer 和任意 Promise callback 的异常描述成 Error Boundary 自动捕获。

## 十二、结论

异步报告查看器的可靠结构是把三种不同责任分开：`lazy` 负责代码类型和代码加载缓存，`use` 负责从
稳定 Promise 读取报告，Suspense 负责 pending，Error Boundary 负责 render 路径的失败。边界位置决定
哪些内容在局部等待或失败时仍然可操作；身份决定重试是否真的从头开始。

一次有效重试不是简单地再次点击按钮，而是由边界外父级替换失败层拥有的资源和 boundary：数据失败
更换 Promise 与数据 boundary，代码失败更换 lazy 类型与外层 boundary；只有整次重建才同时替换所有
身份。同一尝试内必须保持未失败层的身份稳定，普通父级重渲染才能复用已完成结果和局部 State。这个模式
只依赖 React `19.2` 的公开组件、Promise、TypeScript 和 key 行为，足以在没有服务端、数据框架或
Transition 的情况下完成可观察、可解释的本科实战。

## 十三、核验记录

- 已通过 Tavily 搜索定位 React 官方 `lazy`、`Suspense`、`Component`、`use` 和 State/key 页面。
- 已用固定文档提交 `c7d6b700038c63d1aaf2c649af1aefe01ebbacac` 回读上述页面原文并核对关键段落。
- 已用 React `v19.2.8` 固定 URL 回读 `ReactLazy.js`、`ReactFiberThenable.js`、`ReactFiberHooks.js`、
  `ReactFiberThrow.js` 和 `ReactTypes.js`。
- 已用 `@types/react@19.2.18` 固定 npm 类型文件核对 `lazy`、`SuspenseProps`、`Usable<T>` 和 `use<T>`。
- 本轮只写入本文件；未修改课程正文、Demo、manifest、Track、进度、计划、依赖或测试文件。
- 未启动开发服务器，也未运行浏览器 Demo；当前文件是课程实现前的官方研究与验证合同，浏览器状态机应在
  实现 Demo 后按“Demo 可观察合同”逐项复核。
