---
id: react.router.learn.intermediate.route-error-boundary
type: lesson
title: Route Error Boundary
summary: 让 Data Router 把 loader、action 与渲染失败交给最近路由边界，并提供可理解、可恢复的错误界面。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 95
prerequisites:
  - react.router.learn.intermediate.revalidation
related:
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.action-results-and-form-validation
  - react.core.learn.advanced.error-boundary-render-failures
tags:
  - React Router
  - Data Mode
  - Route Error Boundary
  - ErrorBoundary
  - useRouteError
  - isRouteErrorResponse
  - 错误恢复
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-21
objectives:
  - 能说明 route Error Boundary 为什么由 Router 关联 loader、action 与 route component 的失败，而不是由页面手写请求状态代替。
  - 能在 Data Mode route object 上正确配置 ErrorBoundary，并识别 errorElement 的等价元素形式与互斥关系。
  - 能从 useRouteError 读取 unknown，并依次收窄 RouteErrorResponse、普通 Error 与未知值。
  - 能使用 isRouteErrorResponse 安全读取 status、statusText 与 data，而不把解包后的值误当成原始 Response。
  - 能区分 throw data、抛出 Response、普通 Error 与正常返回 action 校验结果的用途。
  - 能说明 loader、action 与 route component render 错误都可以进入最近的 route boundary。
  - 能根据嵌套路由树预测错误由 route 自身、最近祖先或 root 边界处理，以及哪一段 UI 会被替换。
  - 能说明默认边界只提供最后兜底，正式应用仍需自定义 root 和必要的局部边界。
  - 能用新 location、Back 或 useRevalidator 恢复错误界面，并说明 loader 重试不会重放失败 action。
recap:
  - Data Mode route object 使用 ErrorBoundary 组件或 errorElement 元素，两者不能同时配置。
  - useRouteError 返回 unknown，边界应依次处理 RouteErrorResponse、Error 与未知值。
  - loader、action 与 route component render 的 thrown value 都会交给最近 route boundary。
  - throw data 或抛出的非重定向 Response 会形成可读取 status、statusText 与 data 的 RouteErrorResponse。
  - 正常 action 校验结果应返回给 useActionData，不应把每个字段错误都升级为 route exception。
  - 最近边界包括出错 route 自己；边界之上的祖先布局保留，边界 route 的正常内容与下游 Outlet 被替换。
  - 没有自定义边界时 Router 仍有 root 默认兜底，但它不应成为正式产品错误界面。
  - 导航或 Back 可以离开错误 location；useRevalidator 可以重跑 loader，但不会自动重放 action。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是本课核验的稳定发布版本，对应固定官方 tag。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 2026-08-21 的 latest dist-tag 为 8.3.0。
  - title: React Router Error Boundaries Guide
    url: https://reactrouter.com/8.3.0/how-to/error-boundary
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Router 把 route loading、action execution 与 rendering 的错误交给最近边界。
      - Data Mode 边界通过 useRouteError 读取错误，并应区分 route response、Error 与未知值。
      - 应用至少应提供 root boundary，且 route error boundary 不用于普通字段校验。
  - title: React Router Route Component API
    url: https://reactrouter.com/8.3.0/api/components/Route
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - ErrorBoundary 接收组件类型，errorElement 接收 React element，两者互斥。
  - title: React Router useRouteError API
    url: https://reactrouter.com/8.3.0/api/hooks/useRouteError
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - useRouteError 返回当前 route boundary 处理的 unknown 错误值。
  - title: React Router isRouteErrorResponse API
    url: https://reactrouter.com/8.3.0/api/utils/isRouteErrorResponse
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - isRouteErrorResponse 收窄 Router ErrorResponse，并允许读取 status、statusText 与 data。
  - title: React Router Error Selection and Rendering Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L955-L1372
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Router 提供默认根边界，并按错误归属截断到最近边界 route 的渲染分支。
      - render error 与 loader/action error 最终都能由 useRouteError 读取。
  - title: React Router Error Response Conversion Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6765-L6797
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 抛出的非重定向 Response 会解析 body 并转换为 ErrorResponse。
  - title: React Router Navigation Error Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/navigation-test.ts#L587-L712
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - loader 错误由 route 自身或最近祖先边界处理，导航到新 location 后错误状态清空。
  - title: React Router useRevalidator Error Recovery Tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/use-revalidator-test.tsx#L126-L237
    sourceType: official-test
    appliesTo: React Router 8.3.0
    claims:
      - 错误边界中可以调用 revalidate 重跑 loader，成功后清空错误并恢复正常 route UI。
---

# Route Error Boundary

## 一、学习目标

完成本课后，你能够：

- 为 Data Mode route object 配置 root 与局部 `ErrorBoundary`。
- 使用 `useRouteError()` 读取当前边界接管的错误。
- 使用 `isRouteErrorResponse()`、`instanceof Error` 和未知分支完整收窄错误。
- 区分 loader、action 与 route component render 三类错误来源。
- 预测嵌套路由中的最近边界、冒泡方向和被替换的 UI 范围。
- 为失败页面提供导航恢复或 loader 重试，并避免误重放 action。

## 二、为什么 Route 需要错误边界

loader 返回的是 route 正常渲染所需的数据，action 负责处理 route mutation，route component 再把结果呈现成
界面。三者中任何一环失败，当前分支都可能无法继续按正常路径渲染。例如详情 loader 找不到目标报告时，继续
渲染一个字段全空的页面只会掩盖真实问题。

Data Router 已经知道当前匹配了哪些 route、哪一个 loader 或 action 正在执行，以及正常 element 应该插入哪个
`Outlet`。Route Error Boundary 利用这份路由上下文，把 thrown value 交给最近的 route 错误界面。应用不必在
每一层组件重复维护 `try/catch + error state`，也不会丢失“哪段 route UI 应被替换”的所有权。

它仍然不是全局异常捕获器。本课只讨论 Data Mode 的 route loading、action execution 与 route rendering；
按钮回调中的任意异常、独立定时任务和外部日志系统不因配置 route boundary 就自动得到处理。

## 三、最小心智模型

### 1. 正常分支与错误分支

一条 route 可以同时提供正常组件与错误组件：

```tsx
const router = createMemoryRouter([
  {
    path: '/',
    Component: AppLayout,
    ErrorBoundary: RootRouteErrorBoundary,
    children: [
      {
        path: 'reports/:reportId',
        loader: reportLoader,
        action: reportAction,
        Component: ReportPage,
        ErrorBoundary: ReportRouteErrorBoundary,
      },
    ],
  },
])
```

正常时，Router 渲染 `ReportPage`。loader、action 或该 route 分支的 render 抛错时，Router 改为渲染
`ReportRouteErrorBoundary`。错误界面不是正常页面上的一个可选提示，而是当前边界 route 的替代渲染分支。

### 2. 三类来源进入同一个公开入口

```text
loader throw ─────┐
action throw ─────┼─> 最近 route boundary ─> useRouteError()
render throw ─────┘
```

loader/action 错误由 Router 执行数据函数时记录；render 错误由 Router 的渲染边界接住。内部路径不同，但边界
组件都通过 `useRouteError()` 读取结果。

### 3. Data Mode 是必要前提

本课的 route object 由 `createMemoryRouter`、`createBrowserRouter` 等 Data Router 创建。普通
`<MemoryRouter><Routes>` 不会因此获得同一套 loader/action 和 route render-error 合同。Declarative Mode
只能用于识别已有路由，不是本课实现主线。

## 四、配置 ErrorBoundary 与 errorElement

### 1. ErrorBoundary 接收组件类型

推荐在 route object 上提供组件类型：

```tsx
function ReportRouteErrorBoundary() {
  return <section>报告暂时无法显示</section>
}

const reportRoute = {
  path: 'reports/:reportId',
  Component: ReportPage,
  ErrorBoundary: ReportRouteErrorBoundary,
}
```

这里写的是 `ReportRouteErrorBoundary`，不是 `<ReportRouteErrorBoundary />`。Router 负责创建这个组件，并给它
建立读取当前 route error 的上下文。

### 2. errorElement 接收 React element

如果需要直接提供 element，可以改写为：

```tsx
const reportRoute = {
  path: 'reports/:reportId',
  element: <ReportPage />,
  errorElement: <ReportRouteErrorBoundary />,
}
```

两种形式表达同一职责，不能在同一个 route 上同时配置。React Router 8.3.0 同时遇到两者时会给出开发态警告，
并优先使用 `ErrorBoundary`。应用应在代码评审前消除这种歧义，而不是依赖优先级。

### 3. Root 与局部边界分工

root boundary 是最后的自定义兜底，确保顶层错误仍有可恢复界面。局部边界放在可以独立失败、独立理解和独立
恢复的 route 区域。例如报告详情失败时，应用导航仍应保留；工作区布局本身失败时，才交给 root boundary。

## 五、使用 useRouteError 完整收窄

### 1. 返回类型是 unknown

Data Mode 的 route boundary 不接收通用 `error` prop。错误值来自：

```tsx
const error = useRouteError()
```

返回类型是 `unknown`，因为 loader、action 和 render 可以抛出不同值。直接读取 `error.message` 或强制断言成
`Error` 会跳过运行时分类。

### 2. 三分支模板

```tsx
function ReportRouteErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <section>
        <h2>
          {error.status} {error.statusText}
        </h2>
        <p>{typeof error.data === 'string' ? error.data : '报告暂时无法显示'}</p>
      </section>
    )
  }

  if (error instanceof Error) {
    return <p>{error.message}</p>
  }

  return <p>发生未知错误</p>
}
```

顺序表达三种不同合同：

1. `RouteErrorResponse` 提供 HTTP 风格的 `status`、`statusText` 与解包后的 `data`。
2. 普通 `Error` 提供 `name`、`message` 等 JavaScript 异常信息。
3. 最后一个分支处理字符串、对象或其他未知 thrown value，保证边界自身不因错误类型假设再次失败。

### 3. error.data 仍有自己的数据合同

`isRouteErrorResponse` 只收窄外层 ErrorResponse，不会替应用证明 `error.data` 的具体形状。如果 loader 抛出
`{ message, source }`，边界仍应按本应用的最小数据合同判断字段，再展示受控文案。

## 六、RouteErrorResponse 与普通 Error

### 1. 页面缺失使用 throw data

页面缺少继续渲染所需的数据时，可以抛出带状态的 route response：

```tsx
async function reportLoader({ params }: LoaderFunctionArgs) {
  const report = await reportStore.find(params.reportId)
  if (!report) {
    throw data('报告不存在', { status: 404, statusText: 'Not Found' })
  }
  return report
}
```

`throw` 中断正常 loader 分支。边界可以用 `isRouteErrorResponse` 识别 404，并把它和程序异常区分开。

### 2. 抛出的 Response 会先解包

下面写法也会进入 route boundary：

```tsx
throw new Response(JSON.stringify({ message: '报告不存在' }), {
  status: 404,
  statusText: 'Not Found',
  headers: { 'Content-Type': 'application/json' },
})
```

Router 会按 `Content-Type` 解析 body，再转换成 Route ErrorResponse。因此边界中接到的不是原始 `Response`，
不能用 `error instanceof Response` 作为判断条件。

### 3. 普通 Error 表示非预期失败

```tsx
async function reportLoader() {
  const report = await reportService.read()
  if (!reportService.isAvailable) {
    throw new Error('报告服务暂不可用')
  }
  return report
}
```

普通 `Error` 没有业务 HTTP 状态，界面不应伪造 404 或 409。实际应用还要控制对用户暴露的错误内容；本课只
演示可预测的本地消息，不展开通用日志和隐私策略。

## 七、Loader、Action 与 Render 错误

### 1. 三类来源对照

| 来源 | 发生阶段 | 示例 | 边界读取 |
| --- | --- | --- | --- |
| loader | 进入 route 或重新验证数据 | 详情不存在、依赖服务失败 | `useRouteError()` |
| action | mutation 执行 | 当前操作无法继续、资源冲突 | `useRouteError()` |
| render | route component 渲染 | 组件读取到不满足约束的数据 | `useRouteError()` |

这三类错误都由最近 route boundary 处理，但恢复动作不一定相同。loader 可以重跑，action 需要新的用户提交，
render error 必须先解除导致组件再次抛错的条件。

### 2. Action 异常不是字段校验

可预期的字段校验仍应返回正常 action data，让表单从 `useActionData` 或 Fetcher data 显示字段级反馈：

```tsx
if (!title) {
  return data({ fieldErrors: { title: '请输入标题' } }, { status: 400 })
}
```

只有当前 route 流程无法继续时才抛给边界，例如报告已经归档，当前保存上下文需要整体退出：

```tsx
throw data('报告已归档', { status: 409, statusText: 'Conflict' })
```

### 3. Render 错误仍属于 Route 分支

Data Router 会让 route component 的 render error 进入最近 route boundary。边界不会捕获自己的错误；边界
组件或 fallback 再次抛错时，错误继续向更高 route boundary 传播。因此 fallback 应保持简单，不在错误界面里
重复执行高风险数据转换。

## 八、最近边界与冒泡

### 1. 从出错 Route 自身开始查找

```text
工作区 root                 RootRouteErrorBoundary
└── reports/:reportId       ReportRouteErrorBoundary
    └── details             没有自己的 boundary
```

- 报告 route 的 loader、action 或 render 失败：由 `ReportRouteErrorBoundary` 处理。
- details 没有边界：错误向上交给报告边界。
- 如果报告 route 没有局部边界：同一错误继续交给 root boundary。
- 如果应用没有任何自定义边界：Router 使用 root match 的默认边界兜底。

“最近”包括出错 route 自己，不是从父 route 才开始查找。

### 2. 边界位置决定 UI 截断范围

错误发生后，边界之上的祖先布局仍然渲染；边界 route 的正常 component 和它下面的 `Outlet` 被错误界面替换。
所以报告边界接管时，工作区标题与导航仍可用；错误冒泡到 root 时，整个工作区 route UI 都会被 root fallback
替换。

### 3. 默认边界只负责最后兜底

Router 在没有自定义 boundary 时仍提供默认错误界面。React Router 8.3.0 的默认实现会显示通用标题，并可能
显示错误 message 或 stack；它没有应用自己的恢复动作。默认文案和样式属于实现兜底，不应被当作产品 UI
合同。正式应用至少应配置一个可靠的 root boundary。

## 九、恢复与重试

### 1. 导航到安全 Location

导航到可以成功加载的新 location 后，Router 会提交新的 matches 与数据，旧 route error 被清除。错误界面中应
保留一个稳定恢复入口，例如“返回报告列表”或“返回工作区首页”。

Back 也可以离开错误 location。action throw 默认会保留可返回的 history 路径，但 Back 只恢复前一个页面，
不会重新提交失败 action。

### 2. 用 useRevalidator 重试 Loader

短暂 loader 故障可以在 boundary 内显式重试：

```tsx
function ReportRouteErrorBoundary() {
  const error = useRouteError()
  const revalidator = useRevalidator()
  const isRetrying = revalidator.state === 'loading'

  return (
    <section aria-busy={isRetrying}>
      <p>{error instanceof Error ? error.message : '报告暂时无法显示'}</p>
      <button
        type="button"
        disabled={isRetrying}
        onClick={() => void revalidator.revalidate()}
      >
        {isRetrying ? '重试中' : '重试加载'}
      </button>
    </section>
  )
}
```

`revalidate()` 重新执行当前页面 loader。官方测试确认第二次 loader 成功后，错误状态清空，正常 route component
恢复。Router 不会自动 retry，应用也要避免在不可恢复的 404 上建立无限重试入口。

### 3. 不要用 Revalidation 重放 Action

action error 发生后，`revalidate()` 只负责 loader 数据同步，不会自动重新提交原来的 FormData。用户应先返回
安全表单、确认输入和业务状态，再发起一次新的提交。把 loader retry 和 mutation retry 混成一个按钮，会制造
重复写入风险和错误预期。

## 十、Demo：报告故障恢复台

Demo 使用一棵内存 Data Router：工作区 root 有根边界，报告 route 有局部边界，设置 route 没有自己的边界。

- 初始安全首页不显示任何错误。
- “正常报告”证明 loader 成功后 route component 正常渲染。
- “缺失报告”由 loader 抛出 404，报告局部边界显示 `RouteErrorResponse`、status 与 loader 来源；工作区 shell
  仍然保留。
- 正常报告中的“模拟保存归档报告”由 action 抛出 409，仍由报告局部边界处理，但来源显示为 action。
- “不稳定报告”第一次 loader 抛出普通 `Error`；边界里的“重试当前 loader”让 revalidator 经历
  `idle -> loading -> idle`，第二次 loader 成功后同一 location 恢复正常内容。
- “根级错误”进入没有局部边界的设置 route，错误冒泡到工作区 root boundary，正常 shell 被替换。
- 所有错误界面都提供返回已知安全 route 的按钮；“重置演示”还会清空计数与不稳定 loader 尝试次数。

:::demo{id="react.router.learn.intermediate.route-error-boundary.error-boundary-demo"}
:::

建议按“缺失报告 -> 返回正常报告 -> 保存冲突 -> 返回正常报告 -> 不稳定报告 -> 重试 -> 根级错误 -> 返回安全
首页”的顺序操作。每次比较 location、scope、kind、source、status，以及工作区 shell 是否仍存在。

正文中的 render error 合同由 Data Router 官方测试证明；Demo 不伪造一个“像错误”的普通状态。真实 render
故障应在隔离环境验证，避免为了演示而让共享页面产生无关错误输出。

## 十一、易错使用提示

:::pitfalls
### 错误：等待 Data Mode Boundary 接收 error prop

**触发条件：** 把 route `ErrorBoundary` 当作普通带参数组件，直接读取 `props.error.message`。

**原因：** Data Mode boundary 通过 Router context 读取错误，公开入口是返回 `unknown` 的 `useRouteError()`。

**后果：** 组件拿不到预期 prop，或用错误断言跳过 RouteErrorResponse 与未知值。

**错误示例：**

```tsx
function ReportErrorBoundary({ error }: { error: Error }) {
  return <p>{error.message}</p>
}
```

**正确写法：** 从 hook 读取，并完整收窄三类值。

```tsx
function ReportErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error)) return <p>{error.status}</p>
  if (error instanceof Error) return <p>{error.message}</p>
  return <p>发生未知错误</p>
}
```

**验证方式：** 分别触发 404 与普通 Error，确认两个分支都能显示，TypeScript 不需要强制断言。

### 错误：混用 ErrorBoundary 与 errorElement

**触发条件：** 同一个 route 同时提供两个字段，或把 React element 写进 `ErrorBoundary`。

**原因：** `ErrorBoundary` 接组件类型，`errorElement` 接 element，两者是互斥的等价配置入口。

**后果：** 开发态出现警告，实际采用哪个错误 UI 依赖优先级而不再清晰。

**错误示例：**

```tsx
{
  ErrorBoundary: <ReportErrorBoundary />,
  errorElement: <OtherErrorBoundary />,
}
```

**正确写法：** 选择一种形式；route object 主线使用组件类型。

```tsx
{
  ErrorBoundary: ReportErrorBoundary,
}
```

**验证方式：** 检索目标 route 只出现一个错误配置字段，浏览器 console 没有互斥字段警告。

### 错误：用 return 代替 throw 表示页面无法继续

**触发条件：** loader 找不到必需资源时 `return data(..., { status: 404 })`，却期待 route boundary 接管。

**原因：** 返回值仍属于 loader 的正常结果；只有 throw 才进入 route exception path。

**后果：** 正常组件收到不符合数据合同的值，可能继续显示错误内容或产生二次 render 失败。

**错误示例：**

```tsx
return data('报告不存在', { status: 404 })
```

**正确写法：** 无法继续渲染时抛出；普通字段校验仍使用正常返回值。

```tsx
throw data('报告不存在', { status: 404, statusText: 'Not Found' })
```

**验证方式：** 导航到缺失资源时正常 route component 不渲染，最近 boundary 显示 404。

### 错误：把解包后的错误当成原始 Response

**触发条件：** loader 抛出 `Response` 后，边界使用 `error instanceof Response` 读取 body。

**原因：** Router 已解析非重定向 Response，并把它转换成 RouteErrorResponse。

**后果：** 判断分支不命中，status、statusText 与 data 都无法按 Router 合同显示。

**错误示例：**

```tsx
if (error instanceof Response) {
  return <p>{error.status}</p>
}
```

**正确写法：** 使用公开 type guard。

```tsx
if (isRouteErrorResponse(error)) {
  return <p>{error.status} {error.statusText}</p>
}
```

**验证方式：** 抛出带 text 或 JSON body 的 404 Response，确认 guard 命中且 `error.data` 已经解包。

### 错误：认为所有错误都应交给 Root

**触发条件：** 只配置 root boundary，报告详情失败时也替换整个工作区。

**原因：** Router 从出错 route 自身向上寻找最近边界；没有局部边界才继续冒泡。

**后果：** 一个可局部恢复的详情错误让导航、上下文和相邻功能一起消失。

**错误示例：**

```tsx
{
  path: 'reports/:reportId',
  Component: ReportPage,
}
```

**正确写法：** 为可独立失败和恢复的 route 提供局部边界。

```tsx
{
  path: 'reports/:reportId',
  Component: ReportPage,
  ErrorBoundary: ReportRouteErrorBoundary,
}
```

**验证方式：** 报告 loader 抛错后工作区 shell 仍存在；无局部边界的设置错误才由 root 接管。

### 错误：用 revalidate 自动重放失败 Action

**触发条件：** action 抛错后点击“重试”，直接调用 `revalidator.revalidate()` 并声称原 mutation 已重新提交。

**原因：** revalidation 重跑当前 loader，不会自动重新发送失败 action 的 FormData。

**后果：** UI 宣称保存完成但写入从未发生，或后续另加提交逻辑时产生重复 mutation 风险。

**错误示例：**

```tsx
function retryAction() {
  revalidator.revalidate()
}
```

**正确写法：** loader 短暂失败才用 revalidate；action 失败先回到安全表单，再由用户发起新提交。

```tsx
function retryLoader() {
  void revalidator.revalidate()
}
```

**验证方式：** loader 重试时 loader 次数增加；action 次数保持不变，直到用户再次提交表单。
:::

## 十二、源码推导与适用场景

### 1. 官方事实

固定版本的 route 转换逻辑把 `ErrorBoundary` 组件转换为 `errorElement`，同时配置时以前者为准。loader 或
action 抛出的非重定向 Response 会按 Content-Type 解析 body，再形成带 `status`、`statusText` 与 `data` 的
ErrorResponse。

错误归属从出错 route 自身向上寻找第一个 boundary match。渲染阶段按这个 route 截断 matches：边界之上的
祖先继续渲染，边界 route 与更深分支由错误 element 替换。没有自定义边界时，root match 仍由默认边界包住。

官方重验证测试还确认：错误边界调用 `revalidate()` 后，如果 loader 下一次成功，Router 会清除错误并恢复正常
组件。这个结果来自显式重验证，不是自动重试。

### 2. 课程推导

边界粒度应跟可独立恢复的 route 功能区一致。把 404 等可解释的 route response 与普通 Error 分开，能让 UI
提供准确状态和恢复动作；保留 unknown fallback，则能避免错误界面因类型假设再次崩溃。

恢复按钮也应按错误来源设计：换 location 适合离开不可恢复的缺失页面，revalidate 适合短暂 loader 故障，新的
Form submission 才是 action 的再次尝试。

### 3. 使用边界

本课只讨论客户端 Data Mode。鉴权路由、乐观 UI、navigation 并发竞态、自定义 Data Strategy、Framework
Mode、SSR/RSC、`<Await>` 局部错误、通用日志上报与生产错误净化需要分别设计，不能从本 Demo 外推。

## 十三、练习

:::exercise
### 练习目标

**要求：** 创建一棵包含 root、项目详情和详情子 route 的 Data Router。root 与项目 route 各配置一个
`ErrorBoundary`，子 route 不配置边界。让项目 loader 分别抛出 404 RouteErrorResponse 与普通 Error，让 action
抛出 409；边界使用 `useRouteError` 完成 RouteErrorResponse、Error、unknown 三分支，并为短暂 loader 错误
提供 `revalidate()` 重试，为其他错误提供安全导航。

**验收：** 项目 loader/action 错误由项目边界处理且 root shell 保留；无边界子 route 的 render error 向项目边界
冒泡；移除项目边界后同一错误改由 root 处理；404/409 显示 status、statusText 与 data，普通 Error 不伪造
status；loader 第二次成功后同 location 恢复正常页面，action 次数不会因为 revalidate 增加；没有同时配置
`ErrorBoundary` 与 `errorElement`。
:::

## 十四、本节小结

- Route Error Boundary 把 Data Router 已知的数据与渲染失败交给最近 route 错误界面。
- `ErrorBoundary` 接组件类型，`errorElement` 接 element，同一 route 只选一种。
- `useRouteError` 返回 `unknown`，必须依次处理 RouteErrorResponse、Error 与未知值。
- `throw data` 和抛出的非重定向 Response 可以携带 HTTP 风格状态；普通 Error 不应伪造 status。
- loader、action 与 route component render 错误都可能进入 route boundary。
- 最近边界包括出错 route 自己；边界位置决定保留哪些祖先 UI。
- 默认边界是最后兜底，正式应用仍需要 root 和必要的局部恢复界面。
- 导航与 Back 用于离开错误 location；revalidate 只重跑 loader，不会重放 action。

## 十五、参考资料

- React Router 8.3.0 Release (https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 本课稳定版本与固定源码起点。
- npm react-router Latest Metadata (https://registry.npmjs.org/react-router/latest) - `latest` 稳定标签核验。
- Error Boundaries Guide (https://reactrouter.com/8.3.0/how-to/error-boundary) - Data Mode 配置、三类错误值、最近边界与适用边界。
- Route Component API (https://reactrouter.com/8.3.0/api/components/Route) - `ErrorBoundary` 与 `errorElement` 的参数形式。
- useRouteError API (https://reactrouter.com/8.3.0/api/hooks/useRouteError) - route boundary 的 `unknown` 错误读取入口。
- isRouteErrorResponse API (https://reactrouter.com/8.3.0/api/utils/isRouteErrorResponse) - RouteErrorResponse 收窄与公开字段。
- Error Selection and Rendering Source (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/hooks.tsx#L955-L1372) - 默认边界、最近边界与 render-error 处理证据。
- Error Response Conversion Source (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6765-L6797) - Response body 解包与 ErrorResponse 转换。
- Navigation Error Tests (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/navigation-test.ts#L587-L712) - loader 错误归属、冒泡与新 location 恢复。
- useRevalidator Error Recovery Tests (https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/use-revalidator-test.tsx#L126-L237) - loader 显式重试成功后的恢复行为。
