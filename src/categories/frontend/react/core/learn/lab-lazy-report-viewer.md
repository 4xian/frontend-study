---
id: react.core.learn.advanced.lab-lazy-report-viewer
type: lesson
title: 实战：异步报告查看器
summary: 组合 lazy、Suspense、use 和 Error Boundary，构建可分层等待、局部失败并能可靠重试的报告查看器。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 180
prerequisites:
  - react.core.learn.advanced.error-boundary-render-failures
  - react.core.learn.advanced.lazy-component-code-splitting
  - react.core.learn.advanced.suspense-fallback-boundary
  - react.core.learn.advanced.use-resource-reading
related:
  - react.core.learn.intermediate.state-preservation-and-reset
  - react.core.learn.advanced.use-transition-pending-action
tags:
  - React
  - 实战
  - lazy
  - Suspense
  - use
  - Error Boundary
  - 异步资源
  - 重试
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能把报告查看器拆成持续可用的页面外壳、代码加载边界和数据读取边界。
  - 能在组件外稳定声明 lazy loader，并让 loader 最终返回带默认导出的 React 组件模块。
  - 能用两层 Suspense 分别表达查看器代码 pending 与报告数据 pending。
  - 能用 class Error Boundary 分别接管 lazy rejection、use 读取失败和 fallback 自身失败。
  - 能按报告 ID 与尝试次数缓存同一 Promise，避免父级重渲染重新创建资源。
  - 能区分只重建 boundary、只替换 Promise 与同时更新身份时的不同结果。
  - 能在代码失败、数据失败和 fallback 失败三种路径下恢复对应区域，同时保留页面外壳。
  - 能为 lazy loader、Promise 资源、boundary key 和 Report 类型写出清晰的 TypeScript 合同。
recap:
  - lazy 负责代码模块身份和 loader 缓存，use 负责在 render 中读取报告 Promise。
  - Suspense 只表达 pending；lazy 或 use 的 rejection 必须交给 Error Boundary。
  - 报告列表和重试控制应位于局部边界之外，避免等待或失败时丢失操作入口。
  - 同一尝试稳定复用 lazy 类型、Promise 和 boundary key；重试时只替换失败层所需的身份。
  - 数据失败需要新 Promise 和新数据 boundary，代码失败需要新 lazy 类型和新外层 boundary。
  - fallback 也可能渲染失败，内层边界不能捕获自己的 fallback，错误会继续向外层传播。
  - 模块级 Map 只用于演示资源身份，不等于完整的数据缓存、失效或请求重试架构。
sources:
  - title: lazy
    url: https://react.dev/reference/react/lazy
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - loader 的调用时机、Promise 和默认导出要求、同一 lazy 类型的缓存与 rejection。
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 最近边界、fallback 替换范围、lazy/use 挂起源和嵌套 reveal。
  - title: Component Error Boundary
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - class boundary 的 fallback 派生、componentDidCatch 和捕获范围。
  - title: use
    url: https://react.dev/reference/react/use
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Promise 的 pending、fulfilled、rejected、缓存和 try/catch 限制。
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - key 改变组件身份并重建子树 State。
  - title: React 19.2 fixed source
    url: https://github.com/facebook/react/tree/v19.2.8/packages/react/src
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - lazy payload、thenable 状态与 use 输入分派的实现佐证。
---

# 实战：异步报告查看器

## 一、学习目标

- 把一个“报告加载很慢或失败”的页面拆成代码加载、数据读取和页面外壳三个责任。
- 用 `lazy(() => import(...))` 在真正需要查看器时加载代码，并验证同一 lazy 类型不会因父级更新重复调用 loader。
- 用外层 `Suspense` 表达查看器代码等待，用查看器内部的 `Suspense` 表达报告数据等待。
- 用 `use(reportPromise)` 在 render 中读取缓存资源，不把 Promise 状态复制进另一份 loading State。
- 用内层 Error Boundary 接管报告 rejection，用外层 Error Boundary 接管 lazy rejection 或内层 fallback 的失败。
- 设计报告选择、代码失败、数据失败、局部重试和整次重建的可重复操作顺序。
- 解释为什么只换边界、只换 Promise 或只换 lazy 类型都不能代替完整的失败恢复。

## 二、问题场景与验收条件

报告页面有两个彼此独立的异步阶段：先需要查看器代码，代码就绪后才读取报告数据。用户仍然需要在这两个
阶段选择另一份报告、查看当前尝试和执行重试，因此标题、报告列表和控制区不能被局部 fallback 一起替换。

把问题固定成以下可重复合同：

| 项目 | 固定内容 |
| --- | --- |
| 报告输入 | 两份本地固定报告：课程报名质量、前端运行稳定性。 |
| 代码阶段 | 每次尝试创建一个 lazy 类型；loader 由按钮手动放行或拒绝。 |
| 数据阶段 | 每个报告尝试创建一个缓存 Promise；按钮手动兑现或拒绝。 |
| 页面外壳 | 标题、报告选择、阶段计数和控制区始终位于查看器局部边界之外。 |
| 等待状态 | 代码显示“正在加载报告查看器”，数据显示“正在读取报告数据”。 |
| 失败状态 | 代码错误由外层边界显示，数据错误由内层边界显示。 |
| 重试状态 | 代码重试创建新 lazy 类型，数据重试创建新 Promise；对应 boundary key 同时变化。 |
| 正确性 | 选择的报告、固定指标和当前尝试编号始终匹配，父级普通更新不回到旧 loading。 |

Demo 不调用网络、不使用随机数、当前时间或 timer。手动控制 Promise 的兑现和拒绝，能够把每个边界的状态停在
浏览器中观察。这样测量的是 React 的组件、Promise 和边界合同，而不是网络质量。

## 三、先画出组件树

### 1. 把持续可用内容放在边界外

页面标题、报告列表和选择按钮属于同步页面外壳。它们不依赖查看器代码或报告 Promise，因此应位于局部边界
之外：

```tsx
<section>
  <PageHeading />
  <ReportPicker selectedId={reportId} onSelect={setReportId} />
  <ViewerControls />
  <ReportArea />
</section>
```

如果把 `ReportPicker` 放进同一个 Suspense，代码 pending 时用户无法切换报告；如果把它放进同一个 Error Boundary，
数据 rejection 时选择按钮也会消失。边界包围范围应由“失败时仍需要什么操作”决定。

### 2. 代码边界和数据边界分层

查看器区域内部先等待动态模块，再在真实模块内部等待报告 Promise：

```tsx
<ViewerErrorBoundary fallback={<ViewerAreaFailure />}>
  <ViewerToolbar />
  <Suspense fallback={<ViewerCodeLoading />}>
    <LazyReportPanel>
      <ReportDataBoundary key={dataBoundaryVersion} fallback={<ReportFailure />}>
        <Suspense fallback={<ReportDataLoading />}>
          <ReportBody reportPromise={reportPromise} />
        </Suspense>
      </ReportDataBoundary>
    </LazyReportPanel>
  </Suspense>
</ViewerErrorBoundary>
```

外层 `Suspense` 只负责代码 loader pending；内层 `Suspense` 只负责 `use` 读取 Promise pending。两个 fallback 的
文字应明确指出不同阶段，不能都写成“加载中”。

### 3. 失败沿最近边界传播

Suspense 不负责失败。lazy loader rejection 在 lazy 组件 render 时进入最近 Error Boundary；`use` 读取 rejected
Promise 时也会把 rejection 交给最近 Error Boundary。数据边界可以只替换报告主体，代码边界则替换整个查看器区域。

内层 fallback 自己抛错时，内层边界不能捕获自己的 fallback，错误会继续向外层边界传播。外层 fallback 必须是同步、
独立、无需同一个 lazy 或 Promise 的安全 UI。

## 四、固定报告数据和资源身份

### 1. 报告是稳定的只读 fixture

报告数据可以用 TypeScript 的只读类型表达：

```ts
type ReportId = 'enrollment' | 'runtime'

type Report = Readonly<{
  id: ReportId
  title: string
  summary: string
  updatedAt: string
  metrics: readonly Readonly<{
    label: string
    value: string
  }>[]
}>
```

报告内容不是组件 State。State 只保存当前选择和当前尝试编号；模块级 fixture 负责让同一 ID 在每次读取中得到
相同的标题、摘要和指标。

### 2. 用 Map 缓存每次 Promise

`use` 需要跨 render 读取同一个 Promise。可以为 `reportId` 和尝试编号拼出资源 key：

```ts
const resources = new Map<string, Promise<Report>>()

function getReportResource(reportId: ReportId, attempt: number): Promise<Report> {
  const key = `${reportId}:${attempt}`
  let promise = resources.get(key)
  if (!promise) {
    promise = createControlledReportPromise(reportId)
    resources.set(key, promise)
  }
  return promise
}
```

同一个 key 返回同一个 Promise；attempt 增加后返回新的 Promise。Demo 中的 Map 只演示身份稳定，不能自动提供过期、
淘汰、持久化、跨用户隔离、请求取消或缓存一致性。

### 3. 不在 render 中创建异步任务

下面的写法每次 render 都可能得到新 Promise：

```tsx
// 错误：render、Suspense retry 或父级更新都可能再次创建 Promise。
const report = use(fetchReport(reportId))
```

即使 `fetchReport` 本身返回了缓存 Promise，下面的 `.then` 也会每次生成新的派生 Promise：

```tsx
// 错误：then 的返回值不是原来的缓存身份。
const report = use(getCachedReport(reportId).then(normalizeReport))
```

规范化应在资源创建时只做一次，并把最终 Promise 本身放进 Map。reader 只负责读取：

```tsx
function ReportBody({ reportPromise }: { reportPromise: Promise<Report> }) {
  const report = use(reportPromise)
  return <h2>{report.title}</h2>
}
```

## 五、声明并控制 lazy loader

### 1. loader 必须在组件 render 外创建

常规 lazy 类型可以在模块顶层声明：

```tsx
const LazyReportPanel = lazy(() => import('./lazy-report-panel'))
```

如果要为每次显式重试创建新类型，应在初始化或点击处理器中调用 `lazy`，再把结果保存到 State：

```tsx
function createReportPanel(moduleKey: string) {
  return lazy(() => loadReportModule(moduleKey))
}

function retryModule() {
  const nextLazy = createReportPanel(nextModuleKey)
  setLazyReport(() => nextLazy)
}
```

不能在报告组件的 render 内调用 `lazy`。每次 render 新建类型会让 React 把它当成新的组件，子树 State 被重置，
loader 缓存也无法表达“同一尝试只加载一次”。

### 2. 动态模块必须有默认导出

`lazy` 的 loader 需要返回形如 `Promise<{ default: ComponentType }>` 的模块：

```tsx
// lazy-report-panel.tsx
export default function LazyReportPanel() {
  return <section>报告查看器</section>
}
```

如果模块只有命名导出，可以在 loader 中转换为默认导出，但这只解决模块形状：

```tsx
const LazyReportPanel = lazy(() =>
  import('./report-module').then((module) => ({ default: module.ReportPanel })),
)
```

命名导出转换不会改变 lazy 类型的缓存，也不会把失败自动变成成功。

### 3. 同一 lazy 类型缓存 loader 结果

一次尝试的 loader 被调用后，pending、fulfilled 或 rejected 结果都属于该 lazy 类型。普通父级重新 render 不会让
同一 lazy 类型再次调用 loader：

```tsx
const [shellRevision, setShellRevision] = useState(0)

return (
  <>
    <button onClick={() => setShellRevision((revision) => revision + 1)}>更新外壳</button>
    <LazyReportPanel />
  </>
)
```

按钮只改变边界外的 State。只要 lazy 类型没有改变，代码加载计数就不应增加，已成功的查看器也不应重新显示代码
fallback。

## 六、为两类 pending 选择 Suspense

### 1. 代码 pending 替换查看器区域

代码尚未加载时，外层 Suspense 只替换查看器区域：

```tsx
<Suspense fallback={<p role="status">正在加载报告查看器</p>}>
  <LazyReportPanel resourceKey={resourceKey} />
</Suspense>
```

报告列表仍在该 Suspense 之外，所以用户可以选择另一份报告或重置实验。代码 loader resolve 后，React 重试 lazy
组件的 render，并继续走数据边界。

### 2. 数据 pending 只替换主体

真实模块内部读取 Promise，并用更窄的 Suspense 保护主体：

```tsx
function LazyReportPanel({ resourceKey }: { resourceKey: string }) {
  return (
    <Suspense fallback={<p role="status">正在读取报告数据</p>}>
      <ReportBody resourceKey={resourceKey} />
    </Suspense>
  )
}
```

这样查看器标题、当前尝试和外壳能先出现，报告主体在数据完成后 reveal。边界数量不应按组件数量机械增加，而应
对应用户能理解的加载顺序。

### 3. pending 不是错误

- lazy Promise pending：最近的代码 Suspense 显示代码 fallback。
- 报告 Promise pending：最近的数据 Suspense 显示数据 fallback。
- lazy Promise rejected：Error Boundary 显示代码失败。
- 报告 Promise rejected：Error Boundary 显示数据失败。

不要在两个 fallback 中都写“失败”，也不要让 Error Boundary 显示一个永远等待的 loading 文案。等待和失败分别
对应 Suspense 与 Error Boundary。

## 七、实现分层 Error Boundary

### 1. class 外壳只承担边界合同

React 19.2 没有函数组件版的 `getDerivedStateFromError`。最小 class boundary 可以这样写：

```tsx
class ReportErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportLocalFailure(error, info.componentStack)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
```

`getDerivedStateFromError` 只返回用于 fallback 的 State。`componentDidCatch` 可记录本地诊断信息，但不应把它当作
主要 fallback State 入口，也不应把错误对象直接渲染给用户。

### 2. 数据边界只替换报告主体

数据边界的 fallback 可以显示“报告读取失败”和重试按钮。按钮调用仍存活的父级 handler，父级再准备新 Promise
并改变 boundary key：

```tsx
<ReportErrorBoundary
  key={`${reportId}:${attempt}`}
  fallback={<ReportFailure onRetry={retryReport} />}
>
  <Suspense fallback={<ReportDataLoading />}>
    <ReportBody reportPromise={reportPromise} />
  </Suspense>
</ReportErrorBoundary>
```

如果把 `key` 放在整个页面外壳上，报告列表和选择 State 也会被重建；key 应放在恰好拥有失败 State 的边界上。

### 3. 外层边界接管代码和 fallback 失败

外层边界的 fallback 只使用同步文本和边界外 handler：

```tsx
<ViewerErrorBoundary
  fallback={<ViewerAreaFailure onRetry={retryModule} />}
>
  <Suspense fallback={<ViewerCodeLoading />}>
    <LazyReportPanel />
  </Suspense>
</ViewerErrorBoundary>
```

它可以接管 lazy loader rejection，也可以接管内层数据 fallback 自身的 render error。外层 fallback 不能再读取已
失败的 Promise 或渲染同一个 lazy 类型，否则它会沿着原失败链再次失败。

## 八、设计三种身份和重试路径

### 1. 同一次尝试保持三个身份

一次稳定的查看尝试至少有三种身份：

| 身份 | 作用 | 普通父级重渲染时 |
| --- | --- | --- |
| lazy 类型 | 缓存代码 loader 的 pending、fulfilled 或 rejected 结果。 | 保持同一个对象。 |
| Promise 资源 | 让 `use` 继续读取同一份报告进度。 | 保持同一个 Promise。 |
| boundary key | 保存当前边界是否已经进入 fallback。 | 保持同一个 key。 |

父级可以更新 `shellRevision`、当前阶段计数或其他页面 State，但不应在这些更新中重建三种身份。否则成功内容会
无故回到 loading，或局部 State 被重置。

### 2. 数据失败换 Promise 和数据 key

当数据 Promise rejected 时，失败来自报告资源层。数据重试要做两件事：

```tsx
function retryReport() {
  const nextAttempt = attempt + 1
  const nextPromise = getReportResource(reportId, nextAttempt)
  setReportPromise(nextPromise)
  setDataBoundaryKey(`${reportId}:${nextAttempt}`)
}
```

只换 Promise 不重建 boundary 时，旧 boundary 的 `hasError` 仍为 `true`，不会重新渲染后代。只换 boundary key
不换 Promise 时，新 boundary 第一次 render 仍会读取同一个 rejected Promise，结果还是失败。

### 3. 代码失败换 lazy 和外层 key

当代码 loader rejected 时，失败来自 lazy 类型。代码重试要创建新的 lazy 类型，并重建包围它的边界：

```tsx
function retryViewerModule() {
  const nextLazy = createReportPanel(nextModuleKey)
  setLazyReport(() => nextLazy)
  setViewerBoundaryKey((key) => key + 1)
}
```

同一个 lazy 类型会缓存 rejection，单纯增加一个显示计数或只重建 boundary 都不会再次调用 loader。新 lazy 类型
会拥有自己的 loader 结果。

### 4. 整次尝试同时更新所有身份

如果错误来源不明确，或者要从头验证整个页面，可以同时创建新 lazy、新 Promise 并改变两个 boundary key：

```tsx
function rebuildAttempt() {
  const next = createAttempt(reportId, attempt + 1)
  setLazyReport(() => next.lazy)
  setReportPromise(next.promise)
  setViewerBoundaryKey((key) => key + 1)
  setDataBoundaryKey(`${reportId}:${next.number}`)
}
```

按钮应该位于外层边界之外，确保失败后仍然能够执行整次重建。新尝试先显示代码 pending，再显示数据 pending，
最后才显示成功内容。

## 九、让报告查看器可观察

### 1. 阶段计数必须来自身份而不是文案

Demo 显示以下可验证值：

- 当前报告和尝试编号。
- lazy loader 累计调用次数。
- 报告 Promise 创建次数。
- 外层和内层 boundary 版本。
- 边界外壳的普通 render revision。

选择同一报告的新尝试时，报告 Promise 创建次数应增加；父级重新 render 时，创建次数和 loader 调用次数不应
增加。数字只用于观察身份变化，不代表真实网络请求数或生产性能指标。

### 2. 推荐操作顺序

1. 选择一份报告，保持代码控制器 pending，确认报告列表仍可操作。
2. 点击“完成代码加载”，保持数据 pending，确认查看器外壳出现而报告主体仍等待。
3. 点击“兑现报告数据”，确认标题、摘要和指标完整出现。
4. 点击“父级重新 render”，确认成功内容不回到两个 loading，loader 和 Promise 创建次数保持不变。
5. 重置后再次选择报告，拒绝代码加载，确认外层代码错误 fallback 出现。
6. 点击“使用新模块重试”，再次放行代码，确认新的 lazy loader 进入数据 pending。
7. 拒绝报告数据，确认只有内层数据 Error Boundary 替换主体，报告选择区仍在。
8. 先尝试“只换数据边界”和“只换报告资源”，观察它们各自无法完成恢复。
9. 点击“完整重试报告”，兑现新数据，确认通过新的 pending 后显示成功内容。
10. 让内层失败提示也失败，确认外层边界接管，再恢复安全提示。

:::demo{id="react.core.learn.advanced.lab-lazy-report-viewer.lazy-report-viewer-demo"}
:::

### 3. 结果判断

成功不是“按钮点击后出现一段文字”，而是以下因果关系同时成立：

- 代码 pending 的 fallback 来自代码 Suspense，代码 fulfilled 后真实 lazy 模块出现。
- 数据 pending 的 fallback 来自模块内部的数据 Suspense，数据 fulfilled 后 `use` 返回 `Report`。
- rejection 只进入对应最近 Error Boundary，不会让持续可用的页面外壳消失。
- 失败后的新尝试先出现新 pending，再出现新成功内容，没有直接复用旧 rejection。
- 普通父级更新只改变外壳 revision，不改变当前 lazy、Promise 或 boundary 身份。

## 十、TypeScript 合同

### 1. lazy loader 类型

`lazy` 的 loader 返回默认组件模块：

```ts
const LazyReportPanel = lazy(
  (): Promise<{ default: ComponentType<ReportPanelProps> }> =>
    import('./lazy-report-panel'),
)
```

动态模块的 `default` 必须是可以作为 JSX 组件使用的类型。TypeScript 能检查模块形状，但不会告诉你 loader 何时
pending、哪个边界会接管 rejection 或重试时是否创建了新身份。

### 2. use Promise 类型

报告 reader 的 Promise 类型直接推导出报告类型：

```tsx
function ReportBody({ reportPromise }: { reportPromise: Promise<Report> }) {
  const report = use(reportPromise)
  return <h2>{report.title}</h2>
}
```

`use<T>(usable: Usable<T>): T` 表达输入和返回值，不负责缓存。`Promise<Report>` 的 TypeScript 类型也不包含
pending、fulfilled 或 rejected 的运行时状态，因此这些状态必须由 Suspense、Error Boundary 和浏览器操作证明。

### 3. ErrorInfo 和错误显示

`componentDidCatch` 收到的错误值不应被假定为某种业务类，`ErrorInfo.componentStack` 只用于开发诊断。Demo 的
fallback 显示固定的错误类别和恢复动作，不把 stack、内部错误字段或组件实现细节暴露给使用者。

## 十一、易错使用提示

::::pitfalls
### 每次 render 都创建 lazy

**触发条件：** 在报告组件函数体中调用 `lazy(() => import(...))`。

**原因：** 每次 render 都产生新的组件类型，React 无法把它识别为同一个查看器。

**后果：** 查看器子树 State 被重置，loader 缓存也无法表达同一次尝试。

**错误示例：**

```tsx
function ReportArea() {
  const LazyPanel = lazy(() => import('./lazy-report-panel'))
  return <LazyPanel />
}
```

**正确写法：** 在模块顶层声明常规 lazy，或在一次重试事件中创建新类型并保存到 State。

```tsx
const LazyPanel = lazy(() => import('./lazy-report-panel'))
setLazyPanel(() => LazyPanel)
```

**验证方式：** 父级重新 render 后，成功查看器的局部 State 保留，lazy loader 调用次数不增加。

**影响版本：** React 19.2。

**来源：** `lazy` 官方参考和 State/key 官方指南。

### 只重建 boundary 重试 rejected lazy

**触发条件：** lazy loader 已失败，只增加 Error Boundary 的 key。

**原因：** boundary State 被重建了，但原 lazy 类型仍缓存 rejected loader。

**后果：** 新 boundary 第一次渲染立即再次显示代码失败。

**错误示例：**

```tsx
setViewerBoundaryKey((key) => key + 1)
```

**正确写法：** 在同一重试 handler 中创建新的 lazy 类型并改变外层 boundary key。

```tsx
const nextLazy = lazy(() => loadReportModule(nextModuleKey))
setLazyReport(() => nextLazy)
setViewerBoundaryKey((key) => key + 1)
```

**验证方式：** 新模块重试先进入代码 pending，loader 调用次数增加一次，放行后才出现查看器。

**影响版本：** React 19.2。

**来源：** `lazy` 官方参考、React lazy 固定源码。

### 数据失败时只换 Promise 或 boundary key

**触发条件：** 报告读取失败后，只替换 `reportPromise`，或只递增数据 boundary key。

**原因：** 前者保留 Error Boundary 的 `hasError` State，后者继续读取已经 rejected 的 Promise。

**后果：** 新 Promise 没有机会进入 reader，或新 boundary 第一次 render 就再次失败。

**错误示例：**

```tsx
// 错误一：只换资源。
setReportPromise(getReportResource(reportId, nextAttempt))

// 错误二：只换边界。
setDataBoundaryVersion((version) => version + 1)
```

**正确写法：** 用新的尝试编号生成 Promise，并在同一次数据重试中更新 boundary key。

```tsx
const nextPromise = getReportResource(reportId, nextAttempt)
setReportPromise(nextPromise)
setDataBoundaryKey(`${reportId}:${nextAttempt}`)
```

**验证方式：** “只换报告资源”和“只换数据边界”都无法恢复；完整数据重试会进入新的 pending。

**影响版本：** React 19.2。

**来源：** `use`、Suspense 和 State/key 官方文档。

### 在 render 中创建或派生新 Promise

**触发条件：** 把 async 函数直接传给 `use`，或在 reader 中临时调用 `.then(normalize)`。

**原因：** async 调用和 `.then` 都会产生新 Promise，即使原始输入或源 Promise 没有变化。

**后果：** suspended retry 或父级更新持续读取新身份，fallback 反复出现，还可能报告 uncached Promise。

**错误示例：**

```tsx
const directReport = use(loadReport(reportId))
const normalizedReport = use(cachedPromise.then(normalizeReport))
```

**正确写法：** 在资源准备阶段完成异步读取和 normalize，缓存最终 Promise，render 只按稳定 key 读取。

```tsx
const reportPromise = getNormalizedReportResource(reportId, attempt)
const report = use(reportPromise)
```

**验证方式：** reader 中没有 async 调用或 `.then`；父级重新 render 时创建次数不增加，也不重新出现 fallback。

**影响版本：** React 19.2。

**来源：** `use` 官方参考、React thenable 固定源码。

### 把 Suspense fallback 当作失败状态

**触发条件：** 代码或数据 pending 时显示“读取失败”并直接提供错误重试。

**原因：** pending 与 rejected 是两个不同的 render 路径。

**后果：** 用户无法判断是仍在等待还是已经失败，控制逻辑也会在错误阶段提前执行。

**错误示例：**

```tsx
<Suspense fallback={<p>报告读取失败，请重试</p>}>
  <ReportBody />
</Suspense>
```

**正确写法：** Suspense 显示等待文案，Error Boundary 显示失败文案和重试动作。

```tsx
<Suspense fallback={<p>正在等待报告数据</p>}>
  <ReportBody />
</Suspense>
```

**验证方式：** 手动保持代码或数据 pending，再分别 reject；两次界面文字和负责的边界不同。

**影响版本：** React 19.2。

**来源：** Suspense、lazy、use 和 Component Error Boundary 官方文档。

### 用一个大边界包住整个页面

**触发条件：** 页面标题、报告列表、控制区和查看器全部放入一个 Suspense/Error Boundary。

**原因：** 边界会替换它包围的整棵 children，而不是只替换失败叶子。

**后果：** 局部等待或失败时用户无法切换报告、观察阶段或触发恢复。

**错误示例：**

```tsx
<Suspense fallback={<PageLoading />}>
  <PageHeading />
  <ReportPicker />
  <LazyReportPanel />
</Suspense>
```

**正确写法：** 把持续可用外壳放在局部代码和数据边界之外。

```tsx
<PageHeading />
<ReportPicker />
<Suspense fallback={<ViewerCodeLoading />}>
  <LazyReportPanel />
</Suspense>
```

**验证方式：** 保持代码 pending 或数据 rejected，报告选择按钮仍然可点击。

**影响版本：** React 19.2。

**来源：** Suspense 和 Component Error Boundary 官方文档。

### 让内层 fallback 依赖同一个失败资源

**触发条件：** Error Boundary 的 fallback 继续读取 rejected Promise，或继续渲染失败的 lazy 组件。

**原因：** fallback 没有脱离原失败链。

**后果：** 内层 boundary 无法稳定显示失败提示，错误继续向外层传播或造成重复失败。

**错误示例：**

```tsx
function Failure() {
  const report = use(rejectedReportPromise)
  return <p>{report.title}</p>
}
```

**正确写法：** fallback 只使用同步文本，并调用仍存活的父级重试 handler。

```tsx
function Failure({ onRetry }: { onRetry: () => void }) {
  return <button onClick={onRetry}>重试报告</button>
}
```

**验证方式：** 让内层 fallback 故意抛错，确认外层边界接管；恢复后安全 fallback 可以再次出现。

**影响版本：** React 19.2。

**来源：** Component Error Boundary、Suspense 官方文档和固定错误传播源码。

### 误以为事件或 timer 错误会被边界捕获

**触发条件：** 在按钮 handler 或 timer 中直接抛错，期待最近 Error Boundary 自动显示 fallback。

**原因：** Error Boundary 的一般捕获范围是后代 render、constructor 和生命周期，不是普通事件或异步回调。

**后果：** 失败 UI 不出现，页面可能产生未处理异常。

**错误示例：**

```tsx
<button onClick={() => Promise.reject(new Error('读取失败'))}>读取</button>
```

**正确写法：** handler 先准备资源并更新 State，让下一次 render 的 `use` 读取 rejected Promise。

```tsx
function failReport() {
  setReportPromise(getRejectedReportResource(reportId, attempt))
}
```

**验证方式：** 对比裸事件 rejection 和 render 中 `use(rejectedPromise)`，只有后者进入数据边界。

**影响版本：** React 19.2。

**来源：** Component Error Boundary 和 use 官方文档。

### 在 componentDidCatch 中承担主要 fallback State

**触发条件：** 只实现 `componentDidCatch`，在其中调用 `setState` 才生成失败 UI。

**原因：** fallback State 的公开推荐入口是 `getDerivedStateFromError`；`componentDidCatch` 用于副作用报告。

**后果：** fallback 时序不清晰，边界职责和错误报告混在一起。

**错误示例：**

```tsx
componentDidCatch() {
  this.setState({ hasError: true })
}
```

**正确写法：** `getDerivedStateFromError` 纯返回 `{ hasError: true }`，`componentDidCatch` 只记录信息。

```tsx
static getDerivedStateFromError(): BoundaryState {
  return { hasError: true }
}
```

**验证方式：** 检查 fallback 首次提交不依赖 componentDidCatch 内的 State 更新。

**影响版本：** React 19.2。

**来源：** Component Error Boundary 官方文档。

### 把资源 Map 当作完整数据层

**触发条件：** 看到同 key 复用 Promise，就把 Map 当作生产缓存、请求去重或一致性方案。

**原因：** Demo Map 只回答“同一次尝试的 Promise 身份是否稳定”。

**后果：** 过期、失败保留、用户隔离、取消和并发请求等问题没有真实策略。

**错误示例：**

```ts
// 误把教学 fixture 当成永不过期的全局业务缓存。
const reportCache = new Map<string, Promise<Report>>()
```

**正确写法：** 把 Map 限定在本地状态实验，生产数据层另行设计失效和一致性合同。

```ts
const demoResources = new Map<string, Promise<Report>>()
```

**验证方式：** 正文和 Demo 不出现网络、持久化、淘汰或第三方查询库承诺。

**影响版本：** React 19.2。

**来源：** use 官方参考的 Client Promise 缓存说明。
::::

## 十二、源码推导与适用场景

### 1. 固定来源事实

- React 19.2 的 `lazy` 文档规定 loader 在组件第一次尝试渲染时调用，并缓存 loader Promise 和解析模块；模块需要
  有有效的默认导出。固定 `ReactLazy.js` 只作为该公开合同的实现佐证。
- `Suspense` 文档规定 lazy 和 `use` Promise 可以激活最近边界，边界会以 fallback 替换其 children；嵌套边界可以
  形成分层 reveal。pending 与 rejection 不是同一种状态。
- `Component` 文档规定 class Error Boundary 用 `getDerivedStateFromError` 产生 fallback，`componentDidCatch`
  用于报告副作用；事件处理器、普通 timer 和 boundary 自身错误不属于一般捕获范围。
- `use` 文档规定 Promise pending 时挂起，fulfilled 时返回值，rejected 时把原因交给 Error Boundary，并要求
  Client render 复用缓存 Promise。固定 thenable 源码仅校准三态分支，不把内部字段当作代码接口。
- State/key 文档规定 key 改变组件身份并重建其 State 和 children；因此 key 可以用来重建已失败的 boundary。

### 2. 课程推导

- 代码加载和数据读取是两个不同的失败来源，应由不同的 Suspense 和 Error Boundary 表达；把它们混成一个 loading
  文案会丢失因果信息。
- 页面外壳的可操作性是边界位置的直接结果。边界越靠外，等待和失败替换范围越大；边界越靠内，越能保留选择和
  重试入口，但也需要为局部失败设计足够上下文。
- 失败恢复不是一个抽象的“重新加载”按钮，而是针对失败身份的替换：lazy 失败换 lazy 类型，Promise 失败换
  Promise，boundary State 失败换 key。一个完整的新尝试可以同时换三者。
- 稳定身份和缓存是同一个问题的两面：同一次尝试要稳定，失败后的下一次尝试要明确不同。父级普通更新不能偷偷
  变成新尝试。

### 3. 适用场景与边界

- 这种结构适合按需报告、低频设置、分阶段详情和其他“代码先到、数据后到”的局部工作区，前提是等待和失败区域
  可以被清楚画出。
- 如果异步操作只由事件触发且不需要挂起 render，普通 State loading 更直接；不要为了使用 Suspense 把所有请求
  强行改成 render 读取。
- 本实战不覆盖 Server Components、SSR、Hydration、Transition、路由 loader、远程请求、缓存淘汰、请求取消、
  认证、分页、重试退避或第三方错误边界。它们会改变应用工程范围，但不改变这里的边界职责分工。
- 代码分割的 chunk 命名、网络预加载和构建工具配置不属于 `lazy` 的组件合同；本实战只验证 loader 返回模块和
  React 组件树的可观察状态。

## 十三、练习

:::exercise
### 画出边界替换范围

**要求：** 在纸上或编辑器中画出页面标题、报告选择、外层 Error Boundary、代码 Suspense、查看器模块、内层
数据 Error Boundary 和数据 Suspense。为代码 pending、数据 pending、数据失败和内层 fallback 失败分别标出会被
替换的区域。

**验收：** 能说明报告选择按钮为什么始终在局部边界外，以及内层 fallback 失败为什么会进入外层边界。
:::

:::exercise
### 验证同一次尝试的身份稳定

**要求：** 选择报告并完成代码、数据读取；点击多次“父级重新 render”，记录 lazy loader 调用、Promise 创建、
外壳 revision 和边界版本。

**验收：** 外壳 revision 增加，成功内容保持可见；同一次尝试的 lazy loader 调用和 Promise 创建次数不增加。
:::

:::exercise
### 对照三种数据重试

**要求：** 让报告数据 rejected，依次点击“只换数据边界”“只换报告资源”，最后点击“完整重试报告”。每一步先
预测页面结果，再观察 fallback、资源创建次数和边界版本。

**验收：** 只换边界仍读取旧 rejection；只换资源仍被旧 boundary fallback 遮住；完整重试经过新的 data pending
并最终显示新报告内容。
:::

:::exercise
### 让代码 loader 失败并恢复

**要求：** 重置实验，选择报告并拒绝代码加载。观察外层代码错误，然后用新模块重试；放行新 loader 后再兑现数据。

**验收：** 旧 lazy rejection 不会自动重试；新 lazy loader 调用一次并依次经过代码 pending、数据 pending、成功内容。
:::

:::exercise
### 验证 fallback 分层

**要求：** 让报告数据失败，点击“让失败提示也失败”，观察外层边界接管；点击“恢复安全失败提示”，再用完整数据
重试恢复。期间切换报告选择，记录页面外壳是否保持可用。

**验收：** 内层不能捕获自己的 fallback 错误；外层 fallback 可同步显示并恢复；标题与报告选择仍然可操作。
:::

## 十四、本节小结

- `lazy` 只负责代码模块的加载与同类型缓存，不负责报告数据。
- `Suspense` 只表达 pending；代码和数据可以用嵌套边界表达不同的 reveal 顺序。
- `use(promise)` 必须读取 render 前准备并缓存的 Promise；fulfilled 返回报告，rejected 进入最近 Error Boundary。
- 页面外壳和控制区应位于局部边界之外，确保等待和失败期间仍能选择报告和发起恢复。
- 数据失败的恢复需要新 Promise 和新的数据 boundary key；代码失败的恢复需要新 lazy 类型和新的外层 boundary。
- 只换其中一个身份会留下旧 rejection 或旧 boundary State；完整尝试可以同时更换 lazy、Promise 和 boundary。
- fallback 自身也必须是同步、安全的 UI，不能继续读取原失败资源。
- Demo Map 只验证稳定身份，不代表生产数据缓存、请求取消或错误重试策略。

## 十五、参考资料

- [React `lazy`](https://react.dev/reference/react/lazy) - loader 时机、默认导出、缓存和 rejection。
- [React `Suspense`](https://react.dev/reference/react/Suspense) - fallback、最近边界、嵌套 reveal 和挂起来源。
- [React `use`](https://react.dev/reference/react/use) - Promise 三态、缓存、条件调用和错误边界关系。
- [`Component`：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) - class 外壳、fallback 派生和捕获范围。
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key) - key 与组件 State 身份。
