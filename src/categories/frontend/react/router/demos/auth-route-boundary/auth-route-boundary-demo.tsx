import {
  Form,
  Link,
  Outlet,
  RouterProvider,
  createContext,
  createMemoryRouter,
  data,
  isRouteErrorResponse,
  redirect,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useRevalidator,
  useRouteError,
  useRouteLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
  type RouteObject,
} from 'react-router'
import { createContext as createReactContext, useContext, useEffect } from 'react'
import './auth-route-boundary-demo.css'

type DemoUser = {
  id: string
  name: string
  roles: string[]
}

type DemoSession = {
  authenticated: boolean
  user: DemoUser | null
}

type DemoAudit = {
  authChecks: number
  protectedLoaderCalls: number
  protectedActionCalls: number
}

type DemoRuntime = {
  session: DemoSession
  audit: DemoAudit
}

type WorkspaceData = {
  greeting: string
  roles: string[]
}

type AdminData = {
  message: string
}

type LoginActionData = {
  message: string
}

type AdminActionData = {
  message: string
}

const userContext = createContext<DemoUser | null>(null)
const demoRuntimeContext = createReactContext<DemoRuntime | null>(null)

const users: Record<string, DemoUser> = {
  analyst: { id: 'u-analyst', name: '分析员 Lin', roles: ['reports:read'] },
  admin: { id: 'u-admin', name: '管理员 Kai', roles: ['reports:read', 'admin:write'] },
}

const safeReturnTargets = new Set(['/workspace', '/workspace/admin'])

/** 从 URL 中提取仅允许站内的登录后回跳地址。 */
function getSafeReturnTo(request: Request): string {
  const url = new URL(request.url)
  const requested = url.searchParams.get('returnTo') ?? url.pathname
  return safeReturnTargets.has(requested) ? requested : '/workspace'
}

/** 读取当前挂载对应的独立 Demo 运行时。 */
function useDemoRuntime(): DemoRuntime {
  const runtime = useContext(demoRuntimeContext)
  if (!runtime) throw new Error('鉴权路由边界 Demo 缺少运行时上下文')
  return runtime
}

/** 处理管理员页面的 route error，并显示 403 与 401 的职责差异。 */
function AdminErrorBoundary() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 500
  const message =
    isRouteErrorResponse(error) &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'message' in error.data
      ? String(error.data.message)
      : '请返回工作区后重试。'
  return (
    <section className="auth-route-boundary-card" role="alert" data-testid="auth-forbidden">
      <p className="auth-route-boundary-eyebrow">Authorization boundary</p>
      <h3>{status === 403 ? '已登录，但没有权限' : '受保护数据加载失败'}</h3>
      <p>{message}</p>
      <strong>HTTP {status}</strong>
    </section>
  )
}

/** 呈现登录页和 action 校验信息。 */
function LoginPage() {
  const actionData = useActionData() as LoginActionData | undefined
  const location = useLocation()
  const returnTo = new URLSearchParams(location.search).get('returnTo') ?? '/workspace'
  return (
    <section className="auth-route-boundary-card" data-testid="auth-login">
      <p className="auth-route-boundary-eyebrow">Authentication boundary</p>
      <h3>登录后回到原入口</h3>
      <p>returnTo：{returnTo}</p>
      {actionData?.message ? <p role="alert">{actionData.message}</p> : null}
      <Form
        method="post"
        action={`${location.pathname}${location.search}`}
        className="auth-route-boundary-form"
      >
        <label>
          演示身份
          <select name="username" defaultValue="analyst">
            <option value="analyst">analyst（只有 reports:read）</option>
            <option value="admin">admin（包含 admin:write）</option>
          </select>
        </label>
        <button type="submit">登录并回跳</button>
      </Form>
      <Form method="post" action="/workspace?index" replace>
        <button type="submit" name="intent" value="logout">
          未登录直接提交受保护 action
        </button>
      </Form>
    </section>
  )
}

/** 显示 middleware 写入的当前身份及其权限集合。 */
function WorkspacePage() {
  const data = useLoaderData() as WorkspaceData
  const workspaceData = useRouteLoaderData('auth-route-boundary-workspace') as
    WorkspaceData | undefined
  const revalidator = useRevalidator()
  const navigation = useNavigation()
  const runtime = useDemoRuntime()

  /** 模拟服务端 session 失效，并重新运行当前受保护 route 的鉴权链。 */
  function handleSessionExpiry() {
    runtime.session.authenticated = false
    runtime.session.user = null
    void revalidator.revalidate()
  }

  return (
    <section className="auth-route-boundary-card" data-testid="auth-workspace">
      <p className="auth-route-boundary-eyebrow">Protected route</p>
      <h3>{data.greeting}</h3>
      <p>身份数据来自 middleware 的 userContext，而不是组件自行猜测登录状态。</p>
      <dl className="auth-route-boundary-data">
        <div>
          <dt>roles</dt>
          <dd>{workspaceData?.roles.join(', ')}</dd>
        </div>
        <div>
          <dt>revalidator</dt>
          <dd data-testid="auth-revalidator">{revalidator.state}</dd>
        </div>
        <div>
          <dt>navigation</dt>
          <dd>{navigation.state}</dd>
        </div>
      </dl>
      <nav className="auth-route-boundary-links" aria-label="受保护页面">
        <Link to="/">公开页</Link>
        <Link to="/workspace">工作区</Link>
        <Link to="/workspace/admin">管理员区</Link>
      </nav>
      <Form method="post" action="/workspace?index" replace>
        <button type="submit" name="intent" value="logout">
          登出
        </button>
      </Form>
      <Form method="post" action="/workspace/admin">
        <button type="submit" name="intent" value="publish">
          尝试管理员写操作
        </button>
      </Form>
      <p className="auth-route-boundary-action-note">
        logout action 会先从 middleware context 读取当前身份，再清除演示会话。
      </p>
      <button type="button" className="auth-route-boundary-expire" onClick={handleSessionExpiry}>
        模拟 session 失效并重新验证
      </button>
      <Outlet />
    </section>
  )
}

/** 显示管理员权限通过后的受保护内容。 */
function AdminPage() {
  const data = useLoaderData() as AdminData
  const actionData = useActionData() as AdminActionData | undefined
  return (
    <section className="auth-route-boundary-card" data-testid="auth-admin">
      <h3>{data.message}</h3>
      {actionData?.message ? <p role="status">{actionData.message}</p> : null}
      <Form method="post">
        <button type="submit" name="intent" value="publish">
          执行管理员写操作
        </button>
      </Form>
    </section>
  )
}

/** 呈现不经过鉴权 middleware 的公开入口。 */
function PublicPage() {
  return (
    <section className="auth-route-boundary-card" data-testid="auth-public">
      <p className="auth-route-boundary-eyebrow">Public route</p>
      <h3>公开说明页</h3>
      <p>这个 route 不读取受保护数据，可以直接访问。</p>
      <Link to="/workspace">进入受保护工作区</Link>
    </section>
  )
}

/** 呈现全局导航、当前地址和本课可观察状态。 */
function Shell() {
  const location = useLocation()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const { audit } = useDemoRuntime()
  return (
    <section className="auth-route-boundary-demo" data-testid="auth-route-boundary-demo">
      <header className="auth-route-boundary-header">
        <div>
          <p className="auth-route-boundary-eyebrow">React Router Data Mode</p>
          <h2>鉴权路由边界观察台</h2>
          <span>比较未登录重定向、403 拒绝、身份 context 与登出后的重新验证。</span>
        </div>
        <button type="button" onClick={() => navigate('/')}>
          查看公开页
        </button>
      </header>
      <dl className="auth-route-boundary-observer">
        <div>
          <dt>location</dt>
          <dd data-testid="auth-location">
            {location.pathname}
            {location.search}
          </dd>
        </div>
        <div>
          <dt>navigation</dt>
          <dd>{navigation.state}</dd>
        </div>
        <div>
          <dt>auth checks</dt>
          <dd data-testid="auth-middleware-count">{audit.authChecks}</dd>
        </div>
        <div>
          <dt>protected loader calls</dt>
          <dd data-testid="auth-loader-count">{audit.protectedLoaderCalls}</dd>
        </div>
        <div>
          <dt>protected action calls</dt>
          <dd data-testid="auth-action-count">{audit.protectedActionCalls}</dd>
        </div>
      </dl>
      <main className="auth-route-boundary-content">
        <Outlet />
      </main>
    </section>
  )
}

/** 创建一次性内存 Router，确保 Demo 每次挂载都有独立会话与订阅。 */
export function createAuthRouteBoundaryDemo() {
  const runtime: DemoRuntime = {
    session: { authenticated: false, user: null },
    audit: { authChecks: 0, protectedLoaderCalls: 0, protectedActionCalls: 0 },
  }

  /** 在受保护 route 进入 loader/action 前完成身份检查并写入 typed context。 */
  const authMiddleware: MiddlewareFunction = async ({ context, request }) => {
    runtime.audit.authChecks += 1
    const { session } = runtime
    if (!session.authenticated || !session.user) {
      throw redirect(`/login?returnTo=${encodeURIComponent(getSafeReturnTo(request))}`)
    }
    context.set(userContext, session.user)
  }

  /** 读取受保护的工作区数据，身份由 middleware 保证存在。 */
  async function workspaceLoader({ context }: LoaderFunctionArgs): Promise<WorkspaceData> {
    runtime.audit.protectedLoaderCalls += 1
    const user = context.get(userContext)
    if (!user) throw data({ message: '缺少身份上下文' }, { status: 401 })
    return { greeting: `${user.name} 已通过鉴权`, roles: user.roles }
  }

  /** 检查管理员权限，展示已登录但无权访问时的 403 边界。 */
  async function adminLoader({ context }: LoaderFunctionArgs): Promise<AdminData> {
    runtime.audit.protectedLoaderCalls += 1
    const user = context.get(userContext)
    if (!user?.roles.includes('admin:write')) {
      throw data({ message: '当前身份没有 admin:write 权限' }, { status: 403 })
    }
    return { message: '管理员操作区已开放' }
  }

  /** 在受保护 action 中确认身份，再清除会话并离开当前分支。 */
  async function logoutAction({ context }: ActionFunctionArgs) {
    runtime.audit.protectedActionCalls += 1
    const user = context.get(userContext)
    if (!user) throw data({ message: '缺少身份上下文' }, { status: 401 })
    runtime.session.authenticated = false
    runtime.session.user = null
    return redirect('/login?returnTo=%2Fworkspace')
  }

  /** 在写入前校验管理员权限，展示 action 的 403 边界。 */
  async function adminAction({ context }: ActionFunctionArgs) {
    runtime.audit.protectedActionCalls += 1
    const user = context.get(userContext)
    if (!user) throw data({ message: '缺少身份上下文' }, { status: 401 })
    if (!user.roles.includes('admin:write')) {
      throw data({ message: '管理员写操作需要 admin:write 权限' }, { status: 403 })
    }
    return data({ message: '管理员写操作已通过权限检查' })
  }

  /** 处理登录 action，使用白名单回跳避免把 returnTo 当作任意外链。 */
  async function loginAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const username = String(formData.get('username') ?? '')
    const user = users[username]
    if (!user) return data({ message: '请选择 analyst 或 admin' }, { status: 400 })
    runtime.session.authenticated = true
    runtime.session.user = user
    return redirect(getSafeReturnTo(request))
  }

  const routes: RouteObject[] = [
    {
      id: 'auth-route-boundary-root',
      path: '/',
      Component: Shell,
      children: [
        { index: true, Component: PublicPage },
        { path: 'login', action: loginAction, Component: LoginPage },
        {
          id: 'auth-route-boundary-workspace',
          path: 'workspace',
          middleware: [authMiddleware],
          loader: workspaceLoader,
          action: logoutAction,
          Component: WorkspacePage,
          children: [
            {
              path: 'admin',
              loader: adminLoader,
              action: adminAction,
              Component: AdminPage,
              ErrorBoundary: AdminErrorBoundary,
            },
          ],
        },
      ],
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/workspace'] })
  return function AuthRouteBoundaryDemo() {
    useEffect(() => () => router.dispose(), [router])
    return (
      <demoRuntimeContext.Provider value={runtime}>
        <RouterProvider router={router} />
      </demoRuntimeContext.Provider>
    )
  }
}
