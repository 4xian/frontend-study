---
id: react.core.learn.advanced.lab-concurrent-search-workspace
type: lesson
title: 实战：并发搜索工作区
summary: 组合 Transition、useDeferredValue、Suspense 和 Activity，构建输入可响应、结果可追赶、详情可恢复的搜索界面。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 180
prerequisites:
  - react.core.learn.advanced.use-transition-pending-action
  - react.core.learn.advanced.use-deferred-value-stale-content
  - react.core.learn.advanced.suspense-fallback-boundary
  - react.core.learn.advanced.activity-hidden-state-restoration
related:
  - react.core.learn.advanced.use-resource-reading
  - react.core.learn.intermediate.state-preservation-and-reset
tags:
  - React
  - 实战
  - Transition
  - useTransition
  - useDeferredValue
  - Suspense
  - Activity
  - 并发 UI
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能把受控输入、结果查询、详情选择和详情显隐拆成不同的状态源。
  - 能让受控输入保持同步，把可以稍后显示的结果视图交给 useDeferredValue 或 Transition。
  - 能用稳定的 Promise 资源配合 use 和 Suspense 表达首次搜索等待，并保留持续可用的控制区。
  - 能在异步 Transition 的 await 后再次包裹 State 更新，并用 isPending 表达详情选择仍在进行。
  - 能用 Activity hidden 保留详情 State、未受控草稿和 DOM 身份，同时观察 Effect cleanup 与恢复。
  - 能说明 stale、isPending、Suspense fallback 和 Activity hidden 各自表示什么，以及不能表示什么。
  - 能为本地搜索、异步详情和完整重建设计稳定身份，避免在 render 中创建新的 Promise。
  - 能用最终 DOM 状态和相对生命周期验证并发 UI，而不依赖固定毫秒数或 render 次数。
recap:
  - 输入 State 必须同步更新；Transition 和 deferred value 只作用于允许暂时落后的结果或视图。
  - useDeferredValue 返回旧值时，结果区可以继续显示旧内容，并用输入值与 deferred 值的差异标记 stale。
  - Suspense 只处理 render 期间可读的 pending 资源；稳定 Promise resolve 后，边界会重试 children。
  - async Transition 的 await 后 State setter 需要再次调用 startTransition；isPending 不是网络成功信号。
  - Activity hidden 隐藏 DOM、清理后代 Effect，但保留同一树身份下的 State 和 DOM。
  - 资源身份、Action 身份和组件树身份是三种不同合同，不能用一个布尔值替代它们。
sources:
  - title: useTransition
    url: https://react.dev/reference/react/useTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useTransition 的返回值、同步与异步 Action、pending 生命周期、await 后重新包裹和受控输入边界。
  - title: startTransition
    url: https://react.dev/reference/react/startTransition
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Action 立即执行、State 更新的非阻塞语义、可中断渲染、void 返回值和组件外调用边界。
  - title: useDeferredValue
    url: https://react.dev/reference/react/useDeferredValue
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 旧值追赶、后台 render、stale 判断、Suspense 组合与不负责取消请求的边界。
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - fallback 替换范围、最近边界、共同 reveal、已显示内容保护和 render 挂起源。
  - title: use
    url: https://react.dev/reference/react/use
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Promise 的读取、稳定实例复用、pending/fulfilled/rejected 分支和 Error Boundary 传播。
  - title: Activity
    url: https://react.dev/reference/react/Activity
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - visible/hidden 模式、DOM 与 State 保留、Effect 清理和隐藏更新优先级。
  - title: React 19.2 fixed documentation
    url: https://github.com/reactjs/react.dev/tree/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a/src/content/reference/react
    sourceType: source-code
    appliesTo: React 19.2
    claims:
      - 固定官方 Reference 文字，避免在线页面内容漂移。
  - title: React 19.2.8 fixed source and tests
    url: https://github.com/facebook/react/tree/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 当前 patch 对 Transition、deferred value、Suspense 和 Activity 公开行为的实现旁证。
---

# 实战：并发搜索工作区

## 一、学习目标

这个工作区同时处理四类不同速度的状态：输入框必须逐字符响应，搜索结果允许暂时落后，详情选择需要等待一次
异步确认，详情面板关闭后还要保留编辑现场。四个 React 机制分别负责其中一类问题，不互相冒充。

完成本节后，应能回答以下问题：

- 为什么受控 `<input>` 的 State 不能放进 Transition？
- `query !== deferredQuery` 能说明什么，不能说明什么？
- 为什么 `use` 读取的 Promise 必须在 render 之外稳定复用？
- 为什么 Suspense fallback 不应该包住搜索输入和控制按钮？
- 为什么 `await` 返回后要再次调用 `startTransition`？
- Activity hidden 与条件卸载、手工 CSS 隐藏分别有什么差异？

## 二、问题场景与验收条件

界面包含一个搜索框、一个结果区和一个详情区。用户输入时不能感觉到输入被“等结果”阻塞；结果资源未准备好时，
结果区需要表达等待或保留旧结果；点击结果后，旧详情要在异步选择完成前继续显示；详情暂时关闭时，State、未受控
草稿和 DOM 身份都要保留。

本地 Demo 使用固定目录和手动 Promise 放行器，因此每个阶段都可以停在浏览器中检查：

| 场景 | 操作 | 必须看到的结果 |
| --- | --- | --- |
| 冷启动 | 查看页面 | 输入和控制按钮可用，结果区等待第一次搜索。 |
| 首次搜索 | 点击“执行搜索” | 结果区域显示 Suspense fallback，输入和其他按钮仍可用。 |
| 首次完成 | 点击“放行最新搜索” | 固定结果显示，fallback 消失。 |
| 结果追赶 | 修改搜索词并再次执行搜索，不放行 | 输入显示新词，旧结果保留，状态标为 stale。 |
| 结果完成 | 放行最新搜索 | 新结果显示，stale 状态消失。 |
| 详情等待 | 点击结果，保持 gate 未放行 | `isPending` 为 pending，旧详情保持可见，结果选择暂时禁用。 |
| 详情提交 | 点击“放行详情选择” | 新详情提交，pending 回到 idle。 |
| 隐藏恢复 | 输入草稿、记录检查、隐藏再显示 | 草稿、计数器和 DOM identity 保持，Effect cleanup/setup 日志变化。 |
| 完整重建 | 点击“重建实验” | 资源、State、日志和 DOM 重新回到冷启动。 |

这里的手动放行只控制本地 Promise，不模拟真实网络速度。Transition、Suspense 和 Activity 不提供业务请求的取消、
排序、去重或持久化确认；这些需要独立的数据层合同。

:::demo{id="react.core.learn.advanced.lab-concurrent-search-workspace.concurrent-search-demo"}
:::

建议先按表格顺序完整操作一次，再打开源码区对照请求身份、Promise gate、deferred 结果和 Activity 子树。

## 三、先拆出状态向量

并发界面最容易出错的地方，是用一个 `loading` 或 `pending` 布尔值承载多个含义。先把状态按责任分开：

| 状态 | 例子 | 负责机制 | 对用户的含义 |
| --- | --- | --- | --- |
| 输入值 | `query` | `useState` | 输入框此刻应该显示的字符。 |
| 已提交请求 | `{ id, query }` | `useState` | 最近一次要读取的结果身份。 |
| 延后请求 | `deferredRequest` | `useDeferredValue` | 结果区当前允许继续使用的请求。 |
| 资源状态 | Promise pending/fulfilled | `use` + `Suspense` | 结果在 render 中是否可读。 |
| 详情 Action | `isPending` | `useTransition` | 详情选择的非紧急 UI 更新是否仍在进行。 |
| 详情显隐 | `isDetailVisible` | `useState` + `Activity` | 详情面板是否进入 visible 模式。 |
| Effect 生命周期 | setup/cleanup 日志 | `Activity` | 隐藏时同步过程已清理，显示时重新建立。 |

这些状态的差异很重要：

- `query` 是输入合同，必须同步更新，不能由 `deferredRequest` 替代。
- `stale` 只表示输入和结果读取的请求身份不同，不表示网络正在下载，也不表示失败。
- `isPending` 只反映 React 观察到的 Action 生命周期，不表示服务端已成功，也不代表多个 Action 的完成顺序。
- Suspense fallback 表示 render 子树暂时不可读，不表示业务错误；Promise rejection 应交给 Error Boundary。
- Activity hidden 表示子树暂时不可见且 Effect 已清理，不表示组件已经卸载或数据已经持久化。

## 四、受控输入必须保持同步

输入事件应直接更新输入 State：

```tsx
const [query, setQuery] = useState('')

/** 输入值要在事件中同步写入，保证受控 input 立即回显。 */
function updateQuery(event: React.ChangeEvent<HTMLInputElement>): void {
  setQuery(event.target.value)
}
```

不能把 `setQuery` 放入 Transition：

```tsx
// 错误：逐字符回显被标成可中断的非紧急更新。
startTransition(() => {
  setQuery(event.target.value)
})
```

Transition 的 render 可以被更紧急的更新中断或重启，受控输入却需要事件完成后立即反映最新值。正确的拆分是：

```tsx
const [query, setQuery] = useState('')
const deferredQuery = useDeferredValue(query)

return (
  <>
    <input value={query} onChange={(event) => setQuery(event.target.value)} />
    <SearchResults query={deferredQuery} />
  </>
)
```

如果业务要求用户点击“执行搜索”才提交，可以让 `query` 只保存输入，另一个 `requestedRequest` 保存已提交查询。
本 Demo 采用这种方式，并为每次提交生成新的请求 ID，避免同一个查询词再次提交时复用错误的旧 gate。

## 五、用 deferred 值保留旧结果

### 1. 旧值是 UI 的连续性

当 `requestedRequest` 变成新对象时，`useDeferredValue` 可能先返回上一个对象：

```tsx
const deferredRequest = useDeferredValue(requestedRequest)
const isStale = requestedRequest?.id !== deferredRequest?.id
```

结果区读取 `deferredRequest`，输入区继续读取 `query`。因此用户可以同时看到新输入和旧结果。这个状态应该被
明确标记，例如“stale：旧结果仍在显示”，而不是把旧结果伪装成新查询的结果。

### 2. stale 不是 loading

`requestedRequest.id !== deferredRequest.id` 只表示结果子树还在追赶。它不能回答以下问题：

- 新 Promise 是否已经发出？
- 服务器是否返回了错误？
- 结果是否命中缓存？
- 旧请求是否被取消？
- 哪一个请求最终应该胜出？

这些问题必须由资源层或请求协议单独回答。本 Demo 的“放行最新搜索”按钮只兑现当前请求的 Promise，故可以把
deferred 追赶过程固定下来观察。

### 3. 不要把 deferred 值用于 input

下面的写法会让输入显示旧内容：

```tsx
const deferredQuery = useDeferredValue(query)
return <input value={deferredQuery} onChange={updateQuery} />
```

应始终使用 `<input value={query}>`，只把 deferred 值传给允许落后的结果树。

## 六、用稳定 Promise 和 Suspense 读取结果

### 1. Promise 要在 render 外创建

`use` 读取的 Promise 必须在相同资源身份下复用。资源模块用 `Map<string, SearchGate>` 保存每次请求：

```tsx
const searchGates = new Map<string, SearchGate>()

/** 为请求登记一次稳定 Promise。 */
function prepareSearchResource(requestId: string, query: string): Promise<readonly SearchRecord[]> {
  const existing = searchGates.get(requestId)
  if (existing) return existing.promise
  const gate = createSearchGate(query)
  searchGates.set(requestId, gate)
  return gate.promise
}
```

结果组件只负责读取：

```tsx
function SearchResults({ request }: { request: SearchRequest }) {
  const records = use(getSearchPromise(request.id))
  return <ResultList records={records} />
}
```

不要在 render 中直接写 `use(fetchItems(request.query))`，也不要在 render 中对稳定 Promise 再调用 `.then` 创建新
Promise。父组件的无关 State 更新、Suspense 重试和 Transition 重启都可能再次执行 render；如果每次都创建新实例，
React 就无法识别同一个资源已经完成。

### 2. Suspense 只包住结果区

```tsx
<SearchControls />
<Suspense fallback={<p>首次搜索正在准备结果</p>}>
  <SearchResults request={resultRequest} />
</Suspense>
```

输入、搜索按钮、放行按钮和详情控制都属于持续可用的外壳，不应被结果 fallback 一起替换。Suspense fallback 的
边界由“等待期间还需要哪些操作”决定，而不是由组件树的方便程度决定。

首次搜索没有已显示结果，pending Promise 会让最近 Suspense 显示 fallback。已经显示旧结果后，新的 deferred
读取发生挂起时，React 可以保留旧结果；此时用 stale 状态提供轻量反馈，不要手动清空结果再显示另一个 spinner。

### 3. pending 与 rejected 不同

- Promise pending：Suspense 负责显示 fallback 或保留已有内容。
- Promise fulfilled：React 重试挂起的 children，结果进入提交。
- Promise rejected：错误应传播到最近 Error Boundary，不能把错误当作“仍在加载”。

Effect 或事件处理器中的普通 `fetch` 不会自动让 Suspense 感知挂起。如果选择 Effect 请求，就必须自己维护 loading
和 error State；如果选择 `use`，就要提供符合缓存合同的资源。

## 七、用异步 Transition 提交详情

### 1. pending 只描述 React Action

组件中使用：

```tsx
const [isPending, startTransition] = useTransition()
```

点击结果后，Demo 创建详情 gate 并启动异步 Action。旧详情不立即替换，因此用户仍能阅读当前内容：

```tsx
/** 创建详情异步 Action，等待放行后再提交新详情。 */
function selectDetail(nextId: string): void {
  const gate = prepareDetailTransition(nextId)
  startTransition(async () => {
    await gate
    startTransition(() => {
      setSelectedId(nextId)
    })
  })
}
```

`startTransition` 的 Action 函数会立即执行，不能把它理解为定时器、线程或 Promise。等待的是业务代码提供的
`gate`；`isPending` 只是 React 对这段 Action 与最终 State 更新的可见反馈。

### 2. await 后要再次包裹 setter

React 19.2 中，`await` 返回后的 State setter 不会自动继承 Transition 标记。内层 `startTransition` 用来标记最终
提交：

```tsx
startTransition(async () => {
  const nextRecord = await detailGate
  startTransition(() => {
    setSelectedId(nextRecord.id)
  })
})
```

不能写 `await startTransition(...)`，因为 standalone `startTransition` 和 Hook 返回的 start 函数都不把提交 Promise
作为返回值提供。需要严格顺序、取消、去重或 last-write-wins 时，还必须由应用层维护请求身份。Demo 为了可重复观察，
在 pending 期间禁用重复的详情选择入口；这是界面策略，不是 React 自动排队。

### 3. 普通交互仍应可用

Transition 等待时，输入框、搜索控制和隐藏详情按钮仍应响应。不要为了显示 pending 而使用定时器人为拉长过程，也不
要把一个 pending 布尔值扩展成进度百分比、请求数量或成功状态。结果选择按钮在单一 Action pending 期间暂时禁用，
避免创建第二个在途详情 gate；这是本界面的状态机约束，不会阻塞输入、搜索、显隐或重建操作。

## 八、用 Activity 保留详情工作区

### 1. hidden 不等于卸载

```tsx
<Activity mode={isDetailVisible ? 'visible' : 'hidden'} name="并发搜索详情">
  <DetailWorkspace record={selectedRecord} />
</Activity>
```

`mode="hidden"` 会对后代宿主 DOM 使用 `display: none`，清理后代 Effects，并把隐藏更新放在可见工作之后；
它不会因为暂时隐藏就删除 DOM 或重置 State。恢复为 `visible` 时，原来的 State、未受控 `<textarea>` 值和 DOM 身份
可以继续使用，后代 Effects 会重新建立。

### 2. 必须保留稳定树身份

Activity 的恢复依赖 React 的树身份：父级位置、组件类型和 `key` 都保持不变。下面这些变化会触发普通重置：

- 删除 Activity 再重新插入；
- 改变 Activity 或详情组件的 `key`；
- 用另一种组件类型替换原组件；
- 把详情树移动到另一个父级位置。

因此，想保留草稿时只切换 `mode`；确实需要冷启动时，再通过完整重建更换实验实例的 `key`。

### 3. Effect 的可观察边界

详情组件在 Effect 中登记一个同步过程：

```tsx
/** 详情可见时建立同步，Activity hidden 时执行 cleanup。 */
useEffect(() => {
  onEffectEvent('setup')
  return () => onEffectEvent('cleanup')
}, [onEffectEvent])
```

隐藏详情后，检查日志应出现 cleanup；重新显示后应出现新的 setup。不要把开发 Strict Mode 下可能出现的额外检查次数
写成固定合同，验证相对事件和最终状态即可。

### 4. Activity 与 CSS 的差异

```tsx
// 只有视觉变化，不会让 React 清理 Effect。
<section style={{ display: isDetailVisible ? 'block' : 'none' }}>
  <DetailWorkspace />
</section>
```

CSS 可以改变绘制，但不会提供 Activity 的 State/DOM 保留、Effect 生命周期或隐藏更新优先级。Activity hidden 也不是
“零成本冻结”：保留的 DOM 和 State 仍占用资源，隐藏后代仍可能因 props 或 State 变化而 render。

## 九、四类机制的完整状态机

### 1. 首次搜索

```text
点击执行搜索
  -> 登记 requestId 与稳定 Promise
  -> 结果子树在 render 中 use(Promise)
  -> Promise pending
  -> Suspense 显示首次 fallback
  -> 控制区仍可用
点击放行
  -> Promise fulfilled
  -> Suspense 重试 children
  -> 固定结果提交
```

### 2. 新查询追赶

```text
输入 State 立即变化
  -> 创建新的已提交请求
  -> deferred request 暂时保持旧身份
  -> 结果区继续显示旧列表
  -> stale 文案出现
  -> 后台读取新 Promise
点击放行新请求
  -> 新列表提交
  -> deferred request 追上
  -> stale 文案消失
```

### 3. 详情选择

```text
点击结果
  -> 创建详情 gate
  -> startTransition(async Action)
  -> isPending=true，旧详情保持可见
点击放行详情
  -> await 返回
  -> 内层 startTransition 提交 selectedId
  -> 新详情可见
  -> isPending=false
```

### 4. 详情隐藏与恢复

```text
visible
  -> DOM 可见，Effect setup
hidden
  -> DOM 保留但 display:none，Effect cleanup
visible
  -> 原 State、草稿和 DOM identity 恢复，Effect setup
```

四条路径相互独立：Suspense 不负责详情显隐，Activity 不负责 Promise fallback，stale 不负责 Action pending，
isPending 也不负责输入值。

## 十、实现步骤与类型合同

### 1. 先定义固定数据

用只读类型表达结果，避免把 fixture 当作可变 State：

```tsx
type SearchRecord = Readonly<{
  id: string
  title: string
  summary: string
  tags: readonly string[]
}>

type SearchRequest = Readonly<{
  id: string
  query: string
}>
```

`SearchRequest.id` 是一次提交的身份，不是查询词本身。相同查询词再次提交也应创建新的请求身份，便于独立控制
Promise 和观察 stale 过渡。

### 2. 资源模块只管理 Promise

资源模块负责创建、缓存、兑现和清理 gate；组件负责 State 和展示：

```tsx
/** 兑现指定搜索请求，让 Suspense 重试对应结果。 */
export function resolveSearchResource(requestId: string): void {
  searchGates.get(requestId)?.resolve()
}
```

不要把 `Promise` 存进普通 render 局部变量，也不要在结果组件中修改资源 Map。稳定身份减少了重渲染时的歧义。

### 3. 组件分层

建议保持以下职责边界：

- 页面外壳：输入、提交、放行和重建按钮；
- `SearchResults`：只读取 Promise 并渲染固定结果；
- `DetailWorkspace`：拥有计数器、未受控草稿、DOM ref 和 Effect；
- 外层工作区：组合 `useDeferredValue`、`useTransition` 和 `Activity`。

这样 Suspense 只替换结果子树，Activity 只管理详情子树，调试时每个状态都能追溯到唯一来源。

### 4. 重建必须清理身份

完整重建同时做两件事：清理旧 gate，再让内层组件获得新 `key`。只把输入清空而保留旧资源 Map，会让下一次冷启动
意外读到旧 Promise；只清 Map 而不改变树身份，又会保留不应保留的 State 和 DOM。

## 十一、易错使用提示

::::pitfalls
### 错误：把输入 State 放进 Transition

**触发条件：** 为了让搜索框也不阻塞，把 `setQuery` 放进 `startTransition`。

**原因：** 受控输入需要在输入事件中同步更新；Transition 更新可被中断，不能承担逐字符回显。

**后果：** 输入显示滞后，光标体验异常，快速输入时还可能丢失正在编辑的值。

**错误示例：**

```tsx
function onChange(event: React.ChangeEvent<HTMLInputElement>) {
  startTransition(() => setQuery(event.target.value))
}
```

**正确写法：**

```tsx
function onChange(event: React.ChangeEvent<HTMLInputElement>) {
  setQuery(event.target.value)
}
const deferredQuery = useDeferredValue(query)
```

**验证方式：** 连续键入 `abcdef`，逐次读取 `input.value`，确认它立即等于最新事件值；结果区可以暂时落后。

**影响版本：** React 19.2。

**来源：** `useTransition`、`startTransition`、`useDeferredValue` 官方参考。

### 错误：把 `startTransition` 当作延时器

**触发条件：** 认为 Action 回调会稍后执行，把准备数据或副作用放在预计的“后台时段”。

**原因：** React 会立即调用 Action；只有回调内同步安排的 State 更新被标记为 Transition。

**后果：** 日志、请求和 setter 的时机被误判；延迟回调里的更新也不会自动继承 Transition。

**错误示例：**

```tsx
startTransition(() => {
  setTimeout(() => setSelectedId(id), 300)
})
```

**正确写法：**

```tsx
setTimeout(() => {
  startTransition(() => setSelectedId(id))
}, 300)
```

**验证方式：** 在 Action 前、内、后记录同步日志，顺序应是“前、内、后”；延迟回调中的 setter 必须显式重新包裹。

**影响版本：** React 19.2。

**来源：** `useTransition`、`startTransition` 官方参考。

### 错误：忘记 `await` 后的内层 Transition

**触发条件：** async Action 等待 Promise 后直接调用 State setter。

**原因：** `await` 返回后的 setter 不会自动继承 Transition 标记，需要再次调用 `startTransition`。

**后果：** 最终更新可能变成普通紧急更新，pending 观察和结果提交边界不一致。

**错误示例：**

```tsx
startTransition(async () => {
  const next = await gate
  setSelectedId(next.id)
})
```

**正确写法：**

```tsx
startTransition(async () => {
  const next = await gate
  startTransition(() => setSelectedId(next.id))
})
```

**验证方式：** 让 Promise 保持 pending，确认 `isPending` 为 true；放行后确认新详情提交且 pending 归零。

**影响版本：** React 19.2。

**来源：** `useTransition`、`startTransition` 官方参考及 React 19.2 类型声明。

### 错误：把 `isPending` 当业务成功或顺序保证

**触发条件：** 用 `isPending=false` 判断请求成功、错误归属，或认为多个 async Action 会自动按启动顺序完成。

**原因：** `isPending` 只描述 React 观察到的 Action 生命周期；React 不提供业务成功、取消旧请求或 last-write-wins 合同。

**后果：** 慢请求覆盖新结果，错误被错误归因，成功提示与真实业务状态不一致。

**错误示例：**

```tsx
startTransition(async () => {
  const data = await loadResult(query)
  setResults(data)
})
// 看到 isPending=false 就显示“请求成功”
```

**正确写法：**

```tsx
const requestId = ++latestRequestId.current
const data = await loadResult(query)

if (requestId === latestRequestId.current) {
  setResults(data)
}
```

**验证方式：** 用两个手动 Promise 反向放行；加入身份检查后，旧请求不能覆盖新结果，pending 只用于 UI 反馈。

**影响版本：** React 19.2。

**来源：** `useTransition`、`startTransition` 官方参考。

### 错误：每次 render 创建新的 Promise

**触发条件：** 在结果组件中直接调用 `use(fetchItems(query))` 或 `new Promise(...)`。

**原因：** `use` 需要复用同一资源身份；每次 render 产生的新实例都会被 React 当作未完成资源。

**后果：** fallback 反复出现，结果无法稳定 resolve，甚至出现 uncached Promise 警告。

**错误示例：**

```tsx
function SearchResults({ query }: Props) {
  const items = use(fetchItems(query))
  return <List items={items} />
}
```

**正确写法：**

```tsx
const requests = new Map<string, Promise<Result[]>>()

function getRequest(requestId: string) {
  const existing = requests.get(requestId)
  if (existing) return existing

  const request = loadResult(requestId)
  requests.set(requestId, request)
  return request
}
```

**验证方式：** 触发父组件无关 State 更新，确认同一请求的 Promise 引用不变；已放行结果不再次进入 fallback。

**影响版本：** React 19.2。

**来源：** `use`、`useDeferredValue`、`Suspense` 官方参考。

### 错误：把输入和结果一起包在 Suspense

**触发条件：** 为了少写一个边界，把搜索框、控制按钮和结果组件全部放入同一个 `Suspense`。

**原因：** fallback 会替换整个边界范围；输入和放行按钮并不是等待资源的一部分。

**后果：** 首次搜索等待时控制区消失，用户无法继续输入或放行资源。

**错误示例：**

```tsx
<Suspense fallback={<p>正在搜索</p>}>
  <SearchControls />
  <SearchResults request={request} />
</Suspense>
```

**正确写法：**

```tsx
<SearchControls />
<Suspense fallback={<p>正在搜索</p>}>
  <SearchResults request={request} />
</Suspense>
<DetailControls />
```

**验证方式：** 点击首次搜索但不放行，确认 fallback 出现时输入仍能修改，放行按钮仍在且可操作。

**影响版本：** React 19.2。

**来源：** `Suspense` 官方参考及本课 Demo。

### 错误：用 stale 判断请求失败或 loading

**触发条件：** 用 `query !== deferredQuery` 禁用所有按钮，或把它直接显示为失败、取消和网络加载提示。

**原因：** stale 只表示结果子树仍使用旧 deferred 值，不包含 Promise phase、错误和取消协议。

**后果：** 快速输入时错误禁用交互；请求失败时仍显示“正在加载”，用户无法区分两种状态。

**错误示例：**

```tsx
const isLoading = query !== deferredQuery
<button disabled={isLoading}>清空</button>
```

**正确写法：**

```tsx
const isStale = query !== deferredQuery

<section aria-busy={isStale}>
  {isStale ? <p>结果正在追赶新输入</p> : null}
  <SearchResults request={request} />
</section>
```

**验证方式：** 让已缓存查询在没有 pending Promise 时改变；仍可能出现的短暂 stale 说明它不是网络 loading。

**影响版本：** React 19.2。

**来源：** `useDeferredValue` 官方参考。

### 错误：认为 Suspense 一定会显示 fallback

**触发条件：** 新 deferred 资源 pending 时，断言用户必须看到 spinner，并手动清空旧结果。

**原因：** deferred 或 Transition 更新再次挂起时，React 可以保留已显示内容；首次挂起才需要由最近边界显示 fallback。

**后果：** 旧结果的连续性被破坏，用户看不到正在追赶的上下文。

**错误示例：**

```tsx
if (isStale) return <Loading />
return <Suspense fallback={<Loading />}><Results request={request} /></Suspense>
```

**正确写法：**

```tsx
<Suspense fallback={<p>首次结果正在准备</p>}>
  <div aria-busy={isStale}>
    {isStale ? <p>仍在显示上一组结果</p> : null}
    <SearchResults request={request} />
  </div>
</Suspense>
```

**验证方式：** 先放行旧查询，再提交新查询但不放行；旧结果节点应继续连接，stale 文案存在，不能只剩 spinner。

**影响版本：** React 19.2。

**来源：** `useDeferredValue`、`Suspense` 官方参考。

### 错误：用 CSS 隐藏详情或改变 key 代替 Activity

**触发条件：** 只设置 `display:none`，却期待 Effect cleanup；或隐藏时卸载详情、改变 key，认为恢复必须重新 mount。

**原因：** CSS 只改变绘制；Activity hidden 才清理后代 Effect，并保留 State、DOM 与树身份。key 变化会主动重建子树。

**后果：** CSS 版本的订阅仍运行；条件卸载或 key 变化会清空草稿、计数器和 DOM identity，无法观察 Activity 恢复。

**错误示例：**

```tsx
{open ? <DetailsPanel key={selectedId} /> : null}
```

**正确写法：**

```tsx
<Activity mode={open ? 'visible' : 'hidden'}>
  <DetailsPanel />
</Activity>
```

**验证方式：** 关闭前输入草稿并增加计数，隐藏后检查 cleanup、`isConnected=true` 和 `display:none`；恢复后核对草稿、计数器和 identity。

**影响版本：** React 19.2。

**来源：** `Activity` 官方参考、React 19.2 发布说明。

### 错误：用固定次数或毫秒数描述并发结果

**触发条件：** 以“下一帧必定追上”“300ms 后一定 reveal”或“Effect 一定执行两次”写验证断言。

**原因：** render 可以中断/重启，Suspense reveal 可能批处理，Strict Mode 还会增加开发环境检查；公共合同只承诺最终语义。

**后果：** 快慢机器、开发/生产构建和不同视口得到互相矛盾的结果。

**错误示例：**

```tsx
await page.waitForTimeout(300)
expect(setupCount).toBe(2)
```

**正确写法：**

```tsx
await expect(page.getByText('结果正在追赶新输入')).toBeVisible()
await resolveSearchRequest()
await expect(page.getByText('结果正在追赶新输入')).toBeHidden()
await expect(page.getByRole('button', { name: '选择 React 结果' })).toBeVisible()
```

**验证方式：** 在不同 CPU、视口和构建模式重复执行；如果只依赖状态条件仍稳定通过，说明验证没有绑定调度细节。

**影响版本：** React 19.2。

**来源：** `useTransition`、`useDeferredValue`、`Suspense`、`Activity` 官方参考及 React 19.2 测试。

::::

## 十二、可访问性与响应式检查

- 搜索输入必须有可见 `<label>`，结果按钮使用真实 `<button>`，不能把可点击 `<div>` 当作按钮。
- stale、Transition pending 和 Suspense fallback 使用 `aria-live="polite"` 的状态区，状态改变时辅助技术能收到
  简短反馈。
- Activity 外部的显示/隐藏按钮保持可用，并通过 `aria-expanded` 表达当前详情状态；隐藏后不能把恢复入口放入隐藏子树。
- 不用颜色单独表示 stale 或 pending，文案和结构化状态值必须同时存在。
- 结果和详情采用 Flexbox，子项允许换行，长标题使用 `overflow-wrap: anywhere`，避免窄屏横向溢出。
- 用桌面宽度和 390px 左右的窄屏检查：搜索输入、按钮、结果标题、详情草稿、DOM 快照都不能超出父容器。
- 浏览器缩放或根字号变大后，控件应通过换行继续可操作，不依赖固定像素高度容纳长文案。

## 十三、练习与验证顺序

按下面顺序操作，可以把每条合同单独观察出来：

1. 冷启动后直接输入新文字，确认输入值立即变化；此时还没有提交新结果。
2. 执行第一次搜索，确认结果 fallback 出现而输入和放行按钮仍在。
3. 放行第一次搜索，记录结果查询文本和结果列表数量。
4. 执行另一个查询但不放行，确认结果查询仍是旧值、stale 文案存在、旧结果节点仍连接。
5. 放行最新搜索，确认结果查询追上新值，stale 文案消失。
6. 点击不同结果，确认旧详情不立即替换，Transition 状态变为 pending。
7. 在 pending 期间确认结果选择暂时禁用，再修改搜索框或点击隐藏详情，确认其他普通交互仍然响应。
8. 放行详情选择，确认新标题提交且 pending 回到 idle。
9. 在详情草稿输入自定义文字并增加检查次数，隐藏后点击“检查详情 DOM”，确认节点仍 connected 且 display 为
   `none`；再次显示，核对草稿、计数器和 identity。
10. 重建实验，确认日志、计数器、草稿和 DOM identity 回到新实例的初始值。

验证应等待可观察条件，不依赖 `setTimeout`、固定等待毫秒数或固定 Effect 调用次数。开发 Strict Mode 可能额外检查
纯函数和 Effect，不能把这类开发检查次数写成应用合同。

## 十四、适用范围与边界

适合：

- 输入必须顺滑，但结果列表 render 或读取可以稍后完成的界面；
- 需要在旧结果仍可见时表达新结果正在追赶的工作区；
- 需要对面板选择提供 pending 反馈，同时保持普通交互可用的界面；
- 需要暂时关闭详情、编辑器或预览，又希望恢复时保留短期编辑现场的界面。

不适合：

- 输入控制 State、光标位置或逐字符校验必须同步完成的区域；
- 需要严格 FIFO、取消旧请求、事务、持久化回执或服务端排序的业务流程；
- 把 Transition 当作后台线程、debounce、计时器或固定性能数字的代码；
- 把 Activity 当作内存回收、跨刷新持久化或敏感数据删除工具的代码；
- 在 render 中创建未经缓存的 Promise，或把 Effect 请求错误地当作 Suspense 数据源。

## 十五、总结

一个可用的并发搜索工作区需要明确分工：`useState` 让输入同步，`useDeferredValue` 让结果允许追赶，稳定 Promise
和 `Suspense` 让 render 可观察地等待，`useTransition` 让详情选择以非紧急方式提交，`Activity` 让暂时隐藏的详情
保留短期编辑现场。每一种状态都有自己的来源、边界和验证方式；把它们合并成一个 loading 布尔值，反而会丢失用户
真正需要的反馈。

## 十六、参考资料

- [useTransition](https://react.dev/reference/react/useTransition)
- [startTransition](https://react.dev/reference/react/startTransition)
- [useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [Suspense](https://react.dev/reference/react/Suspense)
- [use](https://react.dev/reference/react/use)
- [Activity](https://react.dev/reference/react/Activity)
- [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2)
- [React 官方文档固定提交](https://github.com/reactjs/react.dev/tree/383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a)
- [React 19.2.8 官方源码固定提交](https://github.com/facebook/react/tree/1dd4ecbdabf826f527fc9a58c05ea70375b7d170)
