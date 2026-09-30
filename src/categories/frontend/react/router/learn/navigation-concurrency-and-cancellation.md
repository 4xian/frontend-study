---
id: react.router.learn.advanced.navigation-concurrency-and-cancellation
type: lesson
title: 导航并发与请求取消
summary: 让新的导航优先处理，并把 Router 提供的 AbortSignal 传给真正的异步工作。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 120
prerequisites:
  - react.router.learn.intermediate.loader-requests-and-redirects
  - react.router.learn.intermediate.navigation-pending-ui
  - react.router.learn.advanced.optimistic-ui
related:
  - react.router.learn.intermediate.fetcher
  - react.router.learn.intermediate.revalidation
tags:
  - React Router
  - Data Mode
  - Navigation
  - Concurrency
  - AbortSignal
  - request.signal
  - Cancellation
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
objectives:
  - 能解释 Link 导航被新导航打断时的最新事件优先语义。
  - 能从 loader 的 request.signal 观察导航取消，并把它继续传给 fetch 或可取消任务。
  - 能区分 Router 不再提交旧结果、浏览器释放请求资源和服务端停止处理这三个边界。
  - 能用 useNavigation 区分当前已提交位置与正在前往的位置。
  - 能判断普通导航、同一 Fetcher 重请求和不同 Fetcher 并发之间的取消范围。
recap:
  - 普通 Link/Form 导航是单一导航流，新事件会中断旧导航并优先处理最新目标。
  - loader 只有消费 request.signal，底层异步工作才会随导航取消；Router 不会自动取消你自己创建的 Promise。
  - 导航取消不等于撤销已经到达服务端的请求，写入接口仍需要服务端幂等或版本约束。
  - 同一个 Fetcher 的新请求可以取消旧请求，不同 Fetcher 之间保持独立；这与下一课的 stale revalidation 处理相关但不是同一主题。
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
      - Link 和 Form 导航遵循最新事件优先，新的导航会取消旧导航的在途 loader 请求。
      - action 完成后会触发 loader revalidation，浏览器取消请求不保证服务端没有处理它。
  - title: Race Conditions
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/race-conditions.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 被打断的导航会取消旧数据请求并立即处理新事件；同一 Fetcher 的新请求会取消自身旧请求。
      - 不同 Fetcher 不能互相打断，服务端数据竞态仍需后端负责。
  - title: useNavigation API
    url: https://reactrouter.com/8.3.0/api/hooks/useNavigation
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - useNavigation 返回包含 idle、loading、submitting 状态和目标 location 的当前导航对象。
  - title: React Router 8.3.0 Router Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Router 为导航创建 AbortController，新导航开始时中止旧 controller，并把 signal 注入 loader Request。
      - 已中止请求的结果不会继续提交为当前导航结果。
  - title: React Router 8.3.0 DataFunctionArgs
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - loader 和 action 的 request 参数是标准 Fetch Request，包含可传递给底层工作的 signal。
---

# 导航并发与请求取消

## 一、学习目标

- 能解释 Link 导航 A 在等待时点击导航 B，为什么最终只提交 B。
- 能从 loader 的 `request.signal` 得到取消通知，并把它传给 `fetch` 或自定义可取消任务。
- 能区分当前已提交的 `useLocation()`、目标位置和导航状态。
- 能判断普通导航、同一 Fetcher 重请求和不同 Fetcher 并发的取消边界。
- 能说明浏览器端取消不会撤销已经到达服务端的请求。

## 二、为什么需要

一个详情页可能需要较慢的网络请求。用户点击“慢详情”后又点击“快速详情”时，界面应该尽快处理最后一次
选择，而不是等旧请求结束后再显示已经过时的页面。应用还需要释放旧请求占用的浏览器资源，否则快速操作会
同时积累许多无用工作。

Data Router 把这件事拆成两个相互配合的动作：导航层只保留最新的导航结果；数据层通过 `AbortSignal` 让
底层工作在旧导航被打断时停止。没有第二步时，Router 虽然不会把旧结果提交到界面，但你自己创建的定时器、
Promise 或请求仍可能继续运行。

```text
页面 A，navigation.state = idle
        |
        | 点击慢目标 B
        v
loading，useLocation() = A，navigation.location = B
        |
        | 点击快速目标 C
        v
中止 B 的 loader 请求，开始 C 的 loader 请求
        |
        v
提交 C，navigation.state = idle
```

## 三、核心概念

### 1. 最新导航优先

普通 `Link` 导航和导航型表单属于同一个导航流。新事件开始时，Router 会中止旧导航的在途数据请求，并
立即处理新目标。旧页面在目标 loader 完成前仍然是已提交内容，因此 `useLocation()` 不会提前变成新地址。

```tsx
function NavigationStatus() {
  const location = useLocation()
  const navigation = useNavigation()

  return (
    <p role="status">
      当前：{location.pathname}；
      {navigation.state === 'loading'
        ? `正在前往 ${navigation.location.pathname}`
        : '导航空闲'}
    </p>
  )
}
```

`navigation.location` 在 `loading` 时表示目标位置，空闲时没有目标位置。它是反馈当前导航的观察值，不能
代替已经提交的 `location` 来渲染尚未准备好的页面。

### 2. `request.signal` 是取消的传播通道

每个 loader 都会收到标准 Fetch `Request`。Router 把当前导航的 `AbortSignal` 放在 `request.signal` 上；应用
需要把它继续传给支持取消的底层 API。

```tsx
async function reportLoader({ request }: LoaderFunctionArgs) {
  const response = await fetch('/api/reports', {
    signal: request.signal,
  })
  return response.json()
}
```

自定义异步任务没有自动取消能力，需要监听 signal 并在取消时清理自己的资源：

```tsx
function waitForReport(signal: AbortSignal, milliseconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds)

    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Navigation aborted', 'AbortError'))
    }

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}
```

真实项目中还应在任务完成时移除监听器，并按照所用 API 的约定识别 `AbortError`。上面的短例只突出取消
传播的核心结构。

### 3. Router 取消、底层取消与服务端处理不是一回事

可以把一次请求拆成三个边界：

| 边界 | 发生的事情 | 应用能否保证 |
| --- | --- | --- |
| Router | 旧导航不再成为当前导航结果 | 可以依赖最新导航优先 |
| 浏览器与底层 API | signal 触发，支持取消的工作释放资源 | 只有传入 signal 且 API 支持时才能停止 |
| 服务端 | 请求可能已经到达并开始处理 | 客户端取消不能撤销副作用 |

因此取消适合减少客户端无用工作和避免旧结果覆盖当前界面，但不能代替写入接口的幂等键、版本检查或服务
端事务策略。

### 4. 不同交互的取消范围

- 普通导航：新导航会中断旧导航。
- 同一个 Fetcher：新的 `load` 或 `submit` 会中断该 Fetcher 自己的旧请求。
- 不同 Fetcher：各自独立，可以同时进行，不能互相中断。
- action 完成后的 revalidation：属于后续数据同步过程，可能有多条请求同时在途；旧数据是否提交由 Router
  的新鲜度规则处理，本课只要求知道它不是“所有 Fetcher 共用一个取消开关”。

## 四、用法与示例

### 1. 在 loader 中包住可取消任务

```tsx
type Report = { id: string; title: string }

async function loader({ request, params }: LoaderFunctionArgs): Promise<Report> {
  const report = reports.find((item) => item.id === params.reportId)
  if (!report) throw new Response('Not Found', { status: 404 })

  await fetch(`/api/reports/${report.id}`, { signal: request.signal })
  return report
}
```

不要在 loader 外部保存一个“当前请求”的全局变量来手写竞态判断。导航的生命周期已经由 Router 管理，
底层 API 只需接收本次调用的 signal。

### 2. 在界面中同时显示两种位置

```tsx
function ReportShell() {
  const location = useLocation()
  const navigation = useNavigation()
  const target = navigation.state === 'loading' ? navigation.location.pathname : '无'

  return (
    <dl>
      <div>
        <dt>已提交</dt>
        <dd>{location.pathname}</dd>
      </div>
      <div>
        <dt>目标</dt>
        <dd>{target}</dd>
      </div>
    </dl>
  )
}
```

### 3. 用稳定的 pending 反馈解释取消

`useNavigation()` 适合放在共享布局中，`NavLink` 的 `isPending` 适合标记某个入口。反馈应说明“正在前往
哪里”，而不是只显示一个无目标的旋转图标。用户在等待期间再次点击其他链接时，反馈应随新的目标更新。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.advanced.navigation-concurrency-and-cancellation.navigation-concurrency-demo"}
依次点击“慢报告”，再在等待期间点击“快速报告”。观察当前已提交地址、正在前往的目标、导航状态和事件日志：
慢 loader 会收到 abort，快速目标完成后才提交到界面。重置后可再次操作；底部提示“请求若已到达服务端，仍可能继续处理”
说明客户端取消不等于撤销服务端处理。
:::

Demo 中的延时任务直接消费 loader 的 `request.signal`。因此“已中止”来自实际的 AbortSignal 事件，而不是
组件额外维护的取消布尔值；同一份 TSX 和 CSS 也就是运行时加载并展示给学习者的源码。

## 六、易错使用提示

:::pitfalls
### 错误：只依赖 Router 丢弃旧结果

**触发条件：** loader 启动了自定义 `setTimeout`、Promise 或第三方请求，却没有读取 `request.signal`。

**原因：** Router 只能中止自己的导航请求，无法猜测应用创建的底层工作如何清理。

**后果：** 页面最终不会提交旧结果，但旧任务仍继续占用资源，副作用也可能继续发生。

**错误示例：**

```tsx
async function loader() {
  await new Promise((resolve) => window.setTimeout(resolve, 3000))
  return loadReport()
}
```

**正确写法：**

```tsx
async function loader({ request }: LoaderFunctionArgs) {
  await waitForReport(request.signal, 3000)
  return loadReport()
}
```

**验证方式：** 在延时任务完成前点击另一个目标，确认任务的 abort 清理分支被触发。

### 错误：用目标位置替换当前页面

**触发条件：** loading 期间直接用 `navigation.location` 渲染完整详情内容。

**原因：** 目标位置只是正在进行的导航，不代表目标 loader data 已经提交。

**后果：** 界面出现地址与数据不一致的半成品，或访问不存在的目标数据。

**错误示例：**

```tsx
const title = navigation.location?.pathname ?? location.pathname
return <h1>{title}</h1>
```

**正确写法：**

```tsx
const target = navigation.state === 'loading' ? navigation.location.pathname : null
return <><h1>{loaderData.title}</h1><p>目标：{target ?? '无'}</p></>
```

**验证方式：** 点击慢目标后确认详情标题保持旧页面，只有 loader 完成后才切换。

### 错误：把取消当成服务端撤销

**触发条件：** 取消了客户端提交，就假设数据库写入一定没有发生。

**原因：** 请求可能已经离开浏览器并在服务端开始处理。

**后果：** 重复提交、过期写入或库存等副作用仍可能发生。

**错误示例：**

```tsx
await fetch('/api/pay', { signal: request.signal })
// 认为 abort 后服务端一定没有扣款
```

**正确写法：**

```tsx
await fetch('/api/pay', {
  signal: request.signal,
  headers: { 'Idempotency-Key': paymentAttemptId },
})
```

**验证方式：** 把客户端取消与服务端幂等键、版本检查或事务策略分别测试，不把前者当作后者的替代品。

### 错误：让一个共享取消开关控制所有 Fetcher

**触发条件：** 多个局部交互共用一个 AbortController 或一个全局“正在请求”布尔值。

**原因：** Fetcher 实例有各自的请求生命周期，不同 Fetcher 可以并发。

**后果：** 取消一行操作时误伤另一行，或者把本应并发的局部反馈锁成串行。

**错误示例：**

```tsx
const controller = new AbortController()
// 所有 fetcher 都复用 controller
```

**正确写法：**

```tsx
const first = useFetcher()
const second = useFetcher()
// 让 Router 按 Fetcher 实例管理各自请求
```

**验证方式：** 让两个不同 Fetcher 同时开始，确认其中一个完成或取消不会改变另一个的 state。

### 错误：把所有非 idle 状态都叫作 loading

**触发条件：** 用 `navigation.state !== 'idle'` 显示“正在加载页面”。

**原因：** `submitting` 表示表单数据正在提交，和普通 GET 导航的 `loading` 语义不同。

**后果：** 用户无法知道当前是在等待页面数据还是提交数据，辅助技术也得到含糊反馈。

**错误示例：**

```tsx
const label = navigation.state === 'idle' ? '空闲' : '正在加载页面'
```

**正确写法：**

```tsx
const label =
  navigation.state === 'loading'
    ? '正在加载目标页面'
    : navigation.state === 'submitting'
      ? '正在提交表单'
      : '导航空闲'
```

**验证方式：** 分别触发普通 Link 和表单提交，确认界面播报与 state 含义一致。
:::

## 七、源码推导与适用场景

1. **官方事实：** React Router 的 Router 源码会为导航创建 `AbortController`，在新导航开始时中止旧
   controller，并把对应 signal 放入 loader 的 `Request`；被中止请求的结果不会继续作为当前导航提交。
2. **课程推导：** 应用层只需要把每次 loader 调用收到的 signal 传入可取消 API，并把自定义清理逻辑绑定到
   `abort` 事件，不需要为每个链接复制一套“最后一次请求”状态机。
3. **适用边界：** 这是浏览器端导航和数据请求的取消语义，不是服务端事务回滚保证；涉及写入、支付、库存或
   其他不可逆副作用时，仍须由服务端提供幂等、版本或事务策略。

适合使用本模型的场景包括详情页切换、搜索条件导航、分页和报表筛选。需要保留多个独立局部请求时使用
不同 Fetcher；需要让 URL 和页面上下文一起变化时使用普通导航。多个 Fetcher 的 revalidation 新鲜度和
旧响应处理属于后续 Race Condition 主题，这里只保留取消范围的最小边界。

## 八、练习

:::exercise
### 练习目标

**要求：** 在 Demo 的报告 loader 中增加一个可取消的“相关指标”延时任务，并让它与主报告请求共用本次
`request.signal`。先点击慢报告，再点击快速报告，记录两个任务各自的启动、abort 和完成顺序；然后回答为什么
快速报告可以提交而慢报告不会覆盖它，以及客户端 abort 能否保证服务端撤销已经到达的写入。

**验收：** 相关指标任务在旧导航中触发 abort 清理，快速报告完成后当前地址和标题都属于快速报告；答案明确指出
客户端取消不能保证服务端撤销副作用。
:::

## 九、本节小结

- 新 Link/Form 导航会中断旧导航，最新目标优先提交。
- `request.signal` 只有被传给 `fetch` 或自定义清理逻辑，才会让底层工作真正响应取消。
- `useLocation()` 是已提交位置，`navigation.location` 是等待中的目标位置。
- 同一 Fetcher 可中断自己的旧请求，不同 Fetcher 互不取消。
- 客户端取消释放资源并避免旧结果提交，但不能撤销已经到达服务端的副作用。

## 十、参考资料

- [Network Concurrency Management](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/concurrency.md) - 支持导航最新事件优先、revalidation 与服务端取消边界。
- [Race Conditions](https://raw.githubusercontent.com/remix-run/react-router/react-router@8.3.0/docs/explanation/race-conditions.md) - 支持导航、Fetcher 取消范围及 stale 请求说明。
- [useNavigation API](https://reactrouter.com/8.3.0/api/hooks/useNavigation) - 支持读取导航状态与目标 Location。
- [React Router Router Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts) - 支持 AbortController、Request signal 和取消结果处理的固定版本源码推导。
- [React Router DataFunctionArgs Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts) - 支持 loader/action Request 参数类型。
