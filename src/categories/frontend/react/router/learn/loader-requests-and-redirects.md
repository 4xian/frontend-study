---
id: react.router.learn.intermediate.loader-requests-and-redirects
type: lesson
title: Loader 请求与重定向
summary: 读取 loader 的标准 Request，并在数据流程中安全地取消工作、重定向或替换历史记录。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 105
prerequisites:
  - react.router.learn.intermediate.loader-data-loading
related:
  - react.router.learn.basics.query-params-and-url-state
  - react.router.learn.basics.programmatic-navigation
  - react.router.learn.basics.location-and-history-state
tags:
  - React Router
  - Data Mode
  - LoaderFunctionArgs
  - Request
  - AbortSignal
  - redirect
  - replace
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-20
objectives:
  - 能说明普通客户端 loader 导航中 Request 的 method、url、headers 与 signal 边界。
  - 能从 request.url 读取并校验查询参数，而不与动态路径参数混淆。
  - 能把 request.signal 传给支持取消的数据工作，并解释 Router 取消与底层取消的区别。
  - 能用 redirect 或 replace 表达数据流程中的导航结果，并预测 history 的 PUSH 或 REPLACE。
  - 能区分应用内 Location、外部 URL 与 redirectDocument 的整页导航边界。
  - 能追踪 loader 结果被识别、规范化并启动重定向导航的固定源码路径。
recap:
  - 普通客户端 loader 导航的 Request 默认是 GET，URL 为绝对地址并保留 search，headers 不保证包含业务凭据。
  - 查询参数从 new URL(request.url).searchParams 读取，得到的字符串仍需按业务规则校验。
  - 新导航会 abort 旧 signal；底层 fetch 或自定义任务仍需显式接收 request.signal。
  - redirect 与 replace 都返回带 Location 的 Response，但前者通常沿用 PUSH，后者明确使用 REPLACE。
  - return 和 throw 都能交出 redirect Response；Router 只识别合法重定向状态与 Location。
  - 相对 Location 按 route match 解析；跨源、basename 外或 redirectDocument 会进入整页导航。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本，并对应固定 tag 与提交。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在 2026-08-20 返回 8.3.0。
  - title: WHATWG Fetch Request
    url: https://fetch.spec.whatwg.org/#request-class
    sourceType: specification
    appliesTo: Fetch Living Standard
    claims:
      - Request 公开 method、url、headers 与 signal。
      - 没有显式 method 时 Request 使用 GET。
  - title: React Router 8.3.0 Loader Types
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L269-L340
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - LoaderFunctionArgs 为 loader 提供 Fetch Request 与当前匹配参数。
  - title: React Router 8.3.0 Client Request Construction
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6944-L6982
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 普通客户端 loader 导航用目标 URL 与当前 signal 构造 Request。
      - loader Request 的 URL 不包含 fragment。
  - title: React Router 8.3.0 Network Concurrency
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/explanation/concurrency.md#L20-L90
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 新导航会取消旧导航，loader 可以从 request.url 读取查询参数。
  - title: React Router redirect API
    url: https://reactrouter.com/api/utils/redirect
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - redirect 返回带 Location 的重定向 Response，并默认使用 302。
  - title: React Router replace API
    url: https://reactrouter.com/api/utils/replace
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - replace 让客户端重定向以 history.replaceState 落地。
  - title: React Router redirectDocument API
    url: https://reactrouter.com/api/utils/redirectDocument
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - redirectDocument 强制浏览器执行整页文档导航。
  - title: React Router 8.3.0 Redirect Utilities Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L2134-L2245
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - redirect、replace 与 redirectDocument 通过 Response header 表达不同导航意图。
  - title: React Router 8.3.0 Matched Loader Strategy Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6128-L6152
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 默认 data strategy 并行等待需要加载的 matched loaders。
  - title: React Router 8.3.0 Redirect Result Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L3416-L3435
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Router 把有效 redirect Response 规范化为 redirect result。
  - title: React Router 8.3.0 Redirect Settlement Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L2490-L2520
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - matched loaders settle 后 Router 查找并启动 redirect navigation。
  - title: React Router 8.3.0 Redirect Navigation Source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L3199-L3347
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - Router 规范化重定向目标，并在客户端导航与整页导航之间做选择。
      - replace 标记与原导航选项共同决定 PUSH 或 REPLACE。
---

# Loader 请求与重定向

## 一、学习目标

- 能解释普通 Data Mode 客户端导航交给 loader 的 `Request` 从哪里来，以及哪些字段可以可靠读取。
- 能用 `new URL(request.url)` 读取 search，并对缺失值、非法枚举和用户提供的目标做运行时校验。
- 能把 `request.signal` 传给 `fetch` 或自定义异步任务，区分 Router 不再接纳结果与底层工作真正停止。
- 能在 loader 中选择直接返回数据、`redirect()` 或 `replace()`，并预测中间 URL 与 history 的结果。
- 能区分相对 Location、应用绝对路径、外部绝对 URL 和 `redirectDocument()` 的导航边界。
- 能从固定版本源码解释 Request 构造、loader 执行、redirect 识别和最终导航的最短链路。

## 二、为什么 Loader 需要 Request

Loader 不只是“路由渲染前调用的函数”。同一条 route 可能因为不同 URL、不同查询条件或连续导航而执行：

```text
/reports?view=summary
/reports?view=detail
```

两个地址匹配同一条 `/reports` route，但 loader 需要知道本次目标 URL 才能选择数据。用户快速离开时，旧的
加载工作也不应覆盖新导航。某些输入还需要先规范化成唯一地址，或者直接把用户送到另一条 route。

Data Router 把这些输入集中在 Fetch API `Request` 中：

```tsx
async function reportsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const view = url.searchParams.get('view')

  const response = await fetch(`/api/reports?view=${view}`, {
    signal: request.signal,
  })

  return response.json()
}
```

这条链路把 URL 决策、导航取消和数据读取放在同一个 route loader 中。组件只消费已经提交的结果，不必在
render 后重新解释本次导航。

## 三、认识 Loader 的 Request

### 1. 它是标准 Fetch `Request`

`LoaderFunctionArgs.request` 使用 Web Fetch API 的 `Request`。常用字段如下：

| 字段      | 普通客户端 loader 导航中的含义                         | 本课边界                         |
| --------- | ------------------------------------------------------ | -------------------------------- |
| `method`  | 未发生数据提交时为 `GET`                               | 非 GET 提交属于独立的数据修改流 |
| `url`     | 目标地址的绝对字符串，包含 pathname 与 search          | fragment 不进入 loader Request  |
| `headers` | 标准 `Headers` 对象                                    | 不保证包含 Cookie 或业务 token  |
| `signal`  | 当前 navigation 的 `AbortSignal`                       | 需要显式传给底层工作             |
| `body`    | 普通 GET loader 导航没有 body                          | 表单 body 不在本课展开           |

Router 为客户端导航创建 Request 时会提供目标 URL 与当前 navigation signal。由于普通链接导航没有 mutation
submission，Request 使用 Web 平台的默认 `GET`，也不会凭空加入应用的认证 header。

不要把这里的浏览器内 Data Mode Request 与服务器收到的原始 HTTP 请求混为一谈。在带服务端 loader 的运行
模式中，Cookie、User-Agent 和部署代理 header 来自真实请求；纯客户端路由导航没有这个保证。

### 2. `request.url` 是绝对字符串

`request.url` 不是 `URL` 实例，先构造标准对象再读取各部分：

```tsx
function reportsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)

  return {
    pathname: url.pathname,
    view: url.searchParams.get('view'),
  }
}
```

Router 创建 loader Request 时移除 fragment，因此 loader 不应通过 `url.hash` 决定数据。只改变 fragment 的
导航也可以不重新执行 loaders；fragment 继续由页面锚点与浏览器滚动语义负责。

### 3. Search 输入仍需业务校验

`URLSearchParams` 只负责标准解析，不知道应用支持哪些值：

```tsx
const supportedViews = new Set(['summary', 'detail'])

function reportsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const view = url.searchParams.get('view')

  if (!view || !supportedViews.has(view)) {
    return replace('/reports?view=summary')
  }

  return { view }
}
```

`get()` 返回第一个字符串值或 `null`。多值输入使用 `getAll()`；数字、布尔值和枚举都需要显式解析。即使
TypeScript 把后续变量声明成联合类型，也不会自动校验地址栏中的运行时字符串。

动态 path 参数与 search 仍有不同所有权：`/reports/:reportId` 的 `reportId` 来自 `params`，
`?view=detail` 的 `view` 来自 `request.url`。相同名字不会让两者自动同步。

### 4. Headers 不能凭空提供凭据

`request.headers` 确实是标准 `Headers`，但普通客户端导航构造 Request 时没有自动复制
`document.cookie`、localStorage token 或应用自定义 header：

```tsx
function loader({ request }: LoaderFunctionArgs) {
  const authorization = request.headers.get('Authorization')
  // 普通客户端路由导航中不能假定这里存在应用 token
  return { hasAuthorization: authorization !== null }
}
```

Loader 再调用业务 API 时，应按该 API 的认证合同设置 `credentials` 或允许的 header。不要把所有 loader
Request headers 不加筛选地转发给另一台服务。

## 四、用 Signal 取消旧导航工作

### 1. 新导航会 abort 旧 navigation

每次客户端导航拥有自己的 `AbortController`。新导航开始时，Router 先 abort 旧 controller，再为新目标
创建 Request。旧 loader 结果不会成为新页面的数据。

但这里有两个不同层次：

1. Router 停止等待并拒绝提交旧导航结果。
2. Loader 发起的网络请求、计时器或 SDK 工作真正停止。

第一层由 Router 管理；第二层需要 loader 把 signal 继续传下去。

### 2. 把 `request.signal` 交给底层 API

Fetch 原生接收 `AbortSignal`：

```tsx
async function reportLoader({ request }: LoaderFunctionArgs) {
  const response = await fetch('/api/report', {
    signal: request.signal,
  })

  return response.json()
}
```

自定义工作也可以监听同一个 signal：

```tsx
function waitForReport(signal: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => resolve('ready'), 500)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}
```

取消是导航生命周期的一部分，不等于业务失败。不要为了展示一次预期中断就把它改成页面错误；专门的
错误边界有自己的数据与呈现合同。

### 3. 取消不等于远端回滚

Signal 可以停止浏览器继续等待或接收响应，但已经到达服务端的操作未必能撤回。本课只使用 GET 读取来
说明取消。数据修改需要单独考虑幂等性、事务与重新验证，不能由一次 client abort 推导出“服务端没有
执行”。

## 五、返回重定向 Response

### 1. `redirect()` 表达数据流程的导航结果

当 loader 已经知道当前 route 不应渲染时，直接返回重定向：

```tsx
import { redirect } from 'react-router'

function legacyReportsLoader() {
  return redirect('/reports?view=summary')
}
```

固定版本的 `redirect(url, init)` 返回一个 Fetch `Response`：

- body 为 `null`。
- 默认 status 为 `302`。
- `Location` header 保存目标。

Router 识别这个 Response 后，不会把它当作普通 loader data 交给组件，而是启动到目标 Location 的新导航。
原来的 route component 不会先 render 再跳走。

### 2. `return` 与 `throw` 都能触发 redirect

条件分支可以直接 return：

```tsx
function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)

  if (!url.searchParams.has('view')) {
    return redirect('/reports?view=summary')
  }

  return { view: url.searchParams.get('view') }
}
```

深层 guard 也可以 throw，以便立即退出当前调用栈：

```tsx
function requireProject(project: Project | undefined) {
  if (!project) throw redirect('/projects')
  return project
}
```

Router 会把正常返回值和抛出值分别收集，再统一识别其中的 redirect Response。选择 return 还是 throw 取决
于控制流是否清楚，不代表两种不同的导航协议。

### 3. Router 只识别合法重定向状态

重定向状态集合是 `301`、`302`、`303`、`307`、`308`，而且 Response 必须带 `Location`。下面的代码虽然
能创建 Response，却不会成为 Router redirect result：

```tsx
return redirect('/reports', 200)
```

普通 GET loader 使用默认 `302` 即可。不同状态对 mutation method 的保留规则属于数据提交语义，不需要
为了这条读取链展开。

## 六、区分 `redirect` 与 `replace`

### 1. 中间 URL 都不会提交

假设当前 history 只有 `/start`。用户点击 `/legacy-reports`，该 route loader 返回：

```tsx
return redirect('/reports?view=summary')
```

最终 history 是：

```text
/start -> /reports?view=summary
```

`/legacy-reports` 是仍在进行中的目标，没有成为一条可回退记录。但最终报告地址仍沿用这次普通链接导航
的 PUSH 意图，因此 Back 会回到 `/start`。

### 2. `replace()` 明确替换当前 entry

Canonical URL 规范化通常不希望非法地址保留在 history 中：

```tsx
import { replace } from 'react-router'

if (!supportedViews.has(view)) {
  return replace('/reports?view=summary')
}
```

若从只有 `/start` 的 history 进入非法地址，最终 summary 使用 REPLACE 落地，当前 entry 被替换：

| Loader 结果                    | 最终 navigation type | Back 的结果                      |
| ------------------------------ | --------------------- | -------------------------------- |
| `redirect('/reports?...')`     | 通常为 `PUSH`         | 回到重定向前已提交的地址         |
| `replace('/reports?...')`      | `REPLACE`             | 被替换的当前 entry 不再单独存在  |

“Redirect 替换触发它的导航”只表示中间目标不会提交，不表示普通 `redirect()` 永远使用
`history.replaceState`。需要明确 REPLACE 时使用公开的 `replace()`。

### 3. 原导航也可以携带 replace 意图

如果调用方本来就以 `{ replace: true }` 发起导航，后续普通 redirect 会沿用这个历史意图。最终 PUSH 或
REPLACE 由发起导航的选项和 redirect Response 标记共同决定，不能只看函数名字猜测。

## 七、解析 Location 与文档边界

### 1. 相对 Location 按 route match 解析

Loader 可以返回相对目标：

```tsx
return redirect('details')
```

Router 根据发出 redirect 的 route match 链解析它，而不是对 `request.url` 做字符串拼接。嵌套路由层级不
清楚时，应用内 guard 使用明确的绝对 path 更容易复核：

```tsx
return redirect('/reports/details')
```

### 2. 绝对 URL 可能离开 SPA

`redirect()` 也接受完整 URL。固定版本会判断目标 origin 与 basename：

- 同源且仍在当前 basename 内，可以规范化成客户端 route navigation。
- 跨源，或同源但离开当前 basename，需要浏览器执行 document navigation。

因此用户提供的 `next`、`returnTo` 或 `continue` 不能直接传给 redirect：

```tsx
const allowedTargets = new Set(['/reports', '/settings'])
const next = new URL(request.url).searchParams.get('next')
const target = next && allowedTargets.has(next) ? next : '/reports'

return redirect(target)
```

Allowlist 同时让可到达范围和 fallback 可审查，避免形成 open redirect。

### 3. `redirectDocument()` 强制整页导航

`redirectDocument('/reports')` 即使目标仍在应用内，也要求浏览器重新加载文档。它适合确实需要跨文档
边界的流程，不适合普通站内 canonical URL：

```tsx
import { redirectDocument } from 'react-router'

return redirectDocument('https://accounts.example.com/logout')
```

整页导航会重新请求 document，并丢失只存在于当前 SPA 内存中的状态。内部 route 跳转优先使用
`redirect()` 或 `replace()`。

## 八、用 Demo 观察请求与导航

下面的观察台使用独立 `createMemoryRouter`，不会改变学习站外层地址。可以验证五个结果：

1. “合法请求”显示 `GET`、`?view=detail`、Request URL 和提交时仍 active 的 signal。
2. “非法 view”被 `replace()` 规范为 summary，navigation type 是 `REPLACE`。
3. “旧入口”经 `redirect()` 到 summary，navigation type 是 `PUSH`；Back 返回起点而不停在旧入口。
4. “慢速后立即详细”让第二次导航 abort 慢任务，最终只提交详细报告并增加 aborted work 计数。
5. “只改 hash”改变当前 fragment，但不增加 loader runs。

Demo 的慢任务是确定性的本地观察探针，不模拟真实后端，也不把模块级计数当作应用状态方案。界面不读取
pending state，只展示最后一次已经提交的 loader data。

:::demo{id="react.router.learn.intermediate.loader-requests-and-redirects.request-redirect-demo"}
:::

## 九、易错使用提示

:::pitfalls
### 错误：把 `request.url` 当成 `URL` 对象

**触发条件：** 直接访问 `request.url.searchParams`。

**原因：** Fetch Request 的 `url` 属性是字符串。

**后果：** 代码无法通过类型检查，或者用字符串拆分写出不完整的解析逻辑。

**错误示例：**

```tsx
const view = request.url.searchParams.get('view')
```

**正确写法：**

```tsx
const view = new URL(request.url).searchParams.get('view')
```

**验证方式：** 同时输入编码值、重复参数和缺失参数，确认由标准 URL API 解析。

### 错误：用 `params` 读取查询参数

**触发条件：** URL 为 `/reports?view=detail`，loader 却读取 `params.view`。

**原因：** `params` 只来自 route pattern 的动态 path segment。

**后果：** `view` 始终是 `undefined`，loader 无法按当前查询选择数据。

**错误示例：**

```tsx
const view = params.view
```

**正确写法：**

```tsx
const view = new URL(request.url).searchParams.get('view')
```

**验证方式：** 保持 pathname 不变并切换 search，确认 loader 读到新的查询值。

### 错误：假定客户端 Loader Request 自带认证信息

**触发条件：** 直接从 `request.headers` 读取应用 token，并把缺失值当成 Router 异常。

**原因：** 普通客户端导航只用目标 URL 与 signal 创建 Request，不会自动复制应用凭据。

**后果：** 本地逻辑误判未登录，或把开发环境偶然存在的 header 当成稳定合同。

**错误示例：**

```tsx
const token = request.headers.get('Authorization')!
```

**正确写法：**

```tsx
const response = await fetch('/api/report', {
  credentials: 'same-origin',
  signal: request.signal,
})
```

**验证方式：** 在纯客户端 Data Router 中列出 headers，并按业务 API 的认证合同单独验证 fetch。

### 错误：发起 fetch 却不传 `request.signal`

**触发条件：** Loader 收到 signal，但底层请求没有使用它。

**原因：** Router 可以停止接纳旧结果，却无法自动取消 loader 自己创建的所有工作。

**后果：** 用户离开后旧网络或计算仍消耗资源。

**错误示例：**

```tsx
const response = await fetch('/api/report')
```

**正确写法：**

```tsx
const response = await fetch('/api/report', {
  signal: request.signal,
})
```

**验证方式：** 启动慢请求后立即导航到另一地址，确认旧 signal 为 aborted 且底层请求停止。

### 错误：认为 fragment 会驱动 Loader

**触发条件：** 通过 `new URL(request.url).hash` 选择服务端或路由数据。

**原因：** Fragment 不进入 loader Request，仅改变 hash 的导航也可以跳过 loaders。

**后果：** 依赖 fragment 的数据分支不会按预期执行。

**错误示例：**

```tsx
const section = new URL(request.url).hash
```

**正确写法：**

```tsx
const section = new URL(request.url).searchParams.get('section')
```

**验证方式：** 只切换 `#request`，确认 location hash 改变但 loader execution count 不变。

### 错误：给 `redirect` 使用成功状态码

**触发条件：** 调用 `redirect('/reports', 200)` 或手写没有合法重定向状态的 Response。

**原因：** Router 只识别 `301/302/303/307/308` 且带 `Location` 的 Response。

**后果：** 返回值被当成普通数据或非重定向响应，目标导航不会发生。

**错误示例：**

```tsx
return redirect('/reports', 200)
```

**正确写法：**

```tsx
return redirect('/reports')
```

**验证方式：** 检查 Response status 和 Location，并确认目标 route 的 loader 实际执行。

### 错误：认为 `redirect` 与 `replace` 的 Back 行为相同

**触发条件：** 只观察最终 pathname，没有检查 navigation type 与 history。

**原因：** 普通 redirect 不提交中间 URL，但最终通常沿用 PUSH；replace 明确替换当前 entry。

**后果：** Back 返回位置与产品预期不一致。

**错误示例：**

```tsx
// 错误假设：这一定会替换当前已提交 entry
return redirect('/reports?view=summary')
```

**正确写法：**

```tsx
return replace('/reports?view=summary')
```

**验证方式：** 从已知 initial entry 分别执行两种导航，再检查 `useNavigationType()` 与 Back 结果。

### 错误：把用户提供的目标直接交给 redirect

**触发条件：** 从 search 读取 `next` 后不校验 origin 或允许路径。

**原因：** `redirect` 接受完整外部 URL。

**后果：** 攻击者可以构造链接把用户送到不受信任站点，形成 open redirect。

**错误示例：**

```tsx
return redirect(new URL(request.url).searchParams.get('next')!)
```

**正确写法：**

```tsx
const allowedTargets = new Set(['/reports', '/settings'])
const next = new URL(request.url).searchParams.get('next')

return redirect(next && allowedTargets.has(next) ? next : '/reports')
```

**验证方式：** 分别输入允许路径、跨源 URL 和协议相对 URL，确认只有 allowlist 目标可达。
:::

## 十、源码推导与适用场景

### 1. Navigation 创建 Request 并拥有 signal

**官方事实：** 固定版本开始新 navigation 时先 abort 旧 controller，再创建新的 `AbortController`；普通
客户端 loader Request 由目标 URL 与新 signal 构造，未发生 submission 时不额外设置 method、headers 或
body。

**课程推导：** Loader 可以把 `request.signal` 作为当前导航工作的统一取消入口，并把 URL 视为本次数据
选择的权威输入。

**边界：** 服务器运行模式的 Request 可能来自真实 HTTP 请求；普通客户端观察结果不能替代该环境的
header、Cookie 或代理合同。

### 2. 默认策略先等待匹配 Loaders

**官方事实：** 固定版本的默认 data strategy 用 `Promise.all` 启动需要加载的 matched routes，收集结果后
才查找 redirect。

**课程推导：** Redirect 是导航结果，不是“立刻取消所有祖先和兄弟 loader”的性能捷径。Guard 应放在
拥有决策权的合理 route 层级，避免无意义的昂贵加载。

**边界：** 自定义 data strategy 可以改变调度方式；多个 matched loaders 同时竞争 redirect 也是应避免的
业务设计，不应依赖内部选择顺序。

### 3. Redirect Response 会被规范化

**官方事实：** Router 识别合法 redirect Response 后，按发出它的 match 解析相对 Location，再规范化绝对
URL、origin 与 basename。

**课程推导：** 应用内目标可以使用明确绝对 path；用户可控目标必须经过 allowlist 或严格同源校验。

**边界：** 内部 header 名称只是固定实现证据。应用代码应调用 `redirect`、`replace` 或
`redirectDocument`，不要手写 Router 私有标记。

### 4. 最终目标会开始一次新 Navigation

**官方事实：** 同源应用内 redirect 会再次进入 `startNavigation`；强制 document、跨源或 basename 外目标
则交给 `window.location`。Replace 标记与原导航意图决定最终 PUSH/REPLACE。

**课程推导：** 测试重定向不能只断言最终文本，还应断言中间 route 没有提交、目标 loader 已执行，以及
Back 行为符合产品意图。

**边界：** 重定向不提供缓存、跨 route 数据共享、等待界面或错误呈现；这些能力有各自的公开 API 与
所有权规则。

## 十一、练习

:::exercise
### 练习目标

**要求：** 创建 `/courses` loader，只接受 `level=basic`、`level=intermediate` 和 `level=advanced`。合法值
直接返回当前 level；缺失或非法值使用 `replace('/courses?level=basic')` 规范化。再新增
`/courses-legacy`，用普通 `redirect('/courses?level=basic')` 指向当前入口。为课程读取函数添加一个接收
`AbortSignal` 的确定性慢分支；先进入慢分支，再立即导航到另一个合法 level，确认旧 signal 被 abort、旧
结果没有提交。最后从已知起点分别访问 legacy 与非法 level，使用 navigation type 和 Back 对比 PUSH 与
REPLACE。练习不添加 pending 界面、数据提交、跨 route data hook、fetcher、重新验证或错误边界。

**验收：** 三个合法 level 都返回数据；非法输入最终地址唯一；legacy 中间地址不进入 history；慢任务收到
signal；任意外部 `next` 都不能成为重定向目标。
:::

## 十二、本节小结

- Loader 的 `request` 是标准 Fetch Request；普通客户端读取导航默认 GET，URL 包含 search 而不含 fragment。
- `request.headers` 的类型可靠，但具体业务凭据不能凭空假定；调用业务 API 时遵守其认证合同。
- `new URL(request.url).searchParams` 提供字符串输入，缺省值、枚举和重定向目标仍需运行时验证。
- Router abort 旧 navigation；底层 fetch 或自定义任务只有接收 `request.signal` 才能真正停止。
- `redirect()` 通常沿用 PUSH，`replace()` 明确使用 REPLACE；两者都不会提交仍在进行的中间 URL。
- Return 与 throw 都能交出 redirect Response，合法状态和 `Location` 决定 Router 是否启动目标导航。
- 相对 Location 按 route match 解析；跨源、basename 外或 `redirectDocument()` 会离开客户端路由流程。

## 十三、参考资料

- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 核验稳定发布与固定 tag。
- [npm react-router Latest Metadata](https://registry.npmjs.org/react-router/latest) - 核验 2026-08-20 的 npm latest 版本。
- [WHATWG Fetch Request](https://fetch.spec.whatwg.org/#request-class) - Request 的 method、url、headers 与 signal 公共合同。
- [Loader Types](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L269-L340) - LoaderFunctionArgs 与 Request 参数。
- [Client Request Construction](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6944-L6982) - 普通客户端 loader Request 的 URL、signal 与默认字段。
- [Network Concurrency](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/docs/explanation/concurrency.md#L20-L90) - 导航取消与 loader search 参数示例。
- [redirect API](https://reactrouter.com/api/utils/redirect) - redirect Response 的公开用法。
- [replace API](https://reactrouter.com/api/utils/replace) - REPLACE history 语义。
- [redirectDocument API](https://reactrouter.com/api/utils/redirectDocument) - 强制 document navigation 的边界。
- [Redirect Utilities Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/utils.ts#L2134-L2245) - 三种 redirect utility 的固定实现。
- [Matched Loader Strategy Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L6128-L6152) - 默认策略并行等待 matched loaders。
- [Redirect Result Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L3416-L3435) - redirect Response 识别与规范化入口。
- [Redirect Settlement Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L2490-L2520) - loaders settle 后启动 redirect navigation。
- [Redirect Navigation Source](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts#L3199-L3347) - Location 规范化、document 边界与 PUSH/REPLACE 选择。
