---
id: react.router.learn.intermediate.lab-auth-admin-workspace
type: lesson
title: 实战：鉴权管理后台
summary: 组合 middleware、typed context、Form action、Fetcher、错误边界与安全回跳，完成一个可观察的 Data Mode 鉴权管理后台。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 210
prerequisites:
  - react.router.learn.intermediate.auth-route-boundary
  - react.router.learn.intermediate.loader-data-loading
  - react.router.learn.intermediate.loader-requests-and-redirects
  - react.router.learn.intermediate.action-data-submission
  - react.router.learn.intermediate.form-navigation-form
  - react.router.learn.intermediate.action-results-and-form-validation
  - react.router.learn.intermediate.fetcher
  - react.router.learn.intermediate.revalidation
  - react.router.learn.intermediate.route-error-boundary
  - react.router.learn.intermediate.route-metadata-and-breadcrumbs
related:
  - react.router.learn.basics.nested-routes-and-outlet
  - react.router.learn.basics.route-params
  - react.router.learn.intermediate.lab-content-management-workspace
tags:
  - React Router
  - Data Mode
  - 实战
  - 鉴权
  - middleware
  - context
  - Form
  - Fetcher
  - ErrorBoundary
  - 安全回跳
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-26
objectives:
  - 能把公开页、登录页和受保护后台组织成静态 Data Mode route tree。
  - 能用 middleware 与 createContext 在 loader/action 前完成认证并传递当前用户。
  - 能区分未登录 redirect、已登录但无权限的 403 和资源不存在的 404。
  - 能用 Form action 完成登录、登出和权限编辑，用 Fetcher 完成不改变 URL 的局部操作。
  - 能校验 returnTo，避免把用户输入直接交给 redirect 造成外部跳转。
  - 能用 ErrorBoundary、useMatches 和自动 revalidation 组织恢复路径与后台导航元数据。
recap:
  - middleware 是进入受保护 loader/action 前的共享认证边界，context 是本次路由请求的身份传递通道。
  - 认证和授权是两个阶段：未登录通常重定向到登录页，已登录但缺少权限则返回 403。
  - 登录、登出和权限保存属于会改变服务端状态的 action；行内启停适合用 Fetcher 保持当前地址。
  - redirect 接受绝对 URL，任何来自用户的 returnTo 都必须先限制为明确的同源路径。
  - action 成功后 Router 会自动重新验证相关 loader；普通 CRUD 不需要额外手动刷新。
  - 生产认证仍需要服务端 session、Cookie、CSRF、凭据和权限系统，本 Demo 的内存 session 只用于观察路由机制。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - 8.3.0 是核验时的稳定发布版本，并对应固定 release 与 tag。
  - title: React Router 8.3.0 Middleware
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/how-to/middleware.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Data Mode route object 可以声明 middleware，并通过 context 向 loader/action 传递值。
      - middleware 适合认证、日志和请求前置处理，未认证时可以抛出 redirect。
  - title: React Router 8.3.0 Sessions and Cookies
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/explanation/sessions-and-cookies.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - session 通常在 loader/action 中读取和写入，登录与登出属于 action。
      - 登出等 mutation 不应放在 loader 中。
  - title: React Router 8.3.0 Route Object
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/start/data/route-object.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - route object 可以组合 loader、action、middleware、handle 与 ErrorBoundary。
      - action 成功后会自动重新验证当前页面需要的 loader data。
  - title: React Router 8.3.0 redirect
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/api/utils/redirect.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - redirect 返回带 Location 的 Response，并且可以导航到绝对 URL。
      - 应用必须验证任何用户提供的 redirect 输入。
  - title: React Router 8.3.0 Error Boundaries
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/how-to/error-boundary.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - loader、action 或组件错误由最近的 route ErrorBoundary 处理。
      - isRouteErrorResponse 可以区分带状态的 4xx/5xx route error。
  - title: React Router 8.3.0 useFetcher
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/api/hooks/useFetcher.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - Fetcher 可以在不改变 URL 的情况下调用 loader/action，并维护独立状态。
  - title: React Router 8.3.0 useMatches
    url: https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/api/hooks/useMatches.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - useMatches 返回活动匹配的 id、pathname、params、loaderData 和 handle。
---

# 实战：鉴权管理后台

## 一、学习目标

- 能把公开页、登录页、后台布局、用户列表和用户详情翻译成一棵静态 Data Mode route tree。
- 能把“有没有登录”和“有没有某个权限”拆成 middleware、loader/action 两个清晰阶段。
- 能用安全的 `returnTo` 完成登录后回跳，并解释为什么不能直接信任查询参数。
- 能用页面级 `<Form>` 和局部 `fetcher.Form` 分别表达导航型与不导航的 mutation。
- 能让 401/redirect、403、404 和 400 表单错误出现在各自正确的反馈边界。

本实战使用内存数据模拟 session 和用户，不实现真实密码校验、JWT、OAuth、Cookie session、CSRF 或完整
RBAC。目标是掌握 React Router 的路由数据边界；生产认证仍必须由服务端安全系统负责。

## 二、为什么需要

后台最容易出现的漏洞不是“没有登录页”，而是数据入口没有被保护：组件隐藏了按钮，loader 却已经加载了
敏感数据；页面没有管理员链接，action 却仍然接受了普通用户的写入；登出只改了一个 React state，旧的
route data 还留在界面中。

鉴权后台还同时面对几种不同的结果：未登录用户需要回到登录流程，已登录但无权用户应该看到 403，输入
错误应该留在表单页，资源不存在则由局部 404 边界处理。把它们全都变成“跳登录”或“全局报错”，用户和
开发者都无法判断下一步应该做什么。

先画出路由职责，可以让每个请求入口都有明确的所有权：

```text
/                         公开入口
├── /login                登录 action + 安全 returnTo
└── /admin                middleware + 当前用户摘要 + 登出 action
    ├── /admin/users      用户列表 loader + 面包屑
    ├── /admin/users/:id  用户详情 loader + 最近 ErrorBoundary
    │   └── /permissions  页面级权限编辑 action
    └── /admin/forbidden  403 权限示例
```

## 三、核心概念

### 1. middleware 是认证边界，context 是身份通道

受保护 route 的 middleware 在进入下游 loader/action 前读取当前 session。认证失败时抛出 redirect；认证
成功时把当前用户写入 `createContext` 创建的 typed key：

```tsx
const currentUserContext = createContext<User | null>(null)

const authMiddleware: MiddlewareFunction = async ({ context, request }, next) => {
  const user = await getUserFromSession(request)
  if (!user) {
    throw redirect(`/login?returnTo=${encodeURIComponent('/admin')}`)
  }
  context.set(currentUserContext, user)
  await next()
}
```

后续 loader/action 只从 context 读取已经检查过的身份：

```tsx
async function adminLoader({ context }: LoaderFunctionArgs) {
  const user = context.get(currentUserContext)
  if (!user) throw data('Unauthorized', { status: 401 })
  return { user, permissions: user.permissions }
}
```

父 loader 是数据所有权边界，不是子 loader 的执行锁。默认匹配的 loader 可能并行运行；需要“先认证、再
提供身份”的共享链时，应使用 middleware。每个敏感 action 仍要在自己的 route 边界确认权限，因为
`Form`、`useSubmit` 和 Fetcher 都可以直接触发 action。

### 2. 认证、授权和错误结果各自表达不同事实

| 情况 | 路由结果 | 用户看到的下一步 |
| --- | --- | --- |
| 没有有效 session | `redirect('/login?...')` 或 401 | 登录并回到受控入口 |
| 已登录但没有所需权限 | `data(..., { status: 403 })` | 返回允许访问的后台页面 |
| 目标用户不存在 | `data(..., { status: 404 })` | 返回用户列表 |
| 输入字段不合法 | action 返回 400 data | 留在表单中修正字段 |
| 服务或程序失败 | 抛出错误，由最近 ErrorBoundary 呈现 | 重试或离开当前分支 |

400 校验是可预期的交互结果，不应该把编辑表单替换成错误页。403 和 404 则是当前 route 分支无法继续
完成的结果，适合交给最近的 ErrorBoundary，并在边界内提供明确的恢复链接。

### 3. returnTo 必须先变成安全的站内路径

`redirect()` 本身可以接受绝对 URL，因此不能把用户提供的 `returnTo` 原样拼进登录跳转。一个最小的
课程级策略是：只接受以单个 `/` 开头、解析后仍属于本站、且路径位于 `/admin` 下的目标；其他值回退到
固定 `/admin`：

```tsx
function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin'
  const target = new URL(value, 'https://demo.local')
  if (target.origin !== 'https://demo.local') return '/admin'
  if (target.pathname !== '/admin' && !target.pathname.startsWith('/admin/')) return '/admin'
  return `${target.pathname}${target.search}${target.hash}`
}
```

这是本课为了观察边界而采用的最小白名单，不是完整的生产开放重定向审计。真实应用还应结合自己的路由
白名单、部署域名、session 和安全策略。

### 4. Form、Fetcher 与登出 action

登录、登出和权限编辑都会改变服务端状态，并且登录成功或保存成功有明确的导航结果，因此使用普通
`<Form method="post">`。用户列表的启停是局部 mutation，成功后仍留在列表，使用 `fetcher.Form`：

```tsx
const statusFetcher = useFetcher()

<statusFetcher.Form method="post" action={`/admin/users/${user.id}/status`}>
  <button disabled={statusFetcher.state !== 'idle'}>
    {statusFetcher.state === 'idle' ? '切换状态' : '处理中'}
  </button>
</statusFetcher.Form>
```

登出必须是 action，而不是 loader 或组件渲染副作用。action 清除 session 后 redirect 到登录页；普通
action 成功返回后，Router 会自动重新验证当前页面相关 loader，减少手写“同步用户摘要”的机会。

### 5. 父子 loader、面包屑与局部错误边界

`/admin` 父 route 拥有当前用户和权限摘要；`/admin/users` 只拥有用户列表；`:userId` 只拥有单个用户。
父布局用 `useRouteLoaderData` 读取自己的数据，用户详情用自己的 `useLoaderData`，不会把所有数据塞进
一个全局 store。

路由可以用 `handle` 声明导航元数据，后台布局再通过 `useMatches()` 读取活动匹配链：

```tsx
const routes = [
  { id: 'admin', path: '/admin', handle: { breadcrumb: '管理后台' }, children: [
    { id: 'users', path: 'users', handle: { breadcrumb: '用户管理' } },
  ] },
]
```

用户详情的 loader 抛出 404 时，详情 route 的最近 ErrorBoundary 可以保留后台外框、用户摘要和返回列表
入口。错误边界使用 `useRouteError()` 与 `isRouteErrorResponse()` 读取状态，不需要组件另外请求用户数据。

## 四、用法与示例

### 1. 保护 loader 和 action 两条入口

```tsx
const routes = [
  { path: '/logout', action: logoutAction },
  {
    path: '/admin',
    middleware: [authMiddleware],
    loader: adminLoader,
    children: [
      { path: 'users', loader: usersLoader },
      { path: 'users/:userId/permissions', action: savePermissionsAction },
    ],
  },
]
```

middleware 负责“当前请求有没有身份”；`usersLoader` 和 `savePermissionsAction` 负责自己的细粒度权限。
不要因为用户列表上没有显示“编辑”按钮，就省略 action 中的权限检查。

### 2. 登录 action 返回可修正的错误

```tsx
async function loginAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')
  if (!username || password.length < 8) {
    return data({ message: '请检查账号和密码' }, { status: 400 })
  }
  await createSession(username)
  return redirect(safeReturnTo(new URL(request.url).searchParams.get('returnTo')))
}
```

登录失败仍留在登录页面，成功后才导航到安全目标。这个示例的密码校验只是教学占位，不能直接用于生产。

### 3. 权限编辑用普通 Form，行内启停用 Fetcher

权限编辑成功后返回用户详情，适合普通 Form；列表中切换一个账号的启停状态，不改变地址，适合 Fetcher。
两者调用 action 后都能触发相关 loader 的自动重新验证，但 pending 的观察范围不同：前者来自
`useNavigation()`，后者来自当前 fetcher 的 `state`。

### 4. 403 不是登录失败

```tsx
const user = context.get(currentUserContext)
if (!user) throw data('Unauthorized', { status: 401 })
if (!user.permissions.includes('audit:read')) {
  throw data('当前账号没有 audit:read 权限。', { status: 403 })
}
```

普通编辑者访问 `/admin/forbidden` 时应看到 403；管理员访问同一页面则能看到成功内容。两种身份都已
通过 middleware，差别只在授权阶段。

### 5. 登出后清除 session，再回到登录流程

```tsx
async function logoutAction({ context }: ActionFunctionArgs) {
  const user = context.get(currentUserContext)
  if (!user) throw data('Unauthorized', { status: 401 })
  await destroySession(user.id)
  return redirect('/login?returnTo=%2Fadmin')
}
```

重新访问 `/admin/users` 时，middleware 应再次拦截，而不是继续显示上一次的用户列表。若业务是 session 在
当前页面外失效，则可以使用 `useRevalidator()` 作为显式恢复动作；普通登录、登出和 CRUD mutation 优先
由 Form 或 Fetcher 触发。

## 五、Demo：鉴权管理后台

Demo 使用独立的内存 Router 和内存 session，提供 editor 与 admin 两个演示账号。可以依次观察：

1. 直接进入 `/admin/users`，确认 middleware 把未登录请求送到 `/login`，并显示经过校验的 `returnTo`。
2. 输入错误密码，确认 400 action data 留在登录页；使用有效账号后回跳到后台。
3. 使用 editor 访问用户列表和 `/admin/forbidden`，确认可以区分可读数据与 403 权限拒绝。
4. 使用 admin 打开用户详情，保存权限并观察普通 Form 的 pending、redirect 和父级摘要重新验证。
5. 在用户列表中切换账号启停，确认 Fetcher 显示独立 pending，地址保持不变，列表数据随后自动更新。
6. 直接打开不存在的用户 ID，确认最近详情 ErrorBoundary 显示 404，并能返回用户列表。
7. 点击登出后再次进入受保护地址，确认 session 已清除并重新进入登录边界。
8. 将 `returnTo` 改成 `https://evil.example` 或 `//evil.example`，确认安全目标回退到 `/admin`。

:::demo{id="react.router.learn.intermediate.lab-auth-admin-workspace.auth-admin-workspace-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：只在组件里隐藏后台链接

**触发条件：** 组件不显示管理员按钮，就认为 loader/action 已经安全。

**原因：** 用户仍然可以直接输入 URL，或者通过 Form、Fetcher 直接调用 action。

**后果：** 敏感数据可能已加载，写入 action 可能绕过界面限制。

**错误示例：**

```tsx
return user?.permissions.includes('users:write') ? <AdminLink /> : null
```

**正确写法：** 在 middleware 中确认 session，在各自 loader/action 中确认细粒度权限。

```tsx
if (!user?.permissions.includes('users:write')) {
  throw data('Forbidden', { status: 403 })
}
```

**验证方式：** 直接导航到受保护 URL，并分别触发 loader 与 action，确认未授权请求在 handler 前被拦截。

### 错误：把 403 当成 401

**触发条件：** 已登录但没有 `audit:read` 时也一律重定向到登录页。

**原因：** 认证和授权是两个不同阶段。

**后果：** 用户不知道当前身份有效但权限不足，也无法回到可访问页面。

**错误示例：**

```tsx
if (!user?.permissions.includes('audit:read')) throw redirect('/login')
```

**正确写法：** 无用户走 redirect/401；有用户但缺少权限抛 403，由最近 ErrorBoundary 呈现。

```tsx
if (!user) throw redirect('/login')
if (!user.permissions.includes('audit:read')) throw data('Forbidden', { status: 403 })
```

**验证方式：** 分别用 editor 和 admin 访问同一个权限页面，比较 middleware 检查和 403 边界结果。

### 错误：直接信任 returnTo

**触发条件：** `redirect(request.url.searchParams.get('returnTo'))`。

**原因：** redirect 支持绝对 URL，用户输入可能指向外部站点。

**后果：** 登录流程变成开放重定向入口。

**错误示例：**

```tsx
return redirect(new URL(request.url).searchParams.get('returnTo') ?? '/admin')
```

**正确写法：** 解析目标、限制同源和允许路径，非法值回退固定站内地址。

```tsx
return redirect(safeReturnTo(new URL(request.url).searchParams.get('returnTo')))
```

**验证方式：** 测试绝对外链、协议相对路径和站内未知路径，确认都不会跳出受控管理路径。

### 错误：把登出放在 loader

**触发条件：** 页面加载时通过 loader 或 `useEffect` 销毁 session。

**原因：** loader 是读取阶段，加载页面不应产生 mutation。

**后果：** 刷新、预取或其他读取行为可能意外改变会话，并引入 CSRF 风险。

**错误示例：**

```tsx
export async function loader() {
  return destroySession()
}
```

**正确写法：** 用 `<Form method="post">` 触发 logout action，再 redirect 到登录页。

```tsx
export async function action() {
  await destroySession()
  return redirect('/login')
}
```

**验证方式：** 观察登出只在提交 action 时发生，普通 GET 导航不会清除 session。

### 错误：为普通 mutation 再手动刷新所有 loader

**触发条件：** action 成功后又在 effect 中调用 `revalidator.revalidate()`。

**原因：** 忽略 action 成功后的默认自动 revalidation。

**后果：** 产生重复请求，pending 时序复杂，数据所有权变得不清楚。

**错误示例：**

```tsx
useEffect(() => {
  if (fetcher.data?.ok) revalidator.revalidate()
}, [fetcher.data, revalidator])
```

**正确写法：** 让 action 返回成功结果或 redirect；只在窗口聚焦、轮询或外部 session 失效等显式场景使用 `useRevalidator()`。

```tsx
record.active = true
return { ok: true }
```

**验证方式：** 执行一次权限或状态 mutation，确认相关 loader 在 Router 的提交流程中同步更新。
:::

## 七、源码推导与适用场景

### 1. 官方事实

React Router 8.3.0 的 Data Mode route object 支持 middleware、loader、action、handle 和 ErrorBoundary。
middleware 可以向本次路由 context 写入身份，action 负责登录、登出等 mutation，成功 action 默认触发
相关 loader 的重新验证；Fetcher 则提供不导航的局部交互。

官方 sessions 文档把 session 读取和写入放在 loader/action，并明确建议把登出放到 action。redirect 文档
提醒它可以接受绝对 URL，因此用户提供的跳转目标必须经过应用自己的验证。错误边界文档说明最近边界可
处理 loader/action 错误，并可用 `isRouteErrorResponse` 读取 4xx/5xx 状态。

### 2. 课程推导

由这些能力可以推导出后台的组合方式：

1. 用静态 route tree 让受保护入口和错误边界在匹配阶段可见。
2. 用 middleware/context 共享认证结果，避免每个组件自行猜测用户身份。
3. 用 loader/action 分配数据读取与写入，再按导航意图选择 Form 或 Fetcher。
4. 用 401/403/404/400 的不同结果表达不同恢复动作。
5. 用 handle/useMatches 让后台布局消费路由元数据，用自动 revalidation 保持摘要一致。

### 3. 适用边界

这种结构适合中小型管理后台、配置中心、内容平台和用户管理工作区。它能清楚表达路由数据所有权和交互
边界，但不等于完整的身份系统。

本课不实现真实 session storage、密码哈希、Token/OAuth、CSRF、跨域策略、RBAC/ABAC 建模、并发写入、
竞态处理或 Optimistic UI。生产系统应让服务端认证、授权、审计和数据一致性承担相应责任。

## 八、练习

:::exercise
### 练习目标

**要求：** 为后台新增一个 `/admin/audit` 路由：只有拥有 `audit:read` 的用户能读取；未登录用户回到登录
页；已登录但无权限用户看到 403。为用户详情增加一个“禁用账号” Fetcher action，要求地址不变、按钮拥有
独立 pending，并让列表在 action 成功后自动更新。最后让登录页同时接受 `/admin/users` 和
`/admin/users/:userId` 两个安全回跳目标，并拒绝外部 URL。

**验收：** editor 和 admin 的认证检查次数、授权结果和错误边界可区分；登出只能通过 action；Fetcher 不
改变 pathname/search；400 表单错误保留当前页面；action 成功后不额外手动刷新；不引入 JWT、全局用户 store、
动态 route discovery 或自定义 `dataStrategy`。
:::

## 九、本节小结

- middleware 在受保护 handler 前完成认证，typed context 让 loader/action 共享已经确认的用户。
- 未登录、无权限、资源不存在和字段校验失败分别使用 redirect/401、403、404 和 action data 表达。
- 登录、登出、权限编辑用 Form action；不改变地址的行内启停用 Fetcher。
- returnTo 必须经过同源和允许路径校验，不能把用户输入直接交给 redirect。
- 最近 ErrorBoundary 保留后台外框并提供局部恢复，handle/useMatches 提供面包屑元数据。
- action 成功后优先依靠自动 revalidation；useRevalidator 留给外部失效、聚焦或轮询等显式场景。

## 十、参考资料

- [React Router 8.3.0 Middleware](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/how-to/middleware.md) - Data Mode middleware、context 和认证边界。
- [React Router 8.3.0 Sessions and Cookies](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/explanation/sessions-and-cookies.md) - session 读取、登录与登出 action。
- [React Router 8.3.0 Route Object](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/start/data/route-object.md) - loader、action、handle、middleware 与自动重新验证。
- [React Router 8.3.0 redirect](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/api/utils/redirect.md) - redirect Response 与用户输入校验边界。
- [React Router 8.3.0 Error Boundaries](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/how-to/error-boundary.md) - 最近 ErrorBoundary 和 4xx/5xx route error。
- [React Router 8.3.0 useFetcher](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/api/hooks/useFetcher.md) - 不导航的局部交互和独立 pending。
- [React Router 8.3.0 useMatches](https://raw.githubusercontent.com/remix-run/react-router/react-router%408.3.0/docs/api/hooks/useMatches.md) - active matches、loaderData 与 handle。
