---
id: react.router.learn.advanced.race-conditions
type: lesson
title: Race Condition
summary: 理解 React Router 如何提交新鲜 revalidation、丢弃过时结果，并识别服务端仍可能发生的数据竞态。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 120
prerequisites:
  - react.router.learn.intermediate.fetcher
  - react.router.learn.intermediate.revalidation
  - react.router.learn.advanced.navigation-concurrency-and-cancellation
related:
  - react.router.learn.advanced.optimistic-ui
  - react.router.learn.intermediate.form-fetcher-choice
tags:
  - React Router
  - Data Mode
  - Race Condition
  - Fetcher
  - Revalidation
  - Stale Data
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
objectives:
  - 能解释两个 Fetcher action 触发的 revalidation 为什么可以并发在途。
  - 能判断较晚启动但先返回的 revalidation 为 fresh，较早启动但后返回的结果为 stale。
  - 能用同一 Fetcher 的连续请求说明旧请求被取消且旧结果不应覆盖新结果。
  - 能区分 Router 防止 stale UI 与服务端处理已取消写入这两个边界。
  - 能为需要更强数据完整性的写入选择幂等键、版本号或服务端时间戳策略。
recap:
  - 普通导航和同一 Fetcher 的新请求会中断自己的旧请求；不同 Fetcher 可以并行。
  - Fetcher action 完成后会触发页面数据 revalidation，Router 会提交 fresh 结果并取消或忽略 stale 结果。
  - stale 的判断依据是请求启动顺序与返回时机，不是哪个请求的业务名称更“新”。
  - 浏览器取消只能释放客户端工作，不能保证已经到达服务端的旧写入停止或回滚。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 本课核验的稳定版本为 React Router 8.3.0，并对应固定官方发布版本。
  - title: Network Concurrency Management
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/concurrency.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Fetcher action 完成后会触发页面数据 revalidation，多个 revalidation 可以同时在途。
      - Router 提交较新的 fresh 结果并避免 stale 数据覆盖界面；客户端取消不保证服务端停止处理。
      - 需要更强保护时，服务端可以使用提交时间戳等规则忽略过时写入。
  - title: Race Conditions
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/race-conditions.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 不同 Fetcher 不能互相打断，同一 Fetcher 的新请求会取消自身旧请求。
      - 多份 revalidation 中，Router 会提交 fresh 响应并取消或忽略 stale 响应。
      - Fetcher 可以用于 type-ahead 场景，避免显示已经不匹配输入值的旧结果。
  - title: React Router 8.3.0 Router Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Router 为 Fetcher 请求和 revalidation 保存启动顺序，并在新鲜结果落地时处理 stale 请求。
      - 过时 Fetcher loader 的结果不会继续作为当前状态提交。
  - title: React Router Fetcher concurrency tests
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/fetchers-test.ts
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖同一 Fetcher 重请求的取消、多个 Fetcher action 的并发 revalidation 和 stale 结果处理。
---

# Race Condition

## 一、学习目标

- 能解释两个独立 Fetcher 同时提交时，为什么页面 loader 可能有多份 revalidation 在途。
- 能根据“启动顺序”和“返回顺序”判断哪个结果可以提交，哪个结果必须被丢弃。
- 能观察同一 Fetcher 连续请求的自取消，并说明旧结果为什么不能更新界面。
- 能把 Router 的客户端竞态保护与服务端幂等、版本检查或时间戳约束分开。

## 二、为什么需要

搜索框、批量操作和快速点击都可能让多个请求同时存在。假设用户先输入“慢”，随后输入“快”，如果慢请求
晚到却仍然写入界面，用户看到的结果就和输入框不一致。另一个常见场景是两个局部操作几乎同时完成：每个
action 完成后都会要求页面重新读取数据，revalidation 的返回顺序可能与启动顺序相反。

浏览器通常会取消被新导航打断的文档请求。Data Router 还需要处理更复杂的 Fetcher 场景：不同 Fetcher
可以并行，同一 Fetcher 的新请求可以取消旧请求，而多个 action 引起的 revalidation 可能同时在途。Router
会将能代表最新事实的结果提交到界面，避免已经过时的响应覆盖当前数据。

这里的“避免覆盖”只描述客户端状态。请求一旦离开浏览器，服务器可能已经接收并执行它；客户端取消不能撤销
数据库写入，也不能自动解决两个服务器操作的版本冲突。

## 三、核心概念

### 1. 请求启动顺序和返回顺序

竞态不是“最后点击的按钮一定最后返回”。可以把每次 revalidation 记为一条带启动序号的时间线：

```text
R1 启动 ------------------------------- 返回较晚  -> stale，不提交
R2 启动 -------- 返回较早 -------------          -> fresh，提交
```

R2 虽然启动得更晚，却先返回。Router 可以提交 R2 的结果；R1 之后返回时已经落后于已落地的新鲜结果，不能
再覆盖页面。判断 stale 的关键是请求何时启动、何时有新鲜结果落地，而不是给请求写一个“旧”或“新”的名称。

### 2. Action 与页面 revalidation

Fetcher action 返回后，Router 会按页面数据依赖重新调用相关 loader。两个独立 Fetcher 的 action 可以在不同
时间完成，因此可能产生 R1、R2 两份并发 revalidation：

```tsx
const first = useFetcher()
const second = useFetcher()

first.submit({ operation: 'A' }, { method: 'post', action: '/items' })
second.submit({ operation: 'B' }, { method: 'post', action: '/items' })
```

这两个 Fetcher 不会因为彼此开始请求而互相取消。它们各自的 action 结束后，Router 会重新获取页面数据，并
按 fresh/stale 规则处理这些 revalidation。应用组件应继续读取 loader data，不要另外复制一个“最后响应”的
React state 来和 Router 争夺数据所有权。

### 3. 同一 Fetcher 的自取消

同一 Fetcher 代表同一个局部交互。当输入框每次变化都提交一次时，新请求会取消该 Fetcher 的旧请求：

```tsx
function CitySearch() {
  const fetcher = useFetcher()

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    fetcher.submit(event.currentTarget.form)
  }

  return (
    <fetcher.Form action="/city-search">
      <input name="q" onChange={handleChange} />
      {fetcher.data ? <SearchResults data={fetcher.data} /> : null}
    </fetcher.Form>
  )
}
```

旧请求的 loader 即使因为网络延迟而晚返回，也不应继续成为这个 Fetcher 的当前 data。这样输入框的查询词
和结果保持同一请求身份。若页面需要同时保留两种互不相关的局部请求，应使用两个 Fetcher，而不是让一个
Fetcher 承担两条业务流。

### 4. Router 防 stale 与服务器数据完整性

客户端和服务器分别有自己的竞态边界：

| 边界 | Router 能做什么 | 仍需应用负责什么 |
| --- | --- | --- |
| 同一 Fetcher | 取消旧请求，忽略旧结果 | 保持输入与结果的请求身份一致 |
| 多 Fetcher revalidation | 提交 fresh，避免 stale UI 覆盖 | 让 loader 返回可比较的业务事实 |
| 浏览器请求取消 | 释放客户端资源 | 不能撤销已到达服务端的副作用 |
| 服务端写入 | 不由 Router 管理事务 | 使用幂等键、版本号、时间戳或事务约束 |

当更新不可重复或顺序很重要时，不能只依赖 `AbortSignal`。例如保存文档时可带上客户端看到的版本号，服务端
发现版本已变化就拒绝旧写入；重试同一请求时可使用幂等键避免重复副作用。

## 四、用法与示例

### 1. 让 Router 管理结果，而不是手写“最后一次请求”变量

错误的实现通常在组件外保存一个可变请求编号：

```tsx
let latestRequest = 0

async function loadResults(query: string) {
  const requestId = ++latestRequest
  const result = await fetch(`/api/search?q=${query}`)
  if (requestId !== latestRequest) return
  return result.json()
}
```

这种代码只保护了一个自定义调用点，无法覆盖 Router 的 action、loader 和 revalidation 生命周期。对于由
Data Router 管理的交互，让 `useFetcher` 或导航生命周期承担请求身份；loader 只返回本次调用的数据。

### 2. 通过 `request.signal` 配合底层工作

Router 会把当前请求的 `AbortSignal` 放进 loader/action 的 `request`。底层 API 支持取消时继续传递它：

```tsx
async function loader({ request }: LoaderFunctionArgs) {
  const response = await fetch('/api/cities', { signal: request.signal })
  return response.json()
}
```

对于自定义 Promise，必须在 `abort` 时清理 timer、移除 listener 或关闭客户端连接。Router 不会猜测你创建
的资源如何释放。取消后不要把捕获到的旧值写进全局 state，也不要在 `finally` 中无条件提交旧结果。

### 3. 读取 Fetcher 状态表达局部 pending

`fetcher.state` 只描述这个 Fetcher：`idle`、`submitting` 或 `loading`。它不等于页面级导航状态；多个
Fetcher 可以同时处于忙碌状态。按钮、结果区域和错误消息应从同一个 Fetcher 读取，避免另建一个与 Router
不同步的 pending 标记。

```tsx
function SaveButton() {
  const fetcher = useFetcher<{ ok: boolean }>()
  const busy = fetcher.state !== 'idle'

  return (
    <fetcher.Form method="post">
      <button type="submit" disabled={busy}>
        {busy ? '保存中' : '保存'}
      </button>
    </fetcher.Form>
  )
}
```

禁用按钮是产品选择，不是 Router 的竞态保证。搜索输入等需要允许新请求替换旧请求的交互，不应因为
`fetcher.state !== 'idle'` 就禁止第二次提交。

### 4. 通过版本或时间戳保护服务端写入

客户端取消不足以保证写入顺序时，把版本约束放在服务端：

```tsx
type UpdatePayload = {
  documentId: string
  expectedVersion: number
  content: string
}

async function updateDocument(payload: UpdatePayload) {
  return db.document.updateIfVersionMatches(payload)
}
```

`updateIfVersionMatches` 代表服务端提供的业务契约，不是 React Router API。真正实现时应由服务端返回明确的
冲突结果，客户端再通过 action data 或错误边界表达“版本已变化”，而不是假设 abort 已经撤销了旧写入。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.advanced.race-conditions.race-conditions-demo"}
先点击“提交 A”和“提交 B”，分别完成两个 action。等 R1、R2 都出现后，先完成 R2，再完成 R1：页面事实应
停留在 R2 的版本，事件日志会标记 R1 为 stale。右侧再先启动“搜索慢”，紧接着启动“搜索快”，先完成快搜索；
慢搜索被同一 Fetcher 取消，最终结果仍为“快”。
:::

Demo 使用内存 Router 和手动 deferred gate，不访问真实网络，也不把服务端未执行当作取消结果。每一条事件
来自实际 action、loader 或 Fetcher 生命周期；“stale 未提交”表示客户端提交边界，不表示服务端回滚。

## 六、易错使用提示

:::pitfalls
### 错误：把不同 Fetcher 当成一个全局请求

**触发条件：** 一个组件用全局 `isLoading` 或全局请求编号控制多个独立 Fetcher。

**原因：** 不同 Fetcher 可以并发，它们不会互相取消；全局标记会抹掉局部请求身份。

**后果：** A 的完成状态可能错误地关闭 B 的反馈，或一个操作阻塞本不相关的操作。

**错误示例：**

```tsx
const [isLoading, setIsLoading] = useState(false)
// A、B 两个 fetcher 共用一个 loading 标记
```

**正确写法：**

```tsx
const fetcherA = useFetcher()
const fetcherB = useFetcher()
const busyA = fetcherA.state !== 'idle'
const busyB = fetcherB.state !== 'idle'
```

**验证方式：** 同时启动 A、B，确认一个 Fetcher 的状态变化不会取消或清空另一个 Fetcher。

### 错误：用响应返回顺序判断最新数据

**触发条件：** 谁最后返回就把谁写入 React state，没有考虑请求的启动顺序和 Router 的 revalidation 规则。

**原因：** 网络返回顺序可以与用户操作顺序相反；较早启动的响应可能最后返回。

**后果：** 旧快照覆盖新快照，界面出现 stale UI。

**错误示例：**

```tsx
const response = await fetch(url)
setItems(await response.json())
```

**正确写法：**

```tsx
const fetcher = useFetcher<Item[]>()
fetcher.load(`/items?q=${query}`)
// 由同一 Fetcher 接管当前查询结果
```

**验证方式：** 让旧请求晚于新请求返回，确认旧结果不会覆盖已提交的新结果。

### 错误：认为 abort 会撤销服务端副作用

**触发条件：** action 的 `request.signal` 触发后，直接把数据库写入当作没有发生。

**原因：** 浏览器取消发生在客户端；请求可能已经到达并被服务端处理。

**后果：** 重复提交、旧版本覆盖新版本或其他数据完整性问题仍然发生。

**错误示例：**

```tsx
await updateRecord(input)
// 看到 abort 就假设服务端没有写入
```

**正确写法：**

```tsx
await updateRecord({ ...input, idempotencyKey, expectedVersion })
```

**验证方式：** 让取消请求仍在服务端完成，确认服务端按幂等键或版本规则拒绝重复、过时写入。

### 错误：禁用同一 Fetcher 的下一次请求

**触发条件：** 搜索框因为 `fetcher.state === 'loading'` 就禁止下一次输入提交。

**原因：** 同一 Fetcher 的新请求正是取消旧请求、保持结果与输入一致的机制。

**后果：** 用户只能等待旧查询结束，type-ahead 失去及时反馈。

**错误示例：**

```tsx
<input disabled={fetcher.state !== 'idle'} onChange={handleChange} />
```

**正确写法：**

```tsx
<input onChange={handleChange} aria-busy={fetcher.state !== 'idle'} />
```

**验证方式：** 连续提交“慢”“快”，确认快请求能开始，慢请求被取消且最终只显示快的结果。
:::

## 七、源码推导与适用场景

1. React Router 8.3.0 的官方文档把 Fetcher action 后的页面 revalidation 描述为可并发流程，并定义了 stale
   请求：较早启动、但在较新请求已经返回后才返回的请求，其结果不会继续覆盖当前 UI。
2. 固定版本源码中的 Fetcher reload id、独立 AbortController 和 stale fetch load 处理，说明 Router 会为
   客户端请求维护启动顺序，并在新鲜结果落地后取消或忽略旧请求。这是对公开文档行为的实现推导，不应把
   内部变量名称当成应用 API。
3. 这套机制适合搜索建议、局部保存、批量操作和详情切换等客户端交互。涉及付款、库存扣减、不可重复命令或
   多客户端编辑时，仍需服务端幂等、版本检查、事务或冲突解决策略。
4. 本课不展开自定义 Data Strategy、缓存所有权、离线队列和跨页面状态架构；这些问题需要单独的状态边界设计。

## 八、练习

:::exercise
### 练习目标

**要求：** 把一个由 React state 管理的搜索请求改成同一 Fetcher 驱动的 type-ahead。连续提交两个查询，让
第一个 loader 延迟返回，并在第二个查询返回后再释放第一个查询；记录第一个请求的取消或 stale 事件。再在
action payload 中加入 `expectedVersion`，为服务端冲突响应设计一条用户可理解的错误消息。

**验收：** 第二个查询可以在第一个查询 pending 时发起；最终结果与第二个查询一致，第一个结果不会覆盖它；
UI 文案区分“客户端请求已取消”和“服务端写入已确认”；同时启动两个不同 Fetcher 时，彼此仍能独立显示
pending 与结果。
:::

## 九、本节小结

- Race Condition 的判断要同时看请求启动顺序和返回顺序。
- 不同 Fetcher 可以并行；同一 Fetcher 的新请求会取消自己的旧请求。
- Fetcher action 触发的多份 revalidation 中，Router 提交 fresh 结果并避免 stale 结果覆盖 UI。
- `AbortSignal` 和 Router 的 stale 处理只保护客户端生命周期，不能替代服务端幂等、版本和事务策略。

## 十、参考资料

- [Network Concurrency Management](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/concurrency.md) - 支持 revalidation 并发、fresh/stale 处理与服务端取消边界。
- [Race Conditions](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/race-conditions.md) - 支持导航、Fetcher 自取消、不同 Fetcher 并行和 type-ahead 场景。
- [React Router Router Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts) - 支持 Fetcher reload 顺序、AbortController 与 stale 请求处理的固定版本源码推导。
- [Fetcher concurrency tests](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/fetchers-test.ts) - 支持同一 Fetcher 取消和多 Fetcher revalidation 的官方测试证据。
