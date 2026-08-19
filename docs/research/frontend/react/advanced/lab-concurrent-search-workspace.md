# 并发搜索工作区研究记录

## 研究结论

- 本文固定 React 与 React DOM `19.2.8`，文档语义固定到 React 官方文档仓库提交
  `383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`，类型固定到 `@types/react@19.2.18`。文中不把
  其他版本的实验 API 或内部调度细节当作公共合同。
- 搜索框的受控 State 是紧急更新，必须在输入事件中同步写入；Transition 只包裹结果视图、筛选结果或
  其他可以稍后显示的 State。`startTransition` 会立即调用 Action，不能当作定时器、线程或 Promise。
- `useTransition` 返回 `[isPending, startTransition]`。同步 Action 只把回调内同步安排的 State 更新标为
  Transition；异步 Action 可以让 `isPending` 横跨等待，但 `await` 后的 State setter 当前仍要再次放进
  `startTransition`。
- `useDeferredValue` 不会延迟输入 State，也不会取消或合并数据请求。它在新值尚未准备好时返回上一次
  已提交的值，使结果区保持可见；`query !== deferredQuery` 只能表示 UI 仍在追赶，不能表示网络状态。
- Suspense 只对 render 期间可识别的挂起源作出反应，例如 `lazy` 或用 `use` 读取的、可复用的 Promise。
  Effect 或事件处理器里的普通请求不会自动触发 Suspense。Suspense 决定 fallback 的替换范围和 reveal
  粒度，不负责输入优先级或业务请求顺序。
- `<Activity mode="hidden">` 保留子树的 State 与宿主 DOM，清理后代 Effects，并把隐藏更新放到可见工作
  之后；恢复 `visible` 时重新建立 Effects。它不是 CSS `display:none`，也不是卸载后重新 mount。
- 四者在一个搜索工作区中各司其职：输入 State 保证即时回显，deferred value 维持陈旧结果，Suspense
  表达新结果尚未可读，Transition 表达用户触发的非紧急 Action，Activity 保留暂时关闭的详情面板。
  一个状态不能同时被多个 API 代替，Demo 必须能分别观察每条边界。

## 研究范围与边界

### 覆盖内容

1. `startTransition` 与 `useTransition` 的调用、返回值、同步和异步 Action、pending 生命周期以及
   `await` 后重新包裹 setter 的当前限制。
2. `useDeferredValue` 的首次 render、旧值追赶、可中断后台 render、stale 指示和与 Suspense 的交互。
3. Suspense 的最近边界、首次挂起、已显示内容保护、缓存 Promise、`use` 的读取路径与 fallback 范围。
4. Activity 的 `visible`/`hidden`、State/DOM 保留、Effect cleanup/re-mount、隐藏更新与可访问性影响。
5. 一个完全本地、无网络时间依赖的搜索工作区状态机，以及可逐步验证四条语义的观测点。

### 不在本文展开

- Fiber、lane、thenable 状态值、调度器实现、render 次数和具体毫秒数。
- 服务器组件、RSC、流式 SSR、选择性 hydration、框架数据缓存和生产网络重试策略。
- `useActionState`、`useOptimistic`、表单 Action、`cacheSignal`、View Transition 和 React Compiler。
- 业务级取消、去重、事务、持久化确认和服务端排序协议；这些需要单独的数据层契约。
- Activity 的未来模式、实验导出、`unstable_Activity` 或 React 19.2 之外的公开接口。

## 版本冻结与调研方法

核验日期：`2026-08-17`。

1. 外部检索先限定 Tavily 的 `react.dev`；获得候选链接后，回到 React 官方文档、官方 GitHub 源码、
   官方测试与 npm 精确版本元数据。未使用社区文章、博客转载或搜索摘要支撑知识结论。
2. 运行时提交由 React 仓库 `v19.2.8` tag 和 npm `gitHead` 双重核对；类型声明从
   `@types/react@19.2.18` 的 `index.d.ts` 直接读取。
3. 文档固定到 `reactjs/react.dev@383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`。在线 Reference 仅用于
   易读入口，固定 raw/blob 链接用于防止官网内容漂移。
4. React 源码和测试仅用于确认当前 patch 的实现旁证。源码中的内部字段、测试工具和调度顺序不升级为
   应用可依赖的 API。

## 一手来源卡

| 编号 | 一手来源 | 固定方式 | 支撑内容 |
| --- | --- | --- | --- |
| S1 | [`useTransition` Reference](https://react.dev/reference/react/useTransition) | React 文档 19.2 | 返回值、Action、pending、async/await 限制、受控输入、错误与顺序边界。 |
| S2 | [`startTransition` Reference](https://react.dev/reference/react/startTransition) | React 文档 19.2 | 立即调用、同步 State 更新范围、非阻塞、可中断、`void` 返回和 Hook 外使用。 |
| S3 | [`useDeferredValue` Reference](https://react.dev/reference/react/useDeferredValue) | React 文档 19.2 | 旧值追赶、后台 render、stale UI、Promise 缓存、与 Suspense 的结合。 |
| S4 | [`<Suspense>` Reference](https://react.dev/reference/react/Suspense) | React 文档 19.2 | fallback、最近边界、共同/嵌套 reveal、再次挂起和 Effect 请求边界。 |
| S5 | [`use` Reference](https://react.dev/reference/react/use) | React 文档 19.2 | 读取 Promise、必须复用同一实例、resolve/reject 与 Error Boundary。 |
| S6 | [`<Activity>` Reference](https://react.dev/reference/react/Activity) | React 文档 19.2 | 两种模式、预渲染、State/DOM 保留、Effect 生命周期和隐藏更新。 |
| S7 | [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2) | React 文档 19.2 | Activity 稳定发布语义、hidden 更新延后、Suspense reveal 批处理。 |
| S8 | [固定 `useTransition` 文档源码](https://raw.githubusercontent.com/reactjs/react.dev/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useTransition.md) | `react.dev@383a1e9239c8...` | 固定 S1 的公开文字与示例。 |
| S9 | [固定 `useDeferredValue` 文档源码](https://raw.githubusercontent.com/reactjs/react.dev/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/useDeferredValue.md) | 同上 | 固定 stale 内容、缓存和中断说明。 |
| S10 | [固定 Suspense 文档源码](https://raw.githubusercontent.com/reactjs/react.dev/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/Suspense.md) | 同上 | 固定 fallback 与更新边界文字。 |
| S11 | [固定 Activity 文档源码](https://raw.githubusercontent.com/reactjs/react.dev/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react/Activity.md) | 同上 | 固定 hidden/visible、预渲染和 Effect 说明。 |
| S12 | [`ReactStartTransition.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactStartTransition.js) | `facebook/react@1dd4ecbd...` | standalone Action 立即执行、观察 Promise、返回 `void` 的实现旁证。 |
| S13 | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) | 同上 | `useTransition` 的 pending 与 Action 完成路径旁证。 |
| S14 | [`ReactAsyncActions-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactAsyncActions-test.js) | 同上 | async Action pending、urgent State 和错误传播的当前 patch 旁证。 |
| S15 | [`ReactDeferredValue-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactDeferredValue-test.js) | 同上 | deferred 值追赶、挂起和中断的当前 patch 旁证。 |
| S16 | [`ReactSuspenseWithNoopRenderer-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactSuspenseWithNoopRenderer-test.js) | 同上 | Transition/deferred 更新下已显示 Suspense 内容的保留旁证。 |
| S17 | [`Activity-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/Activity-test.js) | 同上 | hidden cleanup、DOM 保留和隐藏更新的当前 patch 旁证。 |
| S18 | [`ActivitySuspense-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ActivitySuspense-test.js) | 同上 | hidden Activity 中 Suspense 预渲染旁证。 |
| S19 | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm 精确版本 | `TransitionFunction`、`useTransition`、`useDeferredValue`、`use`、`ActivityProps`、`SuspenseProps`。 |
| S20 | [React 19.2.8 npm 元数据](https://registry.npmjs.org/react/19.2.8) 与 [React DOM 19.2.8](https://registry.npmjs.org/react-dom/19.2.8) | npm 精确版本 | 包版本与 `gitHead` 对齐。 |

## 本地版本核对

| 包 | `package.json` | `package-lock.json` | `node_modules` |
| --- | --- | --- | --- |
| `react` | `19.2.8` | `19.2.8` | `19.2.8` |
| `react-dom` | `19.2.8` | `19.2.8` | `19.2.8` |
| `@types/react` | `19.2.18` | `19.2.18` | `19.2.18` |
| `@types/react-dom` | `19.2.4` | `19.2.4` | `19.2.4` |

核对命令读取了三个位置的版本；React npm 元数据和 tag 都报告 `gitHead=1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。

## 公共 API 合同

### 1. 输入 State 与结果 State

输入必须使用当前值同步回显，结果可以使用 deferred 值或 Transition 结果。最小结构如下：

```tsx
const [query, setQuery] = useState('')
const deferredQuery = useDeferredValue(query)
const isStale = query !== deferredQuery

return (
  <>
    <label>
      搜索
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
    </label>
    <p role="status">{isStale ? '结果正在追赶输入' : '结果已同步'}</p>
    <SearchResults query={deferredQuery} />
  </>
)
```

`setQuery` 的同步性是可用性合同，不是性能建议。结果子树必须能在旧 query 仍然显示时继续工作；
若新 deferred query 读取资源并挂起，用户先看到旧结果而不是输入卡顿或空白。

### 2. `startTransition` 与 `useTransition`

standalone API 与 Hook 的共同核心是把 State 更新标记为非紧急 Transition：

```tsx
import { startTransition, useTransition } from 'react'

startTransition(() => {
  setSelectedResult(nextId)
})

const [isPending, startTransitionInComponent] = useTransition()
```

`startTransition` 的回调立即执行，返回 `void`；它不提供 pending。组件需要 pending 文案时使用
`useTransition`，Hook 外（例如数据层）只能使用 standalone API。Transition render 可被更紧急更新
中断并重启，因此 render 必须纯净，不能依赖固定 render 次数或固定延时。

### 3. async Action 的边界

传给 `useTransition` 的 start 函数可接收同步或返回 Promise 的 Action。React 会在 Action 期间报告
`isPending=true`，并在 Action 完成且最终状态可见后结束 pending：

```tsx
const [isPending, startTransition] = useTransition()

function applyPreset() {
  startTransition(async () => {
    const preset = await waitForLocalApproval()
    startTransition(() => {
      setPreset(preset)
    })
  })
}
```

当前限制是 `await` 后的 setter 不会自动继承 Transition；每次等待返回后都要重新调用
`startTransition`。不能写 `await startTransition(...)`，因为 API 返回 `void`。外层 pending 只描述
React 观察到的 Action/最终 State 生命周期，不代表网络、数据库或其他副作用成功。

Action 不保证多个异步调用的业务完成顺序，也不自动取消旧请求。需要 last-write-wins、FIFO、去重或
取消时，应用必须额外保存请求身份；本地 Demo 用“一个放行器、一个按钮、pending 时禁用同一入口”消除
不确定性，而不是暗示 React 内置了队列。

### 4. `useDeferredValue`

```ts
const deferredQuery = useDeferredValue(query)
const deferredWithInitial = useDeferredValue(query, '')
```

默认情况下首次 render 没有旧值可显示，因此返回当前 `value`；后续 `value` 改变且后台内容尚未提交时，
返回上一版本。`initialValue` 只影响首次 render，不是每次更新的 loading 值。后台 render 可被新的输入
中断，React 会以最新传入值重新开始；没有固定延迟。

它不会把 `value` 的更新变成 Transition，也不会延迟或去重请求。若 Promise 挂起，React 会结合
`useDeferredValue` 让旧内容继续显示；`isStale` 只表示输入和结果使用的两个值不同。

### 5. Suspense 与 `use`

```tsx
import { Suspense, use } from 'react'

function SearchResults({ query }: { query: string }) {
  const items = use(getCachedSearchPromise(query))
  return <ResultList items={items} />
}

return (
  <Suspense fallback={<p role="status">正在读取结果…</p>}>
    <SearchResults query={deferredQuery} />
  </Suspense>
)
```

传给 `use` 的 Promise 必须在模块级或框架缓存中复用同一实例；不能每次 render 新建 Promise，否则
每次重渲染都会重新挂起。Promise pending 时最近的 Suspense 显示 fallback，resolve 后重试 children，
reject 后交给最近 Error Boundary。Effect 或事件函数中的 `fetch` 不会自动激活 Suspense。

边界内的 children 默认共同 reveal；需要渐进显示时再嵌套边界。已显示内容再次挂起时，普通更新可能
重新显示 fallback；由 Transition 或 deferred value 触发的更新可保留旧内容。这个保留语义不等于
Suspense 已经知道请求的业务状态。

### 6. Activity

```tsx
import { Activity } from 'react'

<Activity mode={detailsOpen ? 'visible' : 'hidden'} name="search-details">
  <DetailsPanel selectedId={selectedId} />
</Activity>
```

`mode` 只接受 `'visible'` 或 `'hidden'`，省略时默认为 `'visible'`；`children` 必填，`name` 是可选的
DevTools/instrumentation 名称。hidden 状态对宿主 DOM 应用 `display:none`，清理后代 Effects，并降低
后代更新优先级，但保留 State 和 DOM。visible 会恢复显示并建立 Effects。

Activity 不提供数据 fallback、不捕获错误、不管理请求顺序。首次 hidden 仍可能以低优先级 render，且
不建立 Effects；只有 Suspense 可识别的资源（例如 `use` 读取的缓存 Promise）会在预渲染中读取。

## 四类机制如何协作

### 状态向量

| 状态 | 由谁拥有 | 用户可观察结果 | 不应由谁替代 |
| --- | --- | --- | --- |
| `query` | `useState` | 输入框即时回显 | `isPending`、`deferredQuery` |
| `deferredQuery` | `useDeferredValue` | 结果区可暂时使用旧 query | 请求完成标志、输入值 |
| `isPending` | `useTransition` | Action 的轻量进行中反馈 | 网络 loading、成功状态 |
| Promise 状态 | Suspense 数据源 | fallback 或真实结果 | `isStale`、Activity hidden |
| `detailsOpen` | `useState` | 详情面板是否可见 | Suspense fallback |
| 详情 Effect | Activity 管理 | hidden 时 cleanup，visible 时恢复 | CSS 隐藏、卸载重建 |

### 一次查询的确定性顺序

```text
输入事件
  -> setQuery(最新值)（紧急，输入立即更新）
  -> deferredQuery 暂时仍是旧值
  -> 结果读取旧 Promise，旧列表保持显示
  -> 后台尝试读取新 query 的缓存 Promise
  -> Promise pending：最近 Suspense 可等待；stale 标记保持
  -> 用户推进本地放行器
  -> Promise resolve，结果重试并提交
  -> deferredQuery 追上 query，stale 标记消失
```

这里的“后台”不表示网络线程；本地放行器只是把 Promise 的 resolve 暴露成按钮，使每一步可观察。

### 一次异步筛选 Action 的顺序

```text
点击“应用预设”
  -> startTransition(async Action)
  -> isPending=true，输入和普通按钮仍可响应
  -> Action await 本地确认 Promise
  -> 确认 Promise resolve
  -> 内层 startTransition(() => setPreset(...))
  -> 结果视图提交新 preset
  -> isPending=false
```

Action 的确认 Promise 与搜索 Promise 是两个资源：前者验证 pending/await 边界，后者验证 Suspense/deferred
边界。把它们共用一个 Promise 会让观察结果无法归因。

### Activity 详情面板的顺序

```text
打开详情 -> mode="visible" -> DOM 可见、Effect setup
关闭详情 -> mode="hidden" -> 同一 DOM 保留、Effect cleanup、display:none
隐藏期间修改父级 props -> 子树最终可更新，但低于可见工作
再次打开 -> DOM 恢复、State/未受控输入保留、Effect setup 再次执行
```

改变 Activity 的 `key`、组件类型或树位置会触发普通 State 重置；这不是 Activity 的恢复失败，而是
树身份已经改变。

## 确定性本地 Demo 状态机

### 资源与状态定义

```tsx
type Result = { id: string; title: string; available: boolean }
type Preset = 'all' | 'available'
type SearchRequest = { id: string; query: string }

type SearchResource = {
  request: SearchRequest
  query: string
  records: Result[]
  promise: Promise<Result[]>
  resolve: (items: Result[]) => void
}

const searchResources = new Map<string, SearchResource>()

/** 为一次搜索提交创建资源，并在该 requestId 的 render 重试间复用 Promise。 */
function prepareSearchResource(request: SearchRequest): SearchResource {
  const existing = searchResources.get(request.id)
  if (existing) return existing

  let resolvePromise: (items: Result[]) => void = () => undefined
  const resource: SearchResource = {
    request,
    query: request.query,
    records: findSearchRecords(request.query),
    promise: new Promise<Result[]>((resolve) => {
      resolvePromise = resolve
    }),
    resolve: resolvePromise,
  }
  searchResources.set(request.id, resource)
  return resource
}

/** 读取已登记请求的稳定 Promise。 */
function getSearchPromise(requestId: string): Promise<Result[]> {
  return searchResources.get(requestId)!.promise
}

/** 放行指定请求预先计算的固定结果。 */
function resolveSearchResource(requestId: string) {
  const resource = searchResources.get(requestId)
  if (resource) resource.resolve(resource.records)
}
```

实际 Demo 在 `SearchResults` 组件中调用
`const items = use(getSearchPromise(request.id))`，不在普通工具函数中调用 `use`。初始状态不登记搜索
资源；每次点击“执行搜索”都为当前输入建立新的请求 ID 和 pending Promise，再由“放行最新搜索”
推进。这样首次搜索、重复查询和重新挂载都不会读取上一轮已兑现的资源。

### 搜索事件与结果组件

```tsx
function SearchWorkspace() {
  const [query, setQuery] = useState('')
  const [requestSequence, setRequestSequence] = useState(0)
  const [requestedRequest, setRequestedRequest] = useState<SearchRequest | null>(null)
  const [hasVisibleResults, setHasVisibleResults] = useState(false)
  const deferredRequest = useDeferredValue(requestedRequest)
  const resultRequest = hasVisibleResults && deferredRequest ? deferredRequest : requestedRequest
  const isStale = Boolean(
    requestedRequest && deferredRequest && requestedRequest.id !== deferredRequest.id,
  )

  /** 输入只更新受控值，不创建异步资源。 */
  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  /** 每次提交都登记新的 requestId 和 Promise，重复 query 也不会复用旧提交。 */
  function submitSearch() {
    const nextSequence = requestSequence + 1
    const request = { id: `search-${nextSequence}`, query: query.trim() }
    prepareSearchResource(request)
    setRequestSequence(nextSequence)
    setRequestedRequest(request)
  }

  /** 兑现当前请求，并允许后续提交暂时保留已显示结果。 */
  function releaseSearch() {
    if (!requestedRequest) return
    resolveSearchResource(requestedRequest.id)
    setHasVisibleResults(true)
  }

  return (
    <>
      <input value={query} onChange={handleQueryChange} />
      <button onClick={submitSearch}>执行搜索</button>
      <button onClick={releaseSearch}>放行搜索</button>
      <p role="status">{isStale ? '结果正在追赶输入' : '结果已同步'}</p>
      <Suspense fallback={<p role="status">正在读取结果…</p>}>
        {resultRequest ? <SearchResults request={resultRequest} /> : null}
      </Suspense>
    </>
  )
}

function SearchResults({ request }: { request: SearchRequest }) {
  const items = use(getSearchPromise(request.id))
  return <ResultList items={items} />
}
```

验证 query `a` 到 `ab` 的顺序：提交并放行 `a`，输入并提交 `ab`，应同时看到输入 `ab`、结果 `a` 和
stale 文案；放行 `ab` 后结果再变为 `ab`。重复提交 `ab` 时必须得到新的 requestId 和 pending Promise。
如果 fallback 替换了旧结果，检查结果树是否使用了最新请求而不是 deferred 请求。

### async Action 放行器

```tsx
const approvalControl = createManualControl<Preset>()

/** 用异步 Action 演示 pending 与 await 后重新包裹 setter。 */
function PresetButton() {
  const [isPending, startTransition] = useTransition()
  const [preset, setPreset] = useState<Preset>('all')

  /** 创建一个新的确认 Promise，并启动非紧急筛选更新。 */
  function applyAvailablePreset() {
    const approvalPromise = approvalControl.open()
    startTransition(async () => {
      const nextPreset = await approvalPromise
      startTransition(() => {
        setPreset(nextPreset)
      })
    })
  }

  return (
    <>
      <button disabled={isPending} onClick={applyAvailablePreset}>
        应用仅可用
      </button>
      <span role="status">{isPending ? '筛选 Action 进行中' : `当前预设：${preset}`}</span>
    </>
  )
}
```

`approvalControl.open()` 为本次 Action 建立新的 pending Promise；Demo 的“完成筛选 Action”按钮调用
`approvalControl.resolve('available')`。按钮 disabled 是为了让状态机保持单一在途 Action，不是 React
自动提供的队列语义。验证时先点击应用，确认 `isPending=true` 且输入仍能修改，再推进放行器，确认新
preset 提交后 pending 归零。

### Activity 详情面板

```tsx
function DetailsArea({ selectedId }: { selectedId: string | null }) {
  const isVisible = selectedId !== null
  return (
    <Activity mode={isVisible ? 'visible' : 'hidden'} name="search-details">
      <DetailsPanel selectedId={selectedId} />
    </Activity>
  )
}
```

`DetailsPanel` 应包含一个由 State 驱动的计数器和一个未受控 textarea。验证记录至少包括：

1. 关闭面板后宿主节点仍 `isConnected=true`，计算样式为 `display:none`。
2. 关闭时 Effect cleanup 增加，打开时 setup 再增加；不把开发 Strict Mode 的额外一次 setup 当成生产
   次数合同。
3. 关闭前输入的 textarea 草稿、计数器 State 和 DOM 节点身份在重新打开后相同。
4. 改变 `key` 后再打开，State/DOM 重置，这是树身份规则而非 Activity 错误。

## 适用与不适用范围

### 适用

- 搜索输入必须顺滑，而结果列表 render 或数据读取可以稍后完成。
- 需要在旧结果仍可见时显示“正在追赶”而不是把整个工作区换成空白 spinner。
- 需要把本地筛选、选中项或视图切换标为非紧急更新，并用 `isPending` 给出就地反馈。
- 需要让用户关闭详情、编辑器或预览后再打开仍保留草稿和 DOM 临时状态。
- 能够把异步 Action 的成功、错误和请求身份单独建模的应用。

### 不适用

- 输入控制 State、光标位置等必须同步反映的交互。
- 需要严格请求顺序、取消旧请求、事务提交或持久化回执的业务流程。
- 把 Transition 当作 debounce、后台线程、Promise、计时器或性能数字保证。
- 把 stale boolean 当作网络 loading、把 `isPending` 当作错误状态、把 Suspense fallback 当作失败 UI。
- 用 CSS 隐藏代替 Activity，或把 hidden Activity 当作零成本冻结快照。
- 在 render 中为 `use` 每次创建新 Promise，或把 Effect 请求误认为 Suspense 数据源。

## 高价值易错项

### 1. 把输入 State 放进 Transition

- **触发条件：** 为了“让搜索框也不阻塞”，把 `setQuery` 放入 `startTransition`。
- **原因：** 受控输入需要在输入事件中同步更新；Transition 更新可被中断，不能承担逐字符回显。
- **后果：** 输入显示滞后、光标体验异常，或在快速输入时丢失用户正在编辑的值。
- **错误示例：**

  ```tsx
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => setQuery(event.target.value))
  }
  ```

- **正确示例：**

  ```tsx
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }
  const deferredQuery = useDeferredValue(query)
  ```

- **验证方式：** 在输入框连续键入 `abcdef`，逐次读取 `input.value`；它必须立即等于最新事件值，结果区
  可以暂时落后。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S3、S19。

### 2. 把 `startTransition` 当作延时器

- **触发条件：** 认为 Action 回调会稍后执行，于是把准备数据或副作用放在“预计的后台时段”。
- **原因：** React 立即调用 Action；只有回调内同步安排的 State 更新被标记为 Transition。
- **后果：** 日志、请求和 setter 的时机被误判；`setTimeout` 中发生的 setter 也不会自动继承 Transition。
- **错误示例：**

  ```tsx
  startTransition(() => {
    setTimeout(() => setSelectedId(id), 300)
  })
  ```

- **正确示例：**

  ```tsx
  setTimeout(() => {
    startTransition(() => setSelectedId(id))
  }, 300)
  ```

- **验证方式：** 在 Action 前后和 Action 内打印同步日志；顺序应是“前、内、后”。检查延迟回调中的更新
  必须显式再次调用 `startTransition`。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S8、S12。

### 3. 忘记 `await` 后的内层 Transition

- **触发条件：** async Action 等待本地 Promise 或网络后直接调用 setter。
- **原因：** React 19.2 当前只自动标记 Action 内同步更新；异步边界恢复后的 setter 需要重新包裹。
- **后果：** 更新可能变成普通紧急更新，Suspense 再次挂起时出现不期望的 fallback，pending 观察与结果
  提交边界不一致。
- **错误示例：**

  ```tsx
  startTransition(async () => {
    const next = await gate.promise
    setPreset(next)
  })
  ```

- **正确示例：**

  ```tsx
  startTransition(async () => {
    const next = await gate.promise
    startTransition(() => setPreset(next))
  })
  ```

- **验证方式：** 让 Action Promise 保持 pending，确认 `isPending=true`；放行后检查结果提交期间没有错误
  fallback，且 `isPending` 在最终 State 可见后才归零。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S8、S13、S14、S19。

### 4. 把 Transition pending 当作业务结果或顺序保证

- **触发条件：** 等待 standalone `startTransition` 的返回值，或用 `isPending=false` 判断请求成功、错误归属
  和最后一次请求是否胜出。
- **原因：** standalone API 返回 `void`，不提供 pending；`useTransition` 的 `isPending` 只覆盖 React
  观察到的 Action 生命周期。React 不推断业务成功，也不自动取消旧 Action 或保证完成顺序。
- **后果：** `await startTransition(...)` 立即结束，慢请求可能覆盖新结果，成功提示也可能与服务端状态不一致。
- **错误示例：**

  ```tsx
  await startTransition(async () => {
    const data = await fetchResult(query)
    setResults(data)
  })
  ```

- **正确示例：** 组件内用 `useTransition` 表达 Action pending；为每次业务请求生成 `requestId`，在应用层
  比较身份后再提交，或明确禁用重复入口。Transition 只包裹最终 UI 更新。
- **验证方式：** TypeScript 应确认 standalone 返回 `void`；再用两个手动 Promise 反向放行，确认加入
  身份检查后旧结果不能覆盖新结果。
- **适用版本：** React 19.2。
- **来源：** S1、S2、S14、S19。

### 5. 每次 render 创建新的 Promise

- **触发条件：** 在 `SearchResults` render 中直接写 `use(fetch('/api?q=' + query))` 或 `new Promise(...)`。
- **原因：** `use` 要求 Promise 缓存并复用同一实例；新实例让 React 每次 render 都看到未完成资源。
- **后果：** fallback 反复出现、结果无法稳定 resolve，甚至出现 uncached promise 警告。
- **错误示例：**

  ```tsx
  function SearchResults({ query }: Props) {
    const items = use(fetchItems(query))
    return <List items={items} />
  }
  ```

- **正确示例：** 每次提交生成 requestId，模块级 `Map<string, Promise<Result[]>>` 按 requestId 保存
  Promise；同一请求的 render 重试复用该实例，重复 query 的新提交使用新的 requestId。
- **验证方式：** 父组件无关 State 重渲染时，同一 requestId 的 Promise 引用必须相同；重复提交同一 query
  时，新 requestId 必须重新进入 pending。
- **适用版本：** React 19.2。
- **来源：** S3、S4、S5、S9、S19。

### 6. 期待 Effect 请求自动触发 Suspense

- **触发条件：** 在 `useEffect` 中 `fetch`，并认为外层 `<Suspense>` 会显示 fallback。
- **原因：** Suspense 只识别 render 期间支持的挂起源；Effect 和事件函数发生在 render 之后。
- **后果：** 页面先显示空结果，fallback 不出现；开发者又增加第二套 loading 状态，状态互相冲突。
- **错误示例：**

  ```tsx
  function Results() {
    const [items, setItems] = useState<Result[] | null>(null)
    useEffect(() => {
      fetchItems().then(setItems)
    }, [])
    return <List items={items ?? []} />
  }
  ```

- **正确示例：** 使用框架提供的 Suspense 数据源，或使用稳定缓存 Promise 并在 render 中 `use` 读取；若
  选择 Effect，就明确自己管理 loading/error State，不再期待 Suspense。
- **验证方式：** 清空结果并观察 fallback 是否由 Promise pending 立即接管；若只在 Effect 完成后变化，说明
  这不是 Suspense 挂起路径。
- **适用版本：** React 19.2。
- **来源：** S4、S5、S6、S11。

### 7. 把 stale 值当作请求 loading

- **触发条件：** 用 `query !== deferredQuery` 禁用所有按钮、显示失败或取消提示。
- **原因：** stale 只表示结果子树仍使用旧 deferred 值；它可能是后台 render、Suspense pending 或极快更新
  的瞬间，不包含请求协议。
- **后果：** 快速输入时错误禁用交互；请求已失败或已取消时仍显示“正在加载”。
- **错误示例：**

  ```tsx
  const isLoading = query !== deferredQuery
  <button disabled={isLoading}>清空</button>
  ```

- **正确示例：** stale 只用于结果区提示；请求 phase、错误和取消由资源层独立建模。
- **验证方式：** 让已缓存 query 在无 Promise pending 时改变；若仍能看到短暂 stale，说明该值不是网络 loading。
- **适用版本：** React 19.2。
- **来源：** S3、S9。

### 8. 认为 Suspense 一定会显示 fallback

- **触发条件：** deferred query 的新资源 pending 时，断言用户必须看到 spinner。
- **原因：** `useDeferredValue` 与 Transition 触发的再次挂起可以保留已显示内容，避免 fallback 闪回；首次
  挂起或普通更新才按边界显示 fallback。
- **后果：** 为了“证明 loading”额外清空旧列表，破坏 stale UI 的连续性。
- **错误示例：**

  ```tsx
  if (isStale) return <Loading />
  return <Suspense fallback={<Loading />}><Results query={deferredQuery} /></Suspense>
  ```

- **正确示例：** 保留旧结果并标记 `role="status"`；只有最近 Suspense 在没有可保留内容时负责 fallback。
- **验证方式：** 先 resolve 旧 query，再输入新 query 并保持新资源 pending；旧结果节点应继续连接，stale 文案
  应存在，不能只剩 fallback。
- **适用版本：** React 19.2。
- **来源：** S3、S4、S9、S10、S16。

### 9. 把 Activity 当作 CSS 隐藏、冻结快照或真正卸载

- **触发条件：** 详情关闭时只设置 `display:none`，却期待 Effect cleanup；或认为 Activity hidden 后代
  不再 render、DOM 已卸载，恢复时应获得全新 State。
- **原因：** CSS 只改变绘制。Activity hidden 会清理 Effects、保留 State 与 DOM，并降低隐藏更新的
  优先级；它既不是静态冻结，也不是条件卸载。
- **后果：** CSS 版本的订阅继续运行；错误的条件卸载或 key 变化又会清空草稿、重建 DOM，并掩盖
  Activity 的恢复语义。
- **错误示例：**

  ```tsx
  {open ? <DetailsPanel key={selectedId} /> : null}
  ```

- **正确示例：**

  ```tsx
  <Activity mode={open ? 'visible' : 'hidden'}>
    <DetailsPanel />
  </Activity>
  ```

- **验证方式：** 关闭前输入草稿并修改 State；关闭后检查 Effect cleanup、DOM `isConnected` 和 computed
  `display`，再推进父级 revision 并恢复。草稿、State、revision 和 DOM identity 应保留。
- **适用版本：** React 19.2。
- **来源：** S6、S7、S11、S17。

### 10. 用固定次数或毫秒数描述并发结果

- **触发条件：** 以“下一帧必定追上”“300ms 后一定 reveal”“Effect 一定执行两次”写验证断言。
- **原因：** render 可中断/重启，Suspense reveal 有启发式批处理，Strict Mode 会增加开发环境 Effect 检查；
  React 公共合同只承诺最终语义。
- **后果：** 快机器、慢机器、生产构建与开发构建产生互相矛盾的测试结果。
- **错误示例：** `await page.waitForTimeout(300); expect(setupCount).toBe(2)`。
- **正确示例：** 等待可观察条件：Promise 已 resolve、元素可见、stale 文案消失、DOM 节点 identity 相同；只断言
  相对顺序和最终状态，不断言内部次数。
- **验证方式：** 重复运行不同 CPU/viewport 配置，若只依赖状态条件仍稳定通过，说明测试没有绑定调度细节。
- **适用版本：** React 19.2。
- **来源：** S1、S3、S4、S6、S7、S14-S18。

## 观测与验收矩阵

| 阶段 | 操作 | 必须观察 | 不应断言 |
| --- | --- | --- | --- |
| 初始 | 尚未提交搜索 | 输入和控制可用，结果显示“尚未搜索” | 具体 render 次数 |
| 首次搜索 | 执行搜索，不放行资源 | 最近 Suspense 显示 fallback，控制区仍可用 | 固定等待毫秒数 |
| 查询追赶 | 输入新 query，不放行资源 | 输入是新值、结果是旧值、stale 存在 | 一定出现 fallback |
| 查询完成 | 放行新 query | 新结果出现、stale 消失、旧节点被替换为新结果 | 固定等待毫秒数 |
| Action pending | 点击不同详情，不放行确认 Promise | `isPending=true`，输入和普通按钮仍可用，结果选择禁用 | 网络已成功 |
| Action complete | 放行确认 Promise | 内层 Transition 提交详情，pending 归零 | Action 自动 FIFO |
| Activity hidden | 关闭详情 | DOM connected、`display:none`、cleanup 发生 | DOM 已卸载 |
| Activity restore | 再次打开详情 | State/textarea/DOM identity 保留，Effect 重建 | 固定 setup 次数 |
| Activity identity reset | 改 key 后打开 | State 和 DOM 按新身份重置 | Activity 丢失 State |

## 本科范围的知识边界

本主题只要求理解 React 19.2 的四个公共机制和一个可控 UI 状态机：同步输入与非紧急结果的分离、
Action pending、deferred stale、Suspense 等待、Activity 隐藏恢复。可以解释它们的输入、输出、生命周期
和错误边界，并能从 DOM、状态文本和手动放行器观察最终结果。

不要求读 Fiber 源码、实现调度器、编写网络缓存库、设计服务端搜索协议、讨论 SSR/RSC 或计算机体系结构。
当遇到真实请求竞态时，只需指出 Transition 不提供顺序保证，并说明应由独立请求身份协议解决，不在此课
扩展成数据层工程。

## 来源使用说明

- S1-S7、S19 是公共 API 的主要证据；S8-S11 用来固定官网文字，S12-S18 仅作 `19.2.8` 的实现/测试
  旁证，S20 用来锁定发布包身份。
- 官方测试中的 `act`、内部 renderer、flush 以及特定 render 次数只用于验证当前 patch，不应复制成应用
  代码或教学断言。
- 所有示例均假定上述固定版本；若未来 React 增加 Activity 模式、改变 async Action 的 await 语义或
  调整 Suspense 数据源合同，应重新核对文档、类型和源码，不应直接沿用本文结论。
