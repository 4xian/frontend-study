---
id: react.router.learn.intermediate.auth-route-boundary
type: lesson
title: 鉴权路由边界
summary: 在 Data Mode 中把登录检查、身份传递、权限拒绝与登出后的重新验证放在正确的路由数据边界。
domain: frontend
technology: react
module: router
stage: intermediate
level: intermediate
estimatedMinutes: 35
objectives:
  - 能把登录检查放在 Data Mode 受保护 route 的 middleware 边界。
  - 能用 redirect 和白名单回跳处理未登录导航。
  - 能用 typed context 把用户身份传给 loader 与 action。
  - 能区分 401、403、重定向和 Route Error Boundary。
  - 能在登出后导航离开或重新验证受保护数据。
recap:
  - 鉴权检查发生在 route handler 前，优先使用 middleware 作为共享边界。
  - context 传递已确认身份，loader/action 分别负责数据读写和权限细化。
  - 未登录走登录重定向，已登录但无权走 403 错误边界。
  - 回跳只允许明确的站内目标，登出后清除或重新验证 route data。
prerequisites:
  - react.router.learn.intermediate.loader-requests-and-redirects
  - react.router.learn.intermediate.route-data-reading-and-sharing
  - react.router.learn.intermediate.route-error-boundary
related:
  - react.router.learn.intermediate.revalidation
tags:
  - React Router
  - Data Mode
  - middleware
  - loader
  - action
  - 鉴权
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-25
sources:
  - title: React Router Middleware（Data Mode）
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/middleware.md
  - title: React Router Data Strategy
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/data-strategy.md
  - title: React Router Data Route Object
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/route-object.md
  - title: React Router redirect
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/utils/redirect.md
  - title: React Router createContext
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/utils/createContext.md
  - title: React Router Error Boundaries
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/error-boundary.md
  - title: React Router Sessions and Cookies
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/explanation/sessions-and-cookies.md
  - title: React Router useRevalidator
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/hooks/useRevalidator.md
  - title: React Router v8.3.0 middleware and default data strategy source
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts
  - title: React Router v8.3.0 context middleware tests
    url: https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/context-middleware-test.tsx
  - title: RFC 9110 HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110.html
---

# 鉴权路由边界

## 一、学习目标

- 能把“是否登录”的检查放到受保护 route 的 `middleware`，并理解它与 `loader`、`action` 的职责边界。
- 能用 `redirect()` 把未登录用户送到登录页，并只允许回到受控的站内路径。
- 能用 typed `context` 把已经确认的用户身份传给受保护的 `loader` 与 `action`。
- 能区分 401 未认证、403 已认证但无权限、重定向和 Route Error Boundary 的用途。
- 能在登出后让路由重新验证，避免界面继续显示旧的受保护数据。

## 二、为什么需要

只在组件里隐藏“管理员”按钮并不等于保护了路由。用户可以直接输入 URL，也可以提交一个 action；如果真正读取数据的 route 没有检查，受保护内容仍然会被加载。鉴权边界要发生在 route handler 之前，并且要覆盖读取和写入两条路径。

另一个常见问题是登录后回跳。把任意查询参数直接交给 `redirect()`，会把站内登录流程变成外链跳板。回跳目标应先解析，再与应用明确允许的站内路径比较。

## 三、核心概念

### 1. middleware 是进入 route handler 前的边界

Data Mode 的 route object 可以声明 `middleware`。鉴权 middleware 在 `next()` 前读取 session；没有用户时抛出 `redirect()`，有用户时把身份写入 context。这样，后续 loader 和 action 不需要各自重新猜测登录状态。

```tsx
import { createContext, redirect } from 'react-router'

const userContext = createContext<User | null>(null)

const authMiddleware = async ({ request, context }) => {
  const user = await getUserFromSession(request)
  if (!user) {
    throw redirect(`/login?returnTo=${encodeURIComponent('/workspace')}`)
  }
  context.set(userContext, user)
}

const routes = [
  {
    path: '/workspace',
    middleware: [authMiddleware],
    loader: ({ context }) => {
      const user = context.get(userContext)
      return getWorkspace(user)
    },
    action: ({ context, request }) => {
      const user = context.get(userContext)
      return updateWorkspace(user, request)
    },
  },
]
```

`middleware` 是边界，`loader` 负责读取数据，`action` 负责写入数据，组件只消费已经通过边界的数据。若某个 action route 没有经过同一个受保护父 route，就必须在它自己的边界上重新保护；不要把“导航时 UI 没显示”当成权限检查。

### 2. 401、403、redirect 与 Error Boundary

| 情况 | 适合的结果 | 说明 |
| --- | --- | --- |
| 没有有效登录会话 | `throw redirect('/login?...')` | 这是导航流程，不是错误页面；保留受控回跳目标。 |
| 已登录但缺少所需权限 | `throw data(body, { status: 403 })` | 仍留在路由错误边界中，向用户解释“身份有效但权限不足”。 |
| 请求需要重新登录或 session 已失效 | 401 响应或登录重定向 | 选择取决于应用的 API 合同；不要把 401 和 403 混为一谈。 |
| 真正的程序错误或数据加载失败 | 抛出 Error/Response，由最近的 `ErrorBoundary` 呈现 | 错误边界负责呈现与恢复，不替代每个数据入口的授权检查。 |

本课的 Demo 用 `data(..., { status: 403 })` 演示权限拒绝；实际项目应遵守后端 API 的状态码和 session 合同。

### 3. 身份通过 typed context 传递

React Router 的 context 不是随意挂属性的对象。用 `createContext` 创建稳定的 key，在 middleware 中 `context.set(key, value)`，在 loader/action 中 `context.get(key)`。这让“身份已检查”成为可见的路由数据契约。

```tsx
const userContext = createContext<User | null>(null)

async function protectedLoader({ context }: LoaderFunctionArgs) {
  const user = context.get(userContext)
  if (!user) throw data({ message: 'missing user' }, { status: 401 })
  return { user }
}
```

### 4. 父子 loader 不是鉴权锁

React Router 默认会并行执行当前导航需要运行的 loader。父 route 的 loader 不保证先返回，更不是子 loader 的前置锁；因此不要只把鉴权放在父 loader，期待它一定先于所有子 loader 完成。

如果需要可复用的“先检查、再把身份提供给后续 handler”的链，应使用官方 middleware/context seam；如果只在某个 handler 读取敏感数据，也要在这个 handler 所在的受保护 route 上确认授权。

### 5. 登出后的重新验证

登出是一次 action 或其他明确的状态变更。清除 session 后，应让当前导航离开受保护页面，或调用 `useRevalidator().revalidate()` 重新运行鉴权边界和 loader。只改一个 React state 不会自动清掉已经加载的 route data。

## 四、用法与示例

### 1. 受控回跳

```tsx
const allowed = new Set(['/workspace', '/workspace/admin'])

function safeReturnTo(request: Request) {
  const value = new URL(request.url).searchParams.get('returnTo')
  return value && allowed.has(value) ? value : '/workspace'
}

throw redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo(request))}`)
```

只允许预先定义的站内路径。不要接受 `https://example.com`、`//example.com` 或未经解析的任意字符串；更复杂的应用应使用自己的 URL 解析和路由白名单策略。

### 2. 保护 action，不只保护链接

```tsx
const routes = [
  {
    path: '/settings',
    middleware: [authMiddleware],
    loader: settingsLoader,
    action: saveSettingsAction,
  },
]
```

`Form`、`useSubmit` 和 `useFetcher` 都可能触发 action。保护 loader 而漏掉 action，会产生“页面看起来安全，但写入接口没有鉴权”的缺口。

### 3. 需要 403 时保留错误边界

权限不足不是“未登录”。让 route 抛出带有 403 状态的结果，再由最近的 `ErrorBoundary` 呈现拒绝信息；登录检查的 401/redirect 则回到登录流程。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.intermediate.auth-route-boundary.auth-boundary-demo"}
本 Demo 从 `/workspace` 开始：未登录时 middleware 计数增加，而受保护 loader/action 计数保持 0；选择 analyst 可进入工作区，但读取管理员区或直接提交管理员写 action 都会得到 403；选择 admin 可读取并提交管理员写操作。公开页不经过鉴权。登录页只接受白名单回跳；logout action 也从 middleware context 读取身份，再清除会话并导航回登录页。
:::

## 六、易错使用提示

:::pitfalls
### 错误：只在组件里隐藏受保护内容

**触发条件：** 只根据 React state 隐藏链接或按钮，没有在 route 数据入口检查身份。

**原因：** 直接 URL、loader、action 和 fetcher 不依赖组件是否显示。

**后果：** 敏感数据可能已经加载，写入 action 也可能被未授权调用。

**错误示例：**

```tsx
return user?.isAdmin ? <AdminPanel /> : null
```

**正确写法：**

```tsx
const routes = [{ path: '/admin', middleware: [authMiddleware], loader: adminLoader, action: adminAction }]
```

**验证方式：** 直接导航到 URL，并分别提交 loader/action，确认未授权请求在 handler 前被拦截。

### 错误：把父 loader 当成子 loader 的鉴权锁

**触发条件：** 只在布局父 route 的 loader 检查会话。

**原因：** 默认匹配的 loader 可以并行执行。

**后果：** 子 loader 可能已经发起敏感读取。

**错误示例：**

```tsx
const routes = [{ loader: authLoader, children: [{ loader: secretLoader }] }]
```

**正确写法：**

```tsx
const routes = [{ middleware: [authMiddleware], children: [{ loader: secretLoader }] }]
```

**验证方式：** 在父、子 handler 记录调用顺序；不要把父 loader 完成当成子 handler 的前置条件。

### 错误：把 401 和 403 混为一谈

**触发条件：** 已登录用户访问无权限资源时也统一跳登录。

**原因：** 认证确认和权限判断是两个阶段。

**后果：** 用户无法知道是需要登录还是账号没有权限。

**错误示例：**

```tsx
if (!user?.roles.includes('admin')) throw redirect('/login')
```

**正确写法：**

```tsx
if (!user) throw redirect('/login')
if (!user.roles.includes('admin')) throw data({ message: 'forbidden' }, { status: 403 })
```

**验证方式：** 分别使用未登录身份和普通已登录身份访问同一路由，确认结果分别是登录导航和 403 边界。

### 错误：直接信任 returnTo

**触发条件：** 直接把查询参数拼接到登录成功后的 `redirect()`。

**原因：** 参数可以是外部 URL 或协议相对 URL。

**后果：** 形成 open redirect。

**错误示例：**

```tsx
return redirect(new URL(request.url).searchParams.get('returnTo')!)
```

**正确写法：**

```tsx
const returnTo = allowed.has(value) ? value : '/workspace'
return redirect(returnTo)
```

**验证方式：** 使用 `returnTo=https://example.com` 和 `returnTo=//example.com`，确认都回到默认站内路径。

### 错误：登出只清 React state

**触发条件：** 登出后仍停在受保护页面，只把用户对象设为 `null`。

**原因：** Router 已缓存的 loader data 不会因为任意组件 state 变化而自动失效。

**后果：** 旧身份和受保护数据继续显示。

**错误示例：**

```tsx
setUser(null)
```

**正确写法：**

```tsx
await logout()
revalidator.revalidate()
navigate('/login', { replace: true })
```

**验证方式：** 登出后检查 URL、loader 重新执行状态和受保护内容是否消失。
:::

## 七、源码推导与适用场景

1. **官方事实：** React Router 8.3.0 的 Data Mode 文档将 middleware 定义为在 route handler 前后运行的嵌套链，并用 `context` 在 middleware、loader 和 action 之间传值；官方 Data Strategy 文档说明默认 loader 执行是并行的。
2. **课程推导：** 因此鉴权检查应靠 middleware 这样的共享前置 seam，敏感 loader/action 仍需落在该边界内；组件显示状态只能作为体验，不是安全边界。
3. **适用边界：** 本课不实现服务端 session、OAuth/OIDC、JWT 刷新、CSRF、SSR/RSC 或完整 RBAC/ABAC。真实项目必须遵守后端身份与 API 状态码合同；更完整的安全重定向体系属于独立高级主题。

## 八、练习

:::exercise
### 练习目标

**要求：** 把 Demo 的管理员 loader 改成一个“编辑设置”的 action，并保持同一条 middleware 边界；新增一个允许回跳的站内路径，再验证外部 URL 仍会回到默认入口；记录未登录访问、普通用户访问和管理员访问三种结果，解释为什么它们分别对应 redirect、403 和成功数据。

**验收：** 未登录访问先进入登录页；普通用户访问管理员区得到 403；管理员访问得到成功数据；外部回跳目标不会离开站内；登出后受保护数据不再继续显示。
:::

## 九、本节小结

- 鉴权要发生在 route handler 前，优先用 Data Mode middleware 作为共享边界。
- `context` 传递已经确认的身份；loader/action 负责各自的数据读写和权限细化。
- 未登录可以走 401 响应或登录重定向，已登录但无权走 403 错误边界；三者不要混淆。
- 登录回跳只接受明确允许的站内目标，登出后必须导航离开或重新验证。

## 十、参考资料

- [React Router 8.3.0 Middleware](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/middleware.md) - 支持 Data Mode 的 middleware、鉴权 redirect、context 传值、执行时机与错误边界行为。
- [React Router 8.3.0 Data Strategy](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/data-strategy.md) - 说明默认 loader 并行执行及 middleware 与 handler 的执行关系。
- [React Router 8.3.0 Data Route Object](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/start/data/route-object.md) - 说明 route object 的 `middleware`、`loader` 与 `action` 字段。
- [React Router 8.3.0 redirect](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/utils/redirect.md) - 说明重定向 Response、默认状态与用户输入 URL 的验证要求。
- [React Router 8.3.0 createContext](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/utils/createContext.md) - 说明 typed context 的创建、默认值和 set/get 合同。
- [React Router 8.3.0 Error Boundaries](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/error-boundary.md) - 说明状态响应与错误由最近 route boundary 呈现。
- [React Router 8.3.0 Sessions and Cookies](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/explanation/sessions-and-cookies.md) - 说明 logout mutation 应由 action 清 session 后 redirect。
- [React Router 8.3.0 useRevalidator](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/api/hooks/useRevalidator.md) - 说明正常 mutation 之外的显式重验证用途。
- [React Router 8.3.0 router.ts](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/lib/router/router.ts) - 固定源码证明 middleware pipeline 和默认并行 loader 策略。
- [React Router 8.3.0 context middleware tests](https://github.com/remix-run/react-router/blob/2edaca7a4f12a50cad002d55d84f73b0cdd462b6/packages/react-router/__tests__/router/context-middleware-test.tsx) - 固定官方测试证明 middleware 顺序和 context 传递。
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - 定义 401 Unauthorized 与 403 Forbidden 的 HTTP 语义。
